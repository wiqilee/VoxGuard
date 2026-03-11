/**
 * ExplanationCard.jsx
 * ───────────────────
 * Multimodal explanation card that shows WHY VoxGuard flagged a threat.
 * Combines audio transcript analysis + screenshot analysis into a clear,
 * human-readable explanation with signal indicators.
 */

import { useState } from 'react'

const SEVERITY_COLORS = {
  critical: { bg: '#1a0a0a', border: '#ff2d2d', text: '#ff6b6b', icon: '🚨' },
  high:     { bg: '#1a1000', border: '#ff8c00', text: '#ffb347', icon: '⚠️' },
  medium:   { bg: '#0a1a1a', border: '#00bcd4', text: '#4dd0e1', icon: 'ℹ️' },
}

const SOURCE_ICONS = {
  audio:      '🎙️',
  visual:     '🖥️',
  behavioral: '🧠',
}

export default function ExplanationCard({ explanation, onDismiss }) {
  const [expanded, setExpanded] = useState(false)

  if (!explanation) return null

  const severity = explanation.key_signals?.[0]?.severity || 'high'
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.high

  const containerStyle = {
    background: colors.bg,
    border: `1px solid ${colors.border}40`,
    borderLeft: `3px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '10px',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: '12px',
    position: 'relative',
    animation: 'slideIn 0.3s ease-out',
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: colors.text, fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
            {colors.icon} {explanation.headline || 'Threat Explanation'}
          </div>

          {/* Signal badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {explanation.has_audio_signal && (
              <span style={{
                background: '#00bcd420', border: '1px solid #00bcd440',
                borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: '#4dd0e1'
              }}>
                🎙️ Audio
              </span>
            )}
            {explanation.has_visual_signal && (
              <span style={{
                background: '#ff8c0020', border: '1px solid #ff8c0040',
                borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: '#ffb347'
              }}>
                🖥️ Screen
              </span>
            )}
            {explanation.confidence && (
              <span style={{
                background: '#ffffff10', border: '1px solid #ffffff20',
                borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: '#aaa'
              }}>
                {explanation.confidence}% confidence
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', color: '#666',
            cursor: 'pointer', fontSize: '16px', padding: '0 4px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Explanation text */}
      <div style={{ color: '#ccc', lineHeight: 1.5, marginBottom: '8px' }}>
        {explanation.explanation}
      </div>

      {/* Key signals (expandable) */}
      {explanation.key_signals?.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none', color: '#888',
              cursor: 'pointer', fontSize: '11px', padding: 0,
              textDecoration: 'underline',
            }}
          >
            {expanded ? '▼ Hide signals' : '▶ Show detected signals'}
          </button>

          {expanded && (
            <div style={{ marginTop: '8px' }}>
              {explanation.key_signals.map((signal, i) => {
                const sigColor = SEVERITY_COLORS[signal.severity] || SEVERITY_COLORS.medium
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '4px 0', borderBottom: '1px solid #ffffff08',
                  }}>
                    <span style={{ fontSize: '14px' }}>
                      {SOURCE_ICONS[signal.source] || '📋'}
                    </span>
                    <span style={{ color: sigColor.text, flex: 1 }}>
                      {signal.signal}
                    </span>
                    <span style={{
                      color: sigColor.text, fontSize: '10px',
                      background: `${sigColor.border}20`,
                      padding: '1px 6px', borderRadius: '3px',
                    }}>
                      {signal.severity}
                    </span>
                  </div>
                )
              })}

              {/* Risk factors */}
              {explanation.risk_factors?.length > 0 && (
                <div style={{ marginTop: '8px', color: '#999', fontSize: '11px' }}>
                  <div style={{ color: '#ff6b6b', marginBottom: '4px' }}>Risk factors:</div>
                  {explanation.risk_factors.map((f, i) => (
                    <div key={i} style={{ paddingLeft: '8px' }}>• {f}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recommended action */}
      {explanation.recommended_action && (
        <div style={{
          marginTop: '8px', padding: '8px 10px',
          background: '#00ff4110', border: '1px solid #00ff4130',
          borderRadius: '4px', color: '#00ff41', fontSize: '11px',
        }}>
          ✅ {explanation.recommended_action}
        </div>
      )}
    </div>
  )
}
