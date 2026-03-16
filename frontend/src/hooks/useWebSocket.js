import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/session'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts'

// ── Client-side Gemini TTS (for demo mode when backend is unavailable) ──

// Wrap raw PCM (L16) in WAV container so browser can decode it
function _pcmToWavBase64(pcmBase64, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const pcmBytes = atob(pcmBase64)
  const pcmLength = pcmBytes.length
  const byteRate = sampleRate * channels * (bitsPerSample / 8)
  const blockAlign = channels * (bitsPerSample / 8)
  const wavLength = 44 + pcmLength

  const buffer = new ArrayBuffer(wavLength)
  const view = new DataView(buffer)

  // RIFF header
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)) }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + pcmLength, true)
  writeStr(8, 'WAVE')
  // fmt chunk
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  // data chunk
  writeStr(36, 'data')
  view.setUint32(40, pcmLength, true)
  // PCM data
  for (let i = 0; i < pcmLength; i++) view.setUint8(44 + i, pcmBytes.charCodeAt(i))

  // Convert to base64
  const wavBytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < wavBytes.length; i++) binary += String.fromCharCode(wavBytes[i])
  return btoa(binary)
}

// Extract sample rate from MIME type like "audio/L16;rate=24000"
function _extractSampleRate(mime) {
  const match = (mime || '').match(/rate=(\d+)/)
  return match ? parseInt(match[1], 10) : 24000
}

async function _callGeminiClientTTS(text, voice = 'Kore') {
  if (!GEMINI_API_KEY || !text) return null
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          response_modalities: ['AUDIO'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: { voice_name: voice }
            }
          }
        }
      })
    })
    if (!res.ok) {
      console.warn(`[VoxGuard TTS] Gemini API ${res.status}:`, await res.text().catch(() => ''))
      return null
    }
    const data = await res.json()
    const part = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)
    if (part) {
      const rawBase64 = part.inlineData.data
      const mime = part.inlineData.mimeType || ''

      // Gemini TTS returns raw PCM (audio/L16) — wrap in WAV for browser
      if (mime.includes('L16') || mime.includes('pcm') || !mime.includes('wav')) {
        const sampleRate = _extractSampleRate(mime)
        const wavBase64 = _pcmToWavBase64(rawBase64, sampleRate)
        return { base64: wavBase64, mime: 'audio/wav' }
      }

      return { base64: rawBase64, mime: mime || 'audio/wav' }
    }
    return null
  } catch (e) {
    console.warn('[VoxGuard TTS] Client-side Gemini TTS failed:', e)
    return null
  }
}

export function useWebSocket() {
  const wsRef        = useRef(null)
  const retryRef     = useRef(0)
  const retryTimeout = useRef(null)
  const audioCtxRef  = useRef(null)

  const [connected,       setConnected]       = useState(false)
  const [alerts,          setAlerts]          = useState([])
  const [threatScore,     setThreatScore]     = useState(0)
  const [psychScores,     setPsychScores]     = useState({ SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0 })
  const [lieScores,       setLieScores]       = useState({ INCONSISTENCY:0,VAGUENESS:0,OVERDETAIL:0,DEFLECTION:0,PRESSURE:0 })
  const [sessionId,       setSessionId]       = useState(null)
  const [error,           setError]           = useState(null)

  // New state for v2 features
  const [intervention,    setIntervention]    = useState(null)
  const [explanationCard, setExplanationCard] = useState(null)
  const [actionPlan,      setActionPlan]      = useState(null)
  const [ttsPlaying,      setTtsPlaying]      = useState(false)
  const [liveTranscript,  setLiveTranscript]  = useState([])

  // ── TTS Audio Playback ──────────────────────────────────
  // Helper: play raw base64 audio through AudioContext, with optional repeat
  const _playBase64Audio = useCallback((base64Data, onDone, repeatCount = 1) => {
    try {
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      const ctx = audioCtxRef.current
      setTtsPlaying(true)

      ctx.decodeAudioData(bytes.buffer.slice(0), (buffer) => {
        let played = 0

        const playOnce = () => {
          played++
          const source = ctx.createBufferSource()
          source.buffer = buffer
          source.connect(ctx.destination)
          source.onended = () => {
            if (played < repeatCount) {
              // Small pause between repeats (0.8s)
              setTimeout(playOnce, 800)
            } else {
              setTtsPlaying(false)
              onDone?.()
            }
          }
          source.start(0)
        }

        playOnce()
        source.start(0)
      }, (err) => {
        console.warn('[VoxGuard TTS] Audio decode failed', err)
        setTtsPlaying(false)
        onDone?.('decode_error')
      })
    } catch (e) {
      console.error('[VoxGuard TTS] Playback error', e)
      setTtsPlaying(false)
      onDone?.('error')
    }
  }, [])

  // Helper: browser speech synthesis (last-resort fallback)
  const _playBrowserTTS = useCallback((text) => {
    if (!text || !window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.onstart = () => setTtsPlaying(true)
    utterance.onend = () => setTtsPlaying(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const TTS_REPEAT_COUNT = 3 // Repeat intervention voice 3x for recording clarity

  const playTTSAudio = useCallback((base64Audio, mimeType = 'audio/wav', fallbackText = '', voice = 'Kore') => {
    if (base64Audio) {
      // Backend provided audio — play 3x
      _playBase64Audio(base64Audio, (err) => {
        if (err && fallbackText) {
          _callGeminiClientTTS(fallbackText, voice).then(result => {
            if (result) {
              _playBase64Audio(result.base64, (err2) => {
                if (err2) _playBrowserTTS(fallbackText)
              }, TTS_REPEAT_COUNT)
            } else {
              _playBrowserTTS(fallbackText)
            }
          })
        }
      }, TTS_REPEAT_COUNT)
      return
    }

    // No backend audio — try client-side Gemini TTS first (natural voice)
    if (fallbackText && GEMINI_API_KEY) {
      setTtsPlaying(true)
      _callGeminiClientTTS(fallbackText, voice).then(result => {
        if (result) {
          _playBase64Audio(result.base64, (err) => {
            if (err) _playBrowserTTS(fallbackText)
          }, TTS_REPEAT_COUNT)
        } else {
          _playBrowserTTS(fallbackText)
        }
      }).catch(() => {
        _playBrowserTTS(fallbackText)
      })
      return
    }

    // No API key — browser speech synthesis only
    if (fallbackText) {
      _playBrowserTTS(fallbackText)
    }
  }, [_playBase64Audio, _playBrowserTTS])

  // ── Stop TTS ────────────────────────────────────────────
  const stopTTS = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    setTtsPlaying(false)
  }, [])

  // ── WebSocket Connection ────────────────────────────────
  const connect = useCallback(() => {
    // In pure demo mode (Vercel), skip WS connection unless WS_URL is explicitly set
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
    const hasWsUrl = import.meta.env.VITE_WS_URL
    if (isDemoMode && !hasWsUrl) return

    try {
      const ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        setConnected(true)
        setError(null)
        retryRef.current = 0
        console.log('[VoxGuard WS] Connected to backend')
      }

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data)

          switch (msg.type) {
            case 'session_start':
              setSessionId(msg.session_id)
              break

            case 'transcript':
              // [FIX] Handle live transcript from backend audio analysis
              setLiveTranscript(prev => [...prev, {
                text: msg.text,
                speaker: msg.speaker || 'caller',
                time: new Date(msg.timestamp ? msg.timestamp * 1000 : Date.now())
                  .toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                flagged: false,
              }])
              break

            case 'threat_alert':
              setAlerts(prev => [msg.alert, ...prev])
              setThreatScore(msg.threat_score)
              // Use backend psych_scores directly (already accumulated by threat_engine)
              if (msg.psych_scores) setPsychScores(msg.psych_scores)
              if (msg.lie_scores) setLieScores(msg.lie_scores)
              break

            case 'score_update':
              setThreatScore(msg.threat_score)
              if (msg.psych_scores) setPsychScores(msg.psych_scores)
              if (msg.lie_scores) setLieScores(msg.lie_scores)
              break

            case 'intervention':
              setIntervention(msg.intervention)
              break

            case 'intervention_audio':
              // Play natural TTS voice for intervention
              playTTSAudio(
                msg.audio_base64,
                msg.audio_mime || 'audio/wav',
                msg.script_text || ''
              )
              break

            case 'explanation_card':
              setExplanationCard(msg.explanation)
              break

            case 'action_plan':
              setActionPlan(msg)
              break

            case 'session_summary':
              // Handled by parent component
              break

            case 'session_end':
              // Handled by parent component
              break

            case 'ping':
              // Respond to backend keepalive ping
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'pong', ts: Date.now() }))
              }
              break

            case 'error':
              setError(msg.message)
              break

            default:
              console.log('[VoxGuard WS] Unknown message type:', msg.type)
              break
          }
        } catch (e) {
          console.warn('[VoxGuard WS] Failed to parse message', e)
        }
      }

      ws.onerror = (e) => {
        console.error('[VoxGuard WS] Error', e)
        setError('WebSocket connection error')
      }

      ws.onclose = () => {
        setConnected(false)
        const delay = Math.min(1000 * Math.pow(2, retryRef.current), 16000)
        retryRef.current += 1
        console.log(`[VoxGuard WS] Disconnected. Retrying in ${delay}ms`)
        retryTimeout.current = setTimeout(connect, delay)
      }

      wsRef.current = ws
    } catch (e) {
      setError('Failed to create WebSocket connection')
    }
  }, [playTTSAudio])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryTimeout.current)
      wsRef.current?.close()
      stopTTS()
    }
  }, [connect, stopTTS])

  // ── Send Methods ────────────────────────────────────────

  const sendAudioChunk = useCallback((base64Chunk) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'audio_chunk',
        data: base64Chunk,
        timestamp: Date.now(),
      }))
    }
  }, [])

  const sendScreenFrame = useCallback((base64Frame) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'screen_frame',
        data: base64Frame,
        timestamp: Date.now(),
      }))
    }
  }, [])

  const startSession = useCallback((language = 'en', country = 'US') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start_session',
        language,
        country,
      }))
    }
  }, [])

  const endSession = useCallback(() => {
    stopTTS()
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }))
    }
  }, [stopTTS])

  const sendInterventionResponse = useCallback((interventionId, userAction, extra = {}) => {
    stopTTS()
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'intervention_response',
        intervention_id: interventionId,
        user_action: userAction,
        ...extra,
      }))
    }
    // Clear intervention overlay
    if (userAction === 'safe_exit' || userAction === 'dismissed') {
      setIntervention(null)
    }
  }, [stopTTS])

  const setLanguage = useCallback((language, country) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'set_language',
        language,
        country,
      }))
    }
  }, [])

  const requestActionPlan = useCallback((options = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'request_action_plan',
        ...options,
      }))
    }
  }, [])

  const reset = useCallback(() => {
    stopTTS()
    setAlerts([])
    setThreatScore(0)
    setPsychScores({ SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0 })
    setLieScores({ INCONSISTENCY:0,VAGUENESS:0,OVERDETAIL:0,DEFLECTION:0,PRESSURE:0 })
    setSessionId(null)
    setError(null)
    setIntervention(null)
    setExplanationCard(null)
    setActionPlan(null)
    setLiveTranscript([])
  }, [stopTTS])

  // ── Demo-mode TTS: call directly with script text + voice ──
  const playInterventionTTS = useCallback((scriptText, voice = 'Kore') => {
    if (!scriptText) return
    playTTSAudio(null, 'audio/wav', scriptText, voice)
  }, [playTTSAudio])

  return {
    // Connection
    connected, error,

    // Session
    sessionId, startSession, endSession, reset,

    // Threat data
    alerts, threatScore, psychScores, lieScores,

    // Audio / Screen
    sendAudioChunk, sendScreenFrame,

    // v2: Intervention + TTS
    intervention, sendInterventionResponse,
    ttsPlaying, stopTTS, playTTSAudio, playInterventionTTS,

    // v2: Explanation cards
    explanationCard, setExplanationCard,

    // v2: Action agent
    actionPlan, setActionPlan, requestActionPlan,

    // v2: Live transcript from backend
    liveTranscript, setLiveTranscript,

    // Language
    setLanguage,
  }
}
