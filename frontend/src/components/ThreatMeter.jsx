import { PF, MF } from '../utils/constants'

const SEGMENTS = 18

export function ThreatMeter({ score }) {
  const color =
    score > 75 ? '#ff2d55' :
    score > 45 ? '#ff9500' : '#30d158'
  const label =
    score > 75 ? 'CRITICAL' :
    score > 45 ? 'WARNING'  : 'SAFE'

  const filled = Math.round((score / 100) * SEGMENTS)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>

      {/* Arc meter */}
      <div style={{ position: 'relative', width: 140, height: 78 }}>
        <svg width="140" height="78" viewBox="0 0 140 78">
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const angle = (180 / (SEGMENTS - 1)) * i - 90
            const rad   = (angle * Math.PI) / 180
            const r     = 56
            const x     = 70 + r * Math.cos(rad)
            const y     = 74 + r * Math.sin(rad)
            const fc    = i < 6 ? '#30d158' : i < 12 ? '#ff9500' : '#ff2d55'
            return (
              <rect
                key={i}
                x={x - 3} y={y - 3} width={6} height={6}
                fill={i < filled ? fc : fc + '22'}
                style={{
                  filter: i < filled ? `drop-shadow(0 0 4px ${fc})` : 'none',
                  transition: 'fill 0.5s ease',
                }}
              />
            )
          })}
        </svg>

        {/* Center readout */}
        <div style={{
          position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: PF, fontSize: 18, color, textShadow: `0 0 14px ${color}`, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontFamily: MF, fontSize: 9, color: color + '99', letterSpacing: 2, marginTop: 3 }}>
            {label}
          </div>
        </div>
      </div>

      {/* Sub-score bars */}
      {[
        { l: 'VOICE',    v: Math.min(100, score + 8),  c: '#ff2d55' },
        { l: 'LANGUAGE', v: Math.max(0,   score - 5),  c: '#ff9500' },
        { l: 'BEHAVIOR', v: Math.min(100, score + 14), c: '#7b61ff' },
      ].map(item => (
        <div key={item.l} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>{item.l}</span>
            <span style={{ fontFamily: MF, fontSize: 9, color: item.c }}>{item.v}%</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 5,
                  background: i < Math.round(item.v / 100 * 14) ? item.c : item.c + '20',
                  boxShadow: i < Math.round(item.v / 100 * 14) ? `0 0 4px ${item.c}` : 'none',
                  transition: 'all 0.5s ease',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
