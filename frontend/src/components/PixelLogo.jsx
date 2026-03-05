import { useState, useEffect } from 'react'

const PF = "'Press Start 2P', monospace"
const MF = "'Share Tech Mono', 'Courier New', monospace"

const SKULL = [
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,0,1,1,0,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,1,0],
  [1,0,1,0,0,1,0,1],
  [0,0,0,0,0,0,0,0],
]

const CYCLE = [
  ['#00d4ff','#7b61ff','#30d158'],
  ['#7b61ff','#ff2d55','#00d4ff'],
  ['#ff9500','#ffd60a','#7b61ff'],
  ['#30d158','#00d4ff','#ff9500'],
  ['#ff2d55','#ff9500','#ffd60a'],
]

export function PixelLogo() {
  const [ci, setCi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCi(x => (x + 1) % CYCLE.length), 600)
    return () => clearInterval(t)
  }, [])
  const [c1, c2, c3] = CYCLE[ci]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* Pixel skull */}
      <div style={{ position: 'relative' }}>
        {/* Outer glow halo — stronger */}
        <div style={{
          position: 'absolute', inset: -12, borderRadius: 4,
          background: `radial-gradient(ellipse at center, ${c1}55 0%, transparent 65%)`,
          transition: 'background 0.5s',
          pointerEvents: 'none',
        }} />
        {/* Inner secondary glow */}
        <div style={{
          position: 'absolute', inset: -4,
          background: `radial-gradient(ellipse at center, ${c2}22 0%, transparent 80%)`,
          transition: 'background 0.5s',
          pointerEvents: 'none',
        }} />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(8, 12px)', gap: 2,
          position: 'relative', zIndex: 1,
        }}>
          {SKULL.map((row, ri) => row.map((on, ci2) => {
            const col = on ? (ri < 3 ? c1 : ri < 5 ? c2 : c3) : 'transparent'
            return (
              <div key={`${ri}-${ci2}`} style={{
                width: 12, height: 12,
                background: on ? col : 'transparent',
                boxShadow: on
                  ? `0 0 8px ${col}, 0 0 20px ${col}, 0 0 36px ${col}88`
                  : 'none',
                transition: 'all 0.5s ease',
              }} />
            )
          }))}
        </div>
      </div>

      {/* Wordmark */}
      <div>
        <div style={{
          fontFamily: PF, fontSize: 13, lineHeight: 1.55, letterSpacing: 2,
          color: c1,
          textShadow: `0 0 18px ${c1}, 0 0 36px ${c1}88, 3px 3px 0 ${c2}88, 6px 6px 0 ${c3}44`,
          transition: 'all 0.5s ease',
        }}>
          SCAM<br />SHIELD
        </div>
        <div style={{
          fontFamily: MF, fontSize: 8, color: c2, letterSpacing: 3, marginTop: 3,
          textShadow: `0 0 10px ${c2}, 0 0 20px ${c2}66`,
          transition: 'all 0.5s',
        }}>v1.0.0</div>
      </div>
    </div>
  )
}
