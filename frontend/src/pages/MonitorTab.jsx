import { useState, useEffect, useRef, useCallback } from 'react'
import { PBox, PBtn, StatCard }  from '../components/Primitives'
import { WaveformVisualizer }    from '../components/WaveformVisualizer'
import { ThreatMeter }           from '../components/ThreatMeter'
import { AlertCard }             from '../components/AlertCard'
import { PF, MF }                from '../utils/constants'

/* ━━━ VOICE CONFIG — default rate/pitch ━━━ */
const VOICE_PREFS = {
  en: { langPrefix:['en-US','en-GB','en'] },
  id: { langPrefix:['id-ID','id'] },
  zh: { langPrefix:['zh-CN','zh-TW','zh'] },
  ja: { langPrefix:['ja-JP','ja'] },
  ko: { langPrefix:['ko-KR','ko'] },
  es: { langPrefix:['es-ES','es-MX','es'] },
  fr: { langPrefix:['fr-FR','fr'] },
  de: { langPrefix:['de-DE','de'] },
  hi: { langPrefix:['hi-IN','hi'] },
  ar: { langPrefix:['ar-SA','ar-EG','ar'] },
  pt: { langPrefix:['pt-BR','pt-PT','pt'] },
  ru: { langPrefix:['ru-RU','ru'] },
  th: { langPrefix:['th-TH','th'] },
  vi: { langPrefix:['vi-VN','vi'] },
  ms: { langPrefix:['ms-MY','ms'] },
  tr: { langPrefix:['tr-TR','tr'] },
  it: { langPrefix:['it-IT','it'] },
  nl: { langPrefix:['nl-NL','nl'] },
  pl: { langPrefix:['pl-PL','pl'] },
  sv: { langPrefix:['sv-SE','sv'] },
}

function getVoiceForLang(lang) {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const prefs = VOICE_PREFS[lang] || VOICE_PREFS['en']

  // Prefer Google/premium voices (they sound more natural)
  for (const prefix of prefs.langPrefix) {
    // First try Google voices
    const google = voices.find(v => v.lang.startsWith(prefix) && v.name.includes('Google'))
    if (google) return google
    // Then try any non-compact voice
    const premium = voices.find(v => v.lang.startsWith(prefix) && !v.name.includes('Compact') && !v.name.includes('compact'))
    if (premium) return premium
    // Fallback to any matching voice
    const any = voices.find(v => v.lang.startsWith(prefix))
    if (any) return any
  }
  // Final fallback: English Google voice
  const enGoogle = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
  if (enGoogle) return enGoogle
  return voices.find(v => v.lang.startsWith('en')) || voices[0]
}

/* ━━━ Caller Visual — improved silhouette with cybersec HUD ━━━ */
function CallerVisual({ mode='phone', active, screenWatchOn }) {
  if (!active) return null
  return (
    <div style={{ position:'relative',width:'100%',height:90,marginBottom:12,overflow:'hidden',border:`1px solid ${screenWatchOn?'rgba(123,97,255,0.3)':'rgba(255,45,85,0.15)'}`,background:'linear-gradient(135deg,rgba(0,0,0,0.8),rgba(10,10,18,0.9))',transition:'border-color 0.3s' }}>
      <svg width="100%" height="90" viewBox="0 0 400 90" preserveAspectRatio="xMidYMid meet">
        {/* Background grid */}
        <defs>
          <pattern id="bgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20,0L0,0L0,20" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="0.5"/>
          </pattern>
          <radialGradient id="headGlow" cx="50%" cy="40%" r="40%">
            <stop offset="0%" stopColor="rgba(255,45,85,0.15)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>
        <rect width="400" height="90" fill="url(#bgGrid)"/>
        <rect width="400" height="90" fill="url(#headGlow)"/>

        {/* Silhouette — head & shoulders outline only (no blur mess) */}
        <g opacity="0.6">
          {/* Shoulders */}
          <path d="M155,88 Q155,70 170,62 Q185,55 200,52 Q215,55 230,62 Q245,70 245,88" fill="none" stroke="#ff2d5566" strokeWidth="1.5"/>
          {/* Head outline */}
          <ellipse cx="200" cy="36" rx="18" ry="22" fill="none" stroke="#ff2d5588" strokeWidth="1.5"/>
          {/* Face scan lines */}
          <line x1="188" y1="30" x2="195" y2="30" stroke="#ff2d5544" strokeWidth="1"/>
          <line x1="205" y1="30" x2="212" y2="30" stroke="#ff2d5544" strokeWidth="1"/>
          <line x1="194" y1="42" x2="206" y2="42" stroke="#ff2d5544" strokeWidth="1"/>
        </g>

        {/* Scan line */}
        <line x1="170" y1="0" x2="170" y2="90" stroke="#00d4ff" strokeWidth="0.5" opacity="0.3">
          <animate attributeName="x1" values="170;230;170" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="x2" values="170;230;170" dur="2s" repeatCount="indefinite"/>
        </line>

        {/* Mode label */}
        {mode==='phone'&&<>
          <rect x="12" y="8" width="40" height="16" rx="2" fill="rgba(255,45,85,0.15)" stroke="#ff2d55" strokeWidth="0.8"/>
          <text x="32" y="19" textAnchor="middle" fill="#ff2d55" fontSize="7" fontFamily="monospace">CALL</text>
          <circle cx="58" cy="16" r="3" fill="#ff2d55" opacity="0.5"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/></circle>
        </>}
        {mode==='zoom'&&<>
          <rect x="12" y="8" width="44" height="16" rx="2" fill="rgba(45,140,255,0.15)" stroke="#2d8cff" strokeWidth="0.8"/>
          <text x="34" y="19" textAnchor="middle" fill="#2d8cff" fontSize="7" fontFamily="monospace">VIDEO</text>
        </>}

        {/* Corner brackets */}
        <path d="M6,6 L6,20 M6,6 L20,6" stroke={screenWatchOn?'#7b61ff':'#ff2d55'} strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M394,6 L394,20 M394,6 L380,6" stroke={screenWatchOn?'#7b61ff':'#ff2d55'} strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M6,84 L6,70 M6,84 L20,84" stroke={screenWatchOn?'#7b61ff':'#ff2d55'} strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M394,84 L394,70 M394,84 L380,84" stroke={screenWatchOn?'#7b61ff':'#ff2d55'} strokeWidth="1.2" fill="none" opacity="0.5"/>

        {/* Right side: analysis info */}
        <text x="388" y="18" textAnchor="end" fill="#ff2d55" fontSize="6" fontFamily="monospace" opacity="0.6">◉ ANALYZING</text>
        <text x="388" y="30" textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="5" fontFamily="monospace">VOICE PATTERN</text>
        <text x="388" y="40" textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="5" fontFamily="monospace">PSYCH VECTOR</text>
        {screenWatchOn&&<text x="388" y="50" textAnchor="end" fill="#7b61ff" fontSize="5" fontFamily="monospace">◈ SCREEN WATCH</text>}
      </svg>
    </div>
  )
}

/* ━━━ Premium Analysis Progress Bar ━━━ */
function AnalysisProgressBar({ progress, threatColor }) {
  const complete = progress >= 100
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
        <span style={{ fontFamily:PF,fontSize:6,color:'rgba(0,212,255,0.5)',letterSpacing:1 }}>ANALYSIS PROGRESS</span>
        <span style={{ fontFamily:MF,fontSize:9,color:complete?'#30d158':'#00d4ff' }}>{complete?'✓ COMPLETE':progress+'%'}</span>
      </div>
      <div style={{ height:6,background:'rgba(0,212,255,0.08)',overflow:'hidden',position:'relative',border:'1px solid rgba(0,212,255,0.1)' }}>
        <div style={{ height:'100%',width:`${progress}%`,background:complete?'linear-gradient(90deg,#30d158,#4aeaff,#30d158)':`linear-gradient(90deg,#00d4ff,${threatColor},#7b61ff,#00d4ff)`,backgroundSize:'200% 100%',animation:complete?'none':'progressShimmer 2s linear infinite',boxShadow:`0 0 12px ${complete?'#30d158':'#00d4ff'}66`,transition:'width 0.5s ease' }}/>
        {!complete&&progress>0&&<div style={{ position:'absolute',top:0,height:'100%',width:30,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)',animation:'progressScan 1.5s ease-in-out infinite',left:`${Math.max(0,progress-10)}%` }}/>}
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',marginTop:3 }}>
        {[0,25,50,75,100].map(v=><div key={v} style={{ width:2,height:4,background:progress>=v?'#00d4ff':'rgba(0,212,255,0.15)',boxShadow:progress>=v?'0 0 4px #00d4ff':'none',transition:'all 0.3s' }}/>)}
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DEMO SCRIPTS — 2-way, no brand names, localized alert labels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SCRIPTS_EN = [
  {
    id:'bank', label:'🏦 Bank Fraud', category:'critical',
    sentences: [
      { text:"Hello, this is the fraud prevention department from your bank.", delay:0, speaker:'caller' },
      { text:"Hello? Who is this?", delay:3500, speaker:'me' },
      { text:"We have detected suspicious activity on your checking account.", delay:6000, speaker:'caller' },
      { text:"What kind of suspicious activity?", delay:11000, speaker:'me' },
      { text:"Someone attempted to transfer three thousand dollars to an overseas account just minutes ago.", delay:13500, speaker:'caller' },
      { text:"Your account will be permanently frozen within the next ten minutes unless you verify your identity immediately.", delay:19000, speaker:'caller',
        alert:{ id:'b1',severity:'critical',pattern:'Bank Impersonation',quote:'"Your account will be permanently frozen in 10 minutes unless you verify."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'FTC Sentinel',time:'00:19' }},
      { text:"Oh no, what do I need to do?", delay:26000, speaker:'me' },
      { text:"I need you to confirm your full account number and the one time passcode we just sent to your phone.", delay:28500, speaker:'caller',
        alert:{ id:'b2',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"Confirm your full account number and the one-time passcode."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FBI IC3 2024',time:'00:28' }},
      { text:"Please do not contact your branch directly. This is a confidential internal investigation.", delay:36000, speaker:'caller',
        alert:{ id:'b3',severity:'high',pattern:'Isolation Tactic',quote:'"Do not contact your branch. Confidential investigation."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:36' }},
    ]
  },
  {
    id:'tech', label:'💻 Tech Support', category:'high',
    sentences: [
      { text:"Hello, this is the security center calling about your computer.", delay:0, speaker:'caller' },
      { text:"Wait, how do you know about my computer?", delay:5000, speaker:'me' },
      { text:"Our monitoring systems detected your device has been infected with a critical Trojan virus.", delay:7500, speaker:'caller',
        alert:{ id:'t1',severity:'high',pattern:'Tech Support Impersonation',quote:'"Security Center — your device is infected with a Trojan."',confidence:93,tactics:['AUTHORITY','FEAR'],source:'FBI IC3 2024',time:'00:07' }},
      { text:"You must install our certified remote access tool immediately.", delay:15000, speaker:'caller',
        alert:{ id:'t2',severity:'critical',pattern:'Tech Support Impersonation',quote:'"Install remote access tool immediately."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'FTC Sentinel',time:'00:15' }},
      { text:"If you do not act within thirty minutes, your credit card information will be compromised.", delay:23000, speaker:'caller',
        alert:{ id:'t3',severity:'critical',pattern:'Artificial Urgency',quote:'"Within 30 minutes your credit card will be compromised."',confidence:95,tactics:['SCARCITY','FEAR'],source:'FBI IC3 2024',time:'00:23' }},
    ]
  },
  {
    id:'gov', label:'🏛 Government / Tax', category:'critical',
    sentences: [
      { text:"This is an officer from the tax enforcement division.", delay:0, speaker:'caller',
        alert:{ id:'g1',severity:'critical',pattern:'Government Impersonation',quote:'"Officer from tax enforcement division."',confidence:96,tactics:['AUTHORITY'],source:'FBI IC3 2024',time:'00:00' }},
      { text:"What is this about?", delay:6000, speaker:'me' },
      { text:"A warrant has been issued for your arrest. Settle this balance right now or face arrest.", delay:8500, speaker:'caller',
        alert:{ id:'g2',severity:'critical',pattern:'Artificial Urgency',quote:'"Settle this balance right now or face arrest."',confidence:95,tactics:['AUTHORITY','FEAR'],source:'FTC Sentinel',time:'00:08' }},
      { text:"Purchase prepaid debit cards and read me the card numbers.", delay:16000, speaker:'caller',
        alert:{ id:'g3',severity:'high',pattern:'Gift Card Demand',quote:'"Purchase prepaid debit cards and read me the numbers."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FTC Sentinel',time:'00:16' }},
    ]
  },
]

const SCRIPTS_ID = [
  {
    id:'bank_id', label:'🏦 Penipuan Bank', category:'critical',
    sentences: [
      { text:"Halo selamat siang. Saya dari pusat keamanan bank XYZ. Kami mendeteksi aktivitas mencurigakan di rekening Anda.", delay:0, speaker:'caller' },
      { text:"Halo, dari bank mana ya?", delay:5500, speaker:'me' },
      { text:"Ada transaksi lima belas juta rupiah yang tidak dikenal dari rekening Anda ke luar negeri.", delay:8000, speaker:'caller' },
      { text:"Rekening Anda akan kami blokir permanen dalam sepuluh menit jika tidak segera verifikasi identitas.", delay:14500, speaker:'caller',
        alert:{ id:'id1',severity:'critical',pattern:'Penipuan Perbankan',quote:'"Rekening akan diblokir permanen dalam 10 menit."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'OJK 2024',time:'00:14' }},
      { text:"Waduh, gimana caranya?", delay:22000, speaker:'me' },
      { text:"Sebutkan nomor rekening lengkap dan kode OTP yang baru saja kami kirim.", delay:24500, speaker:'caller',
        alert:{ id:'id2',severity:'critical',pattern:'Pencurian OTP / Kredensial',quote:'"Sebutkan nomor rekening dan kode OTP."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'OJK 2024',time:'00:24' }},
      { text:"Jangan hubungi cabang bank. Ini investigasi internal rahasia.", delay:32000, speaker:'caller',
        alert:{ id:'id3',severity:'high',pattern:'Taktik Isolasi',quote:'"Jangan hubungi cabang. Investigasi rahasia."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'Bareskrim 2024',time:'00:32' }},
    ]
  },
  {
    id:'pinjol', label:'💰 Pemerasan Pinjol', category:'high',
    sentences: [
      { text:"Selamat pagi. Bagian penagihan pinjaman. Anda punya tunggakan tiga juta rupiah yang harus dilunasi hari ini.", delay:0, speaker:'caller',
        alert:{ id:'id4',severity:'high',pattern:'Pemerasan / Intimidasi',quote:'"Tunggakan 3 juta harus dilunasi hari ini."',confidence:88,tactics:['AUTHORITY','FEAR'],source:'OJK 2024',time:'00:00' }},
      { text:"Saya tidak pernah pinjam uang!", delay:6500, speaker:'me' },
      { text:"Kalau tidak dibayar dalam satu jam, kami hubungi seluruh kontak di HP Anda tentang hutang Anda.", delay:9000, speaker:'caller',
        alert:{ id:'id5',severity:'critical',pattern:'Ancaman Pemerasan',quote:'"Hubungi seluruh kontak HP tentang hutang."',confidence:95,tactics:['FEAR','SCARCITY'],source:'Bareskrim 2024',time:'00:09' }},
      { text:"Foto KTP dan data pribadi Anda akan kami sebarkan ke media sosial.", delay:17000, speaker:'caller',
        alert:{ id:'id6',severity:'critical',pattern:'Ancaman Penyebaran Data',quote:'"KTP disebarkan ke media sosial."',confidence:96,tactics:['FEAR','ISOLATION'],source:'Kominfo 2024',time:'00:17' }},
    ]
  },
  {
    id:'mama', label:'📱 Mama Minta Pulsa', category:'medium',
    sentences: [
      { text:"Halo nak, ini mama. Mama lagi di rumah sakit, adikmu sakit parah.", delay:0, speaker:'caller' },
      { text:"Mama? Kok suaranya beda?", delay:6000, speaker:'me' },
      { text:"HP mama kehabisan pulsa. Tolong kirimkan pulsa seratus ribu ke nomor ini.", delay:8500, speaker:'caller',
        alert:{ id:'id8',severity:'medium',pattern:'Penipuan Identitas Keluarga',quote:'"Mama di rumah sakit, kirimkan pulsa 100 ribu."',confidence:85,tactics:['RECIPROCITY','FEAR'],source:'Kominfo 2024',time:'00:08' }},
      { text:"Cepat ya nak, ini darurat. Jangan bilang papa dulu.", delay:16000, speaker:'caller',
        alert:{ id:'id9',severity:'high',pattern:'Taktik Isolasi',quote:'"Jangan bilang papa dulu."',confidence:90,tactics:['ISOLATION','SCARCITY'],source:'Bareskrim 2024',time:'00:16' }},
      { text:"Mama butuh transfer tiga juta untuk biaya rumah sakit sekarang juga.", delay:23000, speaker:'caller',
        alert:{ id:'id10',severity:'critical',pattern:'Transfer Paksa Darurat',quote:'"Butuh transfer 3 juta untuk biaya RS."',confidence:92,tactics:['FEAR','COMMITMENT'],source:'OJK 2024',time:'00:23' }},
    ]
  },
  {
    id:'giveaway', label:'🎁 Giveaway Palsu', category:'medium',
    sentences: [
      { text:"Selamat! Anda terpilih sebagai pemenang giveaway dari akun selebgram terkenal!", delay:0, speaker:'caller' },
      { text:"Hah serius? Saya ikut giveaway apa?", delay:5500, speaker:'me' },
      { text:"Hadiah uang tunai lima puluh juta rupiah. Untuk klaim, bayar pajak hadiah dua juta.", delay:8000, speaker:'caller',
        alert:{ id:'id11',severity:'high',pattern:'Undian / Hadiah Palsu',quote:'"Menang 50 juta, bayar pajak 2 juta untuk klaim."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'Kominfo 2024',time:'00:08' }},
      { text:"Transfer sekarang sebelum hadiah hangus tiga puluh menit.", delay:16000, speaker:'caller',
        alert:{ id:'id12',severity:'critical',pattern:'Urgensi Palsu',quote:'"Transfer sebelum hangus 30 menit."',confidence:96,tactics:['SCARCITY','FEAR'],source:'Bareskrim 2024',time:'00:16' }},
    ]
  },
]

const SCRIPTS_ZH = [
  {
    id:'police_zh', label:'🚔 冒充公安诈骗', category:'critical',
    sentences: [
      { text:"你好，这里是公安局。我们发现你的身份证涉及一起重大洗钱案件。", delay:0, speaker:'caller',
        alert:{ id:'zh1',severity:'critical',pattern:'冒充政府机关',quote:'"公安局 — 身份证涉及洗钱案。"',confidence:97,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:00' }},
      { text:"什么？我没有做过这样的事！", delay:7000, speaker:'me' },
      { text:"不配合调查将立即冻结所有资产。", delay:10000, speaker:'caller',
        alert:{ id:'zh2',severity:'critical',pattern:'虚假紧迫性',quote:'"不配合将冻结所有资产。"',confidence:96,tactics:['FEAR','SCARCITY'],source:'GASA 2024',time:'00:10' }},
      { text:"将全部存款转入安全监管账户。", delay:18000, speaker:'caller',
        alert:{ id:'zh3',severity:'critical',pattern:'安全账户转账',quote:'"存款转入安全监管账户。"',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:18' }},
      { text:"这是国家机密案件，严禁向任何人透露。", delay:26000, speaker:'caller',
        alert:{ id:'zh4',severity:'high',pattern:'隔离策略',quote:'"国家机密，严禁透露。"',confidence:94,tactics:['ISOLATION','FEAR'],source:'GASA 2024',time:'00:26' }},
    ]
  },
]

const SCRIPTS_JA = [
  {
    id:'oreore', label:'📞 オレオレ詐欺', category:'critical',
    sentences: [
      { text:"もしもし、お母さん？俺だよ。大変なことになっちゃって。", delay:0, speaker:'caller' },
      { text:"え？誰？", delay:5000, speaker:'me' },
      { text:"会社のお金を間違えて使って、今日中に三百万円返さないとクビになる。", delay:7500, speaker:'caller',
        alert:{ id:'ja1',severity:'high',pattern:'家族なりすまし',quote:'"会社のお金、300万円必要。"',confidence:92,tactics:['RECIPROCITY','FEAR'],source:'NPA 2024',time:'00:07' }},
      { text:"誰にも言わないで。今すぐこの口座に振り込んで。", delay:15000, speaker:'caller',
        alert:{ id:'ja2',severity:'critical',pattern:'緊急送金要求',quote:'"誰にも言わないで、振り込んで。"',confidence:94,tactics:['ISOLATION','COMMITMENT'],source:'NPA 2024',time:'00:15' }},
    ]
  },
]

const SCRIPTS_KO = [
  {
    id:'vp_kr', label:'🏦 보이스피싱', category:'critical',
    sentences: [
      { text:"안녕하세요. 금융당국입니다. 고객님 계좌가 범죄에 연루되었습니다.", delay:0, speaker:'caller',
        alert:{ id:'ko1',severity:'critical',pattern:'정부기관 사칭',quote:'"금융당국 — 계좌 범죄 연루."',confidence:96,tactics:['AUTHORITY','FEAR'],source:'FSS 2024',time:'00:00' }},
      { text:"네? 무슨 말씀이세요?", delay:7000, speaker:'me' },
      { text:"안전계좌로 이체하지 않으면 계좌가 동결됩니다.", delay:10000, speaker:'caller',
        alert:{ id:'ko2',severity:'critical',pattern:'안전계좌 이체',quote:'"안전계좌 이체 안하면 동결."',confidence:98,tactics:['FEAR','SCARCITY'],source:'FSS 2024',time:'00:10' }},
      { text:"수사 기밀이므로 가족이나 은행에 절대 말하면 안 됩니다.", delay:18000, speaker:'caller',
        alert:{ id:'ko3',severity:'high',pattern:'고립 전술',quote:'"수사 기밀 — 말하면 안 됩니다."',confidence:93,tactics:['ISOLATION','AUTHORITY'],source:'FSS 2024',time:'00:18' }},
    ]
  },
]

const SCRIPTS_ES = [
  {
    id:'banco_es', label:'🏦 Fraude Bancario', category:'critical',
    sentences: [
      { text:"Buenas tardes. Seguridad de su banco. Detectamos movimientos sospechosos.", delay:0, speaker:'caller' },
      { text:"¿Qué banco? No entiendo.", delay:5500, speaker:'me' },
      { text:"Su cuenta será bloqueada en diez minutos si no verifica su identidad.", delay:8000, speaker:'caller',
        alert:{ id:'es1',severity:'critical',pattern:'Suplantación Bancaria',quote:'"Cuenta bloqueada en 10 minutos."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08' }},
      { text:"Confirme su número de cuenta y el código de verificación.", delay:16000, speaker:'caller',
        alert:{ id:'es2',severity:'critical',pattern:'Robo de Credenciales',quote:'"Confirme cuenta y código."',confidence:98,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:16' }},
    ]
  },
]

const SCRIPTS_FR = [
  {
    id:'cpf_fr', label:'🏛 Arnaque CPF', category:'high',
    sentences: [
      { text:"Bonjour, service formation. Votre compte formation arrive à expiration.", delay:0, speaker:'caller',
        alert:{ id:'fr1',severity:'high',pattern:'Usurpation gouvernementale',quote:'"Compte formation expire."',confidence:92,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:00' }},
      { text:"De quoi parlez-vous ?", delay:7000, speaker:'me' },
      { text:"Deux mille quatre cents euros seront perdus à la fin du mois.", delay:10000, speaker:'caller',
        alert:{ id:'fr2',severity:'high',pattern:'Urgence Artificielle',quote:'"2400€ perdus fin du mois."',confidence:90,tactics:['SCARCITY','FEAR'],source:'GASA 2024',time:'00:10' }},
    ]
  },
]

const SCRIPTS_HI = [
  {
    id:'aadh', label:'🏛 डिजिटल अरेस्ट', category:'critical',
    sentences: [
      { text:"नमस्ते, दूरसंचार विभाग से बोल रहा हूं। आपका नंबर अवैध गतिविधियों में इस्तेमाल हो रहा है।", delay:0, speaker:'caller',
        alert:{ id:'hi1',severity:'critical',pattern:'सरकारी एजेंसी का रूप',quote:'"दूरसंचार विभाग — अवैध गतिविधि।"',confidence:95,tactics:['AUTHORITY','FEAR'],source:'MHA 2024',time:'00:00' }},
      { text:"क्या? मैंने कुछ नहीं किया!", delay:7500, speaker:'me' },
      { text:"चौबीस घंटे में नंबर बंद हो जाएगा। आधार और OTP बताइए।", delay:10000, speaker:'caller',
        alert:{ id:'hi2',severity:'critical',pattern:'OTP चोरी',quote:'"आधार और OTP बताइए।"',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'RBI 2024',time:'00:10' }},
    ]
  },
]

const SCRIPTS_AR = [
  {
    id:'bank_ar', label:'🏦 احتيال مصرفي', category:'critical',
    sentences: [
      { text:"مرحباً، قسم الأمان في البنك. اكتشفنا عملية مشبوهة على حسابكم.", delay:0, speaker:'caller',
        alert:{ id:'ar1',severity:'critical',pattern:'انتحال موظف بنكي',quote:'"قسم الأمان — عملية مشبوهة."',confidence:95,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:00' }},
      { text:"من أنتم؟", delay:6500, speaker:'me' },
      { text:"نحتاج رمز التحقق لإيقاف العملية فوراً وإلا سيتم تجميد حسابكم.", delay:9000, speaker:'caller',
        alert:{ id:'ar2',severity:'critical',pattern:'سرقة بيانات',quote:'"رمز التحقق لإيقاف العملية."',confidence:97,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:09' }},
    ]
  },
]

function getScriptsForLang(lang) {
  const map = { id:SCRIPTS_ID, zh:SCRIPTS_ZH, ja:SCRIPTS_JA, ko:SCRIPTS_KO, es:SCRIPTS_ES, fr:SCRIPTS_FR, hi:SCRIPTS_HI, ar:SCRIPTS_AR }
  return map[lang] || SCRIPTS_EN
}

/* ━━━ Helpers ━━━ */
const TECH_ITEMS = [
  { icon:'🦀',name:'RUST WASM',sub:'Audio Engine · Zero-copy',c:'#ff9500' },
  { icon:'🐍',name:'PYTHON',sub:'FastAPI · Cloud Run',c:'#30d158' },
  { icon:'✦',name:'GEMINI LIVE',sub:'Real-time AI Analysis',c:'#00d4ff' },
  { icon:'☁',name:'CLOUD RUN',sub:'GCP · Auto-scale',c:'#7b61ff' },
]

function getNow() { return new Date().toLocaleString('en-US',{timeZone:'America/New_York',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' EST' }

function TechChip({ item }) {
  const [h,setH]=useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 12px',marginBottom:3,borderLeft:`2px solid ${h?item.c:item.c+'35'}`,background:h?item.c+'0f':'rgba(255,255,255,0.01)',transition:'all 0.18s ease',cursor:'default' }}>
      <span style={{ fontSize:16,filter:h?`drop-shadow(0 0 6px ${item.c})`:'none',transition:'filter 0.2s' }}>{item.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:PF,fontSize:7,color:h?item.c:item.c+'cc',transition:'all 0.2s' }}>{item.name}</div>
        <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.38)',marginTop:2 }}>{item.sub}</div>
      </div>
    </div>
  )
}

/* ━━━ Live Transcript — 2-way with ME/CALLER labels ━━━ */
function LiveTranscript({ lines, speaking }) {
  const ref=useRef(null)
  useEffect(()=>{ if(ref.current) ref.current.scrollTop=ref.current.scrollHeight },[lines])
  return (
    <div ref={ref} style={{ background:'rgba(0,0,0,0.6)',border:'1px solid rgba(0,212,255,0.12)',padding:'12px 16px',maxHeight:180,overflowY:'auto',marginBottom:16 }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
        <div style={{ fontFamily:PF,fontSize:6,color:'rgba(0,212,255,0.6)',letterSpacing:2 }}>LIVE TRANSCRIPT</div>
        {speaking&&<span style={{ fontFamily:MF,fontSize:8,color:'#ff2d55',animation:'blink 0.8s step-end infinite' }}>● SPEAKING</span>}
      </div>
      {lines.length===0
        ? <div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.2)',fontStyle:'italic' }}>Waiting for audio input...</div>
        : lines.map((l,i)=>{
          const isMe=l.speaker==='me'
          return (
            <div key={i} style={{ fontFamily:MF,fontSize:11,color:isMe?'#30d158':'rgba(255,255,255,0.75)',lineHeight:1.7,padding:'3px 0',borderLeft:l.flagged?'2px solid #ff2d55':isMe?'2px solid #30d15844':'2px solid transparent',paddingLeft:8,background:l.flagged?'rgba(255,45,85,0.06)':'transparent' }}>
              <span style={{ color:isMe?'#30d15877':'rgba(0,212,255,0.4)',fontSize:9,marginRight:6 }}>[{l.time}]</span>
              <span style={{ fontFamily:PF,fontSize:5,color:isMe?'#30d158':'#ff9500',marginRight:5,letterSpacing:1 }}>{isMe?'ME':'CALLER'}</span>
              {l.text}
              {l.flagged&&<span style={{ color:'#ff2d55',fontSize:8,marginLeft:6 }}>⚠</span>}
            </div>
          )
        })}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function MonitorTab({ monitoring,threatLevel,sessionTime,alerts,threatScore,audioLevel,screenOn,onStart,onStop,onToggleScreen,onDemoAlert,onTranscriptLine,language='en' }) {
  const [script,setScript]=useState(null)
  const [now,setNow]=useState(getNow())
  const [speaking,setSpeaking]=useState(false)
  const [transcriptLines,setTranscriptLines]=useState([])
  const [voiceDemo,setVoiceDemo]=useState(false)
  const [demoProgress,setDemoProgress]=useState(0)
  const [voiceMuted,setVoiceMuted]=useState(false)
  const speechTimers=useRef([])
  const startTimeRef=useRef(null)
  const pendingCount=useRef(0)
  const finished=useRef(false)

  const availableScripts=getScriptsForLang(language)
  useEffect(()=>{setScript(null)},[language])
  useEffect(()=>{const t=setInterval(()=>setNow(getNow()),1000);return()=>clearInterval(t)},[])
  useEffect(()=>{return()=>{speechTimers.current.forEach(t=>clearTimeout(t));window.speechSynthesis?.cancel()}},[])
  useEffect(()=>{
    if(!monitoring){
      setTranscriptLines([]);setVoiceDemo(false);setSpeaking(false);setDemoProgress(0)
      finished.current=false;pendingCount.current=0
      speechTimers.current.forEach(t=>clearTimeout(t));speechTimers.current=[]
      window.speechSynthesis?.cancel()
    }
  },[monitoring])

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const avgConf=alerts.length>0?Math.round(alerts.reduce((a,b)=>a+b.confidence,0)/alerts.length):null
  const tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#00d4ff'

  const startVoiceDemo=useCallback((sel)=>{
    if(!sel||!window.speechSynthesis) return
    speechTimers.current.forEach(t=>clearTimeout(t));speechTimers.current=[]
    window.speechSynthesis.cancel()
    setVoiceDemo(true);setTranscriptLines([]);setDemoProgress(0)
    finished.current=false;startTimeRef.current=Date.now()
    const sents=sel.sentences;const totalCaller=sents.filter(s=>s.speaker==='caller').length;pendingCount.current=totalCaller

    const go=()=>{
      const voice=getVoiceForLang(language)
      sents.forEach((s,idx)=>{
        const timer=setTimeout(()=>{
          const elapsed=Date.now()-startTimeRef.current
          const ts=fmt(Math.floor(elapsed/1000))
          const line={text:s.text,time:ts,flagged:!!s.alert,speaker:s.speaker||'caller'}
          setTranscriptLines(prev=>[...prev,line])
          if(onTranscriptLine) onTranscriptLine(line)

          if(s.speaker==='me'){
            if(s.alert){const at=setTimeout(()=>{if(onDemoAlert)onDemoAlert(s.alert)},500);speechTimers.current.push(at)}
            return
          }

          if(!voiceMuted){
            const u=new SpeechSynthesisUtterance(s.text)
            if(voice) u.voice=voice
            u.rate=1.0;u.pitch=1.0;u.volume=1.0
            u.onstart=()=>setSpeaking(true)
            u.onend=()=>{
              setSpeaking(false)
              const callerDone=sents.filter((x,j)=>j<=idx&&x.speaker==='caller').length
              setDemoProgress(Math.round((callerDone/totalCaller)*100))
              pendingCount.current-=1
              if(pendingCount.current<=0&&!finished.current){
                finished.current=true
                const st=setTimeout(()=>onStop(),3000);speechTimers.current.push(st)
              }
            }
            window.speechSynthesis.speak(u)
          } else {
            // Muted: just progress without speaking
            const callerDone=sents.filter((x,j)=>j<=idx&&x.speaker==='caller').length
            setDemoProgress(Math.round((callerDone/totalCaller)*100))
            pendingCount.current-=1
            if(pendingCount.current<=0&&!finished.current){
              finished.current=true
              const st=setTimeout(()=>onStop(),3000);speechTimers.current.push(st)
            }
          }

          if(s.alert){const at=setTimeout(()=>{if(onDemoAlert)onDemoAlert(s.alert)},1800);speechTimers.current.push(at)}
        },s.delay)
        speechTimers.current.push(timer)
      })
    }

    if(window.speechSynthesis.getVoices().length===0){
      window.speechSynthesis.addEventListener('voiceschanged',go,{once:true})
      setTimeout(go,300)
    } else go()
  },[onDemoAlert,onStop,onTranscriptLine,language,voiceMuted])

  const handleStartWithVoice=()=>{onStart();if(script) setTimeout(()=>startVoiceDemo(script),500)}
  const handleStop=()=>{window.speechSynthesis?.cancel();speechTimers.current.forEach(t=>clearTimeout(t));onStop()}

  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 296px',gap:20 }}>
      <style>{`
        @keyframes progressShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes progressScan{0%{opacity:0;transform:translateX(-20px)}50%{opacity:1}100%{opacity:0;transform:translateX(20px)}}
        @media(max-width:900px){.monitor-grid{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
        <PBox color={monitoring&&threatLevel==='critical'?'#ff2d55':'#00d4ff'} style={{ padding:24,background:'rgba(0,212,255,0.01)',transition:'all 0.5s' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:10 }}>
            <div>
              <div style={{ fontFamily:PF,fontSize:10,color:'#00d4ff',marginBottom:6,textShadow:'0 0 14px #00d4ff' }}>LIVE SESSION MONITOR</div>
              <div style={{ fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.48)' }}>
                {monitoring ? voiceDemo ? `► VOICE DEMO — ${fmt(sessionTime)} — ${demoProgress}%` : `► ANALYZING — ${fmt(sessionTime)}` : '■ READY — SELECT DEMO → START'}
              </div>
            </div>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end' }}>
              {voiceDemo&&<PBtn onClick={()=>{setVoiceMuted(m=>!m);if(!voiceMuted)window.speechSynthesis?.cancel()}} color={voiceMuted?'#ff9500':'#30d158'} style={{ padding:'10px 14px' }}>{voiceMuted?'🔇 UNMUTE':'🔊 MUTE'}</PBtn>}
              <PBtn onClick={onToggleScreen} color={screenOn?'#ffd60a':'#7b61ff'}>{screenOn?'■ SCREEN OFF':'◈ SCREEN WATCH'}</PBtn>
              {!monitoring ? <PBtn onClick={handleStartWithVoice} color="#30d158">{script?'▶ START VOICE DEMO':'▶ START'}</PBtn> : <PBtn onClick={handleStop} danger>■ STOP</PBtn>}
            </div>
          </div>

          <CallerVisual mode="phone" active={voiceDemo&&monitoring} screenWatchOn={screenOn} />

          {/* Screen Watch active banner — only when screen is ON */}
          {screenOn&&monitoring&&(
            <div style={{ padding:'8px 12px',marginBottom:12,border:'1px solid rgba(123,97,255,0.3)',background:'rgba(123,97,255,0.08)',display:'flex',alignItems:'center',gap:8 }}>
              <div style={{ width:6,height:6,background:'#7b61ff',animation:'blink 1.5s step-end infinite',boxShadow:'0 0 6px #7b61ff' }}/>
              <span style={{ fontFamily:MF,fontSize:9,color:'#7b61ff' }}>◈ SCREEN WATCH ACTIVE — Capturing screen every 2s · Detecting fake sites, QR codes, spoofed portals</span>
            </div>
          )}

          <div style={{ background:'rgba(0,0,0,0.5)',padding:'10px 14px',marginBottom:16,border:`1px solid ${tColor}18`,position:'relative',transition:'border-color 0.5s' }}>
            <div style={{ fontFamily:MF,fontSize:9,color:`${tColor}60`,marginBottom:8,letterSpacing:2 }}>
              {voiceDemo?'VOICE DEMO ── SPEECH SYNTHESIS ── REAL-TIME DETECTION':'AUDIO STREAM ── GEMINI LIVE API ── RUST WASM ENGINE'}
            </div>
            <WaveformVisualizer active={monitoring} threatLevel={threatLevel} audioLevel={speaking?0.7:audioLevel} />
            {speaking&&!voiceMuted&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff2d55',textShadow:'0 0 8px #ff2d55',animation:'blink 0.6s step-end infinite' }}>🔊 VOICE</div>}
            {voiceMuted&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff9500',opacity:0.6 }}>🔇 MUTED</div>}
          </div>

          {voiceDemo&&<LiveTranscript lines={transcriptLines} speaking={speaking&&!voiceMuted} />}
          {voiceDemo&&<AnalysisProgressBar progress={demoProgress} threatColor={tColor} />}

          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            <StatCard label="THREATS" value={alerts.length} color="#ff2d55" icon="⚠" />
            <StatCard label="PATTERNS" value="50+" color="#00d4ff" icon="◎" />
            <StatCard label="LATENCY" value="<80ms" color="#30d158" icon="⚡" />
            <StatCard label="CONFIDENCE" value={avgConf?`${avgConf}%`:'—'} color="#7b61ff" icon="◆" />
          </div>
        </PBox>

        {/* Demo Scripts */}
        <PBox color="rgba(255,214,10,0.2)" style={{ padding:16,background:'rgba(255,214,10,0.01)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
            <div style={{ width:6,height:6,background:'#ffd60a',animation:'blink 1s step-end infinite' }}/>
            <span style={{ fontFamily:PF,fontSize:7,color:'#ffd60a',letterSpacing:1 }}>VOICE DEMO SCRIPTS</span>
            <span style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.45)' }}>— {language.toUpperCase()}</span>
          </div>
          <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.35)',marginBottom:12,paddingLeft:14 }}>
            🔊 2-way dialog (ME + CALLER) · Auto-stop · Use 🔇 MUTE for text-only mode
          </div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            {availableScripts.map(s=>(
              <button key={s.id} onClick={()=>setScript(script?.id===s.id?null:s)}
                style={{ fontFamily:MF,fontSize:10,padding:'7px 14px',cursor:'pointer',border:`1px solid ${script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.22)'}`,background:script?.id===s.id?'rgba(255,214,10,0.12)':'transparent',color:script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.52)',transition:'all 0.15s',display:'flex',alignItems:'center',gap:6 }}>
                {s.label}{script?.id===s.id&&<span style={{ fontSize:8 }}>✓</span>}
              </button>
            ))}
          </div>
        </PBox>

        {/* Alerts */}
        <PBox color={alerts.length>0?'#ff2d55':'rgba(0,212,255,0.15)'} style={{ padding:20,background:'rgba(0,0,0,0.2)',flex:1 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:PF,fontSize:9,color:'#00d4ff' }}>REAL-TIME ALERTS</div>
              <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:5 }}>{now}</div>
            </div>
            {alerts.length>0&&<div style={{ fontFamily:PF,fontSize:7,padding:'5px 12px',border:'2px solid #ff2d55',color:'#ff2d55',background:'rgba(255,45,85,0.08)',animation:'ppulse 1.5s infinite',flexShrink:0 }}>{alerts.length} DETECTED</div>}
          </div>
          {alerts.length===0?(
            <div style={{ textAlign:'center',padding:'52px 0' }}>
              <div style={{ fontSize:38,marginBottom:14,color:'rgba(0,212,255,0.15)' }}>🛡</div>
              <div style={{ fontFamily:PF,fontSize:7,color:'rgba(255,255,255,0.2)',lineHeight:2.5 }}>
                {monitoring?'LISTENING...\nANALYZING':'SELECT DEMO\nTHEN START'}
              </div>
            </div>
          ):(
            <div style={{ maxHeight:380,overflowY:'auto',paddingRight:4 }}>
              {alerts.map((a,i)=><AlertCard key={a.id} alert={a} index={i} />)}
            </div>
          )}
        </PBox>
      </div>

      {/* Right sidebar */}
      <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
        <PBox color="#7b61ff" style={{ padding:20,background:'rgba(0,0,0,0.2)' }}>
          <div style={{ fontFamily:PF,fontSize:8,color:'#7b61ff',marginBottom:16,textShadow:'0 0 10px #7b61ff' }}>THREAT SCORE</div>
          <ThreatMeter score={threatScore} />
        </PBox>
        <PBox color="rgba(0,212,255,0.12)" style={{ padding:16,background:'rgba(0,0,0,0.1)' }}>
          <div style={{ fontFamily:PF,fontSize:7,color:'rgba(0,212,255,0.55)',marginBottom:12,letterSpacing:1 }}>TECH STACK</div>
          {TECH_ITEMS.map(item=><TechChip key={item.name} item={item} />)}
        </PBox>
      </div>
    </div>
  )
}
