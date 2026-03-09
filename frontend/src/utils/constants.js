// ── Scam Patterns — grounded from FTC / FBI IC3 / GASA / MAS / ACCC ──
// NOTE: No specific brand names — use generic terms
export const SCAM_PATTERNS = [
  { id:1,  category:"Bank Impersonation",         severity:"critical", description:"Caller poses as fraud prevention from a financial institution, manufacturing panic about account security to extract credentials.",                      markers:["suspicious activity detected","account will be frozen","verify your identity","fraud alert"],          mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:2,  category:"OTP / Credential Extraction",severity:"critical", description:"Solicits one-time passwords, PINs, passwords, or account numbers under false pretenses of verification or security.",                                    markers:["read me the code","verification number","confirm your PIN","security code"],                            mechanism:"AUTHORITY + COMPLIANCE",       source:"FTC Sentinel",  detected:false },
  { id:3,  category:"Artificial Urgency",          severity:"critical", description:"Creates false time pressure to prevent the victim from thinking clearly, consulting others, or recognizing the manipulation.",                              markers:["act now","expires in minutes","last chance","within the hour","immediately"],                             mechanism:"SCARCITY + PANIC",             source:"GASA 2024",     detected:false },
  { id:4,  category:"Safe Account Transfer",       severity:"critical", description:"Instructs victim to move funds to a 'secure' or 'protection' account secretly controlled by the scammer.",                                                markers:["safe account","protection account","transfer your funds","secure your money"],                            mechanism:"AUTHORITY + FEAR",             source:"FTC Sentinel",  detected:false },
  { id:5,  category:"Investment Fraud",            severity:"high",     description:"Promises guaranteed, unrealistic returns on investments with no risk — classic hallmarks of Ponzi and pyramid schemes.",                                    markers:["guaranteed returns","zero risk","300% profit","insider opportunity","limited positions"],                  mechanism:"GREED + SCARCITY",             source:"FBI IC3 2024",  detected:false },
  { id:6,  category:"Family Impersonation",        severity:"high",     description:"Impersonates a family member in distress to extract money or information through emotional manipulation.",                                                 markers:["I need your help","emergency situation","don't tell anyone","hospital","accident"],                        mechanism:"RECIPROCITY + FEAR",           source:"FTC Sentinel",  detected:false },
  { id:7,  category:"Tech Support Impersonation",  severity:"high",     description:"Poses as tech company support to gain remote access to the victim's device under the pretense of fixing a security issue.",                                markers:["virus detected","your computer is compromised","download this tool","remote access"],                      mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:8,  category:"Isolation Tactic",            severity:"high",     description:"Instructs victim not to discuss the situation with family, friends, or authorities — a key control mechanism in prolonged scam operations.",               markers:["don't tell anyone","keep this confidential","your family won't understand","between us","top secret"],      mechanism:"ISOLATION + CONTROL",          source:"GASA 2024",     detected:false },
  { id:9,  category:"Gift Card Demand",            severity:"high",     description:"Requests payment via gift cards as an untraceable and irreversible transfer method.",                                                                      markers:["buy gift cards","prepaid cards","scratch the back","read me the numbers"],                                  mechanism:"AUTHORITY + URGENCY",          source:"FTC Sentinel",  detected:false },
  { id:10, category:"Government Impersonation",    severity:"critical", description:"Poses as tax authority, social services, or law enforcement to threaten arrest, deportation, or legal consequences.",                                      markers:["tax authority","arrest warrant","legal action","deportation","badge number"],                              mechanism:"AUTHORITY + FEAR",             source:"FBI IC3 2024",  detected:false },
  { id:11, category:"Crypto Transfer Scam",        severity:"critical", description:"Instructs victim to send cryptocurrency to an 'investment wallet', 'recovery account', or 'escrow' — all controlled by the scammer.",                      markers:["send Bitcoin","crypto wallet","blockchain recovery","USDT transfer","DeFi protocol"],                       mechanism:"AUTHORITY + GREED",            source:"FTC Sentinel",  detected:false },
  { id:12, category:"Fake Prize / Lottery",        severity:"medium",   description:"Claims the victim has won a prize, lottery, or sweepstakes that requires a processing fee, tax, or insurance payment to release.",                          markers:["you've been selected","claim your prize","processing fee","release your winnings","congratulations"],       mechanism:"GREED + RECIPROCITY",          source:"FTC Sentinel",  detected:false },
  { id:13, category:"Extortion / Blackmail",       severity:"critical", description:"Threatens to expose personal data, photos, or contact lists unless payment is made — common in illegal loan app scams.",                                    markers:["spread your data","contact your employer","share photos","expose to social media"],                         mechanism:"FEAR + ISOLATION",             source:"GASA 2024",     detected:false },
  { id:14, category:"Fake Giveaway / Celebrity",   severity:"medium",   description:"Impersonates celebrity or influencer account running fake giveaway requiring upfront payment to claim prize.",                                              markers:["giveaway winner","celebrity","influencer","claim fee","exclusive prize","DM us"],                            mechanism:"RECIPROCITY + SCARCITY",       source:"GASA 2024",     detected:false },
]

// ── Psychological manipulation vectors (Cialdini + FBI behavioral) ──
export const PSYCH_TACTICS = [
  { id:"SCARCITY",    label:"Scarcity",    icon:"⏱", desc:"Creates artificial time pressure or limited availability to force hasty decisions.",                 color:"#ff2d55" },
  { id:"AUTHORITY",   label:"Authority",   icon:"🏛", desc:"Impersonates trusted institutions (banks, government, tech companies) to bypass critical thinking.", color:"#ff9500" },
  { id:"FEAR",        label:"Fear",        icon:"⚡", desc:"Induces panic about account closure, arrest, device compromise, or family harm.",                     color:"#ff2d55" },
  { id:"RECIPROCITY", label:"Reciprocity", icon:"🔄", desc:"Creates false sense of obligation — 'we already helped you, now you must help us'.",                 color:"#ffd60a" },
  { id:"ISOLATION",   label:"Isolation",   icon:"🔒", desc:"Demands secrecy to cut off the victim from people who could identify the scam.",                      color:"#bf5af2" },
  { id:"COMMITMENT",  label:"Commitment",  icon:"📌", desc:"Traps victims in escalating compliance — each small agreement makes refusal harder.",                  color:"#30d158" },
]

// ── Lie Detection Metrics ───────────────────────────────
export const LIE_INDICATORS = [
  { id:"INCONSISTENCY",  label:"Statement Inconsistency", icon:"🔀", desc:"Contradictions between claims made at different points in the conversation.", color:"#ff2d55" },
  { id:"VAGUENESS",      label:"Strategic Vagueness",      icon:"🌫", desc:"Deliberately avoids specifics when challenged — a hallmark of fabricated stories.", color:"#ff9500" },
  { id:"OVERDETAIL",     label:"Excessive Detail",         icon:"📋", desc:"Unprompted flood of irrelevant details to appear credible — overcompensation.", color:"#ffd60a" },
  { id:"DEFLECTION",     label:"Question Deflection",      icon:"↩️", desc:"Responds to direct questions with new claims or changes subject entirely.", color:"#bf5af2" },
  { id:"PRESSURE",       label:"Pressure to Comply",       icon:"⏳", desc:"Uses urgency to prevent verification — liars need you to act before you think.", color:"#ff2d55" },
]

// ── Severity config with animation tokens ──────────────
export const SEV = {
  critical: {
    bg:"rgba(255,45,85,0.1)",
    border:"#ff2d55",
    text:"#ff2d55",
    glow:"0 0 18px rgba(255,45,85,0.5)",
    pulse: true,
    glowAnim: 'alert-glow-critical 3s ease-in-out infinite',
    dotAnim: 'alert-dot-critical 1s ease-in-out infinite',
  },
  high: {
    bg:"rgba(255,149,0,0.1)",
    border:"#ff9500",
    text:"#ff9500",
    glow:"0 0 18px rgba(255,149,0,0.4)",
    pulse: true,
    glowAnim: 'alert-glow-high 4s ease-in-out infinite',
    dotAnim: 'blink 1s step-end infinite',
  },
  medium: {
    bg:"rgba(255,214,10,0.08)",
    border:"#ffd60a",
    text:"#ffd60a",
    glow:"0 0 14px rgba(255,214,10,0.3)",
    pulse: false,
    glowAnim: 'none',
    dotAnim: 'blink 1.5s step-end infinite',
  },
  low: {
    bg:"rgba(48,209,88,0.08)",
    border:"#30d158",
    text:"#30d158",
    glow:"0 0 12px rgba(48,209,88,0.3)",
    pulse: false,
    glowAnim: 'none',
    dotAnim: 'blink 2s step-end infinite',
  },
}

// ── Fonts ──────────────────────────────────────────────────────
export const PF = "'Press Start 2P', monospace"
export const MF = "'Share Tech Mono', 'Courier New', monospace"

// ══════════════════════════════════════════════════════════════════
// ── LIVE SCAM INTERVENTION SYSTEM ────────────────────────────────
// ══════════════════════════════════════════════════════════════════

// Intervention escalation levels — maps threat score ranges to response intensity
export const INTERVENTION_LEVELS = {
  WARN:     { threshold: 55, color: '#ff9500', label: 'WARNING',           icon: '⚠️',  pulse: false },
  BLOCK:    { threshold: 75, color: '#ff2d55', label: 'DANGER — BLOCK',    icon: '🛑',  pulse: true  },
  LOCKDOWN: { threshold: 90, color: '#ff2d55', label: 'LOCKDOWN',          icon: '🚨',  pulse: true  },
}

// Which alert patterns trigger immediate intervention regardless of cumulative score
export const INSTANT_INTERVENTION_PATTERNS = [
  'OTP / Credential Extraction',
  'Safe Account Transfer',
  'Gift Card Demand',
  'Crypto Transfer Scam',
  'Pencurian OTP / Kredensial',   // ID
  'OTP チョリ',                    // JA
  'OTP 도용',                      // KO
  'سرقة بيانات',                  // AR
  'OTP चोरी',                     // HI
  'Robo de Credenciales',         // ES
]

// Sensitive action keywords that trigger intervention in transcript
export const SENSITIVE_ACTION_KEYWORDS = {
  en: ['transfer','wire','send money','gift card','OTP','passcode','PIN','password','account number','routing number','social security','crypto','bitcoin','remote access','download','install'],
  id: ['transfer','kirim uang','pulsa','OTP','PIN','password','rekening','kartu','kripto','download'],
  zh: ['转账','汇款','验证码','密码','银行卡','比特币','下载','安装'],
  ja: ['振込','送金','暗証番号','パスワード','ビットコイン','ダウンロード'],
  ko: ['송금','이체','비밀번호','인증번호','비트코인','다운로드'],
  es: ['transferir','enviar dinero','contraseña','código','tarjeta','cripto','descargar'],
  fr: ['transférer','envoyer','mot de passe','code','carte','crypto','télécharger'],
  hi: ['ट्रांसफर','भेजें','OTP','पासवर्ड','बिटकॉइन','डाउनलोड'],
  ar: ['تحويل','إرسال','كلمة المرور','رمز','بيتكوين','تحميل'],
}

// Verification challenge prompts — forces user to pause and think
export const VERIFICATION_CHALLENGES = {
  en: {
    title: 'VERIFICATION CHALLENGE',
    question: 'Before you continue, answer this:',
    challenges: [
      { q: 'Did YOU initiate this call, or did they call you?', safe: 'They called me', unsafe: 'I called them' },
      { q: 'Has this caller asked for your OTP, PIN, or password?', safe: 'Yes', unsafe: 'No' },
      { q: 'Are they pressuring you to act RIGHT NOW?', safe: 'Yes', unsafe: 'No' },
      { q: 'Did they tell you NOT to contact your bank or family?', safe: 'Yes', unsafe: 'No' },
    ],
    result_scam: 'This matches confirmed scam behavior. Do NOT proceed.',
    result_safe: 'Proceed with caution. Stay alert for further red flags.',
  },
  id: {
    title: 'TANTANGAN VERIFIKASI',
    question: 'Sebelum melanjutkan, jawab ini:',
    challenges: [
      { q: 'Apakah ANDA yang menelepon, atau mereka yang menelepon Anda?', safe: 'Mereka menelepon saya', unsafe: 'Saya yang menelepon' },
      { q: 'Apakah mereka meminta OTP, PIN, atau password Anda?', safe: 'Ya', unsafe: 'Tidak' },
      { q: 'Apakah mereka menekan Anda untuk bertindak SEKARANG JUGA?', safe: 'Ya', unsafe: 'Tidak' },
      { q: 'Apakah mereka bilang jangan hubungi bank atau keluarga?', safe: 'Ya', unsafe: 'Tidak' },
    ],
    result_scam: 'Ini cocok dengan perilaku penipuan. JANGAN lanjutkan.',
    result_safe: 'Lanjutkan dengan hati-hati. Tetap waspada.',
  },
  zh: {
    title: '安全验证',
    question: '继续之前请回答：',
    challenges: [
      { q: '是您主动拨打的电话，还是对方打给您的？', safe: '对方打给我的', unsafe: '我打给他们的' },
      { q: '对方是否要求您提供验证码、密码或PIN？', safe: '是', unsafe: '否' },
      { q: '对方是否在催促您立即行动？', safe: '是', unsafe: '否' },
      { q: '对方是否要求您不要联系银行或家人？', safe: '是', unsafe: '否' },
    ],
    result_scam: '这符合诈骗行为特征。请勿继续操作。',
    result_safe: '请谨慎继续。保持警惕。',
  },
  ja: {
    title: '安全確認チャレンジ',
    question: '続ける前にお答えください：',
    challenges: [
      { q: 'この電話はあなたからかけましたか？それとも相手から？', safe: '相手からです', unsafe: '自分からです' },
      { q: '相手はOTP・暗証番号・パスワードを聞きましたか？', safe: 'はい', unsafe: 'いいえ' },
      { q: '「今すぐ」行動するよう迫られていますか？', safe: 'はい', unsafe: 'いいえ' },
      { q: '銀行や家族に相談しないよう言われましたか？', safe: 'はい', unsafe: 'いいえ' },
    ],
    result_scam: 'これは詐欺の特徴と一致します。絶対に続けないでください。',
    result_safe: '慎重に進めてください。引き続き警戒してください。',
  },
  ko: {
    title: '보안 확인 질문',
    question: '계속하기 전에 답해주세요:',
    challenges: [
      { q: '이 전화를 당신이 걸었습니까, 상대방이 걸었습니까?', safe: '상대방이 걸었습니다', unsafe: '제가 걸었습니다' },
      { q: '상대방이 OTP, 비밀번호를 요구했습니까?', safe: '예', unsafe: '아니오' },
      { q: '지금 당장 행동하라고 압박하고 있습니까?', safe: '예', unsafe: '아니오' },
      { q: '은행이나 가족에게 연락하지 말라고 했습니까?', safe: '예', unsafe: '아니오' },
    ],
    result_scam: '확인된 사기 행위와 일치합니다. 진행하지 마세요.',
    result_safe: '주의하며 진행하세요. 계속 경계하세요.',
  },
  es: {
    title: 'DESAFÍO DE VERIFICACIÓN',
    question: 'Antes de continuar, responda:',
    challenges: [
      { q: '¿Usted inició esta llamada o le llamaron a usted?', safe: 'Me llamaron a mí', unsafe: 'Yo llamé' },
      { q: '¿Le pidieron OTP, PIN o contraseña?', safe: 'Sí', unsafe: 'No' },
      { q: '¿Le presionan para actuar AHORA MISMO?', safe: 'Sí', unsafe: 'No' },
      { q: '¿Le dijeron que no contacte a su banco o familia?', safe: 'Sí', unsafe: 'No' },
    ],
    result_scam: 'Esto coincide con un fraude confirmado. NO continúe.',
    result_safe: 'Proceda con precaución. Manténgase alerta.',
  },
  fr: {
    title: 'DÉFI DE VÉRIFICATION',
    question: 'Avant de continuer, répondez :',
    challenges: [
      { q: 'Avez-VOUS initié cet appel, ou vous a-t-on appelé ?', safe: 'On m\'a appelé', unsafe: 'J\'ai appelé' },
      { q: 'Vous a-t-on demandé un OTP, PIN ou mot de passe ?', safe: 'Oui', unsafe: 'Non' },
      { q: 'Vous presse-t-on d\'agir MAINTENANT ?', safe: 'Oui', unsafe: 'Non' },
      { q: 'Vous a-t-on dit de ne pas contacter votre banque ?', safe: 'Oui', unsafe: 'Non' },
    ],
    result_scam: 'Cela correspond à un comportement frauduleux. Ne continuez PAS.',
    result_safe: 'Continuez avec prudence. Restez vigilant.',
  },
  hi: {
    title: 'सत्यापन चुनौती',
    question: 'आगे बढ़ने से पहले जवाब दें:',
    challenges: [
      { q: 'क्या आपने कॉल किया या उन्होंने कॉल किया?', safe: 'उन्होंने कॉल किया', unsafe: 'मैंने कॉल किया' },
      { q: 'क्या उन्होंने OTP, PIN या पासवर्ड माँगा?', safe: 'हाँ', unsafe: 'नहीं' },
      { q: 'क्या वे अभी तुरंत कार्रवाई के लिए दबाव बना रहे हैं?', safe: 'हाँ', unsafe: 'नहीं' },
      { q: 'क्या उन्होंने कहा कि बैंक या परिवार को न बताएं?', safe: 'हाँ', unsafe: 'नहीं' },
    ],
    result_scam: 'यह धोखाधड़ी के व्यवहार से मेल खाता है। आगे न बढ़ें।',
    result_safe: 'सावधानी से आगे बढ़ें। सतर्क रहें।',
  },
  ar: {
    title: 'تحدي التحقق',
    question: 'قبل المتابعة، أجب على هذا:',
    challenges: [
      { q: 'هل أنت من بدأ المكالمة أم هم من اتصلوا بك؟', safe: 'هم من اتصلوا', unsafe: 'أنا من اتصلت' },
      { q: 'هل طلبوا منك رمز OTP أو كلمة المرور؟', safe: 'نعم', unsafe: 'لا' },
      { q: 'هل يضغطون عليك للتصرف الآن؟', safe: 'نعم', unsafe: 'لا' },
      { q: 'هل قالوا لك لا تتصل بالبنك أو العائلة؟', safe: 'نعم', unsafe: 'لا' },
    ],
    result_scam: 'هذا يتطابق مع سلوك احتيالي مؤكد. لا تتابع.',
    result_safe: 'تابع بحذر. ابق متيقظاً.',
  },
}

// Safe exit actions — what to show when intervention fires
export const SAFE_EXIT_ACTIONS = {
  en: [
    { icon: '📵', text: 'HANG UP NOW', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'Call your bank\'s REAL number (on back of card)', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'Call a trusted family member before doing anything', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'NEVER share OTP / PIN / password on a call', action: 'never_share', priority: 'critical' },
  ],
  id: [
    { icon: '📵', text: 'TUTUP TELEPON SEKARANG', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'Hubungi nomor RESMI bank (di belakang kartu)', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'Hubungi keluarga sebelum melakukan apapun', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'JANGAN PERNAH bagi OTP / PIN / password di telepon', action: 'never_share', priority: 'critical' },
  ],
  zh: [
    { icon: '📵', text: '立即挂断电话', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: '拨打银行卡背面的官方电话', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: '先联系家人再做任何决定', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: '绝不在电话中透露验证码/密码', action: 'never_share', priority: 'critical' },
  ],
  ja: [
    { icon: '📵', text: '今すぐ電話を切ってください', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'カード裏面の公式番号に電話', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: '何かする前に家族に相談', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: '電話で暗証番号を絶対に教えない', action: 'never_share', priority: 'critical' },
  ],
  ko: [
    { icon: '📵', text: '지금 당장 전화를 끊으세요', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: '카드 뒷면의 공식 번호로 전화', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: '행동 전 가족에게 먼저 연락', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: '전화로 비밀번호를 절대 알려주지 마세요', action: 'never_share', priority: 'critical' },
  ],
  es: [
    { icon: '📵', text: 'CUELGUE AHORA', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'Llame al número REAL de su banco', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'Llame a un familiar antes de hacer algo', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'NUNCA comparta OTP / PIN por teléfono', action: 'never_share', priority: 'critical' },
  ],
  fr: [
    { icon: '📵', text: 'RACCROCHEZ MAINTENANT', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'Appelez le VRAI numéro de votre banque', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'Appelez un proche avant toute action', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'Ne JAMAIS partager OTP / PIN par téléphone', action: 'never_share', priority: 'critical' },
  ],
  hi: [
    { icon: '📵', text: 'अभी फोन काटें', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'बैंक का असली नंबर (कार्ड पर) पर कॉल करें', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'कुछ भी करने से पहले परिवार को कॉल करें', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'कॉल पर OTP / PIN कभी न बताएं', action: 'never_share', priority: 'critical' },
  ],
  ar: [
    { icon: '📵', text: 'أغلق المكالمة الآن', action: 'hangup', priority: 'critical' },
    { icon: '🏦', text: 'اتصل بالرقم الرسمي لبنكك', action: 'call_bank', priority: 'critical' },
    { icon: '👥', text: 'اتصل بفرد من العائلة قبل أي إجراء', action: 'call_family', priority: 'high' },
    { icon: '🚫', text: 'لا تشارك أبداً كلمة المرور عبر الهاتف', action: 'never_share', priority: 'critical' },
  ],
}

// Helper to get intervention text for a language
export function getInterventionForLang(langCode) {
  const base = langCode?.split('-')[0] || 'en'
  return {
    challenges: VERIFICATION_CHALLENGES[base] || VERIFICATION_CHALLENGES['en'],
    safeExits: SAFE_EXIT_ACTIONS[base] || SAFE_EXIT_ACTIONS['en'],
  }
}

// Check if a pattern name should trigger instant intervention
export function isInstantInterventionPattern(patternName) {
  return INSTANT_INTERVENTION_PATTERNS.some(p =>
    patternName?.toLowerCase().includes(p.toLowerCase())
  )
}

// Get intervention level from threat score
export function getInterventionLevel(threatScore, latestAlert) {
  // Instant intervention for dangerous patterns regardless of score
  if (latestAlert && isInstantInterventionPattern(latestAlert.pattern)) {
    return INTERVENTION_LEVELS.BLOCK
  }
  if (threatScore >= INTERVENTION_LEVELS.LOCKDOWN.threshold) return INTERVENTION_LEVELS.LOCKDOWN
  if (threatScore >= INTERVENTION_LEVELS.BLOCK.threshold) return INTERVENTION_LEVELS.BLOCK
  if (threatScore >= INTERVENTION_LEVELS.WARN.threshold) return INTERVENTION_LEVELS.WARN
  return null
}

// ── Recommended Actions per Language/Country — ALL IN LOCAL LANGUAGE ──
export const RECOMMENDED_ACTIONS = {
  en: {
    country: 'United States',
    actions: [
      { icon:'🚫', text:'Do NOT transfer money, gift cards, or cryptocurrency to anyone', priority:'critical' },
      { icon:'📞', text:'Hang up immediately — do not engage further with the caller', priority:'critical' },
      { icon:'🏦', text:'Contact your bank\'s official fraud hotline (number on back of your card)', priority:'high' },
      { icon:'📋', text:'Report to FTC: reportfraud.ftc.gov', link:'https://reportfraud.ftc.gov', priority:'high' },
      { icon:'🔍', text:'File FBI IC3 complaint: ic3.gov', link:'https://ic3.gov', priority:'high' },
      { icon:'📱', text:'Enable two-factor authentication on all financial accounts', priority:'medium' },
      { icon:'🔒', text:'Change passwords on any accounts you may have disclosed', priority:'high' },
      { icon:'📝', text:'Document everything: save call logs, screenshots, messages', priority:'medium' },
      { icon:'👥', text:'Alert family members — scammers often target multiple people', priority:'medium' },
      { icon:'⚖️', text:'Contact your state Attorney General\'s consumer protection office', priority:'low' },
    ]
  },
  id: {
    country: 'Indonesia',
    actions: [
      { icon:'🚫', text:'JANGAN transfer uang, pulsa, atau kripto ke siapapun', priority:'critical' },
      { icon:'📞', text:'Putuskan panggilan segera — jangan lanjutkan percakapan', priority:'critical' },
      { icon:'🏦', text:'Hubungi hotline resmi bank Anda (cek nomor di belakang kartu ATM)', priority:'high' },
      { icon:'📋', text:'Lapor ke OJK: 157 atau konsumen@ojk.go.id', link:'https://ojk.go.id', priority:'high' },
      { icon:'🔍', text:'Lapor ke Kominfo: aduankonten.id', link:'https://aduankonten.id', priority:'high' },
      { icon:'👮', text:'Lapor ke Bareskrim Polri: patrolisiber.id', link:'https://patrolisiber.id', priority:'high' },
      { icon:'📱', text:'Aktifkan verifikasi 2 langkah di semua akun keuangan', priority:'medium' },
      { icon:'🔒', text:'Ganti PIN dan password mobile banking segera', priority:'high' },
      { icon:'📝', text:'Simpan semua bukti: screenshot, log panggilan, pesan', priority:'medium' },
      { icon:'👥', text:'Peringatkan keluarga — penipu sering menargetkan banyak orang', priority:'medium' },
    ]
  },
  'zh-CN': {
    country: '中国',
    actions: [
      { icon:'🚫', text:'切勿向任何人转账、汇款或提供银行信息', priority:'critical' },
      { icon:'📞', text:'立即挂断电话 — 不要继续与来电者交流', priority:'critical' },
      { icon:'🏦', text:'联系银行官方客服热线', priority:'high' },
      { icon:'📋', text:'拨打反诈热线 96110 报警', priority:'high' },
      { icon:'🔍', text:'下载国家反诈中心APP进行举报', priority:'high' },
      { icon:'👮', text:'向当地公安局报案', priority:'high' },
      { icon:'📱', text:'开启银行账户交易提醒和二次验证', priority:'medium' },
      { icon:'🔒', text:'立即修改网银密码和支付密码', priority:'high' },
      { icon:'📝', text:'保留所有证据：通话记录、截图、转账记录', priority:'medium' },
      { icon:'👥', text:'提醒家人朋友注意防范', priority:'medium' },
    ]
  },
  zh: {
    country: '中国',
    actions: [
      { icon:'🚫', text:'切勿向任何人转账、汇款或提供银行信息', priority:'critical' },
      { icon:'📞', text:'立即挂断电话', priority:'critical' },
      { icon:'📋', text:'拨打反诈热线 96110 报警', priority:'high' },
      { icon:'🔍', text:'下载国家反诈中心APP进行举报', priority:'high' },
      { icon:'👮', text:'向当地公安局报案', priority:'high' },
      { icon:'🔒', text:'立即修改网银密码和支付密码', priority:'high' },
    ]
  },
  ja: {
    country: '日本',
    actions: [
      { icon:'🚫', text:'絶対にお金を振り込まない・渡さない', priority:'critical' },
      { icon:'📞', text:'すぐに電話を切る — これ以上会話しない', priority:'critical' },
      { icon:'🏦', text:'銀行の公式相談窓口に連絡', priority:'high' },
      { icon:'📋', text:'警察相談 #9110 に電話', priority:'high' },
      { icon:'🔍', text:'消費者ホットライン 188 に相談', priority:'high' },
      { icon:'👮', text:'最寄りの警察署に被害届を提出', priority:'high' },
      { icon:'📱', text:'全ての金融口座で二段階認証を有効化', priority:'medium' },
      { icon:'🔒', text:'暗証番号・パスワードを直ちに変更', priority:'high' },
    ]
  },
  ko: {
    country: '대한민국',
    actions: [
      { icon:'🚫', text:'절대 송금하거나 개인정보를 제공하지 마세요', priority:'critical' },
      { icon:'📞', text:'즉시 전화를 끊으세요', priority:'critical' },
      { icon:'🏦', text:'은행 공식 콜센터에 연락하세요', priority:'high' },
      { icon:'📋', text:'금융감독원 1332에 신고하세요', priority:'high' },
      { icon:'🔍', text:'경찰청 사이버수사대 182에 신고하세요', priority:'high' },
      { icon:'📱', text:'모든 금융계좌 2단계 인증을 활성화하세요', priority:'medium' },
      { icon:'🔒', text:'비밀번호를 즉시 변경하세요', priority:'high' },
    ]
  },
  es: {
    country: 'España',
    actions: [
      { icon:'🚫', text:'NO transfiera dinero ni proporcione datos personales a nadie', priority:'critical' },
      { icon:'📞', text:'Cuelgue inmediatamente — no continúe la conversación', priority:'critical' },
      { icon:'🏦', text:'Contacte la línea de fraude oficial de su banco', priority:'high' },
      { icon:'📋', text:'Denuncie a la Policía Nacional: 091', priority:'high' },
      { icon:'🔍', text:'Reporte en INCIBE: incibe.es', link:'https://incibe.es', priority:'high' },
      { icon:'📱', text:'Active la verificación en dos pasos en todas sus cuentas', priority:'medium' },
      { icon:'🔒', text:'Cambie sus contraseñas inmediatamente', priority:'high' },
      { icon:'📝', text:'Guarde todas las pruebas: capturas, registros de llamadas', priority:'medium' },
    ]
  },
  fr: {
    country: 'France',
    actions: [
      { icon:'🚫', text:'Ne transférez PAS d\'argent et ne communiquez aucune donnée personnelle', priority:'critical' },
      { icon:'📞', text:'Raccrochez immédiatement — ne poursuivez pas la conversation', priority:'critical' },
      { icon:'🏦', text:'Contactez votre banque via le numéro officiel', priority:'high' },
      { icon:'📋', text:'Signalez sur Pharos: internet-signalement.gouv.fr', priority:'high' },
      { icon:'🔍', text:'Appelez Info Escroqueries: 0 805 805 817 (gratuit)', priority:'high' },
      { icon:'📱', text:'Activez l\'authentification à deux facteurs sur tous vos comptes', priority:'medium' },
      { icon:'🔒', text:'Changez vos mots de passe immédiatement', priority:'high' },
    ]
  },
  hi: {
    country: 'भारत (India)',
    actions: [
      { icon:'🚫', text:'किसी को भी पैसे ट्रांसफर न करें या OTP न बताएं', priority:'critical' },
      { icon:'📞', text:'तुरंत कॉल काट दें — बातचीत जारी न रखें', priority:'critical' },
      { icon:'🏦', text:'अपने बैंक की आधिकारिक हेल्पलाइन पर कॉल करें', priority:'high' },
      { icon:'📋', text:'साइबर क्राइम हेल्पलाइन 1930 पर रिपोर्ट करें', priority:'high' },
      { icon:'🔍', text:'cybercrime.gov.in पर शिकायत दर्ज करें', link:'https://cybercrime.gov.in', priority:'high' },
      { icon:'📱', text:'सभी वित्तीय खातों पर 2FA सक्रिय करें', priority:'medium' },
      { icon:'🔒', text:'UPI PIN और बैंकिंग पासवर्ड तुरंत बदलें', priority:'high' },
    ]
  },
  ar: {
    country: 'الشرق الأوسط',
    actions: [
      { icon:'🚫', text:'لا تحول أي أموال أو تشارك بياناتك المصرفية مع أي شخص', priority:'critical' },
      { icon:'📞', text:'أغلق المكالمة فوراً — لا تستمر في الحديث', priority:'critical' },
      { icon:'🏦', text:'اتصل بالخط الساخن الرسمي لبنكك', priority:'high' },
      { icon:'📋', text:'أبلغ الجهات المختصة في بلدك', priority:'high' },
      { icon:'📱', text:'فعّل التحقق بخطوتين على جميع حساباتك المالية', priority:'medium' },
      { icon:'🔒', text:'غيّر كلمات المرور فوراً', priority:'high' },
      { icon:'📝', text:'احتفظ بجميع الأدلة: لقطات الشاشة وسجلات المكالمات', priority:'medium' },
    ]
  },
}

// Helper to get actions for a language code
export function getActionsForLang(langCode) {
  if (RECOMMENDED_ACTIONS[langCode]) return RECOMMENDED_ACTIONS[langCode]
  const base = langCode.split('-')[0]
  if (RECOMMENDED_ACTIONS[base]) return RECOMMENDED_ACTIONS[base]
  return RECOMMENDED_ACTIONS['en']
}

// ── Demo/mock alerts ─────────────────────────────────────────
export const MOCK_ALERTS = [
  { id:1, time:"00:23", severity:"critical", pattern:"Bank Impersonation",         quote:'"I am calling from your bank fraud prevention — we detected suspicious activity on your account."',  confidence:97, tactics:["AUTHORITY","FEAR"],        source:"FTC Sentinel"  },
  { id:2, time:"01:07", severity:"critical", pattern:"Artificial Urgency",         quote:'"Your account will be permanently frozen in 10 minutes if you do not act right now."',                confidence:94, tactics:["SCARCITY","FEAR"],        source:"FBI IC3 2024"  },
  { id:3, time:"01:52", severity:"critical", pattern:"OTP / Credential Extraction",quote:'"Please read me the 6-digit verification code that was just sent to your phone."',                    confidence:99, tactics:["AUTHORITY","COMMITMENT"],  source:"GASA 2024"     },
  { id:4, time:"02:31", severity:"high",     pattern:"Isolation Tactic",           quote:'"Do not discuss this with your family — this is a confidential fraud investigation."',                confidence:91, tactics:["ISOLATION","AUTHORITY"],   source:"FTC Sentinel"  },
]
