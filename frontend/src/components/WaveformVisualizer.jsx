import { useState, useEffect } from 'react'

const BAR_COUNT = 36

const COLOR_MAP = {
  safe:     { light:'#4aeaff', dark:'#007a8c' },
  high:     { light:'#ffbb44', dark:'#aa6600' },
  critical: { light:'#ff5577', dark:'#991133' },
}

export function WaveformVisualizer({ active, threatLevel, audioLevel = 0 }) {
  const [bars, setBars] = useState(Array(BAR_COUNT).fill(0.08))
  const colors = COLOR_MAP[threatLevel] || COLOR_MAP.safe

  useEffect(() => {
    if (!active) {
      setBars(Array(BAR_COUNT).fill(0.08))
      return
    }
    const t = setInterval(() => {
      setBars(() =>
        Array.from({ length: BAR_COUNT }, (_, i) => {
          const base  = audioLevel || 0.3
          const noise = Math.random() * 0.5
          const shape = Math.sin((i / BAR_COUNT) * Math.PI) * 0.4
          return Math.min(1, Math.max(0.05, base * noise + shape))
        })
      )
    }, 70)
    return () => clearInterval(t)
  }, [active, audioLevel])

  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:56, padding:'4px 2px' }}>
      {bars.map((h, i) => {
        const pct = Math.max(4, h * 100)
        return (
          <div key={i} style={{ width:6, height:`${pct}%`, position:'relative', transition:'height 0.07s ease' }}>
            {/* Dark bottom half */}
            <div style={{
              position:'absolute', bottom:0, left:0, right:0, height:'55%',
              background: active ? colors.dark : 'rgba(255,255,255,0.06)',
              transition: 'background 0.4s',
            }} />
            {/* Light top half */}
            <div style={{
              position:'absolute', top:0, left:0, right:0, height:'55%',
              background: active ? colors.light : 'rgba(255,255,255,0.1)',
              boxShadow: active ? `0 0 6px ${colors.light}88` : 'none',
              transition: 'background 0.4s',
            }} />
          </div>
        )
      })}
    </div>
  )
}
