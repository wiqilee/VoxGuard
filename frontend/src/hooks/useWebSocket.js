import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/session'

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

  // ── TTS Audio Playback ──────────────────────────────────
  const playTTSAudio = useCallback((base64Audio, mimeType = 'audio/wav', fallbackText = '') => {
    if (!base64Audio) {
      // Fallback to browser speech synthesis
      if (fallbackText && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(fallbackText)
        utterance.rate = 0.95
        utterance.pitch = 1.0
        utterance.onstart = () => setTtsPlaying(true)
        utterance.onend = () => setTtsPlaying(false)
        window.speechSynthesis.speak(utterance)
      }
      return
    }

    try {
      // Decode base64 to audio and play
      const binaryString = atob(base64Audio)
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
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.onended = () => setTtsPlaying(false)
        source.start(0)
      }, (err) => {
        console.warn('[VoxGuard TTS] Audio decode failed, using browser TTS fallback', err)
        setTtsPlaying(false)
        if (fallbackText && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(fallbackText)
          utterance.rate = 0.95
          utterance.onend = () => setTtsPlaying(false)
          setTtsPlaying(true)
          window.speechSynthesis.speak(utterance)
        }
      })
    } catch (e) {
      console.error('[VoxGuard TTS] Playback error', e)
      setTtsPlaying(false)
    }
  }, [])

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
  }, [stopTTS])

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
    ttsPlaying, stopTTS,

    // v2: Explanation cards
    explanationCard, setExplanationCard,

    // v2: Action agent
    actionPlan, setActionPlan, requestActionPlan,

    // Language
    setLanguage,
  }
}
