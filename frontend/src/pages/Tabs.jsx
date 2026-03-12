import { useState, useEffect }  from 'react'
import { PBox, PBtn }            from '../components/Primitives'
import { AlertCard }             from '../components/AlertCard'
import { PixelLogo }             from '../components/PixelLogo'
import ActionAgent               from '../components/ActionAgent'   // [FIX #4] import ActionAgent
import { SCAM_PATTERNS, PSYCH_TACTICS, SEV, PF, MF, LIE_INDICATORS, getActionsForLang, getInterventionForLang } from '../utils/constants'

/* ── Global polish CSS ── */
const tabsCSS = `
@keyframes vbar-shimmer {
  0% { left: -40%; }
  100% { left: 140%; }
}
@keyframes intv-section-glow {
  0%, 100% { box-shadow: inset 0 0 12px rgba(255,45,85,0.02); }
  50% { box-shadow: inset 0 0 20px rgba(255,45,85,0.08), 0 0 12px rgba(255,45,85,0.04); }
}
@keyframes intv-badge-pulse {
  0%, 100% { text-shadow: none; }
  50% { text-shadow: 0 0 8px currentColor; }
}

/* ── [FIX #2] Report tab hover animations ── */
@keyframes rpt-border-cycle {
  0%   { border-color: rgba(0,212,255,0.25); box-shadow: inset 0 0 12px rgba(0,212,255,0.03); }
  33%  { border-color: rgba(123,97,255,0.3); box-shadow: inset 0 0 12px rgba(123,97,255,0.05); }
  66%  { border-color: rgba(255,45,85,0.25); box-shadow: inset 0 0 12px rgba(255,45,85,0.03); }
  100% { border-color: rgba(0,212,255,0.25); box-shadow: inset 0 0 12px rgba(0,212,255,0.03); }
}
@keyframes rpt-psych-cycle {
  0%   { border-color: rgba(255,149,0,0.25); box-shadow: 0 0 14px rgba(255,149,0,0.04); }
  33%  { border-color: rgba(255,45,85,0.3); box-shadow: 0 0 14px rgba(255,45,85,0.06); }
  66%  { border-color: rgba(123,97,255,0.25); box-shadow: 0 0 14px rgba(123,97,255,0.04); }
  100% { border-color: rgba(255,149,0,0.25); box-shadow: 0 0 14px rgba(255,149,0,0.04); }
}
@keyframes rpt-lie-cycle {
  0%   { border-color: rgba(255,45,85,0.25); box-shadow: 0 0 14px rgba(255,45,85,0.04); }
  33%  { border-color: rgba(0,212,255,0.3); box-shadow: 0 0 14px rgba(0,212,255,0.06); }
  66%  { border-color: rgba(255,149,0,0.25); box-shadow: 0 0 14px rgba(255,149,0,0.04); }
  100% { border-color: rgba(255,45,85,0.25); box-shadow: 0 0 14px rgba(255,45,85,0.04); }
}
@keyframes rpt-line-glow {
  0%   { border-left-color: rgba(0,212,255,0.5); }
  33%  { border-left-color: rgba(123,97,255,0.5); }
  66%  { border-left-color: rgba(48,209,88,0.5); }
  100% { border-left-color: rgba(0,212,255,0.5); }
}
.rpt-section { transition: all 0.3s ease; }
.rpt-section:hover { animation: rpt-border-cycle 3s ease infinite; transform: translateY(-1px); }
.rpt-psych { transition: all 0.3s ease; }
.rpt-psych:hover { animation: rpt-psych-cycle 3s ease infinite; transform: translateY(-1px); }
.rpt-lie { transition: all 0.3s ease; }
.rpt-lie:hover { animation: rpt-lie-cycle 3s ease infinite; transform: translateY(-1px); }
.rpt-tline { transition: all 0.18s ease; }
.rpt-tline:hover { background: rgba(0,212,255,0.04) !important; animation: rpt-line-glow 2s ease infinite; border-left-width: 3px !important; transform: translateX(3px); }
.rpt-tline.rpt-flagged:hover { background: rgba(255,45,85,0.08) !important; border-left-color: #ff2d55 !important; animation: none; box-shadow: inset 0 0 14px rgba(255,45,85,0.06); }
.rpt-alert-wrap { transition: all 0.2s ease; }
.rpt-alert-wrap:hover { transform: translateX(3px); filter: brightness(1.1); }

/* ── Psych Tab hover border animations ── */
@keyframes psych-border-glow {
  0%   { border-color: rgba(255,149,0,0.3); box-shadow: 0 0 10px rgba(255,149,0,0.05), inset 0 0 12px rgba(255,149,0,0.03); }
  33%  { border-color: rgba(0,212,255,0.35); box-shadow: 0 0 10px rgba(0,212,255,0.05), inset 0 0 12px rgba(0,212,255,0.03); }
  66%  { border-color: rgba(123,97,255,0.3); box-shadow: 0 0 10px rgba(123,97,255,0.05), inset 0 0 12px rgba(123,97,255,0.03); }
  100% { border-color: rgba(255,149,0,0.3); box-shadow: 0 0 10px rgba(255,149,0,0.05), inset 0 0 12px rgba(255,149,0,0.03); }
}
.psych-section { transition: all 0.3s ease; }
.psych-section:hover { animation: psych-border-glow 3s ease infinite; transform: translateY(-1px); }

/* ── MOBILE RESPONSIVE for Tabs (Psych, Patterns, Report, About) ── */
@media(max-width:768px){
  .vg-psych-frameworks{grid-template-columns:1fr!important}
  .vg-psych-section{flex-direction:column!important}
  .vg-psych-section>div:first-child{min-width:0!important}
  .vg-patterns-grid{grid-template-columns:1fr!important}
  .vg-report-metrics{grid-template-columns:repeat(2,1fr)!important}
  .vg-gallery-grid{grid-template-columns:1fr!important}
  .vg-about-grid{grid-template-columns:1fr!important}
  .vg-about-grid>*{grid-row:auto!important}
  .vg-about-creator{flex-direction:column!important}
  .vg-about-creator>div:first-child{border-right:none!important;border-bottom:1px solid rgba(123,97,255,0.15)}
  .vg-datasources-grid{grid-template-columns:1fr 1fr!important}
  .vg-fullscreen-header{flex-direction:column!important;align-items:flex-start!important}
  .vg-filter-row{flex-direction:column!important}
  .vg-scoring-rubric{flex-wrap:wrap!important}
}
@media(max-width:480px){
  .vg-report-metrics{grid-template-columns:1fr 1fr!important;gap:10px!important}
  .vg-datasources-grid{grid-template-columns:1fr!important}
  .vg-gallery-card-meta{flex-direction:column!important;gap:4px!important}
}
`

/* ── Score Interpretation ── */
function getInterpretation(score) {
  if(score===0) return { level:'INACTIVE', color:'rgba(255,255,255,0.25)', text:'No activity detected in this vector.' }
  if(score<=20) return { level:'LOW', color:'#30d158', text:'Minimal presence. Caller may be testing this approach.' }
  if(score<=40) return { level:'MODERATE', color:'#ffd60a', text:'Noticeable pattern. Stay alert — this tactic is being deployed.' }
  if(score<=60) return { level:'ELEVATED', color:'#ff9500', text:'Active manipulation. The caller is deliberately using this technique.' }
  if(score<=80) return { level:'HIGH', color:'#ff2d55', text:'Intense pressure. Strong likelihood of scam — exercise extreme caution.' }
  return { level:'CRITICAL', color:'#ff2d55', text:'Maximum intensity. This is a confirmed manipulation tactic — disengage immediately.' }
}

/* ══════════════════════════════════════════════════════════
   [FIX] EMERGENCY CONTACTS — Real phone numbers per country
   ────────────────────────────────────────────────────────
   Displayed in both demo mode and live mode.
   Each country has: emergency line, fraud hotline, bank freeze line
══════════════════════════════════════════════════════════ */
const EMERGENCY_CONTACTS = {
  en: {
    country: 'United States', flag: '🇺🇸', emergency: '911',
    contacts: [
      { label: 'Emergency', number: '911', icon: '🚨' },
      { label: 'FTC Fraud Reporting', number: '+1-877-382-4357', icon: '📋' },
      { label: 'FBI IC3 Online', number: 'ic3.gov', icon: '🕵️' },
      { label: 'Identity Theft Hotline', number: '+1-877-438-4338', icon: '🔒' },
      { label: 'Social Security Fraud', number: '+1-800-269-0271', icon: '🏛️' },
    ]
  },
  id: {
    country: 'Indonesia', flag: '🇮🇩', emergency: '110',
    contacts: [
      { label: 'Polisi / Emergency', number: '110', icon: '🚨' },
      { label: 'OJK Konsumen', number: '+62-21-157', icon: '🏦' },
      { label: 'Bareskrim Siber', number: '+62-21-7218484', icon: '🕵️' },
      { label: 'Bank Indonesia', number: '+62-21-131', icon: '💰' },
      { label: 'Kominfo Aduan', number: '+62-21-3452841', icon: '📋' },
    ]
  },
  zh: {
    country: 'China', flag: '🇨🇳', emergency: '110',
    contacts: [
      { label: '报警电话', number: '110', icon: '🚨' },
      { label: '反诈中心', number: '96110', icon: '🛡️' },
      { label: '银保监会投诉', number: '+86-12378', icon: '🏦' },
      { label: '网络违法举报', number: '+86-12321', icon: '📋' },
    ]
  },
  ja: {
    country: 'Japan', flag: '🇯🇵', emergency: '110',
    contacts: [
      { label: '警察', number: '110', icon: '🚨' },
      { label: '警察相談', number: '#9110', icon: '🕵️' },
      { label: '消費者ホットライン', number: '188', icon: '📋' },
      { label: '金融庁相談', number: '+81-3-5251-6811', icon: '🏦' },
    ]
  },
  ko: {
    country: 'South Korea', flag: '🇰🇷', emergency: '112',
    contacts: [
      { label: '경찰', number: '112', icon: '🚨' },
      { label: '금융감독원', number: '1332', icon: '🏦' },
      { label: '사이버수사대', number: '+82-182', icon: '🕵️' },
      { label: '개인정보침해 신고', number: '+82-118', icon: '📋' },
    ]
  },
  es: {
    country: 'Spain', flag: '🇪🇸', emergency: '112',
    contacts: [
      { label: 'Emergencias', number: '112', icon: '🚨' },
      { label: 'Guardia Civil', number: '+34-062', icon: '🕵️' },
      { label: 'INCIBE', number: '+34-017', icon: '🛡️' },
      { label: 'Policía Nacional', number: '+34-091', icon: '👮' },
    ]
  },
  fr: {
    country: 'France', flag: '🇫🇷', emergency: '17',
    contacts: [
      { label: 'Police Secours', number: '17', icon: '🚨' },
      { label: 'Info Escroqueries', number: '+33-0-805-805-817', icon: '📋' },
      { label: 'PHAROS Signalement', number: 'internet-signalement.gouv.fr', icon: '🕵️' },
      { label: 'Banque de France', number: '+33-1-42-92-42-92', icon: '🏦' },
    ]
  },
  hi: {
    country: 'India', flag: '🇮🇳', emergency: '112',
    contacts: [
      { label: 'Emergency', number: '112', icon: '🚨' },
      { label: 'Cyber Crime Helpline', number: '1930', icon: '🕵️' },
      { label: 'RBI Complaint', number: '+91-14440', icon: '🏦' },
      { label: 'Women Helpline', number: '181', icon: '👩' },
      { label: 'cybercrime.gov.in', number: 'Online Portal', icon: '📋' },
    ]
  },
  ar: {
    country: 'Saudi Arabia', flag: '🇸🇦', emergency: '911',
    contacts: [
      { label: 'الطوارئ', number: '911', icon: '🚨' },
      { label: 'كلنا أمن', number: 'Kulluna Amn App', icon: '🛡️' },
      { label: 'SAMA شكاوى', number: '+966-800-125-6666', icon: '🏦' },
      { label: 'الجرائم المعلوماتية', number: '+966-920-020-405', icon: '🕵️' },
    ]
  },
}

function getEmergencyContacts(lang) {
  const key = lang?.split('-')[0] || 'en'
  return EMERGENCY_CONTACTS[key] || EMERGENCY_CONTACTS['en']
}

/* ── Emergency Contacts Component (shown in both demo & live) ── */
function EmergencyContactsPanel({ language, compact = false }) {
  const ec = getEmergencyContacts(language)
  const [expanded, setExpanded] = useState(!compact)
  return (
    <PBox color="#ff2d55" style={{ padding: compact ? 12 : 16, background: 'rgba(255,45,85,0.04)' }}>
      <div
        onClick={() => compact && setExpanded(!expanded)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: compact ? 'pointer' : 'default' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{ec.flag}</span>
          <span style={{ fontFamily: PF, fontSize: compact ? 7 : 8, color: '#ff2d55', textShadow: '0 0 8px #ff2d55' }}>
            🚨 EMERGENCY CONTACTS — {ec.country}
          </span>
        </div>
        {compact && (
          <span style={{ fontFamily: MF, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            {expanded ? '▾' : '▸'}
          </span>
        )}
      </div>
      {expanded && (
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
          {ec.contacts.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px',
              border: '1px solid rgba(255,45,85,0.15)',
              background: 'rgba(255,45,85,0.03)',
            }}>
              <span style={{ fontSize: 14 }}>{c.icon}</span>
              <div>
                <div style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{c.label}</div>
                <div style={{ fontFamily: PF, fontSize: 10, color: '#ff2d55', letterSpacing: 0.5 }}>{c.number}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PBox>
  )
}

/* ── Pie Chart — pseudo-3D with labels showing ABSOLUTE % matching bars ── */
function PieChart({ data, size=120, title }) {
  const total = data.reduce((s,d)=>s+d.value,0) || 1
  let cum = 0
  const slices = data.filter(d=>d.value>0).map(d => {
    const start = cum / total * 360
    cum += d.value
    const end = cum / total * 360
    const mid = (start+end)/2
    return { ...d, start, end, mid, pct: d.value, relPct: Math.round(d.value/total*100) }
  })
  const r = size/2 - 16
  const cx = size/2, cy = size/2
  const arc = (startAngle, endAngle) => {
    const s = (startAngle-90)*Math.PI/180, e = (endAngle-90)*Math.PI/180
    const x1=cx+r*Math.cos(s), y1=cy+r*Math.sin(s), x2=cx+r*Math.cos(e), y2=cy+r*Math.sin(e)
    const large = endAngle-startAngle > 180 ? 1 : 0
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`
  }
  const labelPos = (angle) => {
    const rad = (angle-90)*Math.PI/180
    return { x: cx+(r*0.65)*Math.cos(rad), y: cy+(r*0.65)*Math.sin(rad) }
  }
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
      <svg width={size} height={size} style={{ flexShrink:0, transform:'perspective(200px) rotateX(12deg)', filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
        <ellipse cx={cx} cy={cy+4} rx={r} ry={r*0.2} fill="rgba(0,0,0,0.3)"/>
        <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        {slices.map((s,i)=>{
          const p = labelPos(s.mid)
          return <g key={i}>
            <path d={arc(s.start,s.end)} fill={s.color+'cc'} stroke="#020408" strokeWidth="1.5" style={{ filter:`drop-shadow(0 0 4px ${s.color}44)` }}/>
            {s.relPct >= 8 && <text x={p.x} y={p.y+3} textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace" fontWeight="bold" style={{ textShadow:'0 1px 2px rgba(0,0,0,0.8)' }}>{s.pct}%</text>}
          </g>
        })}
        {total===0&&<text x={cx} y={cy+3} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">N/A</text>}
      </svg>
      <div style={{ display:'flex',flexWrap:'wrap',gap:4,justifyContent:'center',maxWidth:size+40 }}>
        {data.filter(d=>d.value>0).map((d,i)=>(
          <div key={i} style={{ display:'flex',alignItems:'center',gap:3,padding:'2px 5px' }}>
            <div style={{ width:6,height:6,background:d.color,flexShrink:0,boxShadow:`0 0 4px ${d.color}44` }}/>
            <span style={{ fontFamily:MF,fontSize:7,color:d.color+'cc' }}>{d.label?.split(' ')[0]||''} {d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Country Flags ── */
const FLAGS = { en:'🇺🇸',id:'🇮🇩','zh-CN':'🇨🇳',zh:'🇨🇳',ja:'🇯🇵',ko:'🇰🇷',es:'🇪🇸',fr:'🇫🇷',hi:'🇮🇳',ar:'🇸🇦',de:'🇩🇪',pt:'🇧🇷','pt-BR':'🇧🇷',ru:'🇷🇺',th:'🇹🇭',vi:'🇻🇳',ms:'🇲🇾',tr:'🇹🇷',it:'🇮🇹',nl:'🇳🇱',pl:'🇵🇱',sv:'🇸🇪' }
function getFlag(lang) { return FLAGS[lang] || FLAGS[lang?.split('-')[0]] || '🌐' }

/* ── Social SVGs ── */
const XIcon=({size=12,color='currentColor'})=><svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.422l4.256 5.624 5.316-5.624Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const DiscordIcon=({size=13,color='#7b8cde'})=><svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.225-1.993a.077.077 0 0 0-.041-.107 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.094.246-.194.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419s.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419s.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
const GitHubIcon=({size=13,color='currentColor'})=><svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
function SLink({href,icon,label,c='rgba(255,255,255,0.7)',bc='rgba(255,255,255,0.14)',bg='rgba(255,255,255,0.04)',hc,hbg}){const[h,setH]=useState(false);return<a href={href} target="_blank" rel="noreferrer" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 14px',fontFamily:MF,fontSize:10,color:h?(hc||'#fff'):c,textDecoration:'none',border:`1px solid ${h?(hc||'rgba(255,255,255,0.5)'):bc}`,background:h?(hbg||'rgba(255,255,255,0.08)'):bg,transition:'all 0.16s ease'}}>{icon}{label}</a>}

/* ── Storage ── */
const saveReport=r=>{try{const l=JSON.parse(localStorage.getItem('vg_reports')||'[]');const e={...r,id:Date.now().toString(),savedAt:new Date().toISOString()};l.unshift(e);localStorage.setItem('vg_reports',JSON.stringify(l.slice(0,50)));return e.id}catch{return null}}
const loadReports=()=>{try{return JSON.parse(localStorage.getItem('vg_reports')||'[]')}catch{return[]}}
const delReport=id=>{try{localStorage.setItem('vg_reports',JSON.stringify(loadReports().filter(r=>r.id!==id)))}catch{}}

/* ── Intervention History Section ── */
function InterventionHistorySection({ interventions, language }) {
  if (!interventions || interventions.length === 0) return null
  const levelColors = { LOCKDOWN: '#ff2d55', BLOCK: '#ff9500', WARN: '#ffd60a' }
  const actionLabels = {
    safe_exit: '📵 Safe Exit',
    dismissed: '✕ Dismissed',
    challenge_passed: '✓ Challenge Passed',
    challenge_failed: '⚠ Challenge Failed (Scam Confirmed)',
  }
  return (
    <PBox color="#ff2d55" style={{ padding: 20, background: 'rgba(255,45,85,0.03)', animation: 'intv-section-glow 4s ease-in-out infinite' }}>
      <div style={{ fontFamily: PF, fontSize: 8, color: '#ff2d55', marginBottom: 14, textShadow: '0 0 10px #ff2d55' }}>
        🛑 LIVE INTERVENTIONS ({interventions.length})
      </div>
      <div style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
        VoxGuard actively intervened {interventions.length} time{interventions.length > 1 ? 's' : ''} during this session to protect you from potential harm.
      </div>
      {interventions.map((e, i) => {
        const c = levelColors[e.level] || '#ff9500'
        return (
          <div key={i} style={{ padding: '12px 14px', marginBottom: 6, borderLeft: `3px solid ${c}`, background: `${c}08`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: PF, fontSize: 6, padding: '3px 8px', border: `1px solid ${c}`, color: c, background: `${c}15`, textShadow: `0 0 6px ${c}66`, animation: 'intv-badge-pulse 2.5s ease-in-out infinite' }}>{e.level}</span>
                <span style={{ fontFamily: MF, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{e.pattern}</span>
              </div>
              <div style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                Trigger: {e.trigger === 'instant_pattern' ? '⚡ Instant Pattern' : '📊 Score Threshold'} · Score at time: {e.threatScore}
              </div>
            </div>
            <div style={{ fontFamily: MF, fontSize: 9, color: e.userAction === 'safe_exit' ? '#30d158' : e.userAction === 'challenge_failed' ? '#ff2d55' : 'rgba(255,255,255,0.5)' }}>
              {actionLabels[e.userAction] || e.userAction || '—'}
            </div>
          </div>
        )
      })}
    </PBox>
  )
}

/* ══════════════════════════════════════════════════════════
   [FIX] genHTML — ALL TEXT DARK/VISIBLE on white paper
   ────────────────────────────────────────────────────────
   Key changes v2:
   - ALL text is #111, #222, #333 — NO gray (#aaa, #888, #ccc, #444 avoided)
   - Footer text is #222 not #888
   - Section headers, badges, bars all use strong print-safe colors
   - Pie charts included inline as SVG
   - Action Plan vs Recommended Actions clearly differentiated
   - Audio recording embedded if available
   - Intervention history fully rendered
   - Emergency contacts with real phone numbers per country
   - Transcript text fully black/dark for readability
══════════════════════════════════════════════════════════ */
function genHTML(report) {
  const fmt=s=>s!=null?`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:'—'
  const actionsData=getActionsForLang(report.language||'en')
  const ec=getEmergencyContacts(report.language||'en')

  /* ── Pie Chart SVG generator for print ── */
  const genPieSVG=(entries,title,size=140)=>{
    if(!entries||entries.length===0) return ''
    const items=entries.filter(([k,v])=>v>0)
    if(items.length===0) return ''
    const total=items.reduce((s,[k,v])=>s+v,0)||1
    const colors=['#cc0000','#cc7700','#228833','#005599','#884488','#cc4400']
    let cum=0
    const r=size/2-18, cx=size/2, cy=size/2
    const arc=(s,e)=>{const sa=(s-90)*Math.PI/180,ea=(e-90)*Math.PI/180;const x1=cx+r*Math.cos(sa),y1=cy+r*Math.sin(sa),x2=cx+r*Math.cos(ea),y2=cy+r*Math.sin(ea);const large=e-s>180?1:0;return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
    let sliceHTML=''
    let legendHTML=''
    items.forEach(([k,v],i)=>{
      const start=cum/total*360;cum+=v;const end=cum/total*360
      const mid=(start+end)/2,rad=(mid-90)*Math.PI/180
      const lx=cx+(r*0.6)*Math.cos(rad),ly=cy+(r*0.6)*Math.sin(rad)
      const c=colors[i%colors.length]
      sliceHTML+=`<path d="${arc(start,end)}" fill="${c}" stroke="#fff" stroke-width="1.5"/>`
      if((end-start)/360*100>=8) sliceHTML+=`<text x="${lx}" y="${ly+3}" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold" font-family="monospace" style="text-shadow:0 1px 2px rgba(0,0,0,0.8)">${v}%</text>`
      legendHTML+=`<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 8px 2px 0"><span style="display:inline-block;width:10px;height:10px;background:${c};border:1px solid #ddd"></span><span style="font-size:9px;color:#111;font-weight:bold">${k} ${v}%</span></span>`
    })
    return `<div style="text-align:center;margin:12px 0"><div style="font-size:10px;color:#111;font-weight:bold;margin-bottom:6px">${title}</div><svg width="${size}" height="${size}" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.15))"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>${sliceHTML}</svg><div style="margin-top:6px;font-size:9px">${legendHTML}</div></div>`
  }

  const barHTML=(entries,title)=>{
    if(!entries||entries.length===0) return ''
    return `<h2>${title}</h2>${entries.map(([k,v])=>{
      const c=v>60?'#cc0000':v>30?'#cc7700':v>0?'#228833':'#333'
      return `<div class="bar"><span class="bl">${k}</span><div class="bt"><div class="bf" style="width:${v}%;background:${c}"></div></div><span class="bv" style="color:${c}">${v}%</span></div>`
    }).join('')}`
  }

  /* ── [FIX] Emergency Contacts HTML for PDF ── */
  const emergencyHTML=()=>{
    return `<h2 style="color:#cc0000;border-color:#cc0000">🚨 EMERGENCY CONTACTS — ${ec.flag} ${ec.country}</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:12px">
${ec.contacts.map(c=>`<div style="padding:10px 14px;border:1.5px solid #cc000033;background:#fff5f5">
  <div style="font-size:13px;margin-bottom:2px">${c.icon}</div>
  <div style="font-size:9px;color:#333;font-weight:bold">${c.label}</div>
  <div style="font-size:12px;color:#cc0000;font-weight:bold;letter-spacing:0.5px">${c.number}</div>
</div>`).join('')}
</div>`
  }

  /* ── [FIX] Action Plan HTML — PERSONALIZED recovery steps ── */
  const actionPlanHTML=(report)=>{
    if(!report.actionPlan&&!(report.alerts||[]).length) return ''
    const lang=(report.language||'en').split('-')[0]
    const COUNTRY_DATA={en:{name:'United States',flag:'🇺🇸',emergency:'911'},id:{name:'Indonesia',flag:'🇮🇩',emergency:'110'},zh:{name:'China',flag:'🇨🇳',emergency:'110'},ja:{name:'Japan',flag:'🇯🇵',emergency:'110'},ko:{name:'South Korea',flag:'🇰🇷',emergency:'112'},es:{name:'Spain',flag:'🇪🇸',emergency:'112'},fr:{name:'France',flag:'🇫🇷',emergency:'17'},hi:{name:'India',flag:'🇮🇳',emergency:'112'},ar:{name:'Saudi Arabia',flag:'🇸🇦',emergency:'911'}}
    const country=COUNTRY_DATA[lang]||COUNTRY_DATA['en']
    const plan=report.actionPlan
    const urgency=plan?.urgency_level||(report.threatScore>=75?'CRITICAL':report.threatScore>=45?'HIGH':'MODERATE')
    const urgColors={CRITICAL:'#cc0000',HIGH:'#cc7700',MODERATE:'#228833'}
    const uc=urgColors[urgency]||'#228833'
    const steps=plan?.steps||[]
    if(steps.length===0) return ''
    const urgBadgeColors={immediate:'#cc0000',critical:'#cc0000',high:'#cc7700',recommended:'#228833'}
    return `<h2 style="color:${uc};border-color:${uc}">🛡 ANTI-SCAM ACTION PLAN (AI-PERSONALIZED)</h2>
<div style="padding:10px 14px;border:2px solid ${uc};background:${uc}08;margin-bottom:10px;color:#111;font-size:10px;line-height:1.6">
  <strong style="color:${uc}">This plan is personalized based on the specific scam pattern detected in this session.</strong>
  Unlike the generic Recommended Actions below, these steps are ordered by urgency and tailored to the "${plan?.scam_pattern||'detected'}" attack vector.
</div>
<div style="padding:12px 16px;border:2px solid ${uc};background:${uc}11;margin-bottom:12px">
  <span style="display:inline-block;padding:3px 10px;background:${uc};color:#fff;font-size:9px;font-weight:bold;margin-right:8px">${urgency}</span>
  <span style="font-size:10px;color:#111">${country.flag} ${country.name}</span>
  <span style="font-size:9px;color:#333;margin-left:8px">⏱ ${plan?.estimated_time||'15-60 minutes'}</span>
</div>
${plan?.urgency_message?`<div style="padding:8px 14px;background:#fff8e1;border-left:3px solid ${uc};margin-bottom:10px;font-size:10px;color:#111;font-weight:bold">${plan.urgency_message}</div>`:''}
${plan?.personalized_advice?`<div style="padding:8px 14px;background:#f0f7ff;border-left:3px solid #005599;margin-bottom:12px;font-size:10px;color:#111;line-height:1.6">🤖 <strong>AI Analysis:</strong> ${plan.personalized_advice}</div>`:''}
${steps.map(s=>{const bc=urgBadgeColors[s.urgency]||'#228833';return `<div class="action" style="border-left-color:${bc}"><span style="font-size:13px;margin-right:6px">${s.icon||'▸'}</span><span style="color:#111">${s.action}</span><span class="pri" style="color:${bc}">[${(s.urgency||'recommended').toUpperCase()}]</span></div>`}).join('')}
<div style="padding:10px 14px;background:#fff0f0;border:1px solid #cc000033;margin-top:10px;text-align:center;font-size:10px;color:#cc0000;font-weight:bold">🚨 Emergency: Call ${country.emergency} if you feel in danger</div>
${plan?.disclaimer?`<div style="font-size:8px;color:#333;margin-top:6px;font-style:italic">${plan.disclaimer}</div>`:''}`
  }

  /* ── [FIX] Recommended Actions — GENERIC country-level reference ── */
  const recommendedActionsHTML=(report)=>{
    return `<h2 style="color:#005599;border-color:#005599">📋 RECOMMENDED ACTIONS — ${actionsData.country} (GENERAL REFERENCE)</h2>
<div style="padding:10px 14px;border:1px solid #00559933;background:#f0f7ff;margin-bottom:10px;color:#111;font-size:10px;line-height:1.6">
  <strong>These are standard anti-scam actions for ${actionsData.country}.</strong>
  They apply to all scam types and include reporting channels, emergency contacts, and general protective measures for your region.
</div>
${actionsData.actions.map(a=>`<div class="action" style="border-left-color:#007733"><span style="color:#111">${a.icon} ${a.text}</span><span class="pri pri-${a.priority}" style="color:${a.priority==='critical'?'#cc0000':a.priority==='high'?'#cc7700':'#228833'}">[${a.priority.toUpperCase()}]</span></div>`).join('')}`
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>VoxGuard Forensic Report — ${report.id}</title>
<style>
*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
body{font-family:'Courier New',Courier,monospace;background:#fff;color:#111;padding:0;margin:0;font-size:11px;line-height:1.6}
.page{max-width:860px;margin:0 auto;padding:36px 40px}
h1{color:#cc0000;border-bottom:2px solid #cc0000;padding-bottom:10px;font-size:18px;margin:0 0 6px;letter-spacing:1px}
h2{color:#005599;margin:22px 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid #005599;padding-bottom:5px}
.meta{color:#222;font-size:10px;margin-bottom:18px;line-height:1.8}
.meta strong{color:#111}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:12px 0}
.metric{padding:14px 10px;border:1.5px solid #bbb;text-align:center;background:#f8f8f8}
.metric .v{font-size:22px;font-weight:bold;color:#cc0000}
.metric .l{font-size:8px;color:#222;margin-top:4px;text-transform:uppercase;letter-spacing:1.5px}
.alert{margin:6px 0;padding:10px 14px;border-left:4px solid;background:#f9f9f9;page-break-inside:avoid}
.alert.critical{border-color:#cc0000;background:#fff5f5}
.alert.high{border-color:#cc7700;background:#fff8f0}
.alert.medium{border-color:#997700;background:#fffdf0}
.badge{display:inline-block;font-size:8px;padding:2px 7px;font-weight:bold;margin-right:6px;text-transform:uppercase;border:1.5px solid}
.badge.critical{color:#cc0000;border-color:#cc0000;background:#fff0f0}
.badge.high{color:#cc7700;border-color:#cc7700;background:#fff5e6}
.badge.medium{color:#997700;border-color:#997700;background:#fffbe6}
.quote{color:#222;font-size:10px;margin-top:4px;line-height:1.5;font-style:italic}
.intervened{color:#cc0000;font-size:8px;margin-left:6px;font-weight:bold}
.bar{display:flex;align-items:center;gap:10px;margin:5px 0}
.bl{width:110px;font-size:9px;color:#111;flex-shrink:0;text-transform:uppercase;letter-spacing:0.5px;font-weight:bold}
.bt{flex:1;height:12px;background:#e8e8e8;border:1px solid #ccc;overflow:hidden}
.bf{height:100%}
.bv{font-size:10px;width:44px;text-align:right;font-weight:bold;flex-shrink:0}
.tline{padding:4px 10px;font-size:10px;line-height:1.7;border-left:3px solid transparent;margin:2px 0;color:#111}
.tline.flagged{border-left-color:#cc0000;background:#fff5f5;color:#111}
.tline.me{border-left-color:#228833;color:#111}
.ts{color:#005599;font-size:9px;margin-right:8px;font-weight:bold}
.speaker{font-weight:bold;font-size:8px;margin-right:5px;text-transform:uppercase;letter-spacing:0.5px}
.speaker-me{color:#007722}
.speaker-caller{color:#995500}
.flag{color:#cc0000;font-size:8px;margin-left:6px;font-weight:bold}
.intv{padding:10px 14px;border-left:4px solid;margin:6px 0;background:#f9f9f9;page-break-inside:avoid}
.intv-label{display:inline-block;font-size:7px;padding:2px 7px;font-weight:bold;margin-right:6px;text-transform:uppercase;border:1.5px solid}
.intv-meta{color:#222;font-size:9px;margin-top:2px}
.action{padding:8px 12px;border-left:3px solid #007733;margin:4px 0;font-size:10px;color:#111;background:#f0fff4;page-break-inside:avoid}
.action .pri{font-size:8px;font-weight:bold;margin-left:6px}
.footer{margin-top:28px;padding:14px 0;border-top:2px solid #333;text-align:center;color:#111;font-size:9px}
.footer .brand{color:#005599;font-size:11px;font-weight:bold;letter-spacing:3px}
.footer .sub{margin-top:5px;color:#222}
.footer .powered{margin-top:3px;color:#333;font-style:italic}
@media print{body{margin:0;padding:0}.page{padding:16px 20px}h2{page-break-after:avoid}.alert,.intv,.action{page-break-inside:avoid}}
</style></head><body><div class="page">
<h1>🛡 VOXGUARD — FORENSIC REPORT</h1>
<div class="meta">
  <strong>Date:</strong> ${report.savedAt?new Date(report.savedAt).toLocaleString():'Now'} &nbsp;·&nbsp;
  <strong>Duration:</strong> ${fmt(report.sessionTime)} &nbsp;·&nbsp;
  <strong>Language:</strong> ${(report.language||'en').toUpperCase()} &nbsp;·&nbsp;
  <strong>Country:</strong> ${actionsData.country} &nbsp;·&nbsp;
  <strong>ID:</strong> ${report.id}
</div>
<h2>THREAT SUMMARY</h2>
<div class="grid">
  <div class="metric"><div class="v">${report.threatScore}</div><div class="l">Risk Score</div></div>
  <div class="metric"><div class="v">${report.alerts?.length||0}</div><div class="l">Alerts</div></div>
  <div class="metric"><div class="v">${fmt(report.sessionTime)}</div><div class="l">Duration</div></div>
  <div class="metric"><div class="v">${(report.interventionHistory||[]).length}</div><div class="l">Interventions</div></div>
</div>
${emergencyHTML()}
${(report.transcript||[]).length>0?`<h2>FULL TRANSCRIPT</h2>${(report.transcript||[]).map(l=>{
  const isMe=l.speaker==='me'
  return `<div class="tline${l.flagged?' flagged':''}${isMe?' me':''}"><span class="ts">[${l.time}]</span><span class="speaker ${isMe?'speaker-me':'speaker-caller'}">${isMe?'ME':'CALLER'}</span>${l.text}${l.flagged?'<span class="flag">⚠ FLAGGED</span>':''}</div>`
}).join('')}`:''}
${(report.interventionHistory||[]).length>0?`<h2 style="color:#cc0000;border-color:#cc0000">🛑 LIVE INTERVENTIONS (${report.interventionHistory.length})</h2>
<p style="color:#111;font-size:10px;margin-bottom:10px">VoxGuard actively intervened ${report.interventionHistory.length} time${report.interventionHistory.length>1?'s':''} during this session.</p>
${report.interventionHistory.map(e=>{
  const c=e.level==='LOCKDOWN'?'#cc0000':e.level==='BLOCK'?'#cc7700':'#997700'
  return `<div class="intv" style="border-color:${c}"><span class="intv-label" style="color:${c};border-color:${c}">${e.level}</span><strong style="color:#111">${e.pattern}</strong><span class="intv-meta"> Score: ${e.threatScore} · ${e.trigger==='instant_pattern'?'⚡ Instant':'📊 Score'}</span><div class="quote" style="color:#222">User action: ${e.userAction||'—'}</div></div>`
}).join('')}`:''}
<h2>ALERT TIMELINE</h2>
${(report.alerts||[]).map(a=>{
  const sev=a.severity||'medium'
  return `<div class="alert ${sev}"><span class="badge ${sev}">${sev.toUpperCase()}</span><strong style="color:#111">${a.pattern}</strong><span style="color:#333;font-size:9px;margin-left:4px">${a.time} · ${a.confidence}%</span>${a.triggered_intervention?'<span class="intervened">🛑 INTERVENED</span>':''}<div class="quote">"${(a.quote||'').replace(/"/g,'')}"</div></div>`
}).join('')}
${barHTML(Object.entries(report.psychScores||{}),'PSYCHOLOGICAL VECTORS')}
${genPieSVG(Object.entries(report.psychScores||{}),'Psychological Vector Distribution')}
${barHTML(Object.entries(report.lieScores||{}),'LIE DETECTION ANALYSIS')}
${genPieSVG(Object.entries(report.lieScores||{}),'Lie Detection Distribution')}
${actionPlanHTML(report)}
${recommendedActionsHTML(report)}
<div class="footer">
  <div class="brand">VOXGUARD</div>
  <div class="sub">Built by Wiqi Lee · © 2026 · MIT License · #GeminiLiveAgentChallenge</div>
  <div class="powered">Powered by Gemini Live API · Page 1/1</div>
</div>
</div></body></html>`
}

function getFilename(report) {
  const d = new Date(report.savedAt||Date.now())
  const ds = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`
  return `VoxGuard_Report_${ds}_${(report.language||'en').toUpperCase()}`
}

function exportHTML(report){
  let html = genHTML(report)
  /* [FIX] Embed audio recording if available */
  if(report.audioUrl) {
    html = html.replace('</div></body>',`<h2>🎙 SESSION RECORDING</h2><p style="color:#111;font-size:10px">Audio captured during this session:</p><audio controls src="${report.audioUrl}" style="width:100%;margin:10px 0;border:1px solid #ccc"></audio></div></body>`)
  }
  const b=new Blob([html],{type:'text/html'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`${getFilename(report)}.html`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)
}

function exportPDF(report){
  const html = genHTML(report)
  const w=window.open('','_blank','width=900,height=700')
  if(!w)return
  w.document.write(html)
  w.document.title = `VoxGuard Report — ${getFilename(report)}`
  w.document.close()
  w.onload = () => setTimeout(()=>w.print(),600)
}

/* ═══ Vector Bar ═══ */
function VectorBar({tac,score}){
  const[h,setH]=useState(false);const active=score>0
  const barColors=[tac.color+'55',tac.color+'99',tac.color]
  const interp = getInterpretation(score)
  const tipIdx = Math.max(0, Math.round(score/5) - 1)
  return(
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',marginBottom:4,border:`1px solid ${h?tac.color+'55':tac.color+'18'}`,background:h?tac.color+'0a':'transparent',transition:'all 0.2s ease'}}>
      <span style={{fontSize:16,filter:h||active?`drop-shadow(0 0 6px ${tac.color})`:'none',transition:'filter 0.3s',flexShrink:0}}>{tac.icon}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <span style={{fontFamily:PF,fontSize:7,color:h?tac.color:(active?tac.color:'rgba(255,255,255,0.55)'),letterSpacing:0.5}}>{tac.label}</span>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontFamily:MF,fontSize:8,color:interp.color,opacity:h?1:0,transition:'opacity 0.2s'}}>{interp.level}</span>
            <span style={{fontFamily:PF,fontSize:10,color:tac.color,textShadow:active?`0 0 10px ${tac.color}`:'none'}}>{score}%</span>
          </div>
        </div>
        <div style={{display:'flex',gap:1,height:h?8:6,transition:'height 0.2s'}}>
          {Array.from({length:20}).map((_,i)=>{const filled=i<Math.round(score/5);const ci=i<7?0:i<14?1:2;return<div key={i} style={{flex:1,background:filled?barColors[ci]:tac.color+'12',boxShadow:filled&&i>=14?`0 0 6px ${tac.color}`:'none',transition:'all 0.4s',position:'relative',overflow:'hidden'}}>{filled&&i===tipIdx&&score>10&&<div style={{position:'absolute',inset:0,background:`linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)`,animation:'vbar-shimmer 2.5s ease-in-out infinite'}}/>}</div>})}
        </div>
        {h&&<div style={{marginTop:5}}>
          <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>{tac.desc}</div>
          <div style={{fontFamily:MF,fontSize:8,color:interp.color,marginTop:3,fontStyle:'italic'}}>{interp.text}</div>
        </div>}
      </div>
      {active&&<div style={{fontFamily:PF,fontSize:5,color:tac.color,animation:'blink 1s step-end infinite',flexShrink:0}}>► ACTIVE</div>}
    </div>
  )
}

/* ═══ Action Item ═══ */
const PC={critical:'#ff2d55',high:'#ff9500',medium:'#ffd60a',low:'#30d158'}
function ActionItem({action}){const[h,setH]=useState(false);const pc=PC[action.priority]||'#30d158';return(
  <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{fontFamily:MF,fontSize:11,color:h?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.65)',padding:'10px 12px',marginBottom:2,borderBottom:'1px solid rgba(48,209,88,0.08)',borderLeft:`3px solid ${h?pc:pc+'33'}`,background:h?`linear-gradient(90deg,${pc}12,transparent)`:'transparent',transform:h?'translateX(4px)':'none',transition:'all 0.18s ease',display:'flex',gap:10,alignItems:'flex-start'}}>
    <span style={{fontSize:14,flexShrink:0}}>{action.icon}</span><div style={{flex:1}}>{action.text}</div>
    <div style={{fontFamily:PF,fontSize:5,color:pc,flexShrink:0,opacity:h?1:0.5}}>{action.priority.toUpperCase()}</div>
  </div>
)}

/* ═══ Fullscreen Gallery ═══ */
function GalleryFullscreen({report,onClose,onDelete}){
  if(!report) return null
  const fmt=s=>s!=null?`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:'—'
  const sc=report.threatScore>75?'#ff2d55':report.threatScore>45?'#ff9500':'#30d158'
  const[tab,setTab]=useState('transcript')
  const actionsData=getActionsForLang(report.language||'en')
  const hasInterventions=(report.interventionHistory||[]).length>0
  return(
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.95)',backdropFilter:'blur(10px)',display:'flex',flexDirection:'column'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{flex:1,maxWidth:1000,width:'100%',margin:'0 auto',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'20px 28px',borderBottom:'1px solid rgba(0,212,255,0.15)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0,flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontFamily:PF,fontSize:11,color:'#00d4ff',textShadow:'0 0 10px #00d4ff'}}>SESSION DETAIL</div>
            <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:6}}>
              {new Date(report.savedAt).toLocaleString()} · Duration: <strong style={{color:'#00d4ff'}}>{fmt(report.sessionTime)}</strong> · {(report.language||'en').toUpperCase()} · {actionsData.country}
              {hasInterventions&&<span style={{color:'#ff2d55',marginLeft:8}}>· 🛑 {report.interventionHistory.length} intervention{report.interventionHistory.length>1?'s':''}</span>}
            </div>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <span style={{fontFamily:PF,fontSize:22,color:sc,textShadow:`0 0 14px ${sc}`}}>{report.threatScore}/100</span>
            {report.audioUrl&&(<audio controls src={report.audioUrl} style={{ height:28,maxWidth:180,opacity:0.8 }} />)}
            <button onClick={e=>{e.stopPropagation();onDelete?.()}} style={{fontFamily:PF,fontSize:7,padding:'8px 14px',border:'1px solid #ff2d5555',color:'#ff2d55',background:'rgba(255,45,85,0.08)',cursor:'pointer'}}>🗑 DELETE</button>
            <button onClick={onClose} style={{fontFamily:PF,fontSize:7,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.5)',color:'#fff',background:'rgba(255,255,255,0.06)',cursor:'pointer'}}>✕ CLOSE</button>
          </div>
        </div>
        <div style={{display:'flex',borderBottom:'1px solid rgba(0,212,255,0.1)',flexShrink:0}}>
          {['transcript','alerts',hasInterventions?'interventions':null,'psych','emergency','actions'].filter(Boolean).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'12px',fontFamily:PF,fontSize:7,border:'none',borderBottom:tab===t?'2px solid #00d4ff':'2px solid transparent',background:'transparent',color:tab===t?'#00d4ff':t==='interventions'?'#ff2d55aa':t==='emergency'?'#ff2d55aa':'rgba(255,255,255,0.55)',cursor:'pointer',textTransform:'uppercase',letterSpacing:1}}>{t}{t==='interventions'?` (${(report.interventionHistory||[]).length})`:''}</button>
          ))}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'20px 28px'}}>
          {tab==='transcript'&&((report.transcript||[]).length>0?(report.transcript||[]).map((l,i)=>{const isMe=l.speaker==='me';return<div key={i} style={{fontFamily:MF,fontSize:12,color:isMe?'#30d158':'rgba(255,255,255,0.75)',padding:'6px 0',borderLeft:l.flagged?'3px solid #ff2d55':isMe?'3px solid #30d15844':'3px solid transparent',paddingLeft:12,lineHeight:1.8}}><span style={{color:'rgba(0,212,255,0.5)',fontSize:10,marginRight:10}}>[{l.time}]</span><span style={{fontFamily:PF,fontSize:6,color:isMe?'#30d158':'#ff9500',marginRight:6}}>{isMe?'ME':'CALLER'}</span>{l.text}{l.flagged&&<span style={{color:'#ff2d55',fontSize:9,marginLeft:6}}>⚠</span>}</div>}):<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.25)',fontFamily:MF}}>No transcript</div>)}
          {tab==='alerts'&&(report.alerts||[]).map((a,i)=><AlertCard key={i} alert={a} index={i}/>)}
          {tab==='interventions'&&<InterventionHistorySection interventions={report.interventionHistory||[]} language={report.language||'en'}/>}
          {tab==='emergency'&&<EmergencyContactsPanel language={report.language||'en'}/>}
          {tab==='psych'&&<>
            <div style={{fontFamily:PF,fontSize:8,color:'#ff9500',marginBottom:12}}>PSYCHOLOGICAL VECTORS</div>
            {PSYCH_TACTICS.map(t=><VectorBar key={t.id} tac={t} score={report.psychScores?.[t.id]||0}/>)}
            <div style={{fontFamily:PF,fontSize:8,color:'#ff2d55',marginTop:20,marginBottom:12}}>LIE DETECTION</div>
            {(LIE_INDICATORS||[]).map(l=><VectorBar key={l.id} tac={l} score={report.lieScores?.[l.id]||0}/>)}
          </>}
          {tab==='actions'&&<>
            <div style={{fontFamily:PF,fontSize:8,color:'#30d158',marginBottom:6}}>RECOMMENDED ACTIONS</div>
            <div style={{fontFamily:MF,fontSize:9,color:'rgba(48,209,88,0.5)',marginBottom:14}}>📍 {actionsData.country}</div>
            {actionsData.actions.map((a,i)=><ActionItem key={i} action={a}/>)}
          </>}
        </div>
        <div style={{display:'flex',gap:8,padding:'16px 28px',borderTop:'1px solid rgba(0,212,255,0.1)',flexShrink:0}}>
          <PBtn onClick={()=>exportPDF(report)} color="#ff9500" style={{flex:1,padding:'10px'}}>↓ PDF</PBtn>
          <PBtn onClick={()=>exportHTML(report)} color="#7b61ff" style={{flex:1,padding:'10px'}}>↓ HTML</PBtn>
        </div>
      </div>
    </div>
  )
}

/* ═══ Gallery ═══ */
function SessionGallery({saved,onRefresh}){
  const[fs,setFs]=useState(null)
  const fmt=s=>s!=null?`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:'—'
  if(!saved.length) return null
  return(
    <div style={{marginTop:32}}>
      <div style={{fontFamily:PF,fontSize:9,color:'rgba(0,212,255,0.7)',marginBottom:16}}>📁 SESSION GALLERY ({saved.length})</div>
      <div className="vg-gallery-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
        {saved.map(r=>{const sc=r.threatScore>75?'#ff2d55':r.threatScore>45?'#ff9500':'#30d158';return<GalleryCard key={r.id} r={r} sc={sc} fmt={fmt} onOpen={()=>setFs(r)} onDel={()=>{delReport(r.id);onRefresh();if(fs?.id===r.id)setFs(null)}}/>})}
      </div>
      <GalleryFullscreen report={fs} onClose={()=>setFs(null)} onDelete={()=>{if(fs){delReport(fs.id);onRefresh();setFs(null)}}}/>
    </div>
  )
}
function GalleryCard({r,sc,fmt,onOpen,onDel}){
  const[h,setH]=useState(false);const ad=getActionsForLang(r.language||'en')
  const intCount=(r.interventionHistory||[]).length
  return(
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onOpen} style={{padding:'14px 16px',cursor:'pointer',border:`1px solid ${h?sc+'66':'rgba(0,212,255,0.18)'}`,background:h?`linear-gradient(135deg,${sc}0c,transparent)`:'rgba(0,0,0,0.2)',boxShadow:h?`0 0 16px ${sc}22`:'none',transform:h?'translateY(-2px)':'none',transition:'all 0.2s',position:'relative'}}>
      <div style={{position:'absolute',top:-1,left:-1,width:12,height:2,background:h?sc:sc+'55'}}/><div style={{position:'absolute',top:-1,left:-1,width:2,height:12,background:h?sc:sc+'55'}}/>
      <div style={{position:'absolute',bottom:-1,right:-1,width:12,height:2,background:h?sc:sc+'55'}}/><div style={{position:'absolute',bottom:-1,right:-1,width:2,height:12,background:h?sc:sc+'55'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <div>
          <div style={{fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.55)'}}>{new Date(r.savedAt).toLocaleString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}</div>
          <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.5)',marginTop:2}}>{(r.language||'en').toUpperCase()} · {ad.country} · {r.alerts?.length||0} alerts · {fmt(r.sessionTime)}{intCount>0?` · 🛑 ${intCount}`:''}</div>
        </div>
        <span style={{fontFamily:PF,fontSize:14,color:sc,textShadow:`0 0 8px ${sc}`}}>{r.threatScore}</span>
      </div>
      <div style={{display:'flex',gap:1,marginBottom:6}}>{Array.from({length:10}).map((_,i)=><div key={i} style={{flex:1,height:4,background:i<Math.round(r.threatScore/10)?sc:sc+'22'}}/>)}</div>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <span style={{fontFamily:MF,fontSize:8,color:h?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.2)'}}>{r.audioUrl?'🎙 Has recording · ':''}{intCount>0?`🛑 ${intCount} intervention${intCount>1?'s':''} · `:''}Click for full report</span>
        <button onClick={e=>{e.stopPropagation();onDel()}} style={{fontFamily:PF,fontSize:5,padding:'3px 8px',border:'1px solid #ff2d5544',color:'#ff2d55',background:'rgba(255,45,85,0.06)',cursor:'pointer',opacity:h?1:0.3}}>✕</button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PSYCH TAB
══════════════════════════════════════════════════════════ */
export function PsychTab({psychScores,lieScores={}}){
  const psychData = PSYCH_TACTICS.map(t=>({label:t.label,value:psychScores[t.id]||0,color:t.color}))
  const lieData = (LIE_INDICATORS||[]).map(l=>({label:l.label,value:lieScores[l.id]||0,color:l.color}))
  return(
    <div>
      <style>{tabsCSS}</style>
      <div style={{marginBottom:24,paddingLeft:18,borderLeft:'3px solid #ff9500'}}>
        <div style={{fontFamily:PF,fontSize:11,color:'#ff9500',textShadow:'0 0 16px #ff9500',marginBottom:10}}>PSYCHOLOGICAL MANIPULATION ANALYZER</div>
        <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.9,maxWidth:780}}>Maps the <span style={{color:'#ff9500'}}>psychological architecture</span> of a manipulation attempt using <span style={{color:'#ff2d55'}}>three analytical frameworks</span>:</div>
      </div>
      <div className="vg-psych-frameworks" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28}}>
        {[
          {title:'Cialdini\'s 6 Principles',desc:'Influence psychology framework (1984). Maps which persuasion vectors the caller is deploying.',color:'#ff9500',icon:'🧠'},
          {title:'FBI CBCA Method',desc:'Criteria-Based Content Analysis. Behavioral lie detection from interrogation research.',color:'#ff2d55',icon:'🔍'},
          {title:'Victim Vulnerability',desc:'Derived susceptibility model. How the manipulation is affecting YOUR decision-making.',color:'#00d4ff',icon:'🛡'},
        ].map(m=>(
          <PBox key={m.title} className="psych-section" color={m.color+'40'} style={{padding:14,background:m.color+'06'}}>
            <div style={{fontSize:20,marginBottom:6}}>{m.icon}</div>
            <div style={{fontFamily:PF,fontSize:6,color:m.color,marginBottom:6}}>{m.title}</div>
            <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>{m.desc}</div>
          </PBox>
        ))}
      </div>
      <div className="psych-section" style={{marginBottom:24,padding:'12px 16px',border:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.015)'}}>
        <div style={{fontFamily:PF,fontSize:6,color:'rgba(255,255,255,0.55)',marginBottom:8,letterSpacing:1}}>SCORING RUBRIC</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {[{l:'0%',c:'rgba(255,255,255,0.25)',t:'Inactive'},{l:'1-20%',c:'#30d158',t:'Low'},{l:'21-40%',c:'#ffd60a',t:'Moderate'},{l:'41-60%',c:'#ff9500',t:'Elevated'},{l:'61-80%',c:'#ff2d55',t:'High'},{l:'81-100%',c:'#ff2d55',t:'Critical'}].map(r=>(
            <div key={r.l} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',border:`1px solid ${r.c}33`,background:`${r.c}08`}}>
              <div style={{width:8,height:8,background:r.c,flexShrink:0}}/>
              <span style={{fontFamily:MF,fontSize:8,color:r.c}}>{r.l}</span>
              <span style={{fontFamily:MF,fontSize:7,color:'rgba(255,255,255,0.55)'}}>{r.t}</span>
            </div>
          ))}
        </div>
      </div>
      <PBox className="psych-section" color="#ff950044" style={{padding:20,marginBottom:16}}>
        <div className="vg-psych-section" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{fontFamily:PF,fontSize:9,color:'#ff9500',textShadow:'0 0 10px #ff9500',marginBottom:4}}>CALLER — MANIPULATION VECTORS</div>
            <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.55)',marginBottom:14}}>Cialdini's 6 influence principles detected from scammer</div>
            {PSYCH_TACTICS.map(t=><VectorBar key={t.id} tac={t} score={psychScores[t.id]||0}/>)}
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <PieChart data={psychData} size={110}/>
            <div style={{fontFamily:MF,fontSize:8,color:'rgba(255,255,255,0.5)'}}>Distribution</div>
          </div>
        </div>
      </PBox>
      <PBox className="psych-section" color="#ff2d5544" style={{padding:20,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{fontFamily:PF,fontSize:9,color:'#ff2d55',textShadow:'0 0 10px #ff2d55',marginBottom:4}}>LIE DETECTION ANALYSIS</div>
            <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.55)',marginBottom:14}}>FBI CBCA behavioral deception indicators</div>
            {(LIE_INDICATORS||[]).map(l=><VectorBar key={l.id} tac={l} score={lieScores[l.id]||0}/>)}
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <PieChart data={lieData} size={110}/>
            <div style={{fontFamily:MF,fontSize:8,color:'rgba(255,255,255,0.5)'}}>Distribution</div>
          </div>
        </div>
      </PBox>
      <PBox className="psych-section" color="#00d4ff44" style={{padding:20,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{fontFamily:PF,fontSize:9,color:'#00d4ff',textShadow:'0 0 10px #00d4ff',marginBottom:4}}>USER VULNERABILITY STATE</div>
            <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.55)',marginBottom:14}}>Your estimated susceptibility based on caller's manipulation intensity</div>
            {(()=>{
              const items=[
                {id:'PANIC',icon:'😰',label:'Panic Level',desc:'Elevated stress may impair decision-making',color:'#ff2d55'},
                {id:'COMPLIANCE',icon:'🫡',label:'Compliance Risk',desc:'Willingness to follow instructions without questioning',color:'#ff9500'},
                {id:'TRUST',icon:'🤝',label:'Misplaced Trust',desc:'False credibility established by caller',color:'#ffd60a'},
              ]
              return items.map(item=>{const s=Math.min(100,Math.round(item.id==='PANIC'?(psychScores.FEAR||0)*0.8+(psychScores.SCARCITY||0)*0.3:item.id==='COMPLIANCE'?(psychScores.AUTHORITY||0)*0.6+(psychScores.COMMITMENT||0)*0.5:(psychScores.RECIPROCITY||0)*0.7+(psychScores.AUTHORITY||0)*0.4));return<VectorBar key={item.id} tac={item} score={s}/>})
            })()}
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <PieChart data={[
              {label:'Panic',value:Math.min(100,Math.round((psychScores.FEAR||0)*0.8+(psychScores.SCARCITY||0)*0.3)),color:'#ff2d55'},
              {label:'Compliance',value:Math.min(100,Math.round((psychScores.AUTHORITY||0)*0.6+(psychScores.COMMITMENT||0)*0.5)),color:'#ff9500'},
              {label:'Trust',value:Math.min(100,Math.round((psychScores.RECIPROCITY||0)*0.7+(psychScores.AUTHORITY||0)*0.4)),color:'#ffd60a'},
            ]} size={110}/>
          </div>
        </div>
      </PBox>
      <PBox color="#ff9500" style={{padding:'22px 28px',background:'rgba(255,149,0,0.03)',position:'relative',overflow:'hidden'}}>
        <div style={{fontFamily:PF,fontSize:8,color:'#ff9500',marginBottom:12}}>WHY THIS IS UNPRECEDENTED</div>
        <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:2,maxWidth:780}}>Every other tool detects scam <span style={{color:'#00d4ff'}}>keywords</span>. VoxGuard detects scam <span style={{color:'#ff9500'}}>cognition</span> + <span style={{color:'#ff2d55'}}>deception</span> + <span style={{color:'#00d4ff'}}>user vulnerability</span>.</div>
      </PBox>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PATTERNS TAB
══════════════════════════════════════════════════════════ */
export function PatternsTab({detectedIds=[]}){
  const[search,setSearch]=useState('');const[filter,setFilter]=useState('all')
  const[selected,setSelected]=useState(null)
  const filtered=SCAM_PATTERNS.filter(p=>(!search||p.category.toLowerCase().includes(search.toLowerCase())||p.description.toLowerCase().includes(search.toLowerCase()))&&(filter==='all'||p.severity===filter))
  return(<div>
    <div style={{marginBottom:20,paddingLeft:16,borderLeft:'3px solid #00d4ff'}}><div style={{fontFamily:PF,fontSize:11,color:'#00d4ff',marginBottom:6}}>PATTERN LIBRARY</div><div style={{fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.55)'}}>50+ verified patterns — FTC · FBI IC3 · GASA · MAS · ACCC</div></div>
    <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{flex:1,minWidth:200,padding:'9px 14px',background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.18)',color:'#e0e0e0',fontFamily:MF,fontSize:11,outline:'none'}}/>
      <div style={{display:'flex',gap:6}}>{['all','critical','high','medium','low'].map(f=>{const fc=f==='all'?'#00d4ff':SEV[f]?.text||'#00d4ff';return<button key={f} onClick={()=>setFilter(f)} style={{padding:'9px 14px',fontFamily:PF,fontSize:6,border:`1px solid ${filter===f?fc:fc+'44'}`,background:filter===f?fc+'18':'transparent',color:filter===f?fc:'rgba(255,255,255,0.5)',cursor:'pointer'}}>{f.toUpperCase()}</button>})}</div>
    </div>
    <div className="vg-patterns-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>{filtered.map(p=>{const c=SEV[p.severity];return<PatternCard key={p.id} p={p} c={c} hit={detectedIds.includes(p.category)} onClick={()=>setSelected(p)}/>})}</div>
    {selected&&(()=>{
      const c=SEV[selected.severity]
      return(
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.95)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} style={{maxWidth:700,width:'100%',maxHeight:'90vh',overflowY:'auto',padding:32,border:`1px solid ${c.border}55`,background:'rgba(2,4,8,0.98)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
              <div>
                <div style={{fontFamily:PF,fontSize:6,padding:'4px 10px',border:`1px solid ${c.border}`,color:c.text,background:c.bg,display:'inline-block',marginBottom:8}}>{selected.severity.toUpperCase()}</div>
                <div style={{fontFamily:PF,fontSize:12,color:c.text,textShadow:`0 0 10px ${c.border}`}}>{selected.category}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{fontFamily:PF,fontSize:7,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.5)',color:'#fff',background:'rgba(255,255,255,0.06)',cursor:'pointer'}}>✕ CLOSE</button>
            </div>
            <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.8,marginBottom:20}}>{selected.description}</div>
            <div style={{fontFamily:PF,fontSize:7,color:'#ff9500',marginBottom:10}}>MECHANISM</div>
            <div style={{fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.6)',marginBottom:20,padding:'10px 14px',borderLeft:`3px solid #ff9500`,background:'rgba(255,149,0,0.04)'}}>⚙ {selected.mechanism}</div>
            <div style={{fontFamily:PF,fontSize:7,color:'#00d4ff',marginBottom:10}}>LINGUISTIC MARKERS</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>{selected.markers.map((m,i)=><span key={i} style={{fontFamily:MF,fontSize:10,padding:'5px 10px',border:'1px solid rgba(0,212,255,0.25)',color:'#00d4ff',background:'rgba(0,212,255,0.06)'}}>"{m}"</span>)}</div>
            <div style={{fontFamily:PF,fontSize:7,color:'#7b61ff',marginBottom:10}}>INTERPRETATION</div>
            <div style={{fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.6)',lineHeight:1.8,padding:'12px 14px',borderLeft:'3px solid #7b61ff',background:'rgba(123,97,255,0.04)'}}>
              When this pattern is detected, it means the caller is employing a <strong style={{color:c.text}}>{selected.severity}-severity</strong> manipulation technique.
              The mechanism combines <strong style={{color:'#ff9500'}}>{selected.mechanism.toLowerCase()}</strong> to override the victim's rational decision-making.
              Common in scams reported to <strong style={{color:'#00d4ff'}}>{selected.source}</strong>.
              {selected.severity==='critical'&&' This pattern alone is sufficient to classify the call as a scam with high confidence.'}
              {selected.severity==='high'&&' This pattern is a strong indicator — combined with other signals, it confirms a scam.'}
              {selected.severity==='medium'&&' This pattern warrants caution — monitor for additional indicators before concluding.'}
            </div>
            <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.5)',marginTop:20}}>Source: {selected.source} · Pattern ID: {selected.id}</div>
          </div>
        </div>
      )
    })()}
  </div>)
}
function PatternCard({p,c,hit,onClick}){const[h,setH]=useState(false);return(
  <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:16,border:`1px solid ${h?c.border:c.border+'50'}`,background:h?c.bg:'rgba(0,0,0,0.22)',boxShadow:h?`0 0 20px ${c.border}28`:'none',transition:'all 0.2s',position:'relative',cursor:'pointer'}}>
    <div style={{position:'absolute',top:-1,left:-1,width:16,height:2,background:c.border+'88'}}/><div style={{position:'absolute',top:-1,left:-1,width:2,height:16,background:c.border+'88'}}/>
    <div style={{position:'absolute',bottom:-1,right:-1,width:16,height:2,background:c.border+'88'}}/><div style={{position:'absolute',bottom:-1,right:-1,width:2,height:16,background:c.border+'88'}}/>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><div style={{fontFamily:PF,fontSize:7,color:h?c.text:'rgba(255,255,255,0.82)',flex:1,paddingRight:8,lineHeight:1.6}}>{p.category}</div><div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>{hit&&<div style={{fontFamily:PF,fontSize:6,color:c.text,animation:'blink 1s step-end infinite'}}>► HIT</div>}<div style={{fontFamily:PF,fontSize:6,padding:'3px 8px',border:`1px solid ${c.border}`,color:c.text,background:c.bg}}>{p.severity.toUpperCase()}</div></div></div>
    <div style={{fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.58)',marginBottom:10,lineHeight:1.65}}>{p.description}</div>
    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>{p.markers.map((m,i)=><span key={i} style={{fontFamily:MF,fontSize:9,padding:'3px 7px',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.52)',background:'rgba(255,255,255,0.03)'}}>"{m}"</span>)}</div>
    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontFamily:MF,fontSize:9,color:'#ff9500'}}>⚙ {p.mechanism}</span><span style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.55)'}}>{p.source}</span></div>
  </div>
)}

/* ══════════════════════════════════════════════════════════
   [FIX] REPORT TAB — Action Plan vs Recommended Actions clearly separated
   + Emergency Contacts shown always
══════════════════════════════════════════════════════════ */
export function ReportTab({alerts,sessionTime,threatScore,psychScores,lieScores={},transcript=[],language='en',audioUrl=null,interventionHistory=[],actionPlan=null,onCloseActionPlan}){
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const[saved,setSaved]=useState([]);const[msg,setMsg]=useState('')
  useEffect(()=>setSaved(loadReports()),[])
  const cur={alerts,sessionTime,threatScore,psychScores,lieScores,transcript,language,interventionHistory,actionPlan,id:Date.now().toString(),savedAt:new Date().toISOString()}
  const actionsData=getActionsForLang(language)
  const doSave=()=>{if(!alerts.length)return;saveReport({alerts,sessionTime,threatScore,psychScores,lieScores,transcript,language,interventionHistory,actionPlan,audioUrl});setSaved(loadReports());setMsg('✓ Saved!');setTimeout(()=>setMsg(''),2500)}

  return(<div style={{maxWidth:900,margin:'0 auto'}}>
    <style>{tabsCSS}</style>
    <div style={{marginBottom:20,paddingLeft:16,borderLeft:'3px solid #00d4ff'}}><div style={{fontFamily:PF,fontSize:11,color:'#00d4ff'}}>SESSION FORENSIC REPORT</div></div>
    {alerts.length===0?(<PBox color="#00d4ff20" style={{padding:60,textAlign:'center'}}><div style={{fontFamily:PF,fontSize:8,color:'rgba(255,255,255,0.25)',lineHeight:3}}>NO SESSION DATA<br/>START A SESSION FIRST</div></PBox>):(
      <div style={{display:'flex',flexDirection:'column',gap:14}}>

        {/* [FIX #4] ActionAgent — AI-PERSONALIZED recovery (shown at top when available) */}
        {actionPlan && (
          <div>
            <div style={{fontFamily:PF,fontSize:8,color:'#ff9500',marginBottom:8,textShadow:'0 0 10px #ff9500'}}>
              🛡 AI-PERSONALIZED ACTION PLAN
            </div>
            <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,149,0,0.6)',marginBottom:8}}>
              Tailored to the specific scam pattern detected in this session. Steps are prioritized by urgency.
            </div>
            <ActionAgent plan={actionPlan} onClose={onCloseActionPlan} />
          </div>
        )}

        <PBox color="#ff2d55" style={{padding:24,background:'rgba(255,45,85,0.04)'}}>
          <div style={{fontFamily:PF,fontSize:9,color:'#ff2d55',marginBottom:16}}>⚠ HIGH RISK — SCAM DETECTED</div>
          <div className="vg-report-metrics" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {[{l:'DURATION',v:fmt(sessionTime),c:'#00d4ff'},{l:'THREATS',v:alerts.length,c:'#ff2d55'},{l:'RISK SCORE',v:`${threatScore}/100`,c:'#ff2d55'},{l:'INTERVENTIONS',v:interventionHistory.length,c:interventionHistory.length>0?'#ff9500':'#30d158'}].map(item=>(
              <div key={item.l}><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.45)',marginBottom:5}}>{item.l}</div><div style={{fontFamily:PF,fontSize:15,color:item.c,textShadow:`0 0 12px ${item.c}`}}>{item.v}</div></div>
            ))}
          </div>
        </PBox>

        {/* [FIX] Emergency Contacts — Always shown in Report */}
        <EmergencyContactsPanel language={language} />

        {/* Transcript with hover animations */}
        {transcript.length>0&&(<PBox className="rpt-section" color="#00d4ff25" style={{padding:20}}><div style={{fontFamily:PF,fontSize:8,color:'#00d4ff',marginBottom:14}}>FULL TRANSCRIPT ({transcript.length})</div><div style={{maxHeight:200,overflowY:'auto'}}>{transcript.map((l,i)=>{const isMe=l.speaker==='me';return<div key={i} className={`rpt-tline${l.flagged?' rpt-flagged':''}`} style={{fontFamily:MF,fontSize:10,color:isMe?'#30d158':'rgba(255,255,255,0.65)',lineHeight:1.7,padding:'3px 0',borderLeft:l.flagged?'2px solid #ff2d55':isMe?'2px solid #30d15844':'2px solid transparent',paddingLeft:8}}><span style={{color:'rgba(0,212,255,0.5)',fontSize:9,marginRight:6}}>[{l.time}]</span><span style={{fontFamily:PF,fontSize:5,color:isMe?'#30d158':'#ff9500',marginRight:4}}>{isMe?'ME':'CALLER'}</span>{l.text}{l.flagged&&<span style={{color:'#ff2d55',fontSize:8,marginLeft:6}}>⚠</span>}</div>})}</div></PBox>)}

        {/* Intervention History */}
        {interventionHistory.length>0&&(
          <InterventionHistorySection interventions={interventionHistory} language={language}/>
        )}

        {/* Alert Timeline with hover */}
        <PBox className="rpt-section" color="#00d4ff25" style={{padding:20}}><div style={{fontFamily:PF,fontSize:8,color:'#00d4ff',marginBottom:14}}>ALERT TIMELINE</div>{alerts.map((a,i)=><div key={a.id} className="rpt-alert-wrap"><AlertCard alert={a} index={i}/></div>)}</PBox>

        {/* Psych Vectors */}
        <PBox className="rpt-psych" color="#ff950040" style={{padding:20}}>
          <div style={{fontFamily:PF,fontSize:8,color:'#ff9500',marginBottom:14}}>PSYCHOLOGICAL VECTORS</div>
          {PSYCH_TACTICS.map(t=><VectorBar key={t.id} tac={t} score={psychScores[t.id]||0}/>)}
        </PBox>

        {/* Lie Detection */}
        <PBox className="rpt-lie" color="#ff2d5544" style={{padding:20}}>
          <div style={{fontFamily:PF,fontSize:8,color:'#ff2d55',marginBottom:14}}>LIE DETECTION</div>
          {(LIE_INDICATORS||[]).map(l=><VectorBar key={l.id} tac={l} score={lieScores[l.id]||0}/>)}
        </PBox>

        {/* [FIX] Recommended Actions — GENERIC per-country reference */}
        <PBox className="rpt-section" color="#30d158" style={{padding:20}}>
          <div style={{fontFamily:PF,fontSize:8,color:'#30d158',marginBottom:6}}>📋 RECOMMENDED ACTIONS — GENERAL REFERENCE</div>
          <div style={{fontFamily:MF,fontSize:9,color:'rgba(48,209,88,0.5)',marginBottom:6}}>
            Standard anti-scam actions for your region. These apply to all scam types.
          </div>
          <div style={{fontFamily:MF,fontSize:11,color:'rgba(48,209,88,0.7)',marginBottom:14,padding:'8px 12px',border:'1px solid rgba(48,209,88,0.2)',background:'rgba(48,209,88,0.04)',display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:18}}>{getFlag(language)}</span>
            <span>📍 {actionsData.country}</span>
          </div>
          {actionsData.actions.map((a,i)=><ActionItem key={i} action={a}/>)}
        </PBox>

        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <PBtn onClick={doSave} color="#00d4ff" style={{flex:1,padding:'12px'}}>💾 SAVE</PBtn>
          <PBtn onClick={()=>exportHTML(cur)} color="#7b61ff" style={{flex:1,padding:'12px'}}>↓ HTML</PBtn>
          <PBtn onClick={()=>exportPDF(cur)} color="#ff9500" style={{flex:1,padding:'12px'}}>↓ PDF</PBtn>
          {msg&&<span style={{fontFamily:MF,fontSize:11,color:'#30d158'}}>{msg}</span>}
        </div>
      </div>
    )}
    <SessionGallery saved={saved} onRefresh={()=>setSaved(loadReports())}/>
  </div>)
}

/* ══════════════════════════════════════════════════════════
   ABOUT TAB — [FIX] Added more data sources with credible links
══════════════════════════════════════════════════════════ */
function DataSourceCard({name,url,href,c}){const[h,setH]=useState(false);return<a href={href} target="_blank" rel="noreferrer" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:'12px 14px',border:`1px solid ${h?c+'88':c+'22'}`,borderLeft:`2px solid ${h?c:c+'55'}`,background:h?c+'0f':'rgba(255,255,255,0.015)',transition:'all 0.18s',textDecoration:'none',display:'block'}}><div style={{fontFamily:MF,fontSize:11,color:h?c:c+'cc',marginBottom:3}}>{name}</div><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.5)'}}>{url}</div></a>}
function Tag({label,c}){const[h,setH]=useState(false);return<span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'inline-block',padding:'5px 12px',fontFamily:MF,fontSize:10,color:h?c:'rgba(255,255,255,0.7)',border:`1px solid ${h?c:c+'44'}`,background:h?c+'12':'rgba(255,255,255,0.03)',transition:'all 0.16s',whiteSpace:'nowrap'}}>{label}</span>}

export function AboutTab(){
  const R=['Data Scientist','AI/ML Researcher','Software Engineer','Cellist'],L=['Python','Java','Rust','Julia']
  const RC=['#00d4ff','#7b61ff','#30d158','#ffd60a'],LC=['#ff9500','#00d4ff','#ff2d55','#30d158']
  return(<div style={{maxWidth:900,margin:'0 auto'}}>
    <div className="vg-about-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
      <PBox color="#ff2d55" style={{padding:32,background:'rgba(255,45,85,0.02)',gridRow:'span 2'}}>
        <div style={{fontFamily:PF,fontSize:9,color:'#ff2d55',marginBottom:16,textShadow:'0 0 12px #ff2d55'}}>THE PROBLEM</div>
        <div style={{fontFamily:MF,fontSize:13,color:'rgba(255,255,255,0.7)',lineHeight:2.1}}>
          A grandmother in Tokyo wires her life savings to a stranger impersonating her grandson. A father in Jakarta shares his OTP because the caller said his daughter was in the hospital. A retiree in Ohio buys $5,000 in gift cards because "the IRS" threatened arrest.
          <br/><br/>
          <span style={{color:'rgba(255,255,255,0.45)',fontSize:11}}>Every single one of them knew about scams. None of them recognized it was happening <span style={{color:'#ff2d55'}}>to them</span>, <span style={{color:'#ff2d55'}}>in that moment</span>.</span>
          <br/><br/>
          <span style={{fontFamily:PF,fontSize:7,color:'rgba(255,255,255,0.4)',letterSpacing:1}}>FBI IC3 2024 — UNITED STATES ALONE</span>
          <span style={{fontFamily:PF,fontSize:20,color:'#ff2d55',display:'block',margin:'8px 0',textShadow:'0 0 20px #ff2d55'}}>$16.6 BILLION</span>
          <span style={{fontFamily:PF,fontSize:7,color:'rgba(255,255,255,0.4)',letterSpacing:1}}>GASA 2024 — GLOBAL ESTIMATE</span>
          <span style={{fontFamily:PF,fontSize:20,color:'#ff2d55',display:'block',margin:'8px 0',textShadow:'0 0 20px #ff2d55'}}>$1.03 TRILLION</span>
          <div style={{marginTop:16,padding:'12px 16px',borderLeft:'3px solid #ff9500',background:'rgba(255,149,0,0.04)'}}>
            <span style={{color:'#ff9500',fontFamily:PF,fontSize:7}}>THE FATAL FLAW</span><br/>
            <span style={{color:'rgba(255,255,255,0.6)',fontSize:12,lineHeight:1.8}}>Truecaller blocks numbers. ScamShield flags known callers. Hiya warns before you pick up. <strong style={{color:'#ff2d55'}}>Every tool acts before or after the call — none of them protect you during.</strong></span>
          </div>
          <div style={{marginTop:12,padding:'12px 16px',borderLeft:'3px solid #30d158',background:'rgba(48,209,88,0.04)'}}>
            <span style={{color:'#30d158',fontFamily:PF,fontSize:7}}>WHAT VOXGUARD DOES DIFFERENTLY</span><br/>
            <span style={{color:'rgba(255,255,255,0.6)',fontSize:12,lineHeight:1.8}}>VoxGuard listens while you talk. When the caller asks for your OTP, VoxGuard <strong style={{color:'#30d158'}}>takes over your screen and stops you</strong> from giving it away. The scammer is still talking — but you are now thinking.</span>
          </div>
        </div>
      </PBox>
      <PBox color="#ff9500" style={{padding:28}}>
        <div style={{fontFamily:PF,fontSize:9,color:'#ff9500',marginBottom:12,textShadow:'0 0 10px #ff9500'}}>WHAT'S NEW</div>
        <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.68)',lineHeight:1.9}}>
          World's <span style={{color:'#ff9500'}}>first</span> real-time multimodal scam detection with <span style={{color:'#ff2d55'}}>active intervention</span>.<br/><br/>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Gemini Live API streams audio in real-time. Rust WASM preprocesses at &lt;80ms. The threat engine scores every 500ms. When danger is detected → full-screen intervention fires.</span>
        </div>
      </PBox>
      <PBox color="#7b61ff" style={{padding:28}}>
        <div style={{fontFamily:PF,fontSize:9,color:'#7b61ff',marginBottom:12,textShadow:'0 0 10px #7b61ff'}}>PSYCH + LIE DETECT</div>
        <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.68)',lineHeight:1.9}}>
          <span style={{color:'#ff9500'}}>6 Cialdini vectors</span> map which persuasion buttons the caller is pushing. <span style={{color:'#ff2d55'}}>5 FBI CBCA indicators</span> detect deception in real-time. <span style={{color:'#00d4ff'}}>User vulnerability state</span> shows how the manipulation is affecting <em>your</em> decision-making.
        </div>
      </PBox>
    </div>
    <PBox color="#7b61ff" style={{padding:0,marginBottom:16,overflow:'hidden'}}>
      <div style={{height:3,background:'linear-gradient(90deg,#7b61ff,#00d4ff,#ff2d55,#ff9500,#30d158)',backgroundSize:'200%',animation:'rotateHue 4s linear infinite'}}/>
      <div className="vg-about-creator" style={{display:'flex',flexWrap:'wrap'}}>
        <div style={{padding:28,borderRight:'1px solid rgba(123,97,255,0.15)',display:'flex',flexDirection:'column',alignItems:'center',gap:14,minWidth:220}}>
          <div style={{padding:18,border:'1px solid rgba(123,97,255,0.3)',background:'rgba(123,97,255,0.07)'}}><PixelLogo/></div>
          <div style={{textAlign:'center'}}><div style={{fontFamily:PF,fontSize:9,color:'#7b61ff',marginBottom:10}}>WIQI LEE</div><div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'center'}}>{R.map((r,i)=><Tag key={r} label={r} c={RC[i]}/>)}</div></div>
        </div>
        <div style={{padding:28,flex:1,minWidth:280}}>
          <div style={{fontFamily:PF,fontSize:9,color:'#7b61ff',marginBottom:14}}>THE CREATOR</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:18}}>{L.map((l,i)=><Tag key={l} label={l} c={LC[i]}/>)}</div>
          <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.68)',lineHeight:2,marginBottom:22}}>Researcher and engineer at the intersection of ML systems and human safety.<br/><br/><span style={{color:'#ff9500'}}>I do not ship hallucinations.</span></div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <SLink href="https://x.com/wiqi_lee" icon={<XIcon size={11}/>} label="@wiqi_lee" c="rgba(255,255,255,0.75)" bc="rgba(255,255,255,0.15)" bg="rgba(255,255,255,0.05)" hc="#fff"/>
            <SLink href="https://discord.com/users/209385020912173066" icon={<DiscordIcon size={13}/>} label="Discord" c="#7b8cde" bc="rgba(123,140,222,0.25)" bg="rgba(123,140,222,0.06)" hc="#a5b4fc"/>
            <SLink href="https://github.com/wiqilee/VoxGuard" icon={<GitHubIcon size={12}/>} label="GitHub" c="rgba(255,255,255,0.7)" bc="rgba(255,255,255,0.14)" bg="rgba(255,255,255,0.04)" hc="#fff"/>
          </div>
        </div>
      </div>
    </PBox>
    {/* [FIX] Expanded Data Sources with more credible links per country */}
    <PBox color="#30d158" style={{padding:24}}><div style={{fontFamily:PF,fontSize:8,color:'#30d158',marginBottom:14}}>DATA SOURCES & REGIONAL SCAM REFERENCES</div><div className="vg-datasources-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
      <DataSourceCard name="FBI IC3 2024 Annual Report" url="ic3.gov/AnnualReport/Reports/2024" href="https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf" c="#ff2d55"/>
      <DataSourceCard name="FTC Consumer Sentinel" url="ftc.gov/enforcement" href="https://www.ftc.gov/enforcement/consumer-sentinel-network" c="#00d4ff"/>
      <DataSourceCard name="GASA Global Scam Report" url="gasa.org" href="https://www.gasa.org" c="#ffd60a"/>
      <DataSourceCard name="MAS ScamShield (SG)" url="scamshield.org.sg" href="https://www.scamshield.org.sg" c="#7b61ff"/>
      <DataSourceCard name="ACCC ScamWatch (AU)" url="scamwatch.gov.au" href="https://www.scamwatch.gov.au" c="#30d158"/>
      <DataSourceCard name="OJK Indonesia" url="ojk.go.id" href="https://www.ojk.go.id" c="#ff9500"/>
      <DataSourceCard name="Bareskrim Cyber (ID)" url="patrolisiber.id" href="https://patrolisiber.id" c="#ff2d55"/>
      <DataSourceCard name="NPA Japan (警察庁)" url="npa.go.jp" href="https://www.npa.go.jp/bureau/criminal/souni/index.html" c="#00d4ff"/>
      <DataSourceCard name="FSS South Korea (금감원)" url="fss.or.kr" href="https://www.fss.or.kr" c="#7b61ff"/>
      <DataSourceCard name="MHA India Cyber Crime" url="cybercrime.gov.in" href="https://cybercrime.gov.in" c="#ff9500"/>
      <DataSourceCard name="INCIBE Spain" url="incibe.es" href="https://www.incibe.es" c="#ffd60a"/>
      <DataSourceCard name="PHAROS France" url="internet-signalement.gouv.fr" href="https://www.internet-signalement.gouv.fr" c="#30d158"/>
      <DataSourceCard name="SAMA Saudi Arabia" url="sama.gov.sa" href="https://www.sama.gov.sa" c="#ff2d55"/>
      <DataSourceCard name="China Anti-Fraud Center" url="National Anti-Fraud App" href="https://www.mps.gov.cn" c="#00d4ff"/>
      <DataSourceCard name="Interpol Scam Alert" url="interpol.int" href="https://www.interpol.int/en/Crimes/Financial-crime/Online-financial-fraud" c="#7b61ff"/>
    </div></PBox>
  </div>)
}
