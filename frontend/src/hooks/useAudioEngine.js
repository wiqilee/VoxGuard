import { useRef, useState, useEffect } from 'react'

/**
 * useAudioEngine
 *
 * Captures microphone audio, processes through Rust WASM (if available),
 * and sends 250ms PCM chunks as base64 strings via onChunk callback.
 *
 * Key design: uses refs for callbacks and state to avoid useEffect restart loops.
 */
export function useAudioEngine({ onChunk, active }) {
  const [ready,         setReady]         = useState(false)
  const [hasWasm,       setHasWasm]       = useState(false)
  const [error,         setError]         = useState(null)
  const [audioLevel,    setAudioLevel]    = useState(0)
  const [recordingBlob, setRecordingBlob] = useState(null)

  const streamRef     = useRef(null)
  const contextRef    = useRef(null)
  const processorRef  = useRef(null)
  const wasmRef       = useRef(null)
  const recorderRef   = useRef(null)
  const chunksRef     = useRef([])
  const runningRef    = useRef(false)
  const chunkCountRef = useRef(0)

  // Stable refs for callbacks so they never trigger effect restarts
  const onChunkRef = useRef(onChunk)
  useEffect(() => { onChunkRef.current = onChunk }, [onChunk])

  const hasWasmRef = useRef(false)

  // ── Load Rust WASM engine once ──────────────────────────
  useEffect(() => {
    async function loadWasm() {
      try {
        const wasmPath = new URL('../wasm/scam_shield_audio.js', import.meta.url).href
        const wasm = await import(/* @vite-ignore */ wasmPath)
        await wasm.default()
        wasmRef.current = wasm
        hasWasmRef.current = true
        setHasWasm(true)
        console.log('[VoxGuard Audio] Rust WASM loaded ✓')
      } catch {
        console.warn('[VoxGuard Audio] WASM not available, using Web Audio fallback')
        hasWasmRef.current = false
        setHasWasm(false)
      }
      setReady(true)
    }
    loadWasm()
  }, [])

  // ── Start mic capture ───────────────────────────────────
  function startCapture() {
    if (runningRef.current) return
    runningRef.current = true
    chunkCountRef.current = 0

    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000, channelCount: 1 }
    }).then(stream => {
      if (!runningRef.current) { stream.getTracks().forEach(t => t.stop()); return }

      streamRef.current = stream
      setError(null)
      setRecordingBlob(null)
      chunksRef.current = []

      // MediaRecorder for session recording
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        const recorder = new MediaRecorder(stream, { mimeType })
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            setRecordingBlob(new Blob(chunksRef.current, { type: mimeType }))
          }
        }
        recorder.start(1000)
        recorderRef.current = recorder
      } catch (e) {
        console.warn('[VoxGuard Audio] MediaRecorder not available:', e)
      }

      // Audio processing pipeline
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
      contextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const chunkSamples = 4000 // 250ms at 16kHz
      let buffer = new Float32Array(0)

      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processor.onaudioprocess = (e) => {
        if (!runningRef.current) return

        const input = e.inputBuffer.getChannelData(0)
        const merged = new Float32Array(buffer.length + input.length)
        merged.set(buffer)
        merged.set(input, buffer.length)
        buffer = merged

        // Update audio level meter
        const rms = Math.sqrt(input.reduce((s, v) => s + v * v, 0) / input.length)
        setAudioLevel(Math.min(1, rms * 8))

        // Process and send chunks
        while (buffer.length >= chunkSamples) {
          const chunk = buffer.slice(0, chunkSamples)
          buffer = buffer.slice(chunkSamples)

          let processed = chunk
          if (hasWasmRef.current && wasmRef.current?.preprocess_chunk) {
            try { processed = wasmRef.current.preprocess_chunk(chunk) } catch {}
          }

          const pcm = float32ToInt16(processed)
          const base64 = int16ToBase64(pcm)

          // Send to backend via WebSocket
          if (onChunkRef.current) {
            onChunkRef.current(base64)
            chunkCountRef.current++
            // Log first few chunks and then periodically to confirm streaming
            if (chunkCountRef.current <= 3 || chunkCountRef.current % 40 === 0) {
              console.log(`[VoxGuard Audio] Chunk #${chunkCountRef.current} sent (${base64.length} chars)`)
            }
          } else {
            // Only warn once
            if (chunkCountRef.current === 0) {
              console.warn('[VoxGuard Audio] onChunk callback not set — chunks not being sent to backend')
              chunkCountRef.current = -1
            }
          }
        }
      }

      source.connect(processor)
      processor.connect(ctx.destination)
      processorRef.current = processor

      const mode = hasWasmRef.current ? 'Rust WASM' : 'Web Audio fallback'
      console.log(`[VoxGuard Audio] Started (${mode}) — streaming to backend`)

    }).catch(e => {
      runningRef.current = false
      setError(e.message || 'Microphone access denied')
      console.error('[VoxGuard Audio] Failed to start:', e)
    })
  }

  // ── Stop mic capture ────────────────────────────────────
  function stopCapture() {
    if (!runningRef.current) return
    runningRef.current = false

    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop() } catch {}
    }
    recorderRef.current = null

    if (processorRef.current) {
      try { processorRef.current.disconnect() } catch {}
    }
    processorRef.current = null

    if (contextRef.current) {
      try { contextRef.current.close() } catch {}
    }
    contextRef.current = null

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    streamRef.current = null

    setAudioLevel(0)
    if (chunkCountRef.current > 0) {
      console.log(`[VoxGuard Audio] Stopped — sent ${chunkCountRef.current} chunks total`)
    } else {
      console.log('[VoxGuard Audio] Stopped')
    }
  }

  // ── React to active prop changes ────────────────────────
  // Only depends on [active, ready] — no callback deps that change every render
  useEffect(() => {
    if (active && ready) {
      startCapture()
    } else {
      stopCapture()
    }
    return () => stopCapture()
  }, [active, ready])

  return { ready, hasWasm, error, audioLevel, recordingBlob }
}

// ── Utilities ─────────────────────────────────────────────────
function float32ToInt16(float32Array) {
  const int16 = new Int16Array(float32Array.length)
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
  }
  return int16
}

function int16ToBase64(int16Array) {
  const bytes = new Uint8Array(int16Array.buffer)
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary)
}
