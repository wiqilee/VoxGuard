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
  ['#00ffff','#a78bfa','#4ade80'],
  ['#a78bfa','#ff4d8d','#00ffff'],
  ['#ffaa00','#ffe14d','#a78bfa'],
  ['#4ade80','#00ffff','#ffaa00'],
  ['#ff4d8d','#ffaa00','#ffe14d'],
]

export function PixelLogo({ compact = false }) {
  const [ci, setCi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCi(x => (x + 1) % CYCLE.length), 550)
    return () => clearInterval(t)
  }, [])
  const [c1, c2, c3] = CYCLE[ci]
  const px = compact ? 5 : 7
  const gap = compact ? 1 : 2

  return (
    <div style={{ display:'flex', alignItems:'center', gap: compact ? 10 : 18, flexShrink:0 }}>
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', inset:-16, borderRadius:4, background:`radial-gradient(ellipse at center, ${c1}88 0%, transparent 60%)`, transition:'background 0.4s', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:-8, background:`radial-gradient(ellipse at center, ${c2}44 0%, transparent 75%)`, transition:'background 0.4s', pointerEvents:'none' }} />
        <div style={{ display:'grid', gridTemplateColumns:`repeat(10, ${px}px)`, gap, position:'relative', zIndex:1 }}>
          {SHIELD.map((row, ri) => row.map((on, ci2) => {
            const col = on ? (ri < 3 ? c1 : ri < 6 ? c2 : c3) : 'transparent'
            return (
              <div key={`${ri}-${ci2}`} style={{
                width:px, height:px,
                background: on ? col : 'transparent',
                boxShadow: on ? `0 0 4px ${col}, 0 0 10px ${col}, 0 0 20px ${col}aa` : 'none',
                transition: 'all 0.4s ease',
              }} />
            )
          }))}
        </div>
      </div>
      <div>
        <div style={{
          fontFamily:PF, fontSize: compact ? 9 : 13, lineHeight:1.45, letterSpacing: compact ? 1 : 3,
          color:c1,
          textShadow:`0 0 12px ${c1}, 0 0 28px ${c1}cc, 3px 3px 0 ${c2}aa, 6px 6px 0 ${c3}66`,
          transition:'all 0.4s ease',
        }}>
          VOX<br/>GUARD
        </div>
        <div style={{ fontFamily:MF, fontSize: compact ? 6 : 7, color:c2, letterSpacing:3, marginTop:2, textShadow:`0 0 8px ${c2}, 0 0 16px ${c2}88`, transition:'all 0.4s' }}>
          v1.0.0
        </div>
      </div>
    </div>
  )
}
