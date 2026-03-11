import { useState, useEffect, useRef } from 'react'
import { PixelLogo }      from './components/PixelLogo'
import { MonitorTab }     from './pages/MonitorTab'
import { PsychTab, PatternsTab, ReportTab, AboutTab } from './pages/Tabs'
import { useWebSocket }   from './hooks/useWebSocket'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useScreenCapture } from './hooks/useScreenCapture'
import { MOCK_ALERTS, PF, MF } from './utils/constants'
import { LanguageSelector } from './components/LanguageSelector'

const TABS = ['monitor','psych','patterns','report','about']
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true' || true

const ENGLISH_FALLBACK_LANGS = {
  'ms':'Malay','tl':'Filipino','th':'Thai','vi':'Vietnamese',
  'de':'German','it':'Italian','nl':'Dutch','tr':'Turkish','pl':'Polish',
  'ru':'Russian','uk':'Ukrainian','ro':'Romanian','cs':'Czech','hu':'Hungarian',
  'sv':'Swedish','da':'Danish','fi':'Finnish','el':'Greek','he':'Hebrew',
  'fa':'Persian','bn':'Bengali','ur':'Urdu','ta':'Tamil','sw':'Swahili',
  'am':'Amharic','yo':'Yoruba','ha':'Hausa','af':'Afrikaans','no':'Norwegian',
  'pt-BR':'Portuguese',
}

const XIcon = ({ size=12,color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.422l4.256 5.624 5.316-5.624Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const DiscordIcon = ({ size=13,color='#7b8cde' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.128 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)
const GitHubIcon = ({ size=13,color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)

function SocialLink({ href,icon,label,c,bc,bg,hc,hbg }) {
  const [h,setH]=useState(false)
  return (
    <a href={href} target="_blank" rel="noreferrer" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',fontFamily:MF,fontSize:10,color:h?(hc||'#fff'):c,textDecoration:'none',border:`1px solid ${h?(hc||'rgba(255,255,255,0.35)'):bc}`,background:h?(hbg||'rgba(255,255,255,0.08)'):bg,boxShadow:h?`0 0 12px ${hc||'rgba(255,255,255,0.2)'}55`:'none',transform:h?'translateY(-2px)':'none',transition:'all 0.16s ease' }}>
      {icon}{label}
    </a>
  )
}

/* ══════════════════════════════════════════════════════════
   Mask phone / account numbers for safety display
   "+62812xxxx3456" → "+62 812-****-3456"
   "1234567890" → "******7890"
══════════════════════════════════════════════════════════ */
function maskPhone(num) {
  if (!num) return '—'
  const clean = num.replace(/[\s\-()]/g, '')
  if (clean.length <= 4) return clean
  const last4 = clean.slice(-4)
  const masked = '*'.repeat(Math.max(0, clean.length - 4))
  // Format nicely
  if (clean.startsWith('+')) {
    const cc = clean.slice(0, clean.length > 12 ? 3 : 2)
    return `${cc} ${masked.slice(cc.length - 1)}${last4}`
  }
  return masked + last4
}

/* ══════════════════════════════════════════════════════════
   [FIX #4] Demo Action Plan Generator — 9 LANGUAGES FULL
   ────────────────────────────────────────────────────────
   Generates a local action plan for demo mode since the
   backend ActionAgentService is not called in demo.
   Full native steps for EN, ID, ZH, JA, KO, ES, FR, HI, AR.
   Includes masked phone references and country-specific
   emergency contacts + reporting channels.
══════════════════════════════════════════════════════════ */
function generateDemoActionPlan(alerts, language, threatScore, interventionHistory) {
  const lang = language?.split('-')[0] || 'en'
  const topPattern = alerts[0]?.pattern || 'Unknown Scam'
  const severity = alerts[0]?.severity || 'high'

  const COUNTRY_DATA = {
    en: { name: 'United States', flag: '🇺🇸', emergency: '911', reportLine: '1-877-382-4357', code: 'US', org: 'FTC', policeUrl: 'ic3.gov' },
    id: { name: 'Indonesia', flag: '🇮🇩', emergency: '110', reportLine: '157', code: 'ID', org: 'OJK', policeUrl: 'patrolisiber.id' },
    zh: { name: 'China', flag: '🇨🇳', emergency: '110', reportLine: '12321', code: 'CN', org: '工信部', policeUrl: '12321.cn' },
    ja: { name: 'Japan', flag: '🇯🇵', emergency: '110', reportLine: '#9110', code: 'JP', org: '警察庁', policeUrl: 'npa.go.jp' },
    ko: { name: 'South Korea', flag: '🇰🇷', emergency: '112', reportLine: '1332', code: 'KR', org: '금융감독원', policeUrl: 'ecrm.police.go.kr' },
    es: { name: 'Spain', flag: '🇪🇸', emergency: '112', reportLine: '091', code: 'ES', org: 'Policía Nacional', policeUrl: 'policia.es' },
    fr: { name: 'France', flag: '🇫🇷', emergency: '17', reportLine: '0 805 805 817', code: 'FR', org: 'DGCCRF', policeUrl: 'internet-signalement.gouv.fr' },
    hi: { name: 'India', flag: '🇮🇳', emergency: '112', reportLine: '1930', code: 'IN', org: 'RBI', policeUrl: 'cybercrime.gov.in' },
    ar: { name: 'Saudi Arabia', flag: '🇸🇦', emergency: '911', reportLine: '330330', code: 'SA', org: 'SAMA', policeUrl: 'absher.sa' },
  }
  const country = COUNTRY_DATA[lang] || COUNTRY_DATA['en']

  /* ── Caller phone mask (simulate detected number from demo) ── */
  const DEMO_PHONES = {
    en: '+1 (202) 555-0147', id: '+62 812-3456-7890', zh: '+86 138-0013-8000',
    ja: '+81 90-1234-5678', ko: '+82 10-9876-5432', es: '+34 612 345 678',
    fr: '+33 6 12 34 56 78', hi: '+91 98765 43210', ar: '+966 50 123 4567',
  }
  const callerPhone = maskPhone(DEMO_PHONES[lang] || DEMO_PHONES['en'])

  /* ══════════════════════════════════════════════════════════
     Full native action steps per language
  ══════════════════════════════════════════════════════════ */

  const STEPS_EN = [
    { step: 1, icon: '📵', action: `Block the caller's number (${callerPhone}) on your phone immediately`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: 'Call your bank using the number on the BACK of your card — NOT any number the caller gave you', urgency: 'critical' },
    { step: 3, icon: '🔒', action: 'Request a temporary freeze on your account if you shared any information', urgency: 'critical' },
    { step: 4, icon: '📋', action: `Report to FTC at reportfraud.ftc.gov or call ${country.reportLine}`, urgency: 'high' },
    { step: 5, icon: '🔍', action: 'File FBI IC3 complaint at ic3.gov', urgency: 'high' },
    { step: 6, icon: '🔑', action: 'Change passwords on all accounts discussed during the call', urgency: 'recommended' },
    { step: 7, icon: '📱', action: 'Enable two-factor authentication on all financial accounts', urgency: 'recommended' },
    { step: 8, icon: '👥', action: 'Alert family members — scammers often target multiple people in the same household', urgency: 'recommended' },
  ]

  const STEPS_ID = [
    { step: 1, icon: '📵', action: `Blokir nomor penelepon (${callerPhone}) di pengaturan HP Anda`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: 'Hubungi bank menggunakan nomor di BELAKANG kartu ATM Anda — BUKAN nomor dari penelepon', urgency: 'critical' },
    { step: 3, icon: '🔒', action: 'Minta bank untuk blokir sementara rekening Anda jika sudah membagikan informasi', urgency: 'critical' },
    { step: 4, icon: '📋', action: `Laporkan ke OJK: ${country.reportLine} atau konsumen@ojk.go.id`, urgency: 'high' },
    { step: 5, icon: '🚔', action: `Laporkan ke Bareskrim: ${country.policeUrl} atau hubungi ${country.emergency}`, urgency: 'high' },
    { step: 6, icon: '🔑', action: 'Ganti password semua akun yang dibicarakan saat telepon', urgency: 'recommended' },
    { step: 7, icon: '📱', action: 'Aktifkan verifikasi 2 langkah di semua akun keuangan', urgency: 'recommended' },
    { step: 8, icon: '👥', action: 'Beritahu keluarga — penipu sering menargetkan banyak orang dalam satu keluarga', urgency: 'recommended' },
  ]

  const STEPS_ZH = [
    { step: 1, icon: '📵', action: `立即拉黑来电号码 (${callerPhone})`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: '使用银行卡背面的官方客服电话联系银行 —— 不要拨打来电者提供的任何号码', urgency: 'critical' },
    { step: 3, icon: '🔒', action: '如果已经透露了任何信息，请求银行临时冻结账户', urgency: 'critical' },
    { step: 4, icon: '📋', action: `向${country.org}举报：拨打 ${country.reportLine} 或访问 ${country.policeUrl}`, urgency: 'high' },
    { step: 5, icon: '🚔', action: `拨打 ${country.emergency} 向当地公安局报案`, urgency: 'high' },
    { step: 6, icon: '🔑', action: '更改通话中提及的所有账户密码', urgency: 'recommended' },
    { step: 7, icon: '📱', action: '为所有金融账户启用双重验证', urgency: 'recommended' },
    { step: 8, icon: '👥', action: '通知家人 —— 诈骗分子经常针对同一家庭的多个成员', urgency: 'recommended' },
  ]

  const STEPS_JA = [
    { step: 1, icon: '📵', action: `発信者番号 (${callerPhone}) を着信拒否に設定してください`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: '銀行カード裏面の公式番号に電話してください（電話の相手が教えた番号は使用しないこと）', urgency: 'critical' },
    { step: 3, icon: '🔒', action: '情報を伝えてしまった場合は、口座の一時凍結を依頼してください', urgency: 'critical' },
    { step: 4, icon: '📋', action: `${country.org}に通報：${country.reportLine} または ${country.policeUrl}`, urgency: 'high' },
    { step: 5, icon: '🚔', action: `${country.emergency} に電話して最寄りの警察署に届出`, urgency: 'high' },
    { step: 6, icon: '🔑', action: '通話中に言及したすべてのアカウントのパスワードを変更', urgency: 'recommended' },
    { step: 7, icon: '📱', action: 'すべての金融口座で二段階認証を有効にする', urgency: 'recommended' },
    { step: 8, icon: '👥', action: 'ご家族に注意喚起 —— 詐欺師は同じ家族の複数人を狙うことがあります', urgency: 'recommended' },
  ]

  const STEPS_KO = [
    { step: 1, icon: '📵', action: `발신자 번호 (${callerPhone}) 를 차단 설정하세요`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: '카드 뒷면의 공식 고객센터 번호로 은행에 전화하세요 (전화 상대가 알려준 번호 사용 금지)', urgency: 'critical' },
    { step: 3, icon: '🔒', action: '정보를 이미 알려줬다면 계좌 임시 동결을 요청하세요', urgency: 'critical' },
    { step: 4, icon: '📋', action: `${country.org}에 신고: ${country.reportLine} 전화`, urgency: 'high' },
    { step: 5, icon: '🚔', action: `사이버경찰청 (${country.policeUrl})에 온라인 신고`, urgency: 'high' },
    { step: 6, icon: '🔑', action: '통화 중 언급된 모든 계정 비밀번호를 변경하세요', urgency: 'recommended' },
    { step: 7, icon: '📱', action: '모든 금융 계정에 2단계 인증을 활성화하세요', urgency: 'recommended' },
    { step: 8, icon: '👥', action: '가족에게 알리세요 — 사기범은 같은 가족 여러 명을 노립니다', urgency: 'recommended' },
  ]

  const STEPS_ES = [
    { step: 1, icon: '📵', action: `Bloquea el número (${callerPhone}) en tu teléfono inmediatamente`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: 'Llama a tu banco usando el número del REVERSO de tu tarjeta — NO el que te dio el estafador', urgency: 'critical' },
    { step: 3, icon: '🔒', action: 'Solicita el bloqueo temporal de tu cuenta si compartiste información', urgency: 'critical' },
    { step: 4, icon: '📋', action: `Denuncia a la ${country.org}: llama al ${country.reportLine}`, urgency: 'high' },
    { step: 5, icon: '🚔', action: `Presenta denuncia en ${country.policeUrl} o llama al ${country.emergency}`, urgency: 'high' },
    { step: 6, icon: '🔑', action: 'Cambia las contraseñas de todas las cuentas mencionadas durante la llamada', urgency: 'recommended' },
    { step: 7, icon: '📱', action: 'Activa la autenticación de dos factores en todas tus cuentas financieras', urgency: 'recommended' },
    { step: 8, icon: '👥', action: 'Avisa a tu familia — los estafadores suelen atacar a varias personas del mismo hogar', urgency: 'recommended' },
  ]

  const STEPS_FR = [
    { step: 1, icon: '📵', action: `Bloquez le numéro (${callerPhone}) dans les paramètres de votre téléphone`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: 'Appelez votre banque au numéro figurant au DOS de votre carte — PAS celui donné par l\'appelant', urgency: 'critical' },
    { step: 3, icon: '🔒', action: 'Demandez un blocage temporaire de votre compte si vous avez partagé des informations', urgency: 'critical' },
    { step: 4, icon: '📋', action: `Signalez à la ${country.org}: appelez le ${country.reportLine}`, urgency: 'high' },
    { step: 5, icon: '🚔', action: `Déposez plainte sur ${country.policeUrl} ou appelez le ${country.emergency}`, urgency: 'high' },
    { step: 6, icon: '🔑', action: 'Changez les mots de passe de tous les comptes évoqués pendant l\'appel', urgency: 'recommended' },
    { step: 7, icon: '📱', action: 'Activez l\'authentification à deux facteurs sur tous vos comptes financiers', urgency: 'recommended' },
    { step: 8, icon: '👥', action: 'Prévenez votre famille — les escrocs ciblent souvent plusieurs membres d\'un même foyer', urgency: 'recommended' },
  ]

  const STEPS_HI = [
    { step: 1, icon: '📵', action: `कॉलर का नंबर (${callerPhone}) तुरंत ब्लॉक करें`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: 'अपने ATM कार्ड के पीछे लिखे नंबर से बैंक को कॉल करें — कॉलर ने जो नंबर दिया उसे इस्तेमाल न करें', urgency: 'critical' },
    { step: 3, icon: '🔒', action: 'अगर कोई जानकारी दे दी है तो अकाउंट को अस्थायी रूप से फ़्रीज़ करवाएँ', urgency: 'critical' },
    { step: 4, icon: '📋', action: `${country.org} को रिपोर्ट करें या ${country.reportLine} पर कॉल करें`, urgency: 'high' },
    { step: 5, icon: '🚔', action: `${country.policeUrl} पर ऑनलाइन शिकायत दर्ज करें या ${country.emergency} पर कॉल करें`, urgency: 'high' },
    { step: 6, icon: '🔑', action: 'कॉल में बताए गए सभी अकाउंट के पासवर्ड बदलें', urgency: 'recommended' },
    { step: 7, icon: '📱', action: 'सभी वित्तीय खातों पर दो-चरणीय सत्यापन (2FA) चालू करें', urgency: 'recommended' },
    { step: 8, icon: '👥', action: 'परिवार को सूचित करें — ठग अक्सर एक ही परिवार के कई सदस्यों को निशाना बनाते हैं', urgency: 'recommended' },
  ]

  const STEPS_AR = [
    { step: 1, icon: '📵', action: `قم بحظر رقم المتصل (${callerPhone}) على هاتفك فوراً`, urgency: 'immediate' },
    { step: 2, icon: '🏦', action: 'اتصل بالبنك من الرقم المكتوب على ظهر بطاقتك — لا تستخدم أي رقم أعطاك إياه المتصل', urgency: 'critical' },
    { step: 3, icon: '🔒', action: 'اطلب تجميد مؤقت لحسابك إذا أفشيت أي معلومات', urgency: 'critical' },
    { step: 4, icon: '📋', action: `أبلغ ${country.org} عبر الرقم ${country.reportLine}`, urgency: 'high' },
    { step: 5, icon: '🚔', action: `قدّم بلاغاً عبر ${country.policeUrl} أو اتصل بالطوارئ ${country.emergency}`, urgency: 'high' },
    { step: 6, icon: '🔑', action: 'غيّر كلمات مرور جميع الحسابات التي ذكرتها أثناء المكالمة', urgency: 'recommended' },
    { step: 7, icon: '📱', action: 'فعّل المصادقة الثنائية على جميع حساباتك المالية', urgency: 'recommended' },
    { step: 8, icon: '👥', action: 'أخبر أفراد عائلتك — المحتالون غالباً يستهدفون عدة أشخاص من نفس العائلة', urgency: 'recommended' },
  ]

  const STEPS_MAP = { en: STEPS_EN, id: STEPS_ID, zh: STEPS_ZH, ja: STEPS_JA, ko: STEPS_KO, es: STEPS_ES, fr: STEPS_FR, hi: STEPS_HI, ar: STEPS_AR }
  const steps = STEPS_MAP[lang] || STEPS_EN

  /* ── Urgency messages per language ── */
  const urgencyLevel = threatScore >= 75 ? 'CRITICAL' : threatScore >= 45 ? 'HIGH' : 'MODERATE'
  const urgencyMessages = {
    en: { CRITICAL: '⚠️ Act within the next 15 minutes. Time is critical.', HIGH: '⚠️ Take action as soon as possible.', MODERATE: 'Review these steps when convenient.' },
    id: { CRITICAL: '⚠️ Bertindak dalam 15 menit ke depan. Waktu sangat penting.', HIGH: '⚠️ Segera ambil tindakan.', MODERATE: 'Tinjau langkah-langkah ini saat memungkinkan.' },
    zh: { CRITICAL: '⚠️ 请在15分钟内采取行动，时间紧迫。', HIGH: '⚠️ 请尽快采取行动。', MODERATE: '请在方便时查看以下步骤。' },
    ja: { CRITICAL: '⚠️ 15分以内に対応してください。一刻を争います。', HIGH: '⚠️ できるだけ早く対応してください。', MODERATE: '都合の良い時にご確認ください。' },
    ko: { CRITICAL: '⚠️ 15분 이내에 조치하세요. 시간이 매우 중요합니다.', HIGH: '⚠️ 가능한 빨리 조치하세요.', MODERATE: '편할 때 아래 단계를 확인하세요.' },
    es: { CRITICAL: '⚠️ Actúa en los próximos 15 minutos. El tiempo es crítico.', HIGH: '⚠️ Toma acción lo antes posible.', MODERATE: 'Revisa estos pasos cuando puedas.' },
    fr: { CRITICAL: '⚠️ Agissez dans les 15 prochaines minutes. Le temps est critique.', HIGH: '⚠️ Agissez dès que possible.', MODERATE: 'Consultez ces étapes à votre convenance.' },
    hi: { CRITICAL: '⚠️ अगले 15 मिनट में कार्रवाई करें। समय बहुत महत्वपूर्ण है।', HIGH: '⚠️ जल्द से जल्द कार्रवाई करें।', MODERATE: 'सुविधानुसार इन चरणों की समीक्षा करें।' },
    ar: { CRITICAL: '⚠️ تصرّف خلال الـ 15 دقيقة القادمة. الوقت حرج.', HIGH: '⚠️ اتخذ إجراءً في أقرب وقت.', MODERATE: 'راجع هذه الخطوات في الوقت المناسب.' },
  }
  const msgs = urgencyMessages[lang] || urgencyMessages['en']

  /* ── Personalized advice per language ── */
  const adviceTemplates = {
    en: (pattern, sev) => `Based on the detected pattern "${pattern}", the caller was likely attempting to extract sensitive information. ${sev === 'critical' ? 'If you shared any codes or credentials, contact your bank immediately.' : 'Monitor your accounts closely over the next few days.'}`,
    id: (pattern, sev) => `Berdasarkan pola "${pattern}" yang terdeteksi, penelepon kemungkinan besar mencoba memperoleh informasi sensitif Anda. ${sev === 'critical' ? 'Jika Anda sudah membagikan kode atau kredensial, segera hubungi bank Anda.' : 'Pantau rekening Anda dengan cermat dalam beberapa hari ke depan.'}`,
    zh: (pattern, sev) => `根据检测到的模式"${pattern}"，来电者可能试图获取您的敏感信息。${sev === 'critical' ? '如果您已经泄露了验证码或凭据，请立即联系银行。' : '请在接下来几天内密切监控您的账户。'}`,
    ja: (pattern, sev) => `検出パターン「${pattern}」に基づくと、発信者は機密情報を引き出そうとしていた可能性があります。${sev === 'critical' ? 'コードや認証情報を伝えてしまった場合は、直ちに銀行に連絡してください。' : '今後数日間、口座を注意深く監視してください。'}`,
    ko: (pattern, sev) => `탐지된 패턴 "${pattern}"에 따르면, 발신자가 민감한 정보를 탈취하려 했을 가능성이 높습니다. ${sev === 'critical' ? '코드나 인증정보를 알려줬다면 즉시 은행에 연락하세요.' : '앞으로 며칠간 계좌를 주의 깊게 모니터링하세요.'}`,
    es: (pattern, sev) => `Según el patrón detectado "${pattern}", el llamante probablemente intentaba obtener información confidencial. ${sev === 'critical' ? 'Si compartiste algún código o credencial, contacta a tu banco de inmediato.' : 'Vigila tus cuentas de cerca durante los próximos días.'}`,
    fr: (pattern, sev) => `D'après le schéma détecté « ${pattern} », l'appelant tentait probablement d'obtenir des informations sensibles. ${sev === 'critical' ? 'Si vous avez communiqué des codes ou identifiants, contactez votre banque immédiatement.' : 'Surveillez attentivement vos comptes dans les prochains jours.'}`,
    hi: (pattern, sev) => `पहचाने गए पैटर्न "${pattern}" के अनुसार, कॉलर संभवतः आपकी संवेदनशील जानकारी चुराने की कोशिश कर रहा था। ${sev === 'critical' ? 'अगर आपने कोई कोड या क्रेडेंशियल बताया है, तो तुरंत अपने बैंक से संपर्क करें।' : 'अगले कुछ दिनों तक अपने खातों पर नज़र रखें।'}`,
    ar: (pattern, sev) => `بناءً على النمط المكتشف "${pattern}"، من المرجح أن المتصل كان يحاول الحصول على معلوماتك الحساسة. ${sev === 'critical' ? 'إذا شاركت أي رموز أو بيانات اعتماد، اتصل ببنكك فوراً.' : 'راقب حساباتك عن كثب خلال الأيام القليلة القادمة.'}`,
  }
  const getAdvice = adviceTemplates[lang] || adviceTemplates['en']

  return {
    type: 'action_plan',
    urgency_level: urgencyLevel,
    urgency_message: msgs[urgencyLevel],
    country,
    callerPhone,
    scam_pattern: topPattern,
    estimated_time: urgencyLevel === 'CRITICAL' ? '15-30 minutes' : '30-60 minutes',
    steps,
    total_steps: steps.length,
    personalized_advice: getAdvice(topPattern, severity),
    intervention_summary: {
      total: interventionHistory.length,
      highest_level: interventionHistory.length > 0
        ? interventionHistory.reduce((h, e) => {
            const rank = { LOCKDOWN: 3, BLOCK: 2, WARN: 1 }
            return (rank[e.level] || 0) > (rank[h] || 0) ? e.level : h
          }, 'NONE')
        : null,
    },
    disclaimer: lang === 'id'
      ? 'Rencana tindakan ini dihasilkan oleh AI dan digunakan sebagai panduan. Untuk nasihat hukum, konsultasikan dengan profesional.'
      : lang === 'zh' ? '本行动计划由AI生成，仅供参考。如需法律建议，请咨询专业人士。'
      : lang === 'ja' ? 'このアクションプランはAIが生成したものであり、ガイダンスとしてご利用ください。法的助言については専門家にご相談ください。'
      : lang === 'ko' ? '이 행동 계획은 AI가 생성한 것이며 안내용입니다. 법적 조언은 전문가와 상담하세요.'
      : lang === 'es' ? 'Este plan de acción fue generado por IA y debe usarse como guía. Para asesoría legal, consulta a un profesional.'
      : lang === 'fr' ? 'Ce plan d\'action est généré par IA à titre indicatif. Pour un conseil juridique, consultez un professionnel.'
      : lang === 'hi' ? 'यह कार्य योजना AI द्वारा उत्पन्न है और मार्गदर्शन के रूप में उपयोग की जानी चाहिए। कानूनी सलाह के लिए, किसी पेशेवर से परामर्श करें।'
      : lang === 'ar' ? 'تم إنشاء خطة العمل هذه بواسطة الذكاء الاصطناعي وينبغي استخدامها كدليل إرشادي. للحصول على مشورة قانونية، استشر متخصصاً.'
      : 'This action plan is generated by AI and should be used as guidance. For legal advice, consult a professional.',
  }
}

export default function App() {
  const [tab,setTab]=useState('monitor')
  const [monitoring,setMonitoring]=useState(false)
  const [sessionTime,setSessionTime]=useState(0)
  const [threatScore,setThreatScore]=useState(0)
  const [threatLevel,setThreatLevel]=useState('safe')
  const [alerts,setAlerts]=useState([])
  const [psychScores,setPsychScores]=useState({SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0})
  const [detectedIds,setDetectedIds]=useState([])
  const [screenOn,setScreenOn]=useState(false)
  const [scanY,setScanY]=useState(0)
  const [glitch,setGlitch]=useState(false)
  const [audioLevel,setAudioLevel]=useState(0)
  const [language,setLanguage]=useState('en')
  const [transcript,setTranscript]=useState([])
  const [lieScores,setLieScores]=useState({INCONSISTENCY:0,VAGUENESS:0,OVERDETAIL:0,DEFLECTION:0,PRESSURE:0})
  const [audioUrl,setAudioUrl]=useState(null)
  const [interventionHistory,setInterventionHistory]=useState([])
  const [actionPlan,setActionPlan]=useState(null)
  const timerRef=useRef(null), demoRef=useRef(null), alertIdxRef=useRef(0)

  const headerRef = useRef(null)
  const [headerH, setHeaderH] = useState(92)
  useEffect(() => {
    if (!headerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      setHeaderH(Math.ceil(entry.contentRect.height) + 3)
    })
    ro.observe(headerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(()=>{ const t=setInterval(()=>setScanY(y=>(y+1.4)%100),16); return()=>clearInterval(t) },[])

  const ws=useWebSocket()
  const audio=useAudioEngine({active:monitoring&&!DEMO,onChunk:ws.sendAudioChunk})
  const screen=useScreenCapture({active:screenOn&&!DEMO,onFrame:ws.sendScreenFrame})

  useEffect(()=>{ if(DEMO)return; setAlerts(ws.alerts);setThreatScore(ws.threatScore);setPsychScores(ws.psychScores);setThreatLevel(ws.threatScore>75?'critical':ws.threatScore>45?'high':'safe') },[ws.alerts,ws.threatScore,ws.psychScores])

  useEffect(()=>{
    if(!monitoring){clearInterval(demoRef.current);return}
    demoRef.current=setInterval(()=>{
      setAudioLevel(Math.random()*0.6+0.1)
    },150)
    return()=>clearInterval(demoRef.current)
  },[monitoring])

  const handleDemoAlert = (alert) => {
    setAlerts(prev=>[alert,...prev])
    const s=Math.min(95,threatScore+18+Math.floor(Math.random()*10))
    setThreatScore(s);setThreatLevel(s>75?'critical':s>45?'high':'safe')
    ;(alert.tactics||[]).forEach(t=>setPsychScores(prev=>({...prev,[t]:Math.min(100,(prev[t]||0)+25+Math.floor(Math.random()*15))})))
    setDetectedIds(prev=>prev.includes(alert.pattern)?prev:[...prev,alert.pattern])
    if(alert.severity==='critical'){setGlitch(true);setTimeout(()=>setGlitch(false),500)}
    setLieScores(prev=>({
      INCONSISTENCY: Math.min(100, prev.INCONSISTENCY + (alert.severity==='critical'?18:8) + Math.floor(Math.random()*12)),
      VAGUENESS:     Math.min(100, prev.VAGUENESS + (alert.tactics?.includes('AUTHORITY')?15:5) + Math.floor(Math.random()*10)),
      OVERDETAIL:    Math.min(100, prev.OVERDETAIL + Math.floor(Math.random()*14)),
      DEFLECTION:    Math.min(100, prev.DEFLECTION + (alert.tactics?.includes('ISOLATION')?20:6) + Math.floor(Math.random()*10)),
      PRESSURE:      Math.min(100, prev.PRESSURE + (alert.tactics?.includes('SCARCITY')?22:10) + Math.floor(Math.random()*8)),
    }))
  }

  const handleTranscriptLine = (line) => {
    setTranscript(prev=>[...prev,line])
  }

  const handleInterventionEvent = (event) => {
    setInterventionHistory(prev => [...prev, event])
  }

  // [FIX #4] Modified: generate action plan on safe exit
  const handleSafeExit = () => {
    setMonitoring(false)
    if (audio.recordingBlob) {
      const url = URL.createObjectURL(audio.recordingBlob)
      setAudioUrl(url)
    }
    // [FIX #4] Generate action plan for demo mode
    if (alerts.length > 0) {
      const plan = generateDemoActionPlan(alerts, language, threatScore, interventionHistory)
      setActionPlan(plan)
    }
    if (!DEMO) ws.endSession()
    setTab('report')
  }

  useEffect(()=>{ if(monitoring)timerRef.current=setInterval(()=>setSessionTime(t=>t+1),1000); else clearInterval(timerRef.current); return()=>clearInterval(timerRef.current) },[monitoring])

  const handleStart=()=>{
    setMonitoring(true);setAlerts([]);setThreatScore(0);setThreatLevel('safe')
    setSessionTime(0);setPsychScores({SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0})
    setDetectedIds([]);alertIdxRef.current=0
    setTranscript([])
    setLieScores({INCONSISTENCY:0,VAGUENESS:0,OVERDETAIL:0,DEFLECTION:0,PRESSURE:0})
    setAudioUrl(null)
    setInterventionHistory([])
    setActionPlan(null)
    if(!DEMO){ws.reset();ws.startSession()}
  }

  // [FIX #4] Modified: generate action plan on stop
  const handleStop=()=>{
    setMonitoring(false)
    if(audio.recordingBlob) {
      const url = URL.createObjectURL(audio.recordingBlob)
      setAudioUrl(url)
    }
    // [FIX #4] Generate action plan if threats detected
    if (alerts.length > 0) {
      const plan = generateDemoActionPlan(alerts, language, threatScore, interventionHistory)
      setActionPlan(plan)
    }
    if(!DEMO)ws.endSession()
    setTab('report')
  }

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#30d158'

  const cursorSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><rect x='4' y='1' width='12' height='14' rx='1' fill='%2300d4ff' opacity='0.9'/><rect x='6' y='4' width='3' height='3' fill='%23020408'/><rect x='11' y='4' width='3' height='3' fill='%23020408'/><rect x='6' y='12' width='2' height='3' fill='%23020408'/><rect x='12' y='12' width='2' height='3' fill='%23020408'/><rect x='8' y='12' width='4' height='2' fill='%2300d4ff' opacity='0.5'/></svg>`
  const cursorURL = `url("data:image/svg+xml,${cursorSVG}") 10 10, crosshair`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#020408;color:#e0e0e0;overflow-x:hidden}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:rgba(0,212,255,0.03)}::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#00d4ff,#7b61ff)}
        @keyframes marquee  {0%{transform:translateX(100%)}100%{transform:translateX(-200%)}}
        @keyframes blink    {0%,100%{opacity:1}50%{opacity:0}}
        @keyframes ppulse   {0%,100%{box-shadow:0 0 8px #ff2d55}50%{box-shadow:0 0 32px #ff2d55,0 0 64px rgba(255,45,85,0.25)}}
        @keyframes shimmer  {0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes rotateHue{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
        @keyframes dataGlow {0%,100%{opacity:0.35}50%{opacity:0.9}}
        @keyframes counterUp{from{opacity:0;transform:scale(0.8) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes colorCycle{0%{color:#00ffff;text-shadow:0 0 8px #00ffff}25%{color:#a78bfa;text-shadow:0 0 8px #a78bfa}50%{color:#4ade80;text-shadow:0 0 8px #4ade80}75%{color:#ffaa00;text-shadow:0 0 8px #ffaa00}100%{color:#00ffff;text-shadow:0 0 8px #00ffff}}
        @keyframes borderGlow{0%{border-color:#00ffff44}33%{border-color:#a78bfa44}66%{border-color:#ff4d8d44}100%{border-color:#00ffff44}}
        @keyframes retroFlicker{0%{opacity:1}5%{opacity:0.85}10%{opacity:1}15%{opacity:0.9}20%{opacity:1}100%{opacity:1}}
        @keyframes retroBorderCycle{0%{border-color:#00ffff66;box-shadow:0 0 8px #00ffff22,inset 0 0 12px #00ffff06}33%{border-color:#a78bfa66;box-shadow:0 0 8px #a78bfa22,inset 0 0 12px #a78bfa06}66%{border-color:#ff4d8d66;box-shadow:0 0 8px #ff4d8d22,inset 0 0 12px #ff4d8d06}100%{border-color:#00ffff66;box-shadow:0 0 8px #00ffff22,inset 0 0 12px #00ffff06}}
        @keyframes retroTextGlow{0%{text-shadow:0 0 4px #00ffff}33%{text-shadow:0 0 4px #a78bfa}66%{text-shadow:0 0 4px #ff4d8d}100%{text-shadow:0 0 4px #00ffff}}
        .tab-btn{color:rgba(255,255,255,0.6)!important;transition:all 0.15s ease;position:relative}
        .tab-btn:hover{color:rgba(255,255,255,0.95)!important;text-shadow:0 0 12px rgba(255,255,255,0.4)!important;background:rgba(255,255,255,0.04)!important;animation:retroFlicker 0.4s ease 1}
        .tab-btn.active-tab{color:#00ffff!important;text-shadow:0 0 16px #00ffff,0 0 32px rgba(0,255,255,0.4)!important}
        @media(hover:hover){
          *{cursor:${cursorURL}}
          a,button{cursor:${cursorURL}}
        }
        @media(max-width:768px){
          .vg-header-inner{height:auto!important;flex-wrap:wrap!important;padding:10px 14px!important;gap:8px!important}
          .vg-header-inner .vg-marquee{display:none!important}
          .vg-header-inner .vg-divider{display:none!important}
          .vg-header-inner .vg-status{min-width:auto!important;padding:6px 10px!important;flex:1!important}
          .vg-tabs{padding:0 8px!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:none}
          .vg-tabs::-webkit-scrollbar{display:none}
          .vg-tabs .tab-btn{padding:12px 14px!important;font-size:6px!important;white-space:nowrap;flex-shrink:0}
          .vg-content{padding:14px!important;overflow-x:hidden!important}
          .vg-footer-inner{flex-direction:column!important;padding:12px 14px!important;text-align:center!important;gap:10px!important;align-items:center!important}
          .vg-footer-inner>*{justify-content:center!important;text-align:center!important}
          .vg-footer-socials{flex-wrap:wrap!important;justify-content:center!important}
          .vg-footer-powered{text-align:center!important}
        }
        @media(max-width:480px){
          .vg-header-inner{padding:8px 10px!important}
          .vg-content{padding:10px!important}
          .vg-tabs .tab-btn{padding:10px 10px!important;font-size:5px!important;letter-spacing:1px!important}
          .vg-footer-socials a{font-size:8px!important;padding:4px 8px!important}
        }
      `}</style>

      <div style={{ minHeight:'100vh',background:'#020408',color:'#e0e0e0',fontFamily:MF,position:'relative',overflow:'hidden',filter:glitch?'hue-rotate(18deg) saturate(2.2)':'none',transition:'filter 0.08s' }}>
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',opacity:0.028,backgroundImage:'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)',backgroundSize:'8px 8px' }} />
        <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:999,background:'radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position:'fixed',left:0,right:0,height:2,zIndex:998,pointerEvents:'none',background:'linear-gradient(transparent,rgba(0,212,255,0.07),transparent)',top:`${scanY}%`,transition:'top 0.016s linear' }} />
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',transition:'background 1.8s ease',background:monitoring?`radial-gradient(ellipse 55% 35% at 50% 0%,${tColor}14 0%,transparent 70%)`:'radial-gradient(ellipse 70% 50% at 50% 35%,rgba(0,212,255,0.025) 0%,transparent 70%)' }} />
        <div style={{ position:'fixed',top:0,left:0,bottom:0,width:2,zIndex:1,pointerEvents:'none',background:`linear-gradient(180deg,transparent,${tColor}55,${tColor}22,transparent)`,animation:'dataGlow 3s ease-in-out infinite',transition:'background 1s' }} />
        <div style={{ position:'fixed',top:0,right:0,bottom:0,width:2,zIndex:1,pointerEvents:'none',background:`linear-gradient(180deg,transparent,${tColor}55,${tColor}22,transparent)`,animation:'dataGlow 3s ease-in-out infinite 1.5s',transition:'background 1s' }} />

        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',minHeight:'100vh' }}>

          <header ref={headerRef} style={{ background:'rgba(2,4,8,0.92)',borderBottom:'1px solid rgba(0,255,255,0.15)',position:'sticky',top:0,zIndex:100,backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)' }}>
            <div style={{ height:2,background:monitoring?`linear-gradient(90deg,transparent,${tColor}cc,${tColor}88,transparent)`:'linear-gradient(90deg,transparent,rgba(0,255,255,0.6),rgba(167,139,250,0.4),transparent)',transition:'background 0.6s ease' }} />
            <div className="vg-header-inner" style={{ display:'flex',alignItems:'center',gap:0,height:90,padding:'0 32px' }}>
              <PixelLogo />
              <div className="vg-divider" style={{ width:1,height:40,background:'rgba(0,255,255,0.2)',margin:'0 22px',flexShrink:0 }} />
              <div className="vg-marquee" style={{ flex:1,overflow:'hidden',height:20,display:'flex',alignItems:'center',minWidth:0 }}>
                <div style={{ fontFamily:MF,fontSize:10,whiteSpace:'nowrap',animation:'marquee 28s linear infinite,colorCycle 8s ease infinite',letterSpacing:2 }}>
                  ◄ VOXGUARD - REAL-TIME MULTIMODAL AI PROTECTION - GEMINI LIVE API + RUST WASM ENGINE - &lt;80ms LATENCY - GROUNDED: FTC - FBI IC3 - GASA - MAS - ACCC - #GeminiLiveAgentChallenge - BY WIQI LEE ►
                </div>
              </div>
              <div className="vg-divider" style={{ width:1,height:40,background:'rgba(0,255,255,0.2)',margin:'0 22px',flexShrink:0 }} />
              <LanguageSelector value={language} onChange={setLanguage} />
              <div className="vg-divider" style={{ width:1,height:40,background:'rgba(0,255,255,0.2)',margin:'0 14px',flexShrink:0 }} />
              <div className="vg-status" style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 20px',border:`1px solid ${monitoring?tColor+'66':'rgba(255,255,255,0.15)'}`,background:monitoring?`linear-gradient(135deg,${tColor}14,${tColor}08)`:'rgba(255,255,255,0.04)',boxShadow:monitoring?`0 0 24px ${tColor}28`:'0 0 12px rgba(0,255,255,0.05)',transition:'all 0.5s ease',minWidth:150,flexShrink:0,animation:monitoring?'':'borderGlow 4s ease infinite' }}>
                <div style={{ position:'relative',width:12,height:12,flexShrink:0 }}>
                  {monitoring&&<div style={{ position:'absolute',inset:-4,borderRadius:'50%',border:`1px solid ${tColor}88`,animation:'ppulse 1.6s ease-in-out infinite' }} />}
                  <div style={{ width:12,height:12,background:monitoring?tColor:'rgba(0,255,255,0.5)',boxShadow:monitoring?`0 0 12px ${tColor},0 0 24px ${tColor}66`:'0 0 8px rgba(0,255,255,0.3)',animation:monitoring?'blink 0.9s step-end infinite':'none',transition:'all 0.4s' }} />
                </div>
                <div>
                  <div style={{ fontFamily:PF,fontSize:7,color:monitoring?tColor:'rgba(0,255,255,0.8)',letterSpacing:2,lineHeight:1,transition:'color 0.4s',textShadow:monitoring?`0 0 8px ${tColor}`:'0 0 6px rgba(0,255,255,0.4)' }}>{monitoring?'LIVE':'STANDBY'}</div>
                  {monitoring&&<div style={{ fontFamily:MF,fontSize:10,color:tColor+'cc',marginTop:3 }}>{fmt(sessionTime)}</div>}
                </div>
                {DEMO&&<div style={{ marginLeft:'auto',fontFamily:PF,fontSize:6,padding:'4px 8px',border:'1px solid rgba(255,214,10,0.5)',color:'#ffd60a',background:'rgba(255,214,10,0.1)',display:'flex',alignItems:'center',gap:4,textShadow:'0 0 6px #ffd60a' }}><div style={{ width:5,height:5,background:'#ffd60a',animation:'blink 1s step-end infinite',boxShadow:'0 0 4px #ffd60a' }}/>DEMO</div>}
              </div>
            </div>
          </header>

          <nav className="vg-tabs" style={{ display:'flex',alignItems:'stretch',borderBottom:'1px solid rgba(0,255,255,0.1)',background:'rgba(2,4,8,0.97)',padding:'0 32px',position:'sticky',top:headerH,zIndex:99 }}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`tab-btn${tab===t?' active-tab':''}`}
                style={{ fontFamily:PF,fontSize:7,padding:'16px 22px',border:'none',borderBottom:tab===t?'2px solid #00ffff':'2px solid transparent',background:'transparent',cursor:'pointer',textTransform:'uppercase',letterSpacing:2,position:'relative' }}>
                {tab===t&&<span style={{ position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:6,height:6,background:'#00ffff',boxShadow:'0 0 10px #00ffff,0 0 20px #00ffff55' }} />}
                {t}
              </button>
            ))}
          </nav>

          <main className="vg-content" style={{ flex:1,padding:'32px',maxWidth:1440,margin:'0 auto',width:'100%' }}>
            {ENGLISH_FALLBACK_LANGS[language]&&(
              <div style={{ marginBottom:16,padding:'10px 16px',border:'1px solid rgba(255,214,10,0.25)',background:'rgba(255,214,10,0.04)',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
                <span style={{ fontFamily:PF,fontSize:6,color:'#ffd60a',letterSpacing:1 }}>⚠ LANGUAGE NOTE</span>
                <span style={{ fontFamily:MF,fontSize:10,color:'rgba(255,214,10,0.7)' }}>
                  {ENGLISH_FALLBACK_LANGS[language]} demo currently uses English voice & alerts. Full native language support requires Google Cloud TTS backend (Gemini Live API).
                </span>
              </div>
            )}
            {tab==='monitor'  && <MonitorTab
              monitoring={monitoring}
              threatLevel={threatLevel}
              sessionTime={sessionTime}
              alerts={alerts}
              threatScore={threatScore}
              audioLevel={audioLevel}
              screenOn={screenOn}
              onStart={handleStart}
              onStop={handleStop}
              onToggleScreen={()=>setScreenOn(x=>!x)}
              onDemoAlert={handleDemoAlert}
              onTranscriptLine={handleTranscriptLine}
              onInterventionEvent={handleInterventionEvent}
              onSafeExit={handleSafeExit}
              language={language}
            />}
            {tab==='psych'    && <PsychTab psychScores={psychScores} lieScores={lieScores} />}
            {tab==='patterns' && <PatternsTab detectedIds={detectedIds} />}
            {/* [FIX #4] Pass actionPlan + onCloseActionPlan to ReportTab */}
            {tab==='report'   && <ReportTab alerts={alerts} sessionTime={sessionTime} threatScore={threatScore} psychScores={psychScores} lieScores={lieScores} transcript={transcript} language={language} audioUrl={audioUrl} interventionHistory={interventionHistory} actionPlan={actionPlan} onCloseActionPlan={()=>setActionPlan(null)} />}
            {tab==='about'    && <AboutTab />}
          </main>

          <footer style={{ background:'rgba(2,4,8,0.98)',borderTop:'1px solid rgba(0,255,255,0.12)' }}>
            <div style={{ height:1,background:'linear-gradient(90deg,transparent,rgba(0,255,255,0.4),rgba(167,139,250,0.3),rgba(74,222,128,0.2),transparent)' }} />
            <div className="vg-footer-inner" style={{ padding:'14px 32px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
              <div style={{ fontFamily:PF,fontSize:6,letterSpacing:1.5,lineHeight:2 }}>
                <span style={{ color:'rgba(0,255,255,0.85)',textShadow:'0 0 6px rgba(0,255,255,0.4)' }}>VOXGUARD &copy; 2026</span><br/>
                <span style={{ color:'rgba(255,255,255,0.5)',fontSize:5 }}>WIQI LEE - MIT LICENSE</span>
              </div>
              <div className="vg-footer-socials" style={{ display:'flex',gap:6,alignItems:'center',flexWrap:'wrap' }}>
                <SocialLink href="https://x.com/wiqi_lee" icon={<XIcon size={11} color="currentColor"/>} label="@wiqi_lee" c="rgba(255,255,255,0.7)" bc="rgba(255,255,255,0.16)" bg="rgba(255,255,255,0.04)" hc="#fff" hbg="rgba(255,255,255,0.1)" />
                <SocialLink href="https://discord.com/users/209385020912173066" icon={<DiscordIcon size={12} color="#7b8cde"/>} label="Discord" c="#7b8cde" bc="rgba(123,140,222,0.25)" bg="rgba(123,140,222,0.06)" hc="#a5b4fc" hbg="rgba(123,140,222,0.14)" />
                <SocialLink href="https://github.com/wiqilee" icon={<GitHubIcon size={12} color="currentColor"/>} label="GitHub" c="rgba(255,255,255,0.7)" bc="rgba(255,255,255,0.14)" bg="rgba(255,255,255,0.04)" hc="#fff" hbg="rgba(255,255,255,0.1)" />
                <div style={{ width:1,height:18,background:'rgba(255,255,255,0.12)',margin:'0 3px' }} />
                <SocialLink href="https://geminiliveagentchallenge.devpost.com" icon={null} label="#GeminiLiveAgentChallenge" c="#ffd60a" bc="rgba(255,214,10,0.25)" bg="rgba(255,214,10,0.06)" hc="#ffe55a" hbg="rgba(255,214,10,0.12)" />
              </div>
              <div className="vg-footer-powered" style={{ fontFamily:PF,fontSize:6,color:'rgba(0,255,255,0.8)',letterSpacing:1.5,textAlign:'right',lineHeight:1.9,textShadow:'0 0 6px rgba(0,255,255,0.3)' }}>
                POWERED BY<br/><span style={{ color:'#5da9ff',textShadow:'0 0 10px #4285F4aa',fontSize:6 }}>GEMINI LIVE API</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
