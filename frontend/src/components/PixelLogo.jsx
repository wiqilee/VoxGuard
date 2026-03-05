import { useState, useEffect } from 'react'

const PF = "'Press Start 2P', monospace"
const MF = "'Share Tech Mono', 'Courier New', monospace"

const SHIELD = [
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,0,1,1,0,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,0,1,0,0,1,0,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,0],
]

const CYCLE = [
  ['#00d4ff','#7b61ff','#30d158'],
  ['#7b61ff','#ff2d55','#00d4ff'],
  ['#ff9500','#ffd60a','#7b61ff'],
  ['#30d158','#00d4ff','#ff9500'],
  ['#ff2d55','#ff9500','#ffd60a'],
]

export function PixelLogo({ compact = false }) {
  const [ci, setCi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCi(x => (x + 1) % CYCLE.length), 600)
    return () => clearInterval(t)
  }, [])
  const [c1, c2, c3] = CYCLE[ci]
  const px = compact ? 6 : 8
  const gap = compact ? 1 : 2

  return (
    <div style={{ display:'flex', alignItems:'center', gap: compact ? 12 : 20, flexShrink:0 }}>
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', inset:-14, borderRadius:4, background:`radial-gradient(ellipse at center, ${c1}55 0%, transparent 65%)`, transition:'background 0.5s', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:-6, background:`radial-gradient(ellipse at center, ${c2}22 0%, transparent 80%)`, transition:'background 0.5s', pointerEvents:'none' }} />
        <div style={{ display:'grid', gridTemplateColumns:`repeat(10, ${px}px)`, gap, position:'relative', zIndex:1 }}>
          {SHIELD.map((row, ri) => row.map((on, ci2) => {
            const col = on ? (ri < 3 ? c1 : ri < 6 ? c2 : c3) : 'transparent'
            return (
              <div key={`${ri}-${ci2}`} style={{
                width:px, height:px,
                background: on ? col : 'transparent',
                boxShadow: on ? `0 0 6px ${col}, 0 0 14px ${col}, 0 0 28px ${col}88` : 'none',
                transition: 'all 0.5s ease',
              }} />
            )
          }))}
        </div>
      </div>
      <div>
        <div style={{
          fontFamily:PF, fontSize: compact ? 10 : 14, lineHeight:1.5, letterSpacing: compact ? 1 : 3,
          color:c1, textShadow:`0 0 18px ${c1}, 0 0 36px ${c1}88, 3px 3px 0 ${c2}88, 6px 6px 0 ${c3}44`,
          transition:'all 0.5s ease',
        }}>
          VOX<br/>GUARD
        </div>
        <div style={{ fontFamily:MF, fontSize: compact ? 7 : 8, color:c2, letterSpacing:3, marginTop:3, textShadow:`0 0 10px ${c2}, 0 0 20px ${c2}66`, transition:'all 0.5s' }}>
          v1.0.0
        </div>
      </div>
    </div>
  )
}
