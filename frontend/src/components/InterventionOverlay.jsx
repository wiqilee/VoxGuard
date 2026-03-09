import { useState, useEffect, useRef } from 'react'
import { PF, MF, isChallengeAvailable, getChallengeForScenario, getSafeExitForLang } from '../utils/constants'

/**
 * InterventionOverlay
 * ───────────────────
 * Three flows based on intervention level + pattern:
 *
 * 1. WARN (score >= 55, non-fatal patterns)
 *    → Amber banner · Verify Caller button + Safe Exit button
 *
 * 2. BLOCK (score >= 75 OR instant pattern)
 *    → If fatal pattern (OTP/transfer/gift card/crypto): Safe Exit ONLY
 *    → If verifiable pattern (impersonation/support): Verify + Safe Exit
 *
 * 3. LOCKDOWN (score >= 90)
 *    → Red full-screen · Safe Exit ONLY · 30s auto-disconnect countdown
 */

const overlayCSS = `
@keyframes intv-fadein { 0% { opacity:0; } 100% { opacity:1; } }
@keyframes intv-slidein { 0% { opacity:0; transform:translateY(20px) scale(0.97); } 100% { opacity:1; transform:translateY(0) scale(1); } }
@keyframes intv-pulse-border { 0%,100% { border-color: #ff2d55; } 50% { border-color: #ff9500; } }
@keyframes intv-lockdown-bg { 0%,100% { background: rgba(255,45,85,0.12); } 50% { background: rgba(255,45,85,0.2); } }
@keyframes intv-countdown { 0% { width: 100%; } 100% { width: 0%; } }
@keyframes intv-shake { 0%,100% { transform: translateX(0); } 10%,30%,50%,70%,90% { transform: translateX(-3px); } 20%,40%,60%,80% { transform: translateX(3px); } }
`

// Localized labels
const LABELS = {
  en: { verify:'Verify This Caller', safeExit:'End Call — Safe Exit', verifyOfficial:'I Will Verify Through Official Channel', dismiss:'Continue With Caution', lockdownTitle:'LOCKDOWN — CONFIRMED THREAT', lockdownSub:'This call has been identified as extremely dangerous.', autoDisconnect:'Auto-disconnect in', seconds:'s', resultTitle:'VERIFICATION RESULT', likelyScam:'⚠ LIKELY SCAM', exerciseCaution:'⚡ EXERCISE CAUTION', fatalTitle:'IMMEDIATE DANGER', fatalSub:'This caller is attempting to extract your credentials or money RIGHT NOW.', doNotShare:'Do NOT share any codes, PINs, passwords, or make any transfers.' },
  id: { verify:'Verifikasi Penelepon', safeExit:'Akhiri Panggilan — Keluar Aman', verifyOfficial:'Saya Akan Verifikasi Lewat Saluran Resmi', dismiss:'Lanjutkan Dengan Hati-hati', lockdownTitle:'LOCKDOWN — ANCAMAN TERKONFIRMASI', lockdownSub:'Panggilan ini sangat berbahaya.', autoDisconnect:'Auto-putus dalam', seconds:'d', resultTitle:'HASIL VERIFIKASI', likelyScam:'⚠ KEMUNGKINAN PENIPUAN', exerciseCaution:'⚡ BERHATI-HATI', fatalTitle:'BAHAYA LANGSUNG', fatalSub:'Penelepon sedang mencoba mengambil data atau uang Anda SEKARANG.', doNotShare:'JANGAN bagikan kode, PIN, password, atau lakukan transfer apapun.' },
  zh: { verify:'验证来电者', safeExit:'结束通话 — 安全退出', verifyOfficial:'我将通过官方渠道验证', dismiss:'谨慎继续', lockdownTitle:'锁定 — 确认威胁', lockdownSub:'此通话已被确认为极度危险。', autoDisconnect:'自动断开', seconds:'秒', resultTitle:'验证结果', likelyScam:'⚠ 可能是诈骗', exerciseCaution:'⚡ 请谨慎', fatalTitle:'立即危险', fatalSub:'来电者正在试图获取您的凭证或资金。', doNotShare:'不要分享任何验证码、密码或进行转账。' },
  ja: { verify:'発信者を確認', safeExit:'通話終了 — 安全退出', verifyOfficial:'公式チャネルで確認します', dismiss:'注意して続行', lockdownTitle:'ロックダウン — 脅威確認', lockdownSub:'この通話は極めて危険です。', autoDisconnect:'自動切断', seconds:'秒', resultTitle:'確認結果', likelyScam:'⚠ 詐欺の可能性', exerciseCaution:'⚡ 注意してください', fatalTitle:'緊急の危険', fatalSub:'発信者があなたの情報を盗もうとしています。', doNotShare:'暗証番号やパスワードを絶対に教えないでください。' },
  ko: { verify:'발신자 확인', safeExit:'통화 종료 — 안전 퇴장', verifyOfficial:'공식 채널로 확인하겠습니다', dismiss:'주의하며 계속', lockdownTitle:'잠금 — 위협 확인', lockdownSub:'이 통화는 매우 위험합니다.', autoDisconnect:'자동 종료', seconds:'초', resultTitle:'확인 결과', likelyScam:'⚠ 사기 가능성', exerciseCaution:'⚡ 주의 필요', fatalTitle:'즉각적 위험', fatalSub:'발신자가 귀하의 정보를 탈취하려 합니다.', doNotShare:'코드, PIN, 비밀번호를 절대 공유하지 마세요.' },
  es: { verify:'Verificar Llamante', safeExit:'Finalizar Llamada — Salida Segura', verifyOfficial:'Verificaré Por Canal Oficial', dismiss:'Continuar Con Precaución', lockdownTitle:'BLOQUEO — AMENAZA CONFIRMADA', lockdownSub:'Esta llamada es extremadamente peligrosa.', autoDisconnect:'Desconexión automática en', seconds:'s', resultTitle:'RESULTADO', likelyScam:'⚠ PROBABLE FRAUDE', exerciseCaution:'⚡ PRECAUCIÓN', fatalTitle:'PELIGRO INMEDIATO', fatalSub:'El llamante está intentando robar sus datos AHORA.', doNotShare:'NO comparta códigos, PIN, contraseñas ni haga transferencias.' },
  fr: { verify:'Vérifier l\'Appelant', safeExit:'Fin d\'Appel — Sortie Sûre', verifyOfficial:'Je Vérifierai Par Canal Officiel', dismiss:'Continuer Avec Prudence', lockdownTitle:'VERROUILLAGE — MENACE CONFIRMÉE', lockdownSub:'Cet appel est extrêmement dangereux.', autoDisconnect:'Déconnexion auto dans', seconds:'s', resultTitle:'RÉSULTAT', likelyScam:'⚠ PROBABLE FRAUDE', exerciseCaution:'⚡ PRUDENCE', fatalTitle:'DANGER IMMÉDIAT', fatalSub:'L\'appelant tente de voler vos données MAINTENANT.', doNotShare:'NE partagez PAS de codes, PIN ou mots de passe.' },
  hi: { verify:'कॉलर की पुष्टि करें', safeExit:'कॉल समाप्त — सुरक्षित निकास', verifyOfficial:'मैं आधिकारिक चैनल से सत्यापित करूंगा', dismiss:'सावधानी से जारी रखें', lockdownTitle:'लॉकडाउन — खतरा पुष्ट', lockdownSub:'यह कॉल अत्यंत खतरनाक है।', autoDisconnect:'स्वतः डिस्कनेक्ट', seconds:'से', resultTitle:'सत्यापन परिणाम', likelyScam:'⚠ संभावित धोखाधड़ी', exerciseCaution:'⚡ सावधान रहें', fatalTitle:'तत्काल खतरा', fatalSub:'कॉलर आपका डेटा चुराने की कोशिश कर रहा है।', doNotShare:'कोई कोड, PIN या पासवर्ड साझा न करें।' },
  ar: { verify:'تحقق من المتصل', safeExit:'إنهاء المكالمة — خروج آمن', verifyOfficial:'سأتحقق عبر القناة الرسمية', dismiss:'متابعة بحذر', lockdownTitle:'إغلاق — تهديد مؤكد', lockdownSub:'هذه المكالمة خطيرة للغاية.', autoDisconnect:'قطع تلقائي خلال', seconds:'ث', resultTitle:'نتيجة التحقق', likelyScam:'⚠ احتيال محتمل', exerciseCaution:'⚡ توخ الحذر', fatalTitle:'خطر فوري', fatalSub:'المتصل يحاول سرقة بياناتك الآن.', doNotShare:'لا تشارك أي رموز أو كلمات مرور.' },
}

function getLabels(lang) { return LABELS[lang?.split('-')[0]] || LABELS['en'] }

export function InterventionOverlay({ intervention, language='en', onDismiss, onStop }) {
  const { level, pattern, threatScore } = intervention
  const lang = language?.split('-')[0] || 'en'
  const labels = getLabels(lang)
  const challengeAvail = isChallengeAvailable(level, pattern)
  const challenge = challengeAvail ? getChallengeForScenario(pattern, lang) : null
  const safeExits = getSafeExitForLang(lang)
  const isFatal = !challengeAvail && level !== 'LOCKDOWN'

  // State
  const [phase, setPhase] = useState('main') // main | challenge | result | safe_exit_confirm
  const [answers, setAnswers] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [countdown, setCountdown] = useState(level === 'LOCKDOWN' ? 30 : null)
  const countdownRef = useRef(null)

  // [FIX] Lock body scroll when overlay is active — prevents position jumping
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Lockdown countdown
  useEffect(() => {
    if (level !== 'LOCKDOWN') return
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          onDismiss('safe_exit')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current)
  }, [level])

  // ── Challenge flow ──
  const handleChallengeAnswer = (isScamIndicator) => {
    const newAnswers = [...answers, isScamIndicator]
    setAnswers(newAnswers)
    if (currentQ < challenge.questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setPhase('result')
    }
  }

  const scamCount = answers.filter(Boolean).length
  const isLikelyScam = scamCount >= Math.ceil(answers.length / 2)

  // Colors per level
  const colors = {
    WARN: { bg: 'rgba(255,149,0,0.06)', border: '#ff9500', accent: '#ff9500', overlayBg: 'rgba(0,0,0,0.75)' },
    BLOCK: { bg: 'rgba(255,45,85,0.08)', border: '#ff2d55', accent: '#ff2d55', overlayBg: 'rgba(0,0,0,0.85)' },
    LOCKDOWN: { bg: 'rgba(255,45,85,0.12)', border: '#ff2d55', accent: '#ff2d55', overlayBg: 'rgba(0,0,0,0.92)' },
  }
  const c = colors[level] || colors.BLOCK

  // ── Button component ──
  const ActionBtn = ({ children, onClick, primary, danger, style: s = {} }) => {
    const [hov, setHov] = useState(false)
    const col = danger ? '#ff2d55' : primary ? '#30d158' : c.accent
    return (
      <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ fontFamily:PF, fontSize:7, letterSpacing:2, padding:'14px 24px', textTransform:'uppercase',
          border:`2px solid ${hov?col:col+'88'}`, color:hov?'#fff':col,
          background:hov?`linear-gradient(135deg,${col}44,${col}22)`:`${col}12`,
          boxShadow:hov?`0 0 20px ${col}44,inset 0 0 12px ${col}12`:`0 0 8px ${col}18`,
          cursor:'pointer', transition:'all 0.15s ease', transform:hov?'translateY(-1px)':'none',
          textShadow:hov?`0 0 8px ${col}`:'none', width:'100%', ...s,
        }}>{children}</button>
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, background:c.overlayBg, backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', animation:'intv-fadein 0.3s ease',
      overflowY:'hidden', /* [FIX] prevent background scroll */
    }}>
      <style>{overlayCSS}</style>
      <div style={{ maxWidth:520, width:'90%', maxHeight:'90vh', overflowY:'auto', overflowX:'hidden', /* [FIX] prevent horizontal shift */
        border:`2px solid ${c.border}`, background:'#020408',
        boxShadow:`0 0 60px ${c.accent}33, inset 0 0 30px ${c.accent}08`,
        animation:`intv-slidein 0.4s cubic-bezier(0.22,1,0.36,1)${level==='LOCKDOWN'?', intv-lockdown-bg 3s ease-in-out infinite':''}`,
        position:'relative', overflow:'hidden',
      }}>
        {/* Top accent bar */}
        <div style={{ height:3, background:`linear-gradient(90deg,${c.accent},${c.accent}88,${c.accent})` }} />

        {/* ════════════ MAIN PHASE ════════════ */}
        {phase === 'main' && (
          <div style={{ padding:'28px 32px' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <span style={{ fontSize:28 }}>{level==='LOCKDOWN'?'🚨':level==='BLOCK'?'🛑':'⚠️'}</span>
              <div>
                <div style={{ fontFamily:PF, fontSize:10, color:c.accent, textShadow:`0 0 12px ${c.accent}`, letterSpacing:2 }}>
                  {level==='LOCKDOWN'?labels.lockdownTitle : level==='BLOCK' && isFatal ? labels.fatalTitle : `${level} — ${pattern}`}
                </div>
                <div style={{ fontFamily:MF, fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:4 }}>
                  Threat Score: {threatScore}/100
                </div>
              </div>
            </div>

            {/* [FIX] Description — LOCKDOWN now also shows doNotShare so it doesn't feel empty */}
            <div style={{ fontFamily:MF, fontSize:12, color:'rgba(255,255,255,0.7)', lineHeight:1.8, marginBottom:24,
              padding:'14px 18px', borderLeft:`3px solid ${c.accent}`, background:`${c.accent}08`,
            }}>
              {level === 'LOCKDOWN' ? (
                <><span style={{color:'#ff2d55',fontWeight:'bold'}}>{labels.lockdownSub}</span><br/><br/>{labels.doNotShare}</>
              ) : isFatal ? (
                <><span style={{color:'#ff2d55',fontWeight:'bold'}}>{labels.fatalSub}</span><br/><br/>{labels.doNotShare}</>
              ) : challenge?.subtitle || labels.fatalSub}
            </div>

            {/* LOCKDOWN countdown */}
            {level === 'LOCKDOWN' && countdown !== null && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:PF, fontSize:8, color:'#ff2d55', marginBottom:8, textAlign:'center',
                  animation: countdown <= 10 ? 'intv-shake 0.5s ease' : 'none',
                }}>
                  {labels.autoDisconnect} {countdown}{labels.seconds}
                </div>
                <div style={{ height:6, background:'rgba(255,45,85,0.15)', overflow:'hidden', border:'1px solid #ff2d5533' }}>
                  <div style={{ height:'100%', width:`${(countdown/30)*100}%`, background:'linear-gradient(90deg,#ff2d55,#ff9500)',
                    boxShadow:'0 0 8px #ff2d55', transition:'width 1s linear',
                  }} />
                </div>
              </div>
            )}

            {/* Safe exit actions */}
            <div style={{ marginBottom:20 }}>
              {safeExits.map((a,i) => (
                <div key={i} style={{ fontFamily:MF, fontSize:10, color:'rgba(255,255,255,0.6)', padding:'8px 12px',
                  borderLeft:`2px solid ${a.priority==='critical'?'#ff2d55':'#ff9500'}33`, marginBottom:3,
                  display:'flex', gap:8, alignItems:'center',
                }}>
                  <span style={{fontSize:14}}>{a.icon}</span> {a.text}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {/* Safe Exit — always available, always prominent */}
              <ActionBtn danger onClick={() => onDismiss('safe_exit')}>
                📵 {labels.safeExit}
              </ActionBtn>

              {/* Verification Challenge — only if available */}
              {challengeAvail && challenge && (
                <ActionBtn primary onClick={() => { setPhase('challenge'); setCurrentQ(0); setAnswers([]); }}>
                  🔍 {labels.verify}
                </ActionBtn>
              )}

              {/* Dismiss with caution — only for WARN level */}
              {level === 'WARN' && (
                <ActionBtn onClick={() => onDismiss('dismissed')} style={{opacity:0.6}}>
                  {labels.dismiss}
                </ActionBtn>
              )}
            </div>
          </div>
        )}

        {/* ════════════ CHALLENGE PHASE ════════════ */}
        {phase === 'challenge' && challenge && (
          <div style={{ padding:'28px 32px' }}>
            <div style={{ fontFamily:PF, fontSize:9, color:c.accent, marginBottom:6, letterSpacing:2 }}>
              🔍 {challenge.title}
            </div>
            <div style={{ fontFamily:MF, fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:20 }}>
              {challenge.subtitle} — Question {currentQ+1} of {challenge.questions.length}
            </div>

            {/* Progress dots */}
            <div style={{ display:'flex', gap:6, marginBottom:20, justifyContent:'center' }}>
              {challenge.questions.map((_, i) => (
                <div key={i} style={{ width:10, height:10,
                  background: i < currentQ ? (answers[i] ? '#ff2d55' : '#30d158') : i === currentQ ? c.accent : 'rgba(255,255,255,0.15)',
                  boxShadow: i === currentQ ? `0 0 8px ${c.accent}` : 'none',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>

            {/* Current question */}
            <div style={{ fontFamily:MF, fontSize:14, color:'rgba(255,255,255,0.85)', lineHeight:1.7, marginBottom:24,
              padding:'16px 20px', border:`1px solid ${c.accent}33`, background:`${c.accent}06`, textAlign:'center',
            }}>
              {challenge.questions[currentQ].q}
            </div>

            {/* Answer buttons */}
            <div style={{ display:'flex', gap:10 }}>
              <ActionBtn danger onClick={() => handleChallengeAnswer(true)} style={{flex:1}}>
                {challenge.questions[currentQ].scam_indicator}
              </ActionBtn>
              <ActionBtn primary onClick={() => handleChallengeAnswer(false)} style={{flex:1}}>
                {challenge.questions[currentQ].safe_indicator}
              </ActionBtn>
            </div>
          </div>
        )}

        {/* ════════════ RESULT PHASE ════════════ */}
        {phase === 'result' && challenge && (
          <div style={{ padding:'28px 32px' }}>
            <div style={{ fontFamily:PF, fontSize:9, color:isLikelyScam?'#ff2d55':'#ff9500', marginBottom:16, letterSpacing:2 }}>
              {labels.resultTitle}
            </div>

            {/* Result indicator */}
            <div style={{ textAlign:'center', padding:'20px', marginBottom:20,
              border:`2px solid ${isLikelyScam?'#ff2d55':'#ff9500'}`,
              background: isLikelyScam ? 'rgba(255,45,85,0.1)' : 'rgba(255,149,0,0.08)',
            }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{isLikelyScam ? '🚨' : '⚠️'}</div>
              <div style={{ fontFamily:PF, fontSize:10, color:isLikelyScam?'#ff2d55':'#ff9500', marginBottom:8 }}>
                {isLikelyScam ? labels.likelyScam : labels.exerciseCaution}
              </div>
              <div style={{ fontFamily:MF, fontSize:11, color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>
                {isLikelyScam ? challenge.result_scam : challenge.result_caution}
              </div>
            </div>

            {/* Answer summary */}
            <div style={{ marginBottom:20 }}>
              {challenge.questions.map((q, i) => (
                <div key={i} style={{ fontFamily:MF, fontSize:10, padding:'6px 10px', marginBottom:3,
                  borderLeft:`3px solid ${answers[i]?'#ff2d55':'#30d158'}`, color:'rgba(255,255,255,0.6)',
                  background: answers[i] ? 'rgba(255,45,85,0.06)' : 'rgba(48,209,88,0.04)',
                }}>
                  {q.q} → <span style={{color:answers[i]?'#ff2d55':'#30d158'}}>{answers[i] ? q.scam_indicator : q.safe_indicator}</span>
                </div>
              ))}
            </div>

            {/* Action buttons based on result */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {isLikelyScam ? (
                <>
                  <ActionBtn danger onClick={() => onDismiss('safe_exit')}>
                    📵 {labels.safeExit}
                  </ActionBtn>
                </>
              ) : (
                <>
                  <ActionBtn primary onClick={() => onDismiss('challenge_passed')}>
                    🏦 {labels.verifyOfficial}
                  </ActionBtn>
                  <ActionBtn onClick={() => onDismiss('challenge_passed')} style={{opacity:0.7}}>
                    {labels.dismiss}
                  </ActionBtn>
                </>
              )}
            </div>

            {/* Verify action recommendation */}
            {challenge.verify_action && (
              <div style={{ marginTop:16, fontFamily:MF, fontSize:10, color:'#30d158', textAlign:'center',
                padding:'10px 14px', border:'1px solid #30d15833', background:'rgba(48,209,88,0.04)',
              }}>
                ✓ {challenge.verify_action}
              </div>
            )}
          </div>
        )}

        {/* Bottom accent bar */}
        <div style={{ height:2, background:`linear-gradient(90deg,transparent,${c.accent}44,transparent)` }} />
      </div>
    </div>
  )
}