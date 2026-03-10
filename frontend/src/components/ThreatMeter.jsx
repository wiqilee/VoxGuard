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

  /* Sub-scores derive from main score but stay at 0 when score is 0 */
  const voice    = score === 0 ? 0 : Math.min(100, score + 8)
  const language = score === 0 ? 0 : Math.max(0, score - 5)
  const behavior = score === 0 ? 0 : Math.min(100, score + 14)

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
        { l: 'VOICE',    v: voice,    colors: ['#881133','#cc2244','#ff5577'] },
        { l: 'LANGUAGE', v: language,  colors: ['#885500','#cc8800','#ffbb44'] },
        { l: 'BEHAVIOR', v: behavior, colors: ['#3d2099','#5b3dbb','#7b61ff'] },
      ].map(item => (
        <div key={item.l} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>{item.l}</span>
            <span style={{ fontFamily: MF, fontSize: 9, color: item.v === 0 ? 'rgba(255,255,255,0.25)' : item.colors[2] }}>{item.v}%</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 14 }).map((_, i) => {
              const on = i < Math.round(item.v / 100 * 14)
              const colorIdx = i < 5 ? 0 : i < 10 ? 1 : 2
              return (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 5,
                    background: on ? item.colors[colorIdx] : item.colors[2] + '20',
                    boxShadow: on ? `0 0 4px ${item.colors[colorIdx]}` : 'none',
                    transition: 'all 0.5s ease',
                  }}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}