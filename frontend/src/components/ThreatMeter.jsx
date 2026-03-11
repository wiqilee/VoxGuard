import { useState } from 'react'
import { PF, MF } from '../utils/constants'

const SEGMENTS = 18

const meterCSS = `
@keyframes tm-bar-glow-0 {
  0%,100% { box-shadow: 0 0 4px var(--tm-c); } 
  50% { box-shadow: 0 0 12px var(--tm-c), 0 0 24px color-mix(in srgb, var(--tm-c) 40%, transparent); }
}
@keyframes tm-label-glow {
  0%,100% { text-shadow: none; }
  50% { text-shadow: 0 0 8px currentColor; }
}
@keyframes tm-segment-pulse {
  0%,100% { filter: brightness(1); }
  50% { filter: brightness(1.4); }
}
`

export function ThreatMeter({ score }) {
  const color =
    score > 75 ? '#ff2d55' :
    score > 45 ? '#ff9500' : '#30d158'
  const label =
    score > 75 ? 'CRITICAL' :
    score > 45 ? 'WARNING'  : 'SAFE'

  const filled = Math.round((score / 100) * SEGMENTS)

  const voice    = score === 0 ? 0 : Math.min(100, score + 8)
  const language = score === 0 ? 0 : Math.max(0, score - 5)
  const behavior = score === 0 ? 0 : Math.min(100, score + 14)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <style>{meterCSS}</style>

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

      {/* Sub-score bars with hover animations */}
      {[
        { l: 'VOICE',    v: voice,    colors: ['#881133','#cc2244','#ff5577'] },
        { l: 'LANGUAGE', v: language,  colors: ['#885500','#cc8800','#ffbb44'] },
        { l: 'BEHAVIOR', v: behavior, colors: ['#3d2099','#5b3dbb','#7b61ff'] },
      ].map(item => (
        <SubScoreBar key={item.l} item={item} />
      ))}
    </div>
  )
}

function SubScoreBar({ item }) {
  const [hov, setHov] = useState(false)
  const accentColor = item.colors[2]

  return (
    <div
      style={{ width: '100%', cursor: 'default' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{
          fontFamily: MF, fontSize: 9,
          color: hov ? accentColor : 'rgba(255,255,255,0.35)',
          letterSpacing: 1,
          transition: 'color 0.2s',
          animation: hov ? 'tm-label-glow 1.5s ease infinite' : 'none',
          textShadow: hov ? `0 0 8px ${accentColor}` : 'none',
        }}>
          {item.l}
        </span>
        <span style={{
          fontFamily: MF, fontSize: 9,
          color: item.v === 0 ? 'rgba(255,255,255,0.25)' : accentColor,
          textShadow: hov && item.v > 0 ? `0 0 10px ${accentColor}` : 'none',
          transition: 'text-shadow 0.2s',
        }}>
          {item.v}%
        </span>
      </div>
      <div style={{
        display: 'flex', gap: 2,
        transform: hov ? 'scaleY(1.3)' : 'scaleY(1)',
        transformOrigin: 'bottom',
        transition: 'transform 0.2s ease',
      }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const on = i < Math.round(item.v / 100 * 14)
          const colorIdx = i < 5 ? 0 : i < 10 ? 1 : 2
          return (
            <div
              key={i}
              style={{
                flex: 1, height: 5,
                background: on ? item.colors[colorIdx] : item.colors[2] + '20',
                boxShadow: on
                  ? hov
                    ? `0 0 8px ${item.colors[colorIdx]}, 0 0 16px ${item.colors[colorIdx]}44`
                    : `0 0 4px ${item.colors[colorIdx]}`
                  : 'none',
                transition: 'all 0.3s ease',
                animation: on && hov ? `tm-segment-pulse 1.5s ease-in-out infinite ${i * 0.05}s` : 'none',
              }}
            />
          )
        })}
      </div>
      {/* Hover underline glow */}
      {hov && (
        <div style={{
          height: 1, marginTop: 3,
          background: `linear-gradient(90deg, transparent, ${accentColor}66, transparent)`,
          boxShadow: `0 0 8px ${accentColor}44`,
        }} />
      )}
    </div>
  )
}
