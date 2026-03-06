// ─────────────────────────────────────────────────────────────────
// VoxGuard — Multi-Language Scam Pattern Library
// 40 languages · Region-specific variants · Gemini Live API hints
// Sources: FBI IC3 2024, FTC, GASA, MAS ScamShield, ACCC, regional
// ─────────────────────────────────────────────────────────────────

export const PF = "'Press Start 2P', monospace"
export const MF = "'Share Tech Mono', 'Courier New', monospace"

// ── 40 Supported Languages ───────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  // Tier 1 — Highest scam loss / volume (GASA / FBI IC3 2024)
  { code:'en',    name:'English',            native:'English',        flag:'🇺🇸', tier:1 },
  { code:'zh-CN', name:'Chinese (Simplified)',native:'中文 (简体)',    flag:'🇨🇳', tier:1 },
  { code:'zh-TW', name:'Chinese (Traditional)',native:'中文 (繁體)',   flag:'🇹🇼', tier:1 },
  { code:'id',    name:'Indonesian',         native:'Bahasa Indonesia',flag:'🇮🇩', tier:1 },
  { code:'hi',    name:'Hindi',              native:'हिन्दी',          flag:'🇮🇳', tier:1 },
  { code:'es',    name:'Spanish',            native:'Español',         flag:'🇪🇸', tier:1 },
  { code:'pt-BR', name:'Portuguese (BR)',    native:'Português',       flag:'🇧🇷', tier:1 },
  { code:'ar',    name:'Arabic',             native:'العربية',         flag:'🇸🇦', tier:1 },
  { code:'ja',    name:'Japanese',           native:'日本語',          flag:'🇯🇵', tier:1 },
  { code:'ko',    name:'Korean',             native:'한국어',          flag:'🇰🇷', tier:1 },

  // Tier 2 — Active scam regions
  { code:'ms',    name:'Malay',              native:'Bahasa Melayu',  flag:'🇲🇾', tier:2 },
  { code:'tl',    name:'Filipino',           native:'Filipino',        flag:'🇵🇭', tier:2 },
  { code:'th',    name:'Thai',               native:'ภาษาไทย',        flag:'🇹🇭', tier:2 },
  { code:'vi',    name:'Vietnamese',         native:'Tiếng Việt',      flag:'🇻🇳', tier:2 },
  { code:'fr',    name:'French',             native:'Français',        flag:'🇫🇷', tier:2 },
  { code:'de',    name:'German',             native:'Deutsch',         flag:'🇩🇪', tier:2 },
  { code:'it',    name:'Italian',            native:'Italiano',        flag:'🇮🇹', tier:2 },
  { code:'nl',    name:'Dutch',              native:'Nederlands',      flag:'🇳🇱', tier:2 },
  { code:'tr',    name:'Turkish',            native:'Türkçe',          flag:'🇹🇷', tier:2 },
  { code:'pl',    name:'Polish',             native:'Polski',          flag:'🇵🇱', tier:2 },

  // Tier 3 — Extended coverage
  { code:'ru',    name:'Russian',            native:'Русский',         flag:'🇷🇺', tier:3 },
  { code:'uk',    name:'Ukrainian',          native:'Українська',      flag:'🇺🇦', tier:3 },
  { code:'ro',    name:'Romanian',           native:'Română',          flag:'🇷🇴', tier:3 },
  { code:'cs',    name:'Czech',              native:'Čeština',         flag:'🇨🇿', tier:3 },
  { code:'hu',    name:'Hungarian',          native:'Magyar',          flag:'🇭🇺', tier:3 },
  { code:'sv',    name:'Swedish',            native:'Svenska',         flag:'🇸🇪', tier:3 },
  { code:'da',    name:'Danish',             native:'Dansk',           flag:'🇩🇰', tier:3 },
  { code:'fi',    name:'Finnish',            native:'Suomi',           flag:'🇫🇮', tier:3 },
  { code:'el',    name:'Greek',              native:'Ελληνικά',        flag:'🇬🇷', tier:3 },
  { code:'he',    name:'Hebrew',             native:'עברית',           flag:'🇮🇱', tier:3 },
  { code:'fa',    name:'Persian',            native:'فارسی',           flag:'🇮🇷', tier:3 },
  { code:'bn',    name:'Bengali',            native:'বাংলা',           flag:'🇧🇩', tier:3 },
  { code:'ur',    name:'Urdu',               native:'اردو',            flag:'🇵🇰', tier:3 },
  { code:'ta',    name:'Tamil',              native:'தமிழ்',           flag:'🇱🇰', tier:3 },
  { code:'sw',    name:'Swahili',            native:'Kiswahili',       flag:'🇰🇪', tier:3 },
  { code:'am',    name:'Amharic',            native:'አማርኛ',           flag:'🇪🇹', tier:3 },
  { code:'yo',    name:'Yoruba',             native:'Yorùbá',          flag:'🇳🇬', tier:3 },
  { code:'ha',    name:'Hausa',              native:'Hausa',           flag:'🇳🇬', tier:3 },
  { code:'af',    name:'Afrikaans',          native:'Afrikaans',       flag:'🇿🇦', tier:3 },
  { code:'no',    name:'Norwegian',          native:'Norsk',           flag:'🇳🇴', tier:3 },
]

// ── Regional Scam Patterns (on top of 50+ universal patterns) ────
export const REGIONAL_PATTERNS = {
  'id': [
    { id:'id-001', severity:'critical', category:'Pinjol Ilegal', description:'Fake online loan apps threatening contacts if repayment delayed.', markers:['pinjaman online','cicilan ringan','langsung cair','KTP cukup','daftar sekarang'], source:'OJK Indonesia 2024' },
    { id:'id-002', severity:'critical', category:'BRILink Palsu', description:'Caller claims accidental transfer, demands refund via BRILink agent.', markers:['salah transfer','kembalikan dana','BRILink','tolong dikembalikan'], source:'Bank BRI Advisory 2024' },
    { id:'id-003', severity:'high',     category:'"Mama Minta Pulsa"', description:'Caller impersonates family member with broken phone, requests prepaid credit.', markers:['ini anakmu','minta tolong','hp rusak','transfer pulsa','jangan bilang ayah'], source:'BSSN Indonesia 2023' },
    { id:'id-004', severity:'high',     category:'Undian Berhadiah Palsu', description:'Fake prize lottery requiring admin fee or tax payment to claim reward.', markers:['selamat anda menang','pajak hadiah','biaya administrasi','hadiah mobil','klaim sekarang'], source:'Kominfo 2024' },
    { id:'id-005', severity:'critical', category:'Impersonasi OJK/BI', description:'Caller poses as OJK or Bank Indonesia officer threatening account blocking.', markers:['OJK','Bank Indonesia','rekening diblokir','wajib lapor','investigasi'], source:'OJK Indonesia 2024' },
    { id:'id-006', severity:'high',     category:'Penipuan Jual Beli Online', description:'Fake buyer/seller claiming payment made or demanding COD cancellation fee.', markers:['sudah transfer','cek rekening','rekber','minta cancel','ongkir balik'], source:'Bareskrim Polri 2024' },
  ],
  'zh-CN': [
    { id:'cn-001', severity:'critical', category:'公安局诈骗', description:'Caller impersonates police, claims victim implicated in money laundering.', markers:['公安局','涉嫌洗钱','配合调查','安全账户','不得告诉家人'], source:'MPS China Advisory 2024' },
    { id:'cn-002', severity:'critical', category:'杀猪盘', description:'Romance-investment scam: builds emotional relationship then introduces fraudulent investment platform.', markers:['稳赚不赔','我的分析师','独家平台','提现困难','追加投资'], source:'GASA Asia Report 2024' },
  ],
  'ja': [
    { id:'jp-001', severity:'critical', category:'オレオレ詐欺', description:'Caller impersonates relative claiming emergency, requests cash.', markers:['おれだよおれ','事故を起こした','示談金','弁護士','内緒にして'], source:'NPA Japan 2024' },
  ],
  'ko': [
    { id:'kr-001', severity:'critical', category:'보이스피싱', description:'Caller impersonates police/prosecutor claiming account linked to crime.', markers:['검찰','경찰','명의도용','수사협조','안전계좌'], source:'FSS Korea 2024' },
  ],
  'es': [
    { id:'es-001', severity:'high', category:'Timo del Bizum', description:'Caller claims to have sent Bizum by mistake, asks for refund.', markers:['Bizum','transferencia errónea','devolver'], source:'Guardia Civil Spain 2024' },
  ],
  'fr': [
    { id:'fr-001', severity:'high', category:'Arnaque au Faux Conseiller', description:'Fake bank advisor calls about fraud on account.', markers:['conseiller bancaire','opération frauduleuse','confirmer code'], source:'Banque de France 2024' },
  ],
  'hi': [
    { id:'in-001', severity:'critical', category:'Digital Arrest Scam', description:'Caller claims victim is under "digital arrest" by CBI/ED.', markers:['CBI','Enforcement Directorate','digital arrest','FIR','Aadhaar linked to drugs'], source:'MHA India 2024' },
  ],
}

export function buildLanguageContext(langCode) {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
  const regional = REGIONAL_PATTERNS[langCode] || []
  return {
    language_code: langCode,
    language_name: lang?.name || 'English',
    native_name: lang?.native || 'English',
    regional_count: regional.length,
    regional_patterns: regional,
    system_suffix: regional.length > 0
      ? `\n\nREGIONAL PATTERNS for ${lang?.native}: Watch for these additional local scam types: ${regional.map(p=>`${p.category} (markers: ${p.markers.slice(0,3).join(', ')})`).join('; ')}.`
      : '',
  }
}

export function getPatternsForLanguage(langCode, universalPatterns) {
  const regional = REGIONAL_PATTERNS[langCode] || []
  return [...(universalPatterns || []), ...regional]
}

export const LANGUAGE_STATS = {
  total: SUPPORTED_LANGUAGES.length,
  tier1: SUPPORTED_LANGUAGES.filter(l=>l.tier===1).length,
  tier2: SUPPORTED_LANGUAGES.filter(l=>l.tier===2).length,
  tier3: SUPPORTED_LANGUAGES.filter(l=>l.tier===3).length,
  regionalVariants: Object.values(REGIONAL_PATTERNS).flat().length,
}
