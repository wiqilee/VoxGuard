import { useState, useEffect } from 'react'
import { PBox } from './Primitives'
import { SEV, PSYCH_TACTICS, PF, MF } from '../utils/constants'

export function AlertCard({ alert, index = 0 }) {
  const [visible,  setVisible]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const c = SEV[alert.severity]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 150)
    return () => clearTimeout(t)
  }, [index])

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
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* CRT scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.1) 3px,rgba(0,0,0,0.1) 4px)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, background: c.text,
              boxShadow: c.glow,
              animation: 'blink 1s step-end infinite',
            }} />
            <span style={{ fontFamily: PF, fontSize: 7, color: c.text, letterSpacing: 1 }}>
              {alert.pattern}
            </span>
            {/* Intervention badge */}
            {alert.triggered_intervention && (
              <span style={{
                fontFamily: PF, fontSize: 5, padding: '2px 6px',
                border: '1px solid #ff2d55',
                background: 'rgba(255,45,85,0.2)',
                color: '#ff2d55',
                letterSpacing: 1,
                animation: 'blink 1.5s step-end infinite',
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
                  }}>
                    {tac?.icon} {t}
                  </div>
                )
              })}
            </div>
            {alert.triggered_intervention && (
              <div style={{
                fontFamily: MF, fontSize: 9, color: '#ff2d55',
                padding: '6px 10px', marginBottom: 8,
                border: '1px solid #ff2d5544',
                background: 'rgba(255,45,85,0.06)',
              }}>
                🛑 This alert triggered a Live Intervention
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