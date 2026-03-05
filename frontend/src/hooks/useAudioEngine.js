import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * useAudioEngine
 *
 * Attempts to load the Rust WASM audio engine (scam_shield_audio).
 * If WASM is unavailable (e.g. Vercel demo), falls back to the
 * Web Audio API for microphone capture and chunking.
 *
 * Emits 250ms PCM chunks as base64 strings via onChunk callback.
 */
export function useAudioEngine({ onChunk, active }) {
  const [ready,      setReady]      = useState(false)
  const [hasWasm,    setHasWasm]    = useState(false)
  const [error,      setError]      = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)

  const streamRef   = useRef(null)
  const contextRef  = useRef(null)
  const processorRef= useRef(null)
  const wasmRef     = useRef(null)
  const frameBuffer = useRef([])

  // ── Try to load Rust WASM engine ──────────────────────────
  useEffect(() => {
    async function loadWasm() {
      try {
        // Dynamic import — only present after `wasm-pack build`
        const wasm = await import('../wasm/scam_shield_audio.js')
        await wasm.default()
        wasmRef.current = wasm
        setHasWasm(true)
        console.log('[AudioEngine] Rust WASM loaded ✓')
      } catch {
        console.warn('[AudioEngine] WASM not available, using Web Audio fallback')
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

      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
      contextRef.current = ctx

      const source    = ctx.createMediaStreamSource(stream)
      const analyser  = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      // Chunk size: 250ms at 16kHz = 4000 samples
      const chunkSamples = 4000
      let   buffer       = new Float32Array(0)

      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processor.onaudioprocess = (e) => {
        const input   = e.inputBuffer.getChannelData(0)
        const merged  = new Float32Array(buffer.length + input.length)
        merged.set(buffer)
        merged.set(input, buffer.length)
        buffer = merged

        // Volume level for waveform visualizer
        const rms = Math.sqrt(input.reduce((s, v) => s + v * v, 0) / input.length)
        setAudioLevel(Math.min(1, rms * 8))

        // Emit chunks
        while (buffer.length >= chunkSamples) {
          const chunk = buffer.slice(0, chunkSamples)
          buffer      = buffer.slice(chunkSamples)

          let processed = chunk
          // Use Rust WASM preprocessor if available
          if (hasWasm && wasmRef.current?.preprocess_chunk) {
            try {
              processed = wasmRef.current.preprocess_chunk(chunk)
            } catch { /* fall through to raw chunk */ }
          }

          // Convert Float32 → Int16 PCM → base64
          const pcm    = float32ToInt16(processed)
          const base64 = int16ToBase64(pcm)
          onChunk?.(base64)
        }
      }

      source.connect(processor)
      processor.connect(ctx.destination)
      processorRef.current = processor

      console.log(`[AudioEngine] Started (${hasWasm ? 'Rust WASM' : 'Web Audio fallback'})`)
    } catch (e) {
      setError(e.message || 'Microphone access denied')
      console.error('[AudioEngine] Failed to start:', e)
    }
  }, [ready, hasWasm, onChunk])

  // ── Stop capturing ─────────────────────────────────────────
  const stop = useCallback(() => {
    processorRef.current?.disconnect()
    processorRef.current = null
    contextRef.current?.close()
    contextRef.current  = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current   = null
    setAudioLevel(0)
    console.log('[AudioEngine] Stopped')
  }, [])

  useEffect(() => {
    if (active) start()
    else        stop()
    return () => stop()
  }, [active, start, stop])

  return { ready, hasWasm, error, audioLevel }
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
