import { useRef, useState, useCallback, useEffect } from 'react'

const CAPTURE_INTERVAL_MS = 2000  // Capture frame every 2 seconds

/**
 * useScreenCapture
 *
 * Captures the user's screen via getDisplayMedia,
 * extracts JPEG frames at a 2-second interval,
 * and emits them as base64 strings via onFrame callback.
 *
 * Gemini Vision on the backend analyzes each frame for:
 * - Fake banking interfaces / spoofed websites
 * - Fraudulent investment dashboards
 * - Remote desktop installation prompts
 * - Phishing credential forms
 * - Malicious QR codes
 */
export function useScreenCapture({ onFrame, active }) {
  const [supported,    setSupported]    = useState(false)
  const [capturing,    setCapturing]    = useState(false)
  const [error,        setError]        = useState(null)
  const [frameCount,   setFrameCount]   = useState(0)

  const streamRef   = useRef(null)
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    setSupported(!!navigator.mediaDevices?.getDisplayMedia)
  }, [])

  const startCapture = useCallback(async () => {
    if (!supported) { setError('Screen capture not supported in this browser'); return }
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720, frameRate: 1 },
        audio: false,
      })
      streamRef.current = stream

      // Create hidden video element to read frames from
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted     = true
      await video.play()
      videoRef.current = video

      // Canvas for frame extraction
      const canvas = document.createElement('canvas')
      canvas.width  = 1280
      canvas.height = 720
      canvasRef.current = canvas

      setCapturing(true)

      // Extract frame every 2 seconds
      intervalRef.current = setInterval(() => {
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        // JPEG at 0.7 quality — good enough for Gemini Vision, lower bandwidth
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        const base64  = dataUrl.split(',')[1]
        onFrame?.(base64)
        setFrameCount(c => c + 1)
      }, CAPTURE_INTERVAL_MS)

      // Auto-stop if user ends screen share natively
      stream.getVideoTracks()[0].addEventListener('ended', stopCapture)

      console.log('[ScreenCapture] Started ✓')
    } catch (e) {
      if (e.name !== 'NotAllowedError') {
        setError(e.message || 'Screen capture failed')
      }
      console.warn('[ScreenCapture] Failed or denied:', e.name)
    }
  }, [supported, onFrame])

  const stopCapture = useCallback(() => {
    clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    videoRef.current?.pause()
    streamRef.current  = null
    videoRef.current   = null
    canvasRef.current  = null
    setCapturing(false)
    setFrameCount(0)
    console.log('[ScreenCapture] Stopped')
  }, [])

  useEffect(() => {
    if (active && !capturing)   startCapture()
    if (!active && capturing)   stopCapture()
  }, [active])

  useEffect(() => () => stopCapture(), [])

  return { supported, capturing, error, frameCount, startCapture, stopCapture }
}
