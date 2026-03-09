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
  critical: { bg:"rgba(255,45,85,0.1)",  border:"#ff2d55", text:"#ff2d55", glow:"0 0 18px rgba(255,45,85,0.5)",  pulse:true,  glowAnim:'alert-glow-critical 3s ease-in-out infinite', dotAnim:'alert-dot-critical 1s ease-in-out infinite' },
  high:     { bg:"rgba(255,149,0,0.1)",  border:"#ff9500", text:"#ff9500", glow:"0 0 18px rgba(255,149,0,0.4)",  pulse:true,  glowAnim:'alert-glow-high 4s ease-in-out infinite',     dotAnim:'blink 1s step-end infinite' },
  medium:   { bg:"rgba(255,214,10,0.08)",border:"#ffd60a", text:"#ffd60a", glow:"0 0 14px rgba(255,214,10,0.3)", pulse:false, glowAnim:'none', dotAnim:'blink 1.5s step-end infinite' },
  low:      { bg:"rgba(48,209,88,0.08)", border:"#30d158", text:"#30d158", glow:"0 0 12px rgba(48,209,88,0.3)",  pulse:false, glowAnim:'none', dotAnim:'blink 2s step-end infinite' },
}

// ── Fonts ──────────────────────────────────────────────────────
export const PF = "'Press Start 2P', monospace"
export const MF = "'Share Tech Mono', 'Courier New', monospace"

// ══════════════════════════════════════════════════════════════════
// ── LIVE SCAM INTERVENTION SYSTEM ────────────────────────────────
// ══════════════════════════════════════════════════════════════════

export const INTERVENTION_LEVELS = {
  WARN:     { threshold: 55, color: '#ff9500', label: 'WARNING',        icon: '⚠️',  pulse: false },
  BLOCK:    { threshold: 75, color: '#ff2d55', label: 'DANGER — BLOCK', icon: '🛑',  pulse: true  },
  LOCKDOWN: { threshold: 90, color: '#ff2d55', label: 'LOCKDOWN',       icon: '🚨',  pulse: true  },
}

// Which alert patterns trigger immediate intervention regardless of cumulative score
export const INSTANT_INTERVENTION_PATTERNS = [
  'OTP / Credential Extraction',
  'Safe Account Transfer',
  'Gift Card Demand',
  'Crypto Transfer Scam',
  'Pencurian OTP / Kredensial',
  'OTP チョリ',
  'OTP 도용',
  'سرقة بيانات',
  'OTP चोरी',
  'Robo de Credenciales',
]

// ══════════════════════════════════════════════════════════════════
// ── INTERVENTION RULES — determines what UI each scenario gets ──
// ══════════════════════════════════════════════════════════════════

// Patterns where the damage is immediate — NO challenge, safe exit ONLY
const FATAL_PATTERNS = new Set([
  'OTP / Credential Extraction',
  'Safe Account Transfer',
  'Gift Card Demand',
  'Crypto Transfer Scam',
  // Localized
  'Pencurian OTP / Kredensial',
  '安全账户转账',
  'OTP チョリ',
  'OTP 도용',
  'سرقة بيانات',
  'OTP चोरी',
  'Robo de Credenciales',
])

// Determines if Verification Challenge is available for a given intervention
export function isChallengeAvailable(interventionLevel, pattern) {
  // LOCKDOWN: always safe exit only — too dangerous for challenge
  if (interventionLevel === 'LOCKDOWN') return false
  // Fatal patterns: always safe exit only
  if (FATAL_PATTERNS.has(pattern)) return false
  // WARN and non-fatal BLOCK: challenge available
  return true
}

// ══════════════════════════════════════════════════════════════════
// ── SCENARIO-BASED VERIFICATION CHALLENGES ──────────────────────
// ══════════════════════════════════════════════════════════════════
// 2-3 questions per scenario. Contextual to the scam type.
// Each question: answering "scam_indicator" = confirms scam behavior.

// Scenario classifier — maps pattern names to scenario keys
const SCENARIO_MAP = {
  'Bank Impersonation': 'bank',
  'Government Impersonation': 'government',
  'Tech Support Impersonation': 'tech_support',
  'Investment Fraud': 'investment',
  'Family Impersonation': 'family',
  'Artificial Urgency': 'urgency',
  'Isolation Tactic': 'generic',
  'Fake Prize / Lottery': 'prize',
  'Extortion / Blackmail': 'generic',
  'Fake Giveaway / Celebrity': 'prize',
  // Localized — map to same scenarios
  'Penipuan Perbankan': 'bank',
  '冒充政府机关': 'government',
  '家族なりすまし': 'family',
  '정부기관 사칭': 'government',
  'Suplantación Bancaria': 'bank',
  'Usurpation gouvernementale': 'government',
  'सरकारी एजेंसी का रूप': 'government',
  'انتحال موظف بنكي': 'bank',
  'Pemerasan / Intimidasi': 'generic',
  'Ancaman Pemerasan': 'generic',
  'Penipuan Identitas Keluarga': 'family',
  'डिजिटल अरेस्ट': 'government',
}

function getScenarioKey(pattern) {
  return SCENARIO_MAP[pattern] || 'generic'
}

// Per-language, per-scenario verification challenges
// Each scenario has exactly 2-3 questions + results + verify action
const SCENARIO_CHALLENGES = {
  en: {
    bank: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'This caller claims to be from your bank.',
      questions: [
        { q: 'Did this caller contact you first, or did you call them?', scam_indicator: 'They contacted me', safe_indicator: 'I called them' },
        { q: 'Are they asking you to share your OTP, PIN, or password?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Did they tell you NOT to call your bank directly?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'This matches confirmed bank impersonation tactics. Real banks NEVER ask for your OTP or password by phone.',
      result_caution: 'Some red flags detected. Do not share any credentials until you verify independently.',
      verify_action: 'Call the number on the BACK of your bank card',
    },
    government: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'This caller claims to be from a government agency.',
      questions: [
        { q: 'Is this caller threatening arrest or legal action if you don\'t pay now?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they demanding payment via gift cards, crypto, or wire transfer?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Government agencies NEVER threaten arrest by phone or demand gift card payments. This is a scam.',
      result_caution: 'Be cautious. Verify by calling the agency\'s official public number.',
      verify_action: 'Look up the agency\'s official number independently',
    },
    tech_support: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'This caller claims your device is compromised.',
      questions: [
        { q: 'Did this caller contact you first about a "virus" or "security issue"?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they asking you to install remote access software?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they rushing you to act immediately?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Legitimate tech companies NEVER cold-call about viruses. Do NOT install any software they suggest.',
      result_caution: 'Do not grant remote access. Contact the company through their official website.',
      verify_action: 'Visit the official company website for real support',
    },
    investment: {
      title: 'VERIFY THIS OPPORTUNITY',
      subtitle: 'This caller is promoting an investment.',
      questions: [
        { q: 'Are they promising guaranteed returns with zero risk?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they pressuring you to invest before a deadline?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'No legitimate investment guarantees returns. This matches classic investment fraud patterns.',
      result_caution: 'High-pressure tactics are a red flag. Research independently before investing.',
      verify_action: 'Check with your financial advisor or regulatory body',
    },
    family: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'This caller claims to be a family member in trouble.',
      questions: [
        { q: 'Can you verify their identity by asking something only they would know?', scam_indicator: 'They can\'t answer', safe_indicator: 'They answered correctly' },
        { q: 'Are they telling you not to contact other family members?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'This matches family impersonation tactics. Scammers use panic to prevent you from verifying.',
      result_caution: 'Hang up and call this family member directly on their known number.',
      verify_action: 'Call this person back on their real phone number',
    },
    prize: {
      title: 'VERIFY THIS CLAIM',
      subtitle: 'This caller says you\'ve won a prize.',
      questions: [
        { q: 'Did you enter any contest or lottery to win this?', scam_indicator: 'No', safe_indicator: 'Yes' },
        { q: 'Are they asking you to pay a fee to claim your prize?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'You cannot win a contest you didn\'t enter. Legitimate prizes NEVER require upfront payment.',
      result_caution: 'Be skeptical. Verify the contest through official channels before paying anything.',
      verify_action: 'Search for the contest name online to verify it exists',
    },
    urgency: {
      title: 'PAUSE AND THINK',
      subtitle: 'This caller is creating extreme time pressure.',
      questions: [
        { q: 'Is the caller saying you must act within minutes or face consequences?', scam_indicator: 'Yes', safe_indicator: 'No' },
        { q: 'Are they preventing you from hanging up to verify their claims?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Artificial urgency is the #1 manipulation tactic. Legitimate organizations give you time to verify.',
      result_caution: 'Take a breath. No legitimate situation requires instant action by phone.',
      verify_action: 'Hang up and call back through an official number',
    },
    generic: {
      title: 'VERIFY THIS CALLER',
      subtitle: 'VoxGuard detected manipulation patterns in this call.',
      questions: [
        { q: 'Did this caller contact you first, or did you initiate contact?', scam_indicator: 'They contacted me', safe_indicator: 'I contacted them' },
        { q: 'Are they pressuring you to act immediately without verifying?', scam_indicator: 'Yes', safe_indicator: 'No' },
      ],
      result_scam: 'Multiple scam indicators detected. Do NOT proceed with any requests from this caller.',
      result_caution: 'Exercise caution. Verify the caller\'s identity through independent channels.',
      verify_action: 'Verify through an official channel before taking any action',
    },
  },
  id: {
    bank: {
      title: 'VERIFIKASI PENELEPON',
      subtitle: 'Penelepon mengaku dari bank Anda.',
      questions: [
        { q: 'Apakah penelepon yang menghubungi Anda duluan?', scam_indicator: 'Ya, mereka duluan', safe_indicator: 'Saya yang menelepon' },
        { q: 'Apakah mereka meminta OTP, PIN, atau password?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
        { q: 'Apakah mereka bilang jangan hubungi bank langsung?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
      ],
      result_scam: 'Ini sesuai pola penipuan perbankan. Bank TIDAK PERNAH minta OTP atau password via telepon.',
      result_caution: 'Ada tanda mencurigakan. Jangan bagikan data apapun sebelum verifikasi.',
      verify_action: 'Hubungi nomor resmi bank di BELAKANG kartu ATM',
    },
    government: {
      title: 'VERIFIKASI PENELEPON',
      subtitle: 'Penelepon mengaku dari instansi pemerintah.',
      questions: [
        { q: 'Apakah penelepon mengancam penangkapan jika tidak bayar sekarang?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
        { q: 'Apakah mereka minta pembayaran via pulsa, kripto, atau transfer?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
      ],
      result_scam: 'Instansi pemerintah TIDAK PERNAH mengancam via telepon. Ini penipuan.',
      result_caution: 'Hati-hati. Verifikasi dengan menghubungi kantor resmi.',
      verify_action: 'Cari nomor resmi instansi di website resmi',
    },
    generic: {
      title: 'VERIFIKASI PENELEPON',
      subtitle: 'VoxGuard mendeteksi pola manipulasi.',
      questions: [
        { q: 'Apakah penelepon yang menghubungi Anda duluan?', scam_indicator: 'Ya, mereka duluan', safe_indicator: 'Saya yang menelepon' },
        { q: 'Apakah mereka menekan Anda untuk bertindak segera?', scam_indicator: 'Ya', safe_indicator: 'Tidak' },
      ],
      result_scam: 'Beberapa indikator penipuan terdeteksi. JANGAN lanjutkan permintaan penelepon.',
      result_caution: 'Berhati-hati. Verifikasi identitas penelepon secara mandiri.',
      verify_action: 'Verifikasi melalui saluran resmi sebelum bertindak',
    },
  },
  zh: {
    bank: { title:'验证来电者', subtitle:'来电者自称是您的银行。', questions:[{q:'是对方先联系您的吗？',scam_indicator:'是',safe_indicator:'不是'},{q:'对方是否要求您提供验证码或密码？',scam_indicator:'是',safe_indicator:'否'}], result_scam:'银行绝不会通过电话要求密码。这是诈骗。', result_caution:'请通过官方渠道验证。', verify_action:'拨打银行卡背面的官方电话' },
    generic: { title:'验证来电者', subtitle:'检测到操纵模式。', questions:[{q:'是对方先联系您的吗？',scam_indicator:'是',safe_indicator:'不是'},{q:'对方是否催促您立即行动？',scam_indicator:'是',safe_indicator:'否'}], result_scam:'检测到多个诈骗指标。', result_caution:'请保持警惕。', verify_action:'通过官方渠道验证' },
  },
  ja: {
    bank: { title:'発信者を確認', subtitle:'発信者は銀行を名乗っています。', questions:[{q:'相手から電話がかかってきましたか？',scam_indicator:'はい',safe_indicator:'自分からかけました'},{q:'暗証番号やパスワードを聞かれましたか？',scam_indicator:'はい',safe_indicator:'いいえ'}], result_scam:'銀行が電話でパスワードを聞くことはありません。', result_caution:'公式窓口で確認してください。', verify_action:'カード裏面の公式番号に電話' },
    generic: { title:'発信者を確認', subtitle:'操作パターンを検出。', questions:[{q:'相手から電話がかかってきましたか？',scam_indicator:'はい',safe_indicator:'自分から'},{q:'すぐに行動するよう迫られていますか？',scam_indicator:'はい',safe_indicator:'いいえ'}], result_scam:'複数の詐欺指標を検出。', result_caution:'慎重に進めてください。', verify_action:'公式チャネルで確認' },
  },
  ko: {
    bank: { title:'발신자 확인', subtitle:'발신자가 은행이라고 합니다.', questions:[{q:'상대방이 먼저 전화했습니까?',scam_indicator:'예',safe_indicator:'제가 전화했습니다'},{q:'OTP나 비밀번호를 요구했습니까?',scam_indicator:'예',safe_indicator:'아니오'}], result_scam:'은행은 절대 전화로 비밀번호를 묻지 않습니다.', result_caution:'공식 채널로 확인하세요.', verify_action:'카드 뒷면 공식 번호로 전화' },
    generic: { title:'발신자 확인', subtitle:'조작 패턴 감지.', questions:[{q:'상대방이 먼저 전화했습니까?',scam_indicator:'예',safe_indicator:'제가'},{q:'즉시 행동하라고 압박합니까?',scam_indicator:'예',safe_indicator:'아니오'}], result_scam:'사기 지표 감지.', result_caution:'주의하세요.', verify_action:'공식 채널로 확인' },
  },
  es: {
    bank: { title:'VERIFICAR LLAMANTE', subtitle:'El llamante dice ser de su banco.', questions:[{q:'¿Le contactaron ellos primero?',scam_indicator:'Sí',safe_indicator:'Yo llamé'},{q:'¿Le pidieron OTP, PIN o contraseña?',scam_indicator:'Sí',safe_indicator:'No'}], result_scam:'Los bancos NUNCA piden contraseñas por teléfono.', result_caution:'Verifique por canales oficiales.', verify_action:'Llame al número oficial en su tarjeta' },
    generic: { title:'VERIFICAR LLAMANTE', subtitle:'Patrones de manipulación detectados.', questions:[{q:'¿Le contactaron ellos primero?',scam_indicator:'Sí',safe_indicator:'Yo llamé'},{q:'¿Le presionan para actuar de inmediato?',scam_indicator:'Sí',safe_indicator:'No'}], result_scam:'Indicadores de fraude detectados.', result_caution:'Proceda con precaución.', verify_action:'Verifique por canal oficial' },
  },
  fr: {
    bank: { title:'VÉRIFIER L\'APPELANT', subtitle:'L\'appelant prétend être de votre banque.', questions:[{q:'Est-ce l\'appelant qui vous a contacté en premier ?',scam_indicator:'Oui',safe_indicator:'J\'ai appelé'},{q:'Vous a-t-on demandé OTP, PIN ou mot de passe ?',scam_indicator:'Oui',safe_indicator:'Non'}], result_scam:'Les banques ne demandent JAMAIS de mot de passe par téléphone.', result_caution:'Vérifiez par les canaux officiels.', verify_action:'Appelez le numéro officiel sur votre carte' },
    generic: { title:'VÉRIFIER L\'APPELANT', subtitle:'Modèles de manipulation détectés.', questions:[{q:'L\'appelant vous a-t-il contacté en premier ?',scam_indicator:'Oui',safe_indicator:'J\'ai appelé'},{q:'Vous presse-t-on d\'agir maintenant ?',scam_indicator:'Oui',safe_indicator:'Non'}], result_scam:'Indicateurs de fraude détectés.', result_caution:'Soyez prudent.', verify_action:'Vérifiez par canal officiel' },
  },
  hi: {
    bank: { title:'कॉलर की पुष्टि करें', subtitle:'कॉलर बैंक से होने का दावा कर रहा है।', questions:[{q:'क्या कॉलर ने आपको पहले संपर्क किया?',scam_indicator:'हाँ',safe_indicator:'मैंने कॉल किया'},{q:'क्या OTP, PIN या पासवर्ड माँगा?',scam_indicator:'हाँ',safe_indicator:'नहीं'}], result_scam:'बैंक कभी फोन पर पासवर्ड नहीं माँगता।', result_caution:'आधिकारिक चैनल से सत्यापित करें।', verify_action:'कार्ड के पीछे का आधिकारिक नंबर डायल करें' },
    generic: { title:'कॉलर की पुष्टि करें', subtitle:'मैनिपुलेशन पैटर्न पाया गया।', questions:[{q:'क्या कॉलर ने पहले संपर्क किया?',scam_indicator:'हाँ',safe_indicator:'मैंने'},{q:'क्या तुरंत कार्रवाई का दबाव है?',scam_indicator:'हाँ',safe_indicator:'नहीं'}], result_scam:'धोखाधड़ी संकेतक पाए गए।', result_caution:'सावधान रहें।', verify_action:'आधिकारिक चैनल से सत्यापित करें' },
  },
  ar: {
    bank: { title:'تحقق من المتصل', subtitle:'المتصل يدعي أنه من البنك.', questions:[{q:'هل المتصل اتصل بك أولاً؟',scam_indicator:'نعم',safe_indicator:'أنا اتصلت'},{q:'هل طلبوا رمز OTP أو كلمة المرور؟',scam_indicator:'نعم',safe_indicator:'لا'}], result_scam:'البنوك لا تطلب كلمات المرور عبر الهاتف أبداً.', result_caution:'تحقق عبر القنوات الرسمية.', verify_action:'اتصل بالرقم الرسمي على بطاقتك' },
    generic: { title:'تحقق من المتصل', subtitle:'تم اكتشاف أنماط تلاعب.', questions:[{q:'هل المتصل اتصل بك أولاً؟',scam_indicator:'نعم',safe_indicator:'أنا'},{q:'هل يضغطون للتصرف فوراً؟',scam_indicator:'نعم',safe_indicator:'لا'}], result_scam:'تم اكتشاف مؤشرات احتيال.', result_caution:'كن حذراً.', verify_action:'تحقق عبر القناة الرسمية' },
  },
}

// Get scenario-based challenge for a pattern + language
export function getChallengeForScenario(pattern, langCode) {
  const lang = langCode?.split('-')[0] || 'en'
  const scenario = getScenarioKey(pattern)
  const langChallenges = SCENARIO_CHALLENGES[lang] || SCENARIO_CHALLENGES['en']
  return langChallenges[scenario] || langChallenges['generic'] || SCENARIO_CHALLENGES['en']['generic']
}

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

// Helper to get safe exit actions for a language
export function getSafeExitForLang(langCode) {
  const base = langCode?.split('-')[0] || 'en'
  return SAFE_EXIT_ACTIONS[base] || SAFE_EXIT_ACTIONS['en']
}

// Check if a pattern name should trigger instant intervention
export function isInstantInterventionPattern(patternName) {
  return INSTANT_INTERVENTION_PATTERNS.some(p =>
    patternName?.toLowerCase().includes(p.toLowerCase())
  )
}

// Get intervention level from threat score
export function getInterventionLevel(threatScore, latestAlert) {
  if (latestAlert && isInstantInterventionPattern(latestAlert.pattern)) {
    return INTERVENTION_LEVELS.BLOCK
  }
  if (threatScore >= INTERVENTION_LEVELS.LOCKDOWN.threshold) return INTERVENTION_LEVELS.LOCKDOWN
  if (threatScore >= INTERVENTION_LEVELS.BLOCK.threshold) return INTERVENTION_LEVELS.BLOCK
  if (threatScore >= INTERVENTION_LEVELS.WARN.threshold) return INTERVENTION_LEVELS.WARN
  return null
}

// ── LEGACY COMPAT — keep old exports working ──
export function getInterventionForLang(langCode) {
  return {
    challenges: getChallengeForScenario('generic', langCode),
    safeExits: getSafeExitForLang(langCode),
  }
}

// ── Recommended Actions per Language/Country ──
export const RECOMMENDED_ACTIONS = {
  en: { country:'United States', actions:[{icon:'🚫',text:'Do NOT transfer money, gift cards, or cryptocurrency to anyone',priority:'critical'},{icon:'📞',text:'Hang up immediately — do not engage further with the caller',priority:'critical'},{icon:'🏦',text:'Contact your bank\'s official fraud hotline (number on back of your card)',priority:'high'},{icon:'📋',text:'Report to FTC: reportfraud.ftc.gov',link:'https://reportfraud.ftc.gov',priority:'high'},{icon:'🔍',text:'File FBI IC3 complaint: ic3.gov',link:'https://ic3.gov',priority:'high'},{icon:'📱',text:'Enable two-factor authentication on all financial accounts',priority:'medium'},{icon:'🔒',text:'Change passwords on any accounts you may have disclosed',priority:'high'},{icon:'📝',text:'Document everything: save call logs, screenshots, messages',priority:'medium'},{icon:'👥',text:'Alert family members — scammers often target multiple people',priority:'medium'},{icon:'⚖️',text:'Contact your state Attorney General\'s consumer protection office',priority:'low'}] },
  id: { country:'Indonesia', actions:[{icon:'🚫',text:'JANGAN transfer uang, pulsa, atau kripto ke siapapun',priority:'critical'},{icon:'📞',text:'Putuskan panggilan segera',priority:'critical'},{icon:'🏦',text:'Hubungi hotline resmi bank (cek di belakang kartu ATM)',priority:'high'},{icon:'📋',text:'Lapor ke OJK: 157',link:'https://ojk.go.id',priority:'high'},{icon:'🔍',text:'Lapor ke Kominfo: aduankonten.id',link:'https://aduankonten.id',priority:'high'},{icon:'👮',text:'Lapor ke Bareskrim: patrolisiber.id',link:'https://patrolisiber.id',priority:'high'},{icon:'📱',text:'Aktifkan verifikasi 2 langkah',priority:'medium'},{icon:'🔒',text:'Ganti PIN dan password mobile banking',priority:'high'},{icon:'📝',text:'Simpan semua bukti',priority:'medium'},{icon:'👥',text:'Peringatkan keluarga',priority:'medium'}] },
  zh: { country:'中国', actions:[{icon:'🚫',text:'切勿转账或提供银行信息',priority:'critical'},{icon:'📞',text:'立即挂断电话',priority:'critical'},{icon:'📋',text:'拨打反诈热线 96110',priority:'high'},{icon:'🔍',text:'下载国家反诈中心APP',priority:'high'},{icon:'👮',text:'向当地公安局报案',priority:'high'},{icon:'🔒',text:'修改网银密码',priority:'high'}] },
  ja: { country:'日本', actions:[{icon:'🚫',text:'絶対にお金を振り込まない',priority:'critical'},{icon:'📞',text:'すぐに電話を切る',priority:'critical'},{icon:'🏦',text:'銀行の公式窓口に連絡',priority:'high'},{icon:'📋',text:'警察相談 #9110',priority:'high'},{icon:'🔍',text:'消費者ホットライン 188',priority:'high'},{icon:'👮',text:'最寄りの警察署に届出',priority:'high'},{icon:'📱',text:'二段階認証を有効化',priority:'medium'},{icon:'🔒',text:'暗証番号を変更',priority:'high'}] },
  ko: { country:'대한민국', actions:[{icon:'🚫',text:'절대 송금하지 마세요',priority:'critical'},{icon:'📞',text:'즉시 전화를 끊으세요',priority:'critical'},{icon:'🏦',text:'은행 공식 콜센터에 연락',priority:'high'},{icon:'📋',text:'금융감독원 1332 신고',priority:'high'},{icon:'🔍',text:'경찰청 182 신고',priority:'high'},{icon:'📱',text:'2단계 인증 활성화',priority:'medium'},{icon:'🔒',text:'비밀번호 변경',priority:'high'}] },
  es: { country:'España', actions:[{icon:'🚫',text:'NO transfiera dinero ni datos personales',priority:'critical'},{icon:'📞',text:'Cuelgue inmediatamente',priority:'critical'},{icon:'🏦',text:'Contacte la línea de fraude de su banco',priority:'high'},{icon:'📋',text:'Denuncie: Policía Nacional 091',priority:'high'},{icon:'🔍',text:'Reporte en INCIBE: incibe.es',link:'https://incibe.es',priority:'high'},{icon:'📱',text:'Active verificación en dos pasos',priority:'medium'},{icon:'🔒',text:'Cambie contraseñas',priority:'high'}] },
  fr: { country:'France', actions:[{icon:'🚫',text:'Ne transférez PAS d\'argent',priority:'critical'},{icon:'📞',text:'Raccrochez immédiatement',priority:'critical'},{icon:'🏦',text:'Contactez votre banque via le numéro officiel',priority:'high'},{icon:'📋',text:'Signalez sur Pharos',priority:'high'},{icon:'🔍',text:'Info Escroqueries: 0 805 805 817',priority:'high'},{icon:'📱',text:'Activez l\'authentification 2FA',priority:'medium'},{icon:'🔒',text:'Changez vos mots de passe',priority:'high'}] },
  hi: { country:'भारत', actions:[{icon:'🚫',text:'पैसे ट्रांसफर न करें या OTP न बताएं',priority:'critical'},{icon:'📞',text:'तुरंत कॉल काटें',priority:'critical'},{icon:'🏦',text:'बैंक की आधिकारिक हेल्पलाइन पर कॉल करें',priority:'high'},{icon:'📋',text:'साइबर क्राइम हेल्पलाइन 1930',priority:'high'},{icon:'🔍',text:'cybercrime.gov.in पर शिकायत',link:'https://cybercrime.gov.in',priority:'high'},{icon:'📱',text:'2FA सक्रिय करें',priority:'medium'},{icon:'🔒',text:'UPI PIN और पासवर्ड बदलें',priority:'high'}] },
  ar: { country:'الشرق الأوسط', actions:[{icon:'🚫',text:'لا تحول أي أموال',priority:'critical'},{icon:'📞',text:'أغلق المكالمة فوراً',priority:'critical'},{icon:'🏦',text:'اتصل بالخط الساخن لبنكك',priority:'high'},{icon:'📋',text:'أبلغ الجهات المختصة',priority:'high'},{icon:'📱',text:'فعّل التحقق بخطوتين',priority:'medium'},{icon:'🔒',text:'غيّر كلمات المرور',priority:'high'},{icon:'📝',text:'احتفظ بالأدلة',priority:'medium'}] },
}

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
