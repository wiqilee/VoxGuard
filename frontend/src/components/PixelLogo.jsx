import { useState, useEffect } from 'react'

const PF = "'Press Start 2P', monospace"
const MF = "'Share Tech Mono', 'Courier New', monospace"

// VoxGuard "V" shield shape
const SHIELD = [
  [0,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,0,1,1,1,1,0,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,1,0,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,0],
]

const CYCLE = [
  ['#00ffff','#c084fc','#4ade80'],
  ['#c084fc','#ff6b9d','#00ffff'],
  ['#ffbb33','#ffee55','#c084fc'],
  ['#4ade80','#00ffff','#ffbb33'],
  ['#ff6b9d','#ffbb33','#ffee55'],
]

export function PixelLogo({ compact = false }) {
  const [ci, setCi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCi(x => (x + 1) % CYCLE.length), 500)
    return () => clearInterval(t)
  }, [])
  const [c1, c2, c3] = CYCLE[ci]
  const px = compact ? 5 : 7

  return (
    <div style={{ display:'flex', alignItems:'center', gap: compact ? 10 : 18, flexShrink:0 }}>
      <div style={{ position:'relative' }}>
        {/* Strong outer glow */}
        <div style={{ position:'absolute', inset:-20, borderRadius:6, background:`radial-gradient(ellipse at center, ${c1}99 0%, ${c2}44 40%, transparent 65%)`, transition:'background 0.35s', pointerEvents:'none', filter:'blur(4px)' }} />
        <div style={{ display:'grid', gridTemplateColumns:`repeat(10, ${px}px)`, gap:2, position:'relative', zIndex:1 }}>
          {SHIELD.map((row, ri) => row.map((on, ci2) => {
            const col = on ? (ri < 2 ? c1 : ri < 5 ? c2 : c3) : 'transparent'
            return (
              <div key={`${ri}-${ci2}`} style={{
                width:px, height:px,
                background: on ? col : 'transparent',
                boxShadow: on ? `0 0 3px ${col}, 0 0 8px ${col}, 0 0 16px ${col}` : 'none',
                transition: 'all 0.35s ease',
              }} />
            )
          }))}
        </div>
      </div>
      <div>
        <div style={{
          fontFamily:PF, fontSize: compact ? 9 : 14, lineHeight:1.4, letterSpacing: compact ? 1 : 3,
          color:'#fff',
          textShadow:`0 0 10px ${c1}, 0 0 25px ${c1}, 0 0 50px ${c1}88, 3px 3px 0 ${c2}cc`,
          transition:'text-shadow 0.35s ease',
        }}>
          VOX<br/>GUARD
        </div>
        <div style={{ fontFamily:MF, fontSize: compact ? 6 : 7, color:c2, letterSpacing:3, marginTop:2, textShadow:`0 0 6px ${c2}`, transition:'all 0.35s' }}>
          v1.0.0
        </div>
      </div>
    </div>
  )
}
