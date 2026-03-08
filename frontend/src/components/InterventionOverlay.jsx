import { useState, useEffect, useRef } from 'react'
import { PF, MF, getInterventionForLang, INTERVENTION_LEVELS } from '../utils/constants'

/**
 * InterventionOverlay
 * ───────────────────
 * Full-screen or banner overlay that fires when VoxGuard detects
 * the user is about to take a fatal action during a live scam call.
 *
 * Three escalation levels:
 *   WARN     → Amber banner with safe exit suggestion
 *   BLOCK    → Red overlay with verification challenge
 *   LOCKDOWN → Full-screen red lockdown, safe exit actions only
 */

const overlayCSS = `
@keyframes intv-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
@keyframes intv-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}
@keyframes intv-scan {
  0% { top: 0; }
  100% { top: 100%; }
}
@keyframes intv-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255,45,85,0.3), inset 0 0 20px rgba(255,45,85,0.05); }
  50% { box-shadow: 0 0 40px rgba(255,45,85,0.6), inset 0 0 40px rgba(255,45,85,0.1); }
}
@keyframes intv-border {
  0%, 100% { border-color: #ff2d55; }
  50% { border-color: #ff9500; }
}
@keyframes intv-fadeIn {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes intv-countPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
`

function ChallengeStep({ challenge, index, onAnswer }) {
  const [ans, setAns] = useState(null)
  const isSafe = ans === 'safe'

  return (
    <div style={{
      padding: '14px 16px',
      marginBottom: 8,
      border: `1px solid ${ans ? (isSafe ? '#ff2d5566' : '#30d15844') : 'rgba(255,255,255,0.1)'}`,
      background: ans ? (isSafe ? 'rgba(255,45,85,0.08)' : 'rgba(48,209,88,0.06)') : 'rgba(255,255,255,0.02)',
      transition: 'all 0.3s',
    }}>
      <div style={{ fontFamily: MF, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 10, lineHeight: 1.6 }}>
        <span style={{ fontFamily: PF, fontSize: 8, color: '#ff9500', marginRight: 8 }}>Q{index + 1}</span>
        {challenge.q}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { setAns('safe'); onAnswer(true) }}
          disabled={ans !== null}
          style={{
            flex: 1, padding: '10px', fontFamily: MF, fontSize: 11,
            border: `1px solid ${ans === 'safe' ? '#ff2d55' : 'rgba(255,45,85,0.3)'}`,
            background: ans === 'safe' ? 'rgba(255,45,85,0.15)' : 'rgba(255,45,85,0.04)',
            color: ans === 'safe' ? '#ff2d55' : 'rgba(255,255,255,0.6)',
            cursor: ans ? 'default' : 'pointer', transition: 'all 0.2s',
          }}
        >
          {challenge.safe}
        </button>
        <button
          onClick={() => { setAns('unsafe'); onAnswer(false) }}
          disabled={ans !== null}
          style={{
            flex: 1, padding: '10px', fontFamily: MF, fontSize: 11,
            border: `1px solid ${ans === 'unsafe' ? '#30d158' : 'rgba(48,209,88,0.3)'}`,
            background: ans === 'unsafe' ? 'rgba(48,209,88,0.1)' : 'rgba(48,209,88,0.04)',
            color: ans === 'unsafe' ? '#30d158' : 'rgba(255,255,255,0.6)',
            cursor: ans ? 'default' : 'pointer', transition: 'all 0.2s',
          }}
        >
          {challenge.unsafe}
        </button>
      </div>
      {ans && (
        <div style={{
          marginTop: 8, fontFamily: MF, fontSize: 10,
          color: isSafe ? '#ff2d55' : '#30d158',
        }}>
          {isSafe ? '⚠ This is a scam indicator' : '✓ Lower risk response'}
        </div>
      )}
    </div>
  )
}

export function InterventionOverlay({ intervention, language, onDismiss, onStop }) {
  const { challenges, safeExits } = getInterventionForLang(language)
  const [phase, setPhase] = useState('alert') // alert | challenge | result
  const [scamAnswers, setScamAnswers] = useState(0)
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [countdown, setCountdown] = useState(null)
  const countRef = useRef(null)

  const level = intervention?.level || 'WARN'
  const isBlock = level === 'BLOCK' || level === 'LOCKDOWN'
  const isLockdown = level === 'LOCKDOWN'
  const c = isLockdown ? '#ff2d55' : level === 'BLOCK' ? '#ff2d55' : '#ff9500'

  // Auto-countdown for LOCKDOWN: if user doesn't respond in 30s, auto-stop
  useEffect(() => {
    if (isLockdown) {
      setCountdown(30)
      countRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countRef.current)
            onDismiss('safe_exit')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(countRef.current)
    }
  }, [isLockdown])

  const handleChallengeAnswer = (isScamIndicator) => {
    const newTotal = totalAnswers + 1
    const newScam = scamAnswers + (isScamIndicator ? 1 : 0)
    setTotalAnswers(newTotal)
    setScamAnswers(newScam)
    if (newTotal >= challenges.challenges.length) {
      setPhase('result')
    }
  }

  const scamRatio = totalAnswers > 0 ? scamAnswers / totalAnswers : 0
  const isScamResult = scamRatio >= 0.5

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: isLockdown
        ? 'rgba(20,0,0,0.97)'
        : isBlock
          ? 'rgba(10,0,0,0.92)'
          : 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'intv-fadeIn 0.3s ease',
    }}>
      <style>{overlayCSS}</style>

      {/* Scanline effect for LOCKDOWN */}
      {isLockdown && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,45,85,0.03) 2px,rgba(255,45,85,0.03) 4px)',
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg,transparent,#ff2d5544,transparent)',
            animation: 'intv-scan 2s linear infinite',
          }} />
        </div>
      )}

      <div style={{
        maxWidth: isLockdown ? 700 : 600, width: '95%', maxHeight: '90vh', overflowY: 'auto',
        border: `2px solid ${c}`,
        background: 'rgba(2,4,8,0.98)',
        animation: isLockdown ? 'intv-glow 2s ease-in-out infinite' : 'intv-border 2s ease-in-out infinite',
        position: 'relative',
      }}>
        {/* Corner brackets */}
        {[{ top: -1, left: -1 }, { top: -1, right: -1 }, { bottom: -1, left: -1 }, { bottom: -1, right: -1 }].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', ...pos, width: 20, height: 20 }}>
            <div style={{ position: 'absolute', [pos.top !== undefined ? 'top' : 'bottom']: 0, [pos.left !== undefined ? 'left' : 'right']: 0, width: 20, height: 2, background: c }} />
            <div style={{ position: 'absolute', [pos.top !== undefined ? 'top' : 'bottom']: 0, [pos.left !== undefined ? 'left' : 'right']: 0, width: 2, height: 20, background: c }} />
          </div>
        ))}

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${c}44`,
          background: `linear-gradient(180deg,${c}18,transparent)`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 28,
                animation: isLockdown ? 'intv-shake 0.5s ease-in-out infinite' : 'intv-pulse 1.5s ease-in-out infinite',
              }}>
                {isLockdown ? '🚨' : isBlock ? '🛑' : '⚠️'}
              </span>
              <div>
                <div style={{
                  fontFamily: PF, fontSize: isLockdown ? 12 : 10, color: c,
                  textShadow: `0 0 16px ${c}`,
                  animation: isLockdown ? 'intv-pulse 1s ease-in-out infinite' : 'none',
                }}>
                  {isLockdown ? 'LOCKDOWN — SCAM CONFIRMED' : isBlock ? 'DANGER — BLOCK ACTIVE' : 'WARNING — HIGH RISK DETECTED'}
                </div>
                <div style={{ fontFamily: MF, fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  Pattern: {intervention.pattern} · Score: {intervention.threatScore}/100
                </div>
              </div>
            </div>
            {isLockdown && countdown !== null && (
              <div style={{
                fontFamily: PF, fontSize: 22, color: '#ff2d55',
                textShadow: '0 0 20px #ff2d55',
                animation: 'intv-countPulse 1s ease-in-out infinite',
              }}>
                {countdown}s
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>

          {/* Phase: Alert */}
          {phase === 'alert' && (
            <>
              <div style={{
                fontFamily: MF, fontSize: 13, color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.8, marginBottom: 20,
                padding: '14px 16px', borderLeft: `3px solid ${c}`,
                background: `${c}0a`,
              }}>
                {isLockdown
                  ? 'VoxGuard has detected CONFIRMED SCAM patterns with maximum confidence. Your money and personal data are at immediate risk. DO NOT share any information with this caller.'
                  : isBlock
                    ? 'VoxGuard detected a dangerous pattern that is commonly used to steal your money or credentials. Pause and verify before continuing.'
                    : 'Multiple scam indicators detected. We recommend caution before proceeding with any requests from this caller.'
                }
              </div>

              {/* Safe Exit Actions */}
              <div style={{ fontFamily: PF, fontSize: 7, color: '#30d158', marginBottom: 12, letterSpacing: 1 }}>
                SAFE EXIT ACTIONS
              </div>
              {safeExits.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', marginBottom: 4,
                  borderLeft: `3px solid ${a.priority === 'critical' ? '#ff2d55' : '#ff9500'}`,
                  background: `${a.priority === 'critical' ? '#ff2d55' : '#ff9500'}08`,
                }}>
                  <span style={{ fontSize: 16 }}>{a.icon}</span>
                  <span style={{ fontFamily: MF, fontSize: 12, color: 'rgba(255,255,255,0.8)', flex: 1 }}>{a.text}</span>
                </div>
              ))}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {isBlock && (
                  <button
                    onClick={() => setPhase('challenge')}
                    style={{
                      flex: 1, padding: '14px', fontFamily: PF, fontSize: 7,
                      border: '1px solid #ff950066', background: 'rgba(255,149,0,0.1)',
                      color: '#ff9500', cursor: 'pointer', letterSpacing: 1,
                    }}
                  >
                    🧠 TAKE VERIFICATION CHALLENGE
                  </button>
                )}
                <button
                  onClick={() => onDismiss('safe_exit')}
                  style={{
                    flex: 1, padding: '14px', fontFamily: PF, fontSize: 7,
                    border: '2px solid #ff2d55', background: 'rgba(255,45,85,0.15)',
                    color: '#ff2d55', cursor: 'pointer', letterSpacing: 1,
                    animation: 'intv-pulse 1.5s ease-in-out infinite',
                  }}
                >
                  📵 END CALL — SAFE EXIT
                </button>
                {!isLockdown && (
                  <button
                    onClick={() => onDismiss('dismissed')}
                    style={{
                      padding: '14px 20px', fontFamily: MF, fontSize: 10,
                      border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                    }}
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </>
          )}

          {/* Phase: Verification Challenge */}
          {phase === 'challenge' && (
            <>
              <div style={{
                fontFamily: PF, fontSize: 8, color: '#ff9500',
                marginBottom: 6, letterSpacing: 1,
              }}>
                {challenges.title}
              </div>
              <div style={{
                fontFamily: MF, fontSize: 11, color: 'rgba(255,255,255,0.6)',
                marginBottom: 16,
              }}>
                {challenges.question}
              </div>
              {challenges.challenges.map((ch, i) => (
                <ChallengeStep
                  key={i}
                  challenge={ch}
                  index={i}
                  onAnswer={handleChallengeAnswer}
                />
              ))}
            </>
          )}

          {/* Phase: Result */}
          {phase === 'result' && (
            <>
              <div style={{
                padding: '20px',
                border: `2px solid ${isScamResult ? '#ff2d55' : '#30d158'}`,
                background: `${isScamResult ? '#ff2d55' : '#30d158'}0c`,
                marginBottom: 20, textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>
                  {isScamResult ? '🚨' : '✓'}
                </div>
                <div style={{
                  fontFamily: PF, fontSize: 10,
                  color: isScamResult ? '#ff2d55' : '#30d158',
                  marginBottom: 10,
                }}>
                  {isScamResult ? 'SCAM CONFIRMED' : 'LOWER RISK'}
                </div>
                <div style={{
                  fontFamily: MF, fontSize: 12,
                  color: 'rgba(255,255,255,0.7)', lineHeight: 1.8,
                }}>
                  {isScamResult ? challenges.result_scam : challenges.result_safe}
                </div>
                <div style={{
                  fontFamily: MF, fontSize: 10, color: 'rgba(255,255,255,0.4)',
                  marginTop: 8,
                }}>
                  Scam indicators: {scamAnswers}/{totalAnswers}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => onDismiss(isScamResult ? 'challenge_failed' : 'challenge_passed')}
                  style={{
                    flex: 1, padding: '14px', fontFamily: PF, fontSize: 7,
                    border: `2px solid ${isScamResult ? '#ff2d55' : '#30d158'}`,
                    background: `${isScamResult ? '#ff2d55' : '#30d158'}15`,
                    color: isScamResult ? '#ff2d55' : '#30d158',
                    cursor: 'pointer', letterSpacing: 1,
                  }}
                >
                  {isScamResult ? '📵 END CALL NOW' : '► CONTINUE WITH CAUTION'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 24px',
          borderTop: `1px solid ${c}22`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: MF, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
            VOXGUARD LIVE INTERVENTION · {intervention.id}
          </span>
          <span style={{ fontFamily: MF, fontSize: 8, color: c + '88' }}>
            {intervention.trigger === 'instant_pattern' ? '⚡ INSTANT' : '📊 SCORE'} TRIGGER
          </span>
        </div>
      </div>
    </div>
  )
}