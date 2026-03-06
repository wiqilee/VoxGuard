import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/session'

export function useWebSocket() {
  const wsRef        = useRef(null)
  const retryRef     = useRef(0)
  const retryTimeout = useRef(null)

  const [connected,  setConnected]  = useState(false)
  const [alerts,     setAlerts]     = useState([])
  const [threatScore,setThreatScore]= useState(8)
  const [psychScores,setPsychScores]= useState({ SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0 })
  const [sessionId,  setSessionId]  = useState(null)
  const [error,      setError]      = useState(null)

  const connect = useCallback(() => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') return

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
              if (msg.tactics) {
                setPsychScores(prev => {
                  const next = { ...prev }
                  msg.tactics.forEach(t => {
                    next[t] = Math.min(100, (prev[t] || 0) + (msg.tactic_delta || 25))
                  })
                  return next
                })
              }
              break

            case 'score_update':
              setThreatScore(msg.threat_score)
              break

            case 'error':
              setError(msg.message)
              break

            default:
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
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryTimeout.current)
      wsRef.current?.close()
    }
  }, [connect])

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

  const startSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start_session' }))
    }
  }, [])

  const endSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }))
    }
  }, [])

  const reset = useCallback(() => {
    setAlerts([])
    setThreatScore(8)
    setPsychScores({ SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0 })
    setSessionId(null)
    setError(null)
  }, [])

  return {
    connected, alerts, threatScore, psychScores,
    sessionId, error,
    sendAudioChunk, sendScreenFrame,
    startSession, endSession, reset,
  }
}
