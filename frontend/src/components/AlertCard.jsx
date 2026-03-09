import { useState, useEffect } from 'react'
import { PBox } from './Primitives'
import { SEV, PSYCH_TACTICS, PF, MF } from '../utils/constants'

const alertCSS = `
@keyframes alert-glow-critical {
  0%, 100% { box-shadow: inset 0 0 12px rgba(255,45,85,0.04); }
  50% { box-shadow: inset 0 0 20px rgba(255,45,85,0.12), 0 0 16px rgba(255,45,85,0.08); }
}
@keyframes alert-glow-high {
  0%, 100% { box-shadow: inset 0 0 12px rgba(255,149,0,0.04); }
  50% { box-shadow: inset 0 0 18px rgba(255,149,0,0.1), 0 0 12px rgba(255,149,0,0.06); }
}
@keyframes alert-intervention-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(255,45,85,0.3); }
  50% { opacity: 0.85; box-shadow: 0 0 10px rgba(255,45,85,0.6), 0 0 20px rgba(255,45,85,0.2); }
}
@keyframes alert-enter {
  0% { opacity: 0; transform: translateX(20px) scale(0.98); }
  60% { opacity: 1; transform: translateX(-3px) scale(1.005); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes alert-dot-critical {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px currentColor, 0 0 12px currentColor; }
  50% { opacity: 0.4; box-shadow: 0 0 2px currentColor; }
}
`

export function AlertCard({ alert, index = 0 }) {
  const [visible,  setVisible]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const c = SEV[alert.severity]
  const isCritical = alert.severity === 'critical'
  const isHigh = alert.severity === 'high'
  const hasIntervention = alert.triggered_intervention

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 150)
    return () => clearTimeout(t)
  }, [index])

  // Severity-specific glow animation
  const glowAnim = isCritical ? 'alert-glow-critical 3s ease-in-out infinite'
    : isHigh ? 'alert-glow-high 4s ease-in-out infinite'
    : 'none'

  return (
    <PBox
      color={c.border}
      onClick={() => setExpanded(e => !e)}
      style={{
        marginBottom: 10,
        padding: '12px 14px',
        background: c.bg,
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        animation: visible ? `alert-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards${glowAnim !== 'none' ? `, ${glowAnim}` : ''}` : 'none',
        animationDelay: visible ? `${index * 0.12}s, 0s` : '0s',
        transition: 'background 0.2s ease',
        // Intervention border accent
        borderLeft: hasIntervention ? `3px solid #ff2d55` : undefined,
      }}
    >
      <style>{alertCSS}</style>

      {/* CRT scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.1) 3px,rgba(0,0,0,0.1) 4px)',
      }} />

      {/* Top-edge color bar for hierarchy */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${c.border}, ${c.border}88, transparent)`,
        opacity: isCritical ? 0.8 : 0.4,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{
              width: 8, height: 8, background: c.text, color: c.text,
              boxShadow: c.glow,
              animation: isCritical ? 'alert-dot-critical 1s ease-in-out infinite' : 'blink 1s step-end infinite',
            }} />
            <span style={{ fontFamily: PF, fontSize: 7, color: c.text, letterSpacing: 1,
              textShadow: isCritical ? `0 0 8px ${c.text}66` : 'none',
            }}>
              {alert.pattern}
            </span>
            {/* Intervention badge — more prominent */}
            {hasIntervention && (
              <span style={{
                fontFamily: PF, fontSize: 5, padding: '3px 8px',
                border: '1px solid #ff2d55',
                background: 'rgba(255,45,85,0.2)',
                color: '#ff2d55',
                letterSpacing: 1,
                animation: 'alert-intervention-pulse 2s ease-in-out infinite',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                🛑 INTERVENED
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: MF, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              {alert.time}
            </span>
            <div style={{
              fontFamily: PF, fontSize: 7, padding: '3px 8px',
              border: `1px solid ${c.border}`, color: c.text, background: c.bg,
              textShadow: isCritical ? `0 0 6px ${c.text}44` : 'none',
            }}>
              {alert.confidence}%
            </div>
          </div>
        </div>

        {/* Quote */}
        <div style={{ fontFamily: MF, fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          {alert.quote}
        </div>

        {/* Expanded: psych tactics */}
        {expanded && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${c.border}40` }}>
            <div style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.65)', marginBottom: 8, letterSpacing: 1 }}>
              PSYCHOLOGICAL TACTICS DETECTED:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {(alert.tactics || []).map(t => {
                const tac = PSYCH_TACTICS.find(p => p.id === t)
                return (
                  <div key={t} style={{
                    fontFamily: PF, fontSize: 6, padding: '4px 8px',
                    border: `1px solid ${tac?.color}60`,
                    color: tac?.color,
                    background: tac?.color + '15',
                    boxShadow: `0 0 8px ${tac?.color}15`,
                  }}>
                    {tac?.icon} {t}
                  </div>
                )
              })}
            </div>
            {hasIntervention && (
              <div style={{
                fontFamily: MF, fontSize: 9, color: '#ff2d55',
                padding: '8px 12px', marginBottom: 8,
                border: '1px solid #ff2d5544',
                background: 'rgba(255,45,85,0.06)',
                borderLeft: '3px solid #ff2d55',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 12 }}>🛑</span>
                This alert triggered a Live Intervention
              </div>
            )}
            <div style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>
              SOURCE: {alert.source} &nbsp;·&nbsp; CLICK TO COLLAPSE
            </div>
          </div>
        )}

        {!expanded && (
          <div style={{ fontFamily: MF, fontSize: 9, color: c.text+'99', marginTop: 6, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:8, opacity:0.7 }}>▼</span> click to expand tactics
          </div>
        )}
      </div>
    </PBox>
  )
}
