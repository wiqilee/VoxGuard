/**
 * ActionAgent.jsx
 * ────────────────
 * Guided Anti-Scam Action Agent UI.
 *
 * After Safe Exit or session end, displays a step-by-step checklist
 * of personalized recovery actions based on scam type, country, and severity.
 * Users can check off completed steps, and the component tracks progress.
 */

import { useState, useCallback } from 'react'

const URGENCY_STYLES = {
  CRITICAL: { bg: '#1a0505', border: '#ff2d2d', accent: '#ff6b6b', badge: '🚨 CRITICAL' },
  HIGH:     { bg: '#1a0f00', border: '#ff8c00', accent: '#ffb347', badge: '⚠️ HIGH' },
  MODERATE: { bg: '#0a1a0a', border: '#00ff41', accent: '#4dff7c', badge: 'ℹ️ MODERATE' },
}

const STEP_URGENCY_COLORS = {
  critical:    '#ff2d2d',
  immediate:   '#ff6b6b',
  high:        '#ff8c00',
  recommended: '#00bcd4',
  ongoing:     '#888888',
}

export default function ActionAgent({ plan, onClose }) {
  const [completedSteps, setCompletedSteps] = useState(new Set())

  const toggleStep = useCallback((stepNum) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepNum)) {
        next.delete(stepNum)
      } else {
        next.add(stepNum)
      }
      return next
    })
  }, [])

  if (!plan || !plan.steps) return null

  const style = URGENCY_STYLES[plan.urgency_level] || URGENCY_STYLES.MODERATE
  const progress = plan.total_steps > 0
    ? Math.round((completedSteps.size / plan.total_steps) * 100)
    : 0

  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}50`,
      borderRadius: '10px',
      padding: '16px',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: '12px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ color: style.accent, fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
            🛡️ Anti-Scam Action Plan
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              background: `${style.border}30`, border: `1px solid ${style.border}60`,
              borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color: style.accent,
            }}>
              {style.badge}
            </span>
            {plan.country && (
              <span style={{ color: '#aaa', fontSize: '11px' }}>
                {plan.country.flag} {plan.country.name}
              </span>
            )}
            <span style={{ color: '#666', fontSize: '11px' }}>
              ⏱ {plan.estimated_time}
            </span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#666',
            cursor: 'pointer', fontSize: '16px',
          }}>×</button>
        )}
      </div>

      {/* Urgency message */}
      <div style={{
        background: `${style.border}15`, border: `1px solid ${style.border}30`,
        borderRadius: '6px', padding: '8px 12px', marginBottom: '12px',
        color: style.accent, fontSize: '11px', lineHeight: 1.5,
      }}>
        {plan.urgency_message}
      </div>

      {/* AI personalized advice */}
      {plan.personalized_advice && (
        <div style={{
          background: '#00bcd410', border: '1px solid #00bcd430',
          borderRadius: '6px', padding: '8px 12px', marginBottom: '12px',
          color: '#4dd0e1', fontSize: '11px', lineHeight: 1.5,
        }}>
          🤖 {plan.personalized_advice}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#888', fontSize: '10px' }}>Progress</span>
          <span style={{ color: '#888', fontSize: '10px' }}>
            {completedSteps.size}/{plan.total_steps} steps ({progress}%)
          </span>
        </div>
        <div style={{
          height: '4px', background: '#ffffff10', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: progress === 100 ? '#00ff41' : style.accent,
            borderRadius: '2px', transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Steps checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {plan.steps.map((step) => {
          const done = completedSteps.has(step.step)
          const urgColor = STEP_URGENCY_COLORS[step.urgency] || '#888'

          return (
            <div
              key={step.step}
              onClick={() => toggleStep(step.step)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                background: done ? '#00ff4108' : '#ffffff05',
                border: done ? '1px solid #00ff4120' : '1px solid #ffffff10',
                opacity: done ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                border: done ? '2px solid #00ff41' : '2px solid #555',
                background: done ? '#00ff4130' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', color: '#00ff41', marginTop: '1px',
              }}>
                {done ? '✓' : ''}
              </div>

              {/* Icon */}
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{step.icon}</span>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  color: done ? '#666' : '#ddd',
                  textDecoration: done ? 'line-through' : 'none',
                  lineHeight: 1.4,
                }}>
                  {step.action}
                </div>
              </div>

              {/* Urgency badge */}
              <span style={{
                fontSize: '9px', color: urgColor, flexShrink: 0,
                background: `${urgColor}15`, border: `1px solid ${urgColor}30`,
                borderRadius: '3px', padding: '1px 5px',
              }}>
                {step.urgency}
              </span>
            </div>
          )
        })}
      </div>

      {/* Emergency contact */}
      {plan.country?.emergency && (
        <div style={{
          marginTop: '12px', padding: '8px 12px',
          background: '#ff2d2d10', border: '1px solid #ff2d2d30',
          borderRadius: '6px', color: '#ff6b6b', fontSize: '11px',
          textAlign: 'center',
        }}>
          🚨 Emergency: Call <strong>{plan.country.emergency}</strong> if you feel in danger
        </div>
      )}

      {/* Intervention summary */}
      {plan.intervention_summary && plan.intervention_summary.total > 0 && (
        <div style={{
          marginTop: '8px', padding: '6px 10px',
          background: '#ffffff05', borderRadius: '4px',
          color: '#888', fontSize: '10px',
        }}>
          🛑 {plan.intervention_summary.total} intervention(s) fired during this session
          (highest: {plan.intervention_summary.highest_level})
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        marginTop: '10px', color: '#555', fontSize: '9px',
        textAlign: 'center', fontStyle: 'italic',
      }}>
        {plan.disclaimer}
      </div>
    </div>
  )
}
