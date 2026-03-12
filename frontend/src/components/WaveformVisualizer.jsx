import { useState, useEffect, useRef } from 'react'

/* [FIX] Increased bar count from 42 to 80 for full-width equalizer */
const BAR_COUNT = 80

const COLOR_MAP = {
  safe:     { light:'#4aeaff', mid:'#00a4c4', dark:'#005a6e' },
  high:     { light:'#ffbb44', mid:'#cc8800', dark:'#885500' },
  critical: { light:'#ff5577', mid:'#cc2244', dark:'#881133' },
}

export function WaveformVisualizer({ active, threatLevel, audioLevel = 0 }) {
  const [bars, setBars] = useState(Array(BAR_COUNT).fill(0.08))
  const colors = COLOR_MAP[threatLevel] || COLOR_MAP.safe
  const frameRef = useRef(0)

  useEffect(() => {
    if (!active) {
      setBars(Array(BAR_COUNT).fill(0.08))
      return
    }
    const t = setInterval(() => {
      frameRef.current++
      setBars(() =>
        Array.from({ length: BAR_COUNT }, (_, i) => {
          const base  = audioLevel || 0.3
          const noise = Math.random() * 0.5
          const shape = Math.sin((i / BAR_COUNT) * Math.PI) * 0.4
          const wave  = Math.sin((frameRef.current * 0.05) + (i * 0.3)) * 0.15
          return Math.min(1, Math.max(0.05, base * noise + shape + wave))
        })
      )
    }, 70)
    return () => clearInterval(t)
  }, [active, audioLevel])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 1,
      height: 64,
      width: '100%',       /* [FIX] Full width */
      padding: '4px 0',
      perspective: '600px',
      transformStyle: 'preserve-3d',
    }}>
      {bars.map((h, i) => {
        const pct = Math.max(4, h * 100)
        const centerDist = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)
        const depth = centerDist * 8
        return (
          <div key={i} style={{
            flex: 1,              /* [FIX] flex:1 instead of fixed width */
            minWidth: 0,
            height: `${pct}%`,
            position: 'relative',
            transition: 'height 0.07s ease',
            transform: `rotateY(${(i - BAR_COUNT / 2) * 0.4}deg) translateZ(${depth}px)`,
            transformStyle: 'preserve-3d',
          }}>
            <div style={{
              position:'absolute', bottom:0, left:0, right:0, height:'100%',
              background: active
                ? `linear-gradient(0deg, ${colors.dark} 0%, ${colors.mid} 40%, ${colors.light} 100%)`
                : 'linear-gradient(0deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 100%)',
              boxShadow: active ? `0 0 8px ${colors.light}66, inset 0 0 4px ${colors.mid}44` : 'none',
              transition: 'background 0.4s',
            }} />
            <div style={{
              position:'absolute', top:0, left:-1, right:-1, height:3,
              background: active ? colors.light : 'rgba(255,255,255,0.06)',
              boxShadow: active ? `0 -2px 8px ${colors.light}88, 0 0 4px ${colors.light}` : 'none',
              transition: 'background 0.4s',
            }} />
            {active && <div style={{
              position:'absolute', bottom:-6, left:1, right:1, height:6,
              background: `linear-gradient(0deg, transparent, ${colors.dark}44)`,
              opacity: 0.5,
            }} />}
          </div>
        )
      })}
    </div>
  )
}
