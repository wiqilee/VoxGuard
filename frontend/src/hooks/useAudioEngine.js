import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * useAudioEngine
 *
 * Attempts to load the Rust WASM audio engine.
 * If WASM is unavailable (e.g. Vercel demo), falls back to the
 * Web Audio API for microphone capture and chunking.
 *
 * Records session audio via MediaRecorder for gallery playback.
 * Emits 250ms PCM chunks as base64 strings via onChunk callback.
 */
export function useAudioEngine({ onChunk, active }) {
  const [ready,      setReady]      = useState(false)
  const [hasWasm,    setHasWasm]    = useState(false)
  const [error,      setError]      = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingBlob, setRecordingBlob] = useState(null)

  const streamRef    = useRef(null)
  const contextRef   = useRef(null)
  const processorRef = useRef(null)
  const wasmRef      = useRef(null)
  const recorderRef  = useRef(null)
  const chunksRef    = useRef([])

  // ── Try to load Rust WASM engine ──────────────────────────
  useEffect(() => {
    async function loadWasm() {
      try {
        // Dynamic import with explicit catch — won't break Vite build
        // The WASM file only exists after wasm-pack build (CI/CD pipeline)
        const wasmPath = new URL('../wasm/scam_shield_audio.js', import.meta.url).href
        const wasm = await import(/* @vite-ignore */ wasmPath)
        await wasm.default()
        wasmRef.current = wasm
        setHasWasm(true)
        console.log('[VoxGuard Audio] Rust WASM loaded ✓')
      } catch {
        console.warn('[VoxGuard Audio] WASM not available, using Web Audio fallback')
        setHasWasm(false)
      }
      setReady(true)
    }
    loadWasm()
  }, [])

  // ── Start capturing ────────────────────────────────────────
  const start = useCallback(async () => {
    if (!ready) return
    setError(null)
    setRecordingBlob(null)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        }
      })
      streamRef.current = stream

      // ── Start MediaRecorder for session recording ──
      try {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }
        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
            setRecordingBlob(blob)
          }
        }
        recorder.start(1000)
        recorderRef.current = recorder
      } catch (recErr) {
        console.warn('[VoxGuard Audio] MediaRecorder not available:', recErr)
      }

      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
      contextRef.current = ctx

      const source   = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const chunkSamples = 4000
      let   buffer       = new Float32Array(0)

      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processor.onaudioprocess = (e) => {
        const input  = e.inputBuffer.getChannelData(0)
        const merged = new Float32Array(buffer.length + input.length)
        merged.set(buffer)
        merged.set(input, buffer.length)
        buffer = merged

        const rms = Math.sqrt(input.reduce((s, v) => s + v * v, 0) / input.length)
        setAudioLevel(Math.min(1, rms * 8))

        while (buffer.length >= chunkSamples) {
          const chunk = buffer.slice(0, chunkSamples)
          buffer      = buffer.slice(chunkSamples)

          let processed = chunk
          if (hasWasm && wasmRef.current?.preprocess_chunk) {
            try { processed = wasmRef.current.preprocess_chunk(chunk) } catch {}
          }

          const pcm    = float32ToInt16(processed)
          const base64 = int16ToBase64(pcm)
          onChunk?.(base64)
        }
      }

      source.connect(processor)
      processor.connect(ctx.destination)
      processorRef.current = processor

      console.log(`[VoxGuard Audio] Started (${hasWasm ? 'Rust WASM' : 'Web Audio fallback'})`)
    } catch (e) {
      setError(e.message || 'Microphone access denied')
      console.error('[VoxGuard Audio] Failed to start:', e)
    }
  }, [ready, hasWasm, onChunk])

  // ── Stop capturing ─────────────────────────────────────────
  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    recorderRef.current = null

    processorRef.current?.disconnect()
    processorRef.current = null
    contextRef.current?.close()
    contextRef.current  = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current   = null
    setAudioLevel(0)
    console.log('[VoxGuard Audio] Stopped')
  }, [])

  useEffect(() => {
    if (active) start()
    else        stop()
    return () => stop()
  }, [active, start, stop])

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
  const bytes  = new Uint8Array(int16Array.buffer)
  let   binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary)
}
