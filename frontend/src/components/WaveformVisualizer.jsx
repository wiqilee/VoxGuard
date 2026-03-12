import { useState, useEffect, useRef } from 'react'

const BAR_COUNT = 72

const COLOR_MAP = {
  safe:     { light:'#4aeaff', mid:'#00a4c4', dark:'#005a6e', glow:'#00d4ff' },
  high:     { light:'#ffbb44', mid:'#cc8800', dark:'#885500', glow:'#ff9500' },
  critical: { light:'#ff5577', mid:'#cc2244', dark:'#881133', glow:'#ff2d55' },
}

export function WaveformVisualizer({ active, threatLevel, audioLevel = 0 }) {
  const [bars, setBars] = useState(Array(BAR_COUNT).fill(0.05))
  const [peaks, setPeaks] = useState(Array(BAR_COUNT).fill(0))
  const colors = COLOR_MAP[threatLevel] || COLOR_MAP.safe
  const frameRef = useRef(0)
  const prevBarsRef = useRef(Array(BAR_COUNT).fill(0.05))

  useEffect(() => {
    if (!active) {
      setBars(Array(BAR_COUNT).fill(0.05))
      setPeaks(Array(BAR_COUNT).fill(0))
      prevBarsRef.current = Array(BAR_COUNT).fill(0.05)
      return
    }
    const t = setInterval(() => {
      frameRef.current++
      const f = frameRef.current
      const prev = prevBarsRef.current
      const level = Math.max(0.15, audioLevel)
      const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
        const pos = i / BAR_COUNT
        const wave1 = Math.sin(f * 0.08 + i * 0.25) * 0.2
        const wave2 = Math.sin(f * 0.13 + i * 0.4) * 0.12
        const wave3 = Math.sin(f * 0.04 + i * 0.15) * 0.08
        const centerShape = Math.sin(pos * Math.PI) * 0.35
        const burst = Math.random() < 0.3 ? Math.random() * level * 0.6 : 0
        const noise = Math.random() * 0.12
        const raw = level * 0.5 + centerShape + wave1 + wave2 + wave3 + burst + noise
        const smoothed = prev[i] * 0.3 + raw * 0.7
        return Math.min(1, Math.max(0.04, smoothed))
      })
      prevBarsRef.current = newBars
      setBars(newBars)
      setPeaks(prev => prev.map((p, i) => {
        const cur = newBars[i]
        if (cur > p) return cur
        return Math.max(0, p - 0.02)
      }))
    }, 50)
    return () => clearInterval(t)
  }, [active, audioLevel])

  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:1, height:72, width:'100%', padding:'4px 0', position:'relative' }}>
      {active && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg, transparent, ${colors.glow}33, transparent)` }} />}
      {bars.map((h, i) => {
        const pct = Math.max(3, h * 100)
        const peakPct = Math.max(3, peaks[i] * 100)
        const isCenter = Math.abs(i - BAR_COUNT / 2) < BAR_COUNT * 0.25
        const intensity = h > 0.6 ? 1 : h > 0.3 ? 0.6 : 0.3
        return (
          <div key={i} style={{ flex:1, minWidth:0, height:`${pct}%`, position:'relative', transition:'height 0.06s linear' }}>
            <div style={{
              position:'absolute', bottom:0, left:0, right:0, height:'100%',
              background: active ? `linear-gradient(0deg, ${colors.dark} 0%, ${colors.mid} 50%, ${colors.light} 100%)` : 'linear-gradient(0deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 100%)',
              boxShadow: active && isCenter ? `0 0 6px ${colors.glow}${Math.round(intensity * 80).toString(16).padStart(2,'0')}` : 'none',
              transition: 'background 0.3s',
            }} />
            <div style={{
              position:'absolute', top:0, left:0, right:0, height:2,
              background: active ? colors.light : 'rgba(255,255,255,0.04)',
              boxShadow: active ? `0 -1px 6px ${colors.light}aa` : 'none',
            }} />
            {active && peakPct > pct + 3 && (
              <div style={{ position:'absolute', bottom:`${peakPct}%`, left:0, right:0, height:2, background:colors.light, opacity:0.7, boxShadow:`0 0 4px ${colors.light}` }} />
            )}
            {active && (
              <div style={{ position:'absolute', bottom:-8, left:0, right:0, height:`${Math.min(8, pct * 0.15)}px`, background:`linear-gradient(0deg, transparent, ${colors.dark}22)`, opacity:intensity * 0.4 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
