import { useState, useEffect } from 'react'

const BAR_COUNT = 32

export function WaveformVisualizer({ active, threatLevel, audioLevel = 0 }) {
  const [bars, setBars] = useState(Array(BAR_COUNT).fill(0.08))

  const color =
    threatLevel === 'critical' ? '#ff2d55' :
    threatLevel === 'high'     ? '#ff9500' : '#00d4ff'

  useEffect(() => {
    if (!active) {
      setBars(Array(BAR_COUNT).fill(0.08))
      return
    }
    const t = setInterval(() => {
      setBars(() =>
        Array.from({ length: BAR_COUNT }, (_, i) => {
          // Natural-feeling wave with position-based variation
          const base  = audioLevel || 0.3
          const noise = Math.random() * 0.5
          const shape = Math.sin((i / BAR_COUNT) * Math.PI) * 0.4
          return Math.min(1, Math.max(0.05, base * noise + shape))
        })
      )
    }, 75)
    return () => clearInterval(t)
  }, [active, audioLevel])

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52, padding: '4px 2px' }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: `${Math.max(4, h * 100)}%`,
            background: color,
            boxShadow: active ? `0 0 6px ${color}` : 'none',
            transition: 'height 0.075s ease, background 0.4s ease',
          }}
        />
      ))}
    </div>
  )
}
