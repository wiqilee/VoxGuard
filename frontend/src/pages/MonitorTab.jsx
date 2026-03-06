import { useState, useEffect, useRef, useCallback } from 'react'
import { PBox, PBtn, StatCard }  from '../components/Primitives'
import { WaveformVisualizer }    from '../components/WaveformVisualizer'
import { ThreatMeter }           from '../components/ThreatMeter'
import { AlertCard }             from '../components/AlertCard'
import { PF, MF }                from '../utils/constants'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VOICE CONFIG — REVERTED to default rate/pitch for natural sound
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const VOICE_PREFS = {
  en: { langPrefix: ['en-US','en-GB','en'], rate: 1.0, pitch: 1.0 },
  id: { langPrefix: ['id-ID','id'], rate: 1.0, pitch: 1.0 },
  zh: { langPrefix: ['zh-CN','zh-TW','zh'], rate: 1.0, pitch: 1.0 },
  ja: { langPrefix: ['ja-JP','ja'], rate: 1.0, pitch: 1.0 },
  ko: { langPrefix: ['ko-KR','ko'], rate: 1.0, pitch: 1.0 },
  es: { langPrefix: ['es-ES','es-MX','es'], rate: 1.0, pitch: 1.0 },
  fr: { langPrefix: ['fr-FR','fr'], rate: 1.0, pitch: 1.0 },
  de: { langPrefix: ['de-DE','de'], rate: 1.0, pitch: 1.0 },
  hi: { langPrefix: ['hi-IN','hi'], rate: 1.0, pitch: 1.0 },
  ar: { langPrefix: ['ar-SA','ar'], rate: 1.0, pitch: 1.0 },
  pt: { langPrefix: ['pt-BR','pt-PT','pt'], rate: 1.0, pitch: 1.0 },
  ru: { langPrefix: ['ru-RU','ru'], rate: 1.0, pitch: 1.0 },
  th: { langPrefix: ['th-TH','th'], rate: 1.0, pitch: 1.0 },
  vi: { langPrefix: ['vi-VN','vi'], rate: 1.0, pitch: 1.0 },
  ms: { langPrefix: ['ms-MY','ms'], rate: 1.0, pitch: 1.0 },
  tr: { langPrefix: ['tr-TR','tr'], rate: 1.0, pitch: 1.0 },
  it: { langPrefix: ['it-IT','it'], rate: 1.0, pitch: 1.0 },
  nl: { langPrefix: ['nl-NL','nl'], rate: 1.0, pitch: 1.0 },
  pl: { langPrefix: ['pl-PL','pl'], rate: 1.0, pitch: 1.0 },
  sv: { langPrefix: ['sv-SE','sv'], rate: 1.0, pitch: 1.0 },
}

function getVoiceForLang(lang) {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const prefs = VOICE_PREFS[lang] || VOICE_PREFS['en']
  for (const prefix of prefs.langPrefix) {
    const match = voices.find(v => v.lang.startsWith(prefix))
    if (match) return match
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0]
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CALLER VISUAL — blurred face silhouette SVG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CallerVisual({ mode = 'phone', active }) {
  if (!active) return null
  return (
    <div style={{ position:'relative', width:'100%', height:80, marginBottom:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(0,0,0,0.6)' }}>
      <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="faceBlur"><feGaussianBlur stdDeviation="6" /></filter>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="100%" stopColor="#b08050" />
          </linearGradient>
        </defs>
        <rect width="300" height="80" fill="#0a0a12" />
        {/* Head/face — blurred */}
        <g filter="url(#faceBlur)">
          <ellipse cx="150" cy="32" rx="22" ry="26" fill="url(#skinGrad)" />
          <rect x="140" y="52" width="20" height="18" rx="4" fill="url(#skinGrad)" />
          <ellipse cx="150" cy="14" rx="24" ry="14" fill="#2a1a0a" />
          <ellipse cx="142" cy="30" rx="3" ry="2" fill="#1a1a1a" opacity="0.5" />
          <ellipse cx="158" cy="30" rx="3" ry="2" fill="#1a1a1a" opacity="0.5" />
        </g>
        {/* Mode indicators */}
        {mode === 'phone' && <>
          <rect x="10" y="8" width="32" height="14" rx="2" fill="none" stroke="#ff2d55" strokeWidth="1" opacity="0.6" />
          <text x="26" y="18" textAnchor="middle" fill="#ff2d55" fontSize="7" fontFamily="monospace" opacity="0.8">CALL</text>
          <circle cx="26" cy="32" r="4" fill="#ff2d55" opacity="0.4"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" /></circle>
        </>}
        {mode === 'zoom' && <>
          <rect x="6" y="6" width="44" height="22" rx="3" fill="none" stroke="#2d8cff" strokeWidth="1.5" opacity="0.7" />
          <text x="28" y="20" textAnchor="middle" fill="#2d8cff" fontSize="6" fontFamily="monospace" opacity="0.8">ZOOM</text>
          <rect x="252" y="6" width="42" height="22" rx="3" fill="none" stroke="#30d158" strokeWidth="1" opacity="0.5" />
          <text x="273" y="20" textAnchor="middle" fill="#30d158" fontSize="5" fontFamily="monospace" opacity="0.6">YOU</text>
        </>}
        {mode === 'video' && <>
          <circle cx="20" cy="15" r="5" fill="none" stroke="#ff2d55" strokeWidth="1.5" opacity="0.8"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" /></circle>
          <text x="32" y="18" fill="#ff2d55" fontSize="6" fontFamily="monospace" opacity="0.7">REC</text>
        </>}
        {/* Scan line */}
        <rect x="0" y="0" width="300" height="2" fill="rgba(0,212,255,0.15)"><animate attributeName="y" values="0;80;0" dur="3s" repeatCount="indefinite" /></rect>
        {/* Corner brackets */}
        <path d="M4,4 L4,16 M4,4 L16,4" stroke="#ff2d55" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M296,4 L296,16 M296,4 L284,4" stroke="#ff2d55" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M4,76 L4,64 M4,76 L16,76" stroke="#ff2d55" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M296,76 L296,64 M296,76 L284,76" stroke="#ff2d55" strokeWidth="1.5" fill="none" opacity="0.5" />
      </svg>
      <div style={{ position:'absolute', bottom:4, right:8, fontFamily:PF, fontSize:5, color:'#ff2d55', opacity:0.7, letterSpacing:1 }}>◉ ANALYZING CALLER</div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PREMIUM ANALYSIS PROGRESS BAR — animated gradient
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AnalysisProgressBar({ progress, threatColor }) {
  const complete = progress >= 100
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
        <span style={{ fontFamily:PF,fontSize:6,color:'rgba(0,212,255,0.5)',letterSpacing:1 }}>ANALYSIS PROGRESS</span>
        <span style={{ fontFamily:MF,fontSize:9,color:complete?'#30d158':'#00d4ff' }}>{complete?'✓ COMPLETE':progress+'%'}</span>
      </div>
      <div style={{ height:6, background:'rgba(0,212,255,0.08)', overflow:'hidden', position:'relative', border:'1px solid rgba(0,212,255,0.1)' }}>
        <div style={{
          height:'100%', width:`${progress}%`,
          background: complete
            ? 'linear-gradient(90deg, #30d158, #4aeaff, #30d158)'
            : `linear-gradient(90deg, #00d4ff, ${threatColor}, #7b61ff, #00d4ff)`,
          backgroundSize: '200% 100%',
          animation: complete ? 'none' : 'progressShimmer 2s linear infinite',
          boxShadow: `0 0 12px ${complete?'#30d158':'#00d4ff'}66, 0 0 24px ${complete?'#30d158':'#00d4ff'}33`,
          transition:'width 0.5s ease',
        }} />
        {!complete && progress > 0 && (
          <div style={{
            position:'absolute', top:0, height:'100%', width:30,
            background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation:'progressScan 1.5s ease-in-out infinite',
            left:`${Math.max(0,progress-10)}%`,
          }} />
        )}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
        {[0,25,50,75,100].map(v => (
          <div key={v} style={{ width:2, height:4, background:progress>=v?'#00d4ff':'rgba(0,212,255,0.15)', boxShadow:progress>=v?'0 0 4px #00d4ff':'none', transition:'all 0.3s' }} />
        ))}
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DEMO SCRIPTS — kept as original (English + Indonesian)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SCRIPTS_EN = [
  {
    id: 'bank', label: '🏦 Bank Impersonation', category: 'critical',
    sentences: [
      { text: "Hello, this is the fraud prevention department from Chase Bank.", delay: 0 },
      { text: "We have detected suspicious activity on your checking account ending in four seven eight two.", delay: 4200 },
      { text: "Someone attempted to transfer three thousand two hundred dollars to an overseas account just minutes ago.", delay: 9200 },
      { text: "Your account will be permanently frozen within the next ten minutes unless you verify your identity immediately.", delay: 15000,
        alert: { id:'b1', severity:'critical', pattern:'Bank Impersonation', quote:'"Your account will be permanently frozen in 10 minutes unless you verify your identity."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel', time:'00:15' }},
      { text: "I need you to confirm your full account number and the one time passcode we just sent to your phone.", delay: 23000,
        alert: { id:'b2', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Confirm your full account number and the one-time passcode."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'FBI IC3 2024', time:'00:23' }},
      { text: "Please do not contact your branch directly. This is a confidential internal investigation.", delay: 30000,
        alert: { id:'b3', severity:'high', pattern:'Isolation Tactic', quote:'"Do not contact your branch. This is a confidential investigation."', confidence:91, tactics:['ISOLATION','AUTHORITY'], source:'GASA 2024', time:'00:30' }},
      { text: "Time is running out. If you don't act now, we cannot protect your funds and your savings will be at risk.", delay: 37000,
        alert: { id:'b4', severity:'critical', pattern:'Artificial Urgency', quote:'"Time is running out. If you don\'t act now, we cannot protect your funds."', confidence:95, tactics:['SCARCITY','FEAR'], source:'FTC Sentinel', time:'00:37' }},
    ]
  },
  {
    id: 'investment', label: '📈 Investment Scam', category: 'critical',
    sentences: [
      { text: "Good afternoon. I'm calling from Global Wealth Partners, an elite investment advisory firm.", delay: 0 },
      { text: "Congratulations. You've been pre-selected for an exclusive blockchain investment opportunity.", delay: 5000 },
      { text: "Our clients have seen guaranteed returns of three hundred percent in just thirty days, with absolutely zero risk.", delay: 10500,
        alert: { id:'i1', severity:'high', pattern:'Investment Fraud', quote:'"Guaranteed returns of 300% in 30 days, zero risk."', confidence:96, tactics:['SCARCITY','COMMITMENT'], source:'FBI IC3 2024', time:'00:10' }},
      { text: "There are only five positions remaining and this window closes in exactly ten minutes.", delay: 17500,
        alert: { id:'i2', severity:'critical', pattern:'Artificial Urgency', quote:'"Only 5 positions remaining, window closes in 10 minutes."', confidence:94, tactics:['SCARCITY','FEAR'], source:'GASA 2024', time:'00:17' }},
      { text: "To secure your position, I need you to transfer five hundred dollars in cryptocurrency to our escrow wallet right now.", delay: 23500,
        alert: { id:'i3', severity:'critical', pattern:'Crypto Transfer Scam', quote:'"Transfer $500 in cryptocurrency to our escrow wallet."', confidence:98, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel', time:'00:23' }},
      { text: "This is strictly confidential. Do not discuss this with your family or financial advisor. It could void your eligibility.", delay: 31000,
        alert: { id:'i4', severity:'high', pattern:'Isolation Tactic', quote:'"Do not discuss with your family — it could void your eligibility."', confidence:92, tactics:['ISOLATION','RECIPROCITY'], source:'GASA 2024', time:'00:31' }},
    ]
  },
  {
    id: 'tech', label: '💻 Tech Support', category: 'high',
    sentences: [
      { text: "Hello, this is the Microsoft Windows Security Center calling about your computer.", delay: 0 },
      { text: "Our monitoring systems have detected that your device has been infected with a critical Trojan virus.", delay: 4800,
        alert: { id:'t1', severity:'high', pattern:'Tech Support Impersonation', quote:'"Microsoft Security Center — your device is infected with a Trojan."', confidence:93, tactics:['AUTHORITY','FEAR'], source:'FBI IC3 2024', time:'00:04' }},
      { text: "Hackers currently have active access to your banking passwords and personal files as we speak.", delay: 11000 },
      { text: "You must install our certified remote access tool immediately so our engineers can remove the threat from your system.", delay: 16500,
        alert: { id:'t2', severity:'critical', pattern:'Tech Support Impersonation', quote:'"Install remote access tool immediately so we can remove the threat."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel', time:'00:16' }},
      { text: "If you do not act within the next thirty minutes, your credit card information will be compromised permanently.", delay: 24000,
        alert: { id:'t3', severity:'critical', pattern:'Artificial Urgency', quote:'"Within 30 minutes your credit card information will be compromised."', confidence:95, tactics:['SCARCITY','FEAR'], source:'FBI IC3 2024', time:'00:24' }},
      { text: "Our premium protection service costs two hundred and ninety nine dollars, payable by Google Play gift cards for secure processing.", delay: 31500,
        alert: { id:'t4', severity:'high', pattern:'Gift Card Demand', quote:'"$299 payable by Google Play gift cards."', confidence:98, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel', time:'00:31' }},
    ]
  },
  {
    id: 'gov', label: '🏛 Government / IRS', category: 'critical',
    sentences: [
      { text: "This is Officer Johnson, badge number eight four seven three, calling from the Internal Revenue Service enforcement division.", delay: 0,
        alert: { id:'g1', severity:'critical', pattern:'Government Impersonation', quote:'"Officer Johnson, badge 8473, IRS enforcement division."', confidence:96, tactics:['AUTHORITY'], source:'FBI IC3 2024', time:'00:00' }},
      { text: "We have identified unpaid federal taxes under your Social Security number totaling twelve thousand four hundred dollars.", delay: 7000 },
      { text: "A warrant has already been issued for your arrest, and local law enforcement has been notified.", delay: 13000,
        alert: { id:'g2', severity:'critical', pattern:'Government Impersonation', quote:'"A warrant has been issued for your arrest."', confidence:98, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel', time:'00:13' }},
      { text: "However, if you settle this outstanding balance right now over the phone, we can cancel the warrant.", delay: 20000,
        alert: { id:'g3', severity:'critical', pattern:'Artificial Urgency', quote:'"Settle this balance right now or face arrest."', confidence:95, tactics:['SCARCITY','FEAR'], source:'FBI IC3 2024', time:'00:20' }},
      { text: "You will need to purchase prepaid debit cards and read me the card numbers.", delay: 28000,
        alert: { id:'g4', severity:'high', pattern:'Gift Card Demand', quote:'"Purchase prepaid debit cards and read me the numbers."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel', time:'00:28' }},
    ]
  },
]

const SCRIPTS_ID = [
  {
    id: 'bri', label: '🏦 Penipuan Bank BRI', category: 'critical',
    sentences: [
      { text: "Halo selamat siang. Saya dari pusat keamanan Bank BRI. Kami mendeteksi aktivitas mencurigakan di rekening Anda.", delay: 0 },
      { text: "Ada transaksi sebesar lima belas juta rupiah yang tidak dikenal dari rekening Anda ke luar negeri.", delay: 6000 },
      { text: "Rekening Anda akan kami blokir permanen dalam sepuluh menit jika Anda tidak segera melakukan verifikasi identitas.", delay: 12500,
        alert: { id:'id1', severity:'critical', pattern:'Bank Impersonation', quote:'"Rekening akan diblokir permanen dalam 10 menit."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'GASA 2024', time:'00:12' }},
      { text: "Tolong sebutkan nomor rekening lengkap dan kode OTP yang baru saja kami kirim ke nomor handphone Anda.", delay: 20000,
        alert: { id:'id2', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Sebutkan nomor rekening dan kode OTP."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'MAS ScamShield', time:'00:20' }},
      { text: "Jangan menghubungi cabang bank. Ini investigasi internal yang bersifat rahasia.", delay: 27500,
        alert: { id:'id3', severity:'high', pattern:'Isolation Tactic', quote:'"Jangan hubungi cabang. Investigasi rahasia."', confidence:91, tactics:['ISOLATION','AUTHORITY'], source:'GASA 2024', time:'00:27' }},
    ]
  },
  {
    id: 'pinjol', label: '💰 Pinjol Ilegal', category: 'high',
    sentences: [
      { text: "Selamat pagi. Bagian penagihan pinjaman. Anda punya tunggakan tiga juta rupiah yang harus dilunasi hari ini.", delay: 0,
        alert: { id:'id4', severity:'high', pattern:'Government Impersonation', quote:'"Tunggakan 3 juta harus dilunasi hari ini."', confidence:88, tactics:['AUTHORITY','FEAR'], source:'GASA 2024', time:'00:00' }},
      { text: "Kalau tidak dibayar dalam satu jam, kami akan hubungi seluruh kontak di handphone Anda tentang hutang Anda.", delay: 7500,
        alert: { id:'id5', severity:'critical', pattern:'Artificial Urgency', quote:'"Hubungi seluruh kontak HP tentang hutang."', confidence:95, tactics:['FEAR','SCARCITY'], source:'MAS ScamShield', time:'00:07' }},
      { text: "Foto KTP dan data pribadi Anda akan kami sebarkan ke media sosial jika pembayaran tidak diterima.", delay: 15000,
        alert: { id:'id6', severity:'critical', pattern:'Isolation Tactic', quote:'"KTP disebarkan ke media sosial."', confidence:96, tactics:['FEAR','ISOLATION'], source:'GASA 2024', time:'00:15' }},
    ]
  },
]

function getScriptsForLang(lang) {
  const map = { id:SCRIPTS_ID }
  return map[lang] || SCRIPTS_EN
}

/* ━━━ Tech chips & helpers ━━━ */
const TECH_ITEMS = [
  { icon:'🦀', name:'RUST WASM',   sub:'Audio Engine · Zero-copy',  c:'#ff9500' },
  { icon:'🐍', name:'PYTHON',      sub:'FastAPI · Cloud Run',        c:'#30d158' },
  { icon:'✦',  name:'GEMINI LIVE', sub:'Real-time AI Analysis',      c:'#00d4ff' },
  { icon:'☁',  name:'CLOUD RUN',   sub:'GCP · Auto-scale',           c:'#7b61ff' },
]

function getNow() {
  return new Date().toLocaleString('en-US',{ timeZone:'America/New_York',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false })+' EST'
}

function TechChip({ item }) {
  const [h,setH]=useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 12px',marginBottom:3,borderLeft:`2px solid ${h?item.c:item.c+'35'}`,background:h?item.c+'0f':'rgba(255,255,255,0.01)',boxShadow:h?`0 0 16px ${item.c}22,inset 0 0 12px ${item.c}06`:'none',transition:'all 0.18s ease',cursor:'default' }}>
      <span style={{ fontSize:16,filter:h?`drop-shadow(0 0 6px ${item.c})`:'none',transition:'filter 0.2s' }}>{item.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:PF,fontSize:7,color:h?item.c:item.c+'cc',textShadow:h?`0 0 10px ${item.c}`:'none',transition:'all 0.2s' }}>{item.name}</div>
        <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.38)',marginTop:2 }}>{item.sub}</div>
      </div>
      {h&&<div style={{ width:4,height:4,background:item.c,boxShadow:`0 0 6px ${item.c}` }} />}
    </div>
  )
}

function LiveTranscript({ lines, speaking }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [lines])
  return (
    <div ref={ref} style={{ background:'rgba(0,0,0,0.6)',border:'1px solid rgba(0,212,255,0.12)',padding:'12px 16px',maxHeight:160,overflowY:'auto',marginBottom:16 }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
        <div style={{ fontFamily:PF,fontSize:6,color:'rgba(0,212,255,0.6)',letterSpacing:2 }}>LIVE TRANSCRIPT</div>
        {speaking && (
          <div style={{ display:'flex',gap:2,alignItems:'center' }}>
            {[0,1,2,3,4].map(i=><div key={i} style={{ width:2,background:'#ff2d55',animation:`vb 0.35s ease-in-out ${i*0.08}s infinite alternate`,height:4+Math.random()*8 }} />)}
            <style>{`@keyframes vb{0%{height:3px;opacity:0.4}100%{height:14px;opacity:1}}`}</style>
            <span style={{ fontFamily:MF,fontSize:8,color:'#ff2d55',marginLeft:4,animation:'blink 0.8s step-end infinite' }}>CALLER SPEAKING</span>
          </div>
        )}
      </div>
      {lines.length===0
        ? <div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.2)',fontStyle:'italic' }}>Waiting for audio input...</div>
        : lines.map((l,i)=>(
          <div key={i} style={{ fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.75)',lineHeight:1.7,padding:'3px 0',borderLeft:l.flagged?'2px solid #ff2d55':'2px solid transparent',paddingLeft:8,background:l.flagged?'rgba(255,45,85,0.06)':'transparent',animation:i===lines.length-1?'fadeUp 0.3s ease':'none' }}>
            <span style={{ color:'rgba(0,212,255,0.4)',fontSize:9,marginRight:8 }}>[{l.time}]</span>
            {l.text}
            {l.flagged&&<span style={{ color:'#ff2d55',fontSize:8,marginLeft:8 }}>⚠ FLAGGED</span>}
          </div>
        ))}
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT — added onTranscriptLine, CallerVisual, AnalysisProgressBar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function MonitorTab({ monitoring,threatLevel,sessionTime,alerts,threatScore,audioLevel,screenOn,onStart,onStop,onToggleScreen,onDemoAlert,onTranscriptLine,language='en' }) {
  const [script,setScript]=useState(null)
  const [now,setNow]=useState(getNow())
  const [speaking,setSpeaking]=useState(false)
  const [transcriptLines,setTranscriptLines]=useState([])
  const [voiceDemo,setVoiceDemo]=useState(false)
  const [demoProgress,setDemoProgress]=useState(0)
  const speechTimers=useRef([])
  const startTimeRef=useRef(null)
  const pendingCount=useRef(0)
  const finished=useRef(false)

  const availableScripts = getScriptsForLang(language)
  useEffect(() => { setScript(null) }, [language])
  useEffect(()=>{ const t=setInterval(()=>setNow(getNow()),1000); return ()=>clearInterval(t) },[])

  useEffect(() => {
    return () => { speechTimers.current.forEach(t=>clearTimeout(t)); window.speechSynthesis?.cancel() }
  }, [])

  useEffect(() => {
    if (!monitoring) {
      setTranscriptLines([]); setVoiceDemo(false); setSpeaking(false); setDemoProgress(0)
      finished.current=false; pendingCount.current=0
      speechTimers.current.forEach(t=>clearTimeout(t)); speechTimers.current=[]
      window.speechSynthesis?.cancel()
    }
  }, [monitoring])

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const avgConf=alerts.length>0?Math.round(alerts.reduce((a,b)=>a+b.confidence,0)/alerts.length):null
  const tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#00d4ff'

  const startVoiceDemo = useCallback((sel) => {
    if (!sel||!window.speechSynthesis) return
    speechTimers.current.forEach(t=>clearTimeout(t)); speechTimers.current=[]
    window.speechSynthesis.cancel()
    setVoiceDemo(true); setTranscriptLines([]); setDemoProgress(0)
    finished.current=false; startTimeRef.current=Date.now()
    const sents=sel.sentences; const total=sents.length; pendingCount.current=total

    const go=()=>{
      const voice=getVoiceForLang(language)
      const prefs=VOICE_PREFS[language]||VOICE_PREFS['en']
      sents.forEach((s,idx)=>{
        const timer=setTimeout(()=>{
          const u=new SpeechSynthesisUtterance(s.text)
          if(voice) u.voice=voice
          u.rate=prefs.rate; u.pitch=prefs.pitch; u.volume=1.0
          const elapsed=Date.now()-startTimeRef.current
          const ts=fmt(Math.floor(elapsed/1000))
          u.onstart=()=>setSpeaking(true)
          u.onend=()=>{
            setSpeaking(false)
            setDemoProgress(Math.round(((idx+1)/total)*100))
            pendingCount.current-=1
            if(pendingCount.current<=0&&!finished.current){
              finished.current=true
              const st=setTimeout(()=>onStop(),3000)
              speechTimers.current.push(st)
            }
          }
          const line={text:s.text,time:ts,flagged:!!s.alert}
          setTranscriptLines(prev=>[...prev,line])
          // Send transcript line to parent for report saving
          if(onTranscriptLine) onTranscriptLine(line)
          window.speechSynthesis.speak(u)
          if(s.alert){
            const at=setTimeout(()=>{if(onDemoAlert)onDemoAlert(s.alert)},1800)
            speechTimers.current.push(at)
          }
        },s.delay)
        speechTimers.current.push(timer)
      })
    }

    if(window.speechSynthesis.getVoices().length===0){
      window.speechSynthesis.addEventListener('voiceschanged',go,{once:true})
      setTimeout(go,300)
    } else go()
  },[onDemoAlert,onStop,onTranscriptLine,fmt,language])

  const handleStartWithVoice=()=>{ onStart(); if(script) setTimeout(()=>startVoiceDemo(script),500) }
  const handleStop=()=>{ window.speechSynthesis?.cancel(); speechTimers.current.forEach(t=>clearTimeout(t)); onStop() }

  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 296px',gap:20 }}>
      {/* Add keyframes for progress bar animations */}
      <style>{`
        @keyframes progressShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes progressScan{0%{opacity:0;transform:translateX(-20px)}50%{opacity:1}100%{opacity:0;transform:translateX(20px)}}
      `}</style>

      <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

        <PBox color={monitoring&&threatLevel==='critical'?'#ff2d55':'#00d4ff'} style={{ padding:24,background:'rgba(0,212,255,0.01)',transition:'all 0.5s' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:PF,fontSize:10,color:'#00d4ff',marginBottom:6,textShadow:'0 0 14px #00d4ff' }}>LIVE SESSION MONITOR</div>
              <div style={{ fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.48)' }}>
                {monitoring ? voiceDemo ? `► VOICE DEMO — ${fmt(sessionTime)} — ${demoProgress}%` : `► ANALYZING — ${fmt(sessionTime)}` : '■ READY — SELECT DEMO → START'}
              </div>
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap',justifyContent:'flex-end' }}>
              <PBtn onClick={onToggleScreen} color={screenOn?'#ffd60a':'#7b61ff'}>{screenOn?'■ SCREEN OFF':'◈ SCREEN WATCH'}</PBtn>
              {!monitoring ? <PBtn onClick={handleStartWithVoice} color="#30d158">{script?'▶ START VOICE DEMO':'▶ START'}</PBtn> : <PBtn onClick={handleStop} danger>■ STOP</PBtn>}
            </div>
          </div>

          {/* Caller Visual — blurred face silhouette */}
          <CallerVisual mode="phone" active={voiceDemo && monitoring} />

          <div style={{ background:'rgba(0,0,0,0.5)',padding:'10px 14px',marginBottom:16,border:`1px solid ${tColor}18`,position:'relative',transition:'border-color 0.5s' }}>
            <div style={{ fontFamily:MF,fontSize:9,color:`${tColor}60`,marginBottom:8,letterSpacing:2 }}>
              {voiceDemo?'VOICE DEMO ── SPEECH SYNTHESIS ── REAL-TIME DETECTION':'AUDIO STREAM ── GEMINI LIVE API ── RUST WASM ENGINE'}
            </div>
            <WaveformVisualizer active={monitoring} threatLevel={threatLevel} audioLevel={speaking?0.7:audioLevel} />
            {screenOn&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#7b61ff',textShadow:'0 0 8px #7b61ff',animation:'blink 1.5s step-end infinite' }}>◈ SCREEN</div>}
            {speaking&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff2d55',textShadow:'0 0 8px #ff2d55',animation:'blink 0.6s step-end infinite' }}>🔊 VOICE</div>}
          </div>

          {voiceDemo && <LiveTranscript lines={transcriptLines} speaking={speaking} />}

          {/* Premium Analysis Progress Bar */}
          {voiceDemo && <AnalysisProgressBar progress={demoProgress} threatColor={tColor} />}

          <div style={{ display:'flex',gap:8 }}>
            <StatCard label="THREATS" value={alerts.length} color="#ff2d55" icon="⚠" />
            <StatCard label="PATTERNS" value="50+" color="#00d4ff" icon="◎" />
            <StatCard label="LATENCY" value="<80ms" color="#30d158" icon="⚡" />
            <StatCard label="CONFIDENCE" value={avgConf?`${avgConf}%`:'—'} color="#7b61ff" icon="◆" />
          </div>
        </PBox>

        <PBox color="rgba(255,214,10,0.2)" style={{ padding:16,background:'rgba(255,214,10,0.01)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
            <div style={{ width:6,height:6,background:'#ffd60a',animation:'blink 1s step-end infinite' }} />
            <span style={{ fontFamily:PF,fontSize:7,color:'#ffd60a',letterSpacing:1 }}>VOICE DEMO SCRIPTS</span>
            <span style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.45)' }}>— {language.toUpperCase()} — select → START</span>
          </div>
          <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.35)',marginBottom:12,paddingLeft:14 }}>
            🔊 Voice simulation · Auto-stop on completion · Switch language above for regional scam demos
          </div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:script?12:0 }}>
            {availableScripts.map(s=>(
              <button key={s.id} onClick={()=>setScript(script?.id===s.id?null:s)}
                style={{ fontFamily:MF,fontSize:10,padding:'7px 14px',cursor:'pointer',border:`1px solid ${script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.22)'}`,background:script?.id===s.id?'rgba(255,214,10,0.12)':'transparent',color:script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.52)',transition:'all 0.15s',display:'flex',alignItems:'center',gap:6 }}>
                {s.label}{script?.id===s.id&&<span style={{ fontSize:8 }}>🔊</span>}
              </button>
            ))}
          </div>
          {script&&!voiceDemo&&(
            <div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.55)',lineHeight:1.75,padding:'12px 14px',background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,214,10,0.1)' }}>
              <div style={{ fontFamily:PF,fontSize:6,color:'rgba(255,214,10,0.6)',marginBottom:8,letterSpacing:1 }}>
                PREVIEW — {script.sentences.length} SENTENCES · ~{Math.round(script.sentences[script.sentences.length-1].delay/1000+8)}s · AUTO-STOP
              </div>
              {script.sentences.map((s,i)=>(
                <div key={i} style={{ padding:'2px 0',borderLeft:s.alert?'2px solid #ff2d55':'2px solid transparent',paddingLeft:8,marginBottom:2 }}>
                  <span style={{ color:s.alert?'rgba(255,45,85,0.7)':'rgba(255,255,255,0.4)' }}>{s.text}</span>
                  {s.alert&&<span style={{ fontSize:8,color:'#ff2d55',marginLeft:6 }}>⚠ {s.alert.pattern}</span>}
                </div>
              ))}
            </div>
          )}
        </PBox>

        <PBox color={alerts.length>0?'#ff2d55':'rgba(0,212,255,0.15)'} style={{ padding:20,background:'rgba(0,0,0,0.2)',flex:1 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:PF,fontSize:9,color:'#00d4ff' }}>REAL-TIME ALERTS</div>
              <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:5 }}>{now}</div>
            </div>
            {alerts.length>0&&<div style={{ fontFamily:PF,fontSize:7,padding:'5px 12px',border:'2px solid #ff2d55',color:'#ff2d55',background:'rgba(255,45,85,0.08)',animation:'ppulse 1.5s infinite',flexShrink:0 }}>{alerts.length} DETECTED</div>}
          </div>
          {alerts.length===0 ? (
            <div style={{ textAlign:'center',padding:'52px 0' }}>
              <div style={{ fontSize:38,marginBottom:14,color:'rgba(0,212,255,0.15)' }}>🛡</div>
              <div style={{ fontFamily:PF,fontSize:7,color:'rgba(255,255,255,0.2)',lineHeight:2.5 }}>
                {monitoring?voiceDemo?'LISTENING...\nANALYZING':'MONITORING...':'SELECT DEMO\nTHEN START'}
              </div>
            </div>
          ) : (
            <div style={{ maxHeight:380,overflowY:'auto',paddingRight:4 }}>
              {alerts.map((a,i)=><AlertCard key={a.id} alert={a} index={i} />)}
            </div>
          )}
        </PBox>
      </div>

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
