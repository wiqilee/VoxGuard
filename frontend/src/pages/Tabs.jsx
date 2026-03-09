import { useState, useEffect }  from 'react'
import { PBox, PBtn }            from '../components/Primitives'
import { AlertCard }             from '../components/AlertCard'
import { PixelLogo }             from '../components/PixelLogo'
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

/* ── Pie Chart — pseudo-3D with labels ── */
function PieChart({ data, size=120, title }) {
  const total = data.reduce((s,d)=>s+d.value,0) || 1
  let cum = 0
  const slices = data.filter(d=>d.value>0).map(d => {
    const start = cum / total * 360
    cum += d.value
    const end = cum / total * 360
    const mid = (start+end)/2
    return { ...d, start, end, mid, pct: Math.round(d.value/total*100) }
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
        {/* Shadow ellipse for 3D effect */}
        <ellipse cx={cx} cy={cy+4} rx={r} ry={r*0.2} fill="rgba(0,0,0,0.3)"/>
        <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        {slices.map((s,i)=>{
          const p = labelPos(s.mid)
          return <g key={i}>
            <path d={arc(s.start,s.end)} fill={s.color+'cc'} stroke="#020408" strokeWidth="1.5" style={{ filter:`drop-shadow(0 0 4px ${s.color}44)` }}/>
            {s.pct >= 8 && <text x={p.x} y={p.y+3} textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace" fontWeight="bold" style={{ textShadow:'0 1px 2px rgba(0,0,0,0.8)' }}>{s.pct}%</text>}
          </g>
        })}
        {total===0&&<text x={cx} y={cy+3} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">N/A</text>}
      </svg>
      {/* Legend */}
      <div style={{ display:'flex',flexWrap:'wrap',gap:4,justifyContent:'center',maxWidth:size+40 }}>
        {data.filter(d=>d.value>0).map((d,i)=>(
          <div key={i} style={{ display:'flex',alignItems:'center',gap:3,padding:'2px 5px' }}>
            <div style={{ width:6,height:6,background:d.color,flexShrink:0,boxShadow:`0 0 4px ${d.color}44` }}/>
            <span style={{ fontFamily:MF,fontSize:7,color:d.color+'cc' }}>{d.label?.split(' ')[0]||''}</span>
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

/* ── Intervention History Section (POLISHED) ── */
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
      <style>{tabsCSS}</style>
      <div style={{ fontFamily: PF, fontSize: 8, color: '#ff2d55', marginBottom: 14, textShadow: '0 0 10px #ff2d55' }}>
        🛑 LIVE INTERVENTIONS ({interventions.length})
      </div>
      <div style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
        VoxGuard actively intervened {interventions.length} time{interventions.length > 1 ? 's' : ''} during this session to protect you from potential harm.
      </div>
      {interventions.map((e, i) => {
        const c = levelColors[e.level] || '#ff9500'
        return (
          <div key={i} style={{
            padding: '12px 14px', marginBottom: 6,
            borderLeft: `3px solid ${c}`,
            background: `${c}08`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontFamily: PF, fontSize: 6, padding: '3px 8px',
                  border: `1px solid ${c}`, color: c, background: `${c}15`,
                  textShadow: `0 0 6px ${c}66`,
                  animation: 'intv-badge-pulse 2.5s ease-in-out infinite',
                }}>
                  {e.level}
                </span>
                <span style={{ fontFamily: MF, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                  {e.pattern}
                </span>
              </div>
              <div style={{ fontFamily: MF, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                Trigger: {e.trigger === 'instant_pattern' ? '⚡ Instant Pattern' : '📊 Score Threshold'} · Score at time: {e.threatScore}
              </div>
            </div>
            <div style={{
              fontFamily: MF, fontSize: 9,
              color: e.userAction === 'safe_exit' ? '#30d158'
                : e.userAction === 'challenge_failed' ? '#ff2d55'
                : 'rgba(255,255,255,0.5)',
            }}>
              {actionLabels[e.userAction] || e.userAction || '—'}
            </div>
          </div>
        )
      })}
    </PBox>
  )
}

/* ══════════════════════════════════════════════════════════
   PREMIUM HTML/PDF EXPORT — colored bars, all sections, footer
   ─────────────────────────────────────────────────────────
   FIX: Comprehensive @media print overrides so all text is
   readable on white paper. Dark-theme hex colors that were
   invisible on white (#888, rgba(255,255,255,*)) are now
   remapped to dark equivalents (#333, #555, #000).
══════════════════════════════════════════════════════════ */
function genHTML(report) {
  const fmt=s=>s!=null?`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:'—'
  const actionsData=getActionsForLang(report.language||'en')
  const barHTML=(entries,title)=>{
    if(!entries||entries.length===0) return ''
    return `<h2>${title}</h2>${entries.map(([k,v])=>{
      const c=v>60?'#ff2d55':v>30?'#ff9500':v>0?'#30d158':'#333'
      return `<div class="bar"><span class="bl">${k}</span><div class="bt"><div class="bf" style="width:${v}%;background:linear-gradient(90deg,${c}88,${c})"></div></div><span class="bv" style="color:${c}">${v}%</span></div>`
    }).join('')}`
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>VoxGuard Forensic Report — ${report.id}</title>
<style>
*{box-sizing:border-box}
body{font-family:'Courier New',monospace;background:#020408;color:#e0e0e0;padding:0;margin:0}
.page{max-width:900px;margin:0 auto;padding:40px}
h1{color:#ff2d55;border-bottom:2px solid #ff2d55;padding-bottom:12px;font-size:20px;margin-bottom:8px}
h2{color:#00d4ff;margin:28px 0 14px;font-size:12px;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid #00d4ff33;padding-bottom:6px}
.meta{color:#999;font-size:11px;margin-bottom:24px;line-height:1.8}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:16px 0}
.metric{padding:18px 14px;border:1px solid #1a1a2e;text-align:center;background:rgba(255,255,255,0.02)}
.metric .v{font-size:26px;font-weight:bold;color:#ff2d55}
.metric .l{font-size:9px;color:#888;margin-top:6px;text-transform:uppercase;letter-spacing:1px}
.alert{margin:10px 0;padding:14px 16px;border-left:4px solid;background:rgba(255,255,255,0.02)}
.critical{border-color:#ff2d55}.high{border-color:#ff9500}.medium{border-color:#ffd60a}
.badge{display:inline-block;font-size:8px;padding:3px 8px;font-weight:bold;margin-right:8px;text-transform:uppercase;border:1px solid}
.badge.critical{color:#ff2d55;border-color:#ff2d55}.badge.high{color:#ff9500;border-color:#ff9500}.badge.medium{color:#ffd60a;border-color:#ffd60a}
.quote{color:rgba(255,255,255,0.55);font-size:11px;margin-top:6px;line-height:1.7}
.bar{display:flex;align-items:center;gap:10px;margin:8px 0}
.bl{width:120px;font-size:10px;color:#ccc;flex-shrink:0}
.bt{flex:1;height:10px;background:#111;border:1px solid #222;overflow:hidden}
.bf{height:100%;transition:width 0.3s}
.bv{font-size:11px;width:44px;text-align:right;font-weight:bold;flex-shrink:0}
.tline{padding:5px 10px;font-size:11px;line-height:1.8;border-left:3px solid transparent;margin:3px 0}
.tline.flagged{border-left-color:#ff2d55;background:rgba(255,45,85,0.06)}
.tline.me{border-left-color:#30d15866}
.ts{color:#00d4ffaa;font-size:10px;margin-right:10px}
.speaker{font-weight:bold;font-size:9px;margin-right:6px}
.flag{color:#ff2d55;font-size:9px;margin-left:8px}
.action{padding:10px 14px;border-left:3px solid #30d158;margin:6px 0;font-size:11px;color:#ccc;background:rgba(48,209,88,0.04)}
.action .pri{font-size:8px;font-weight:bold;margin-left:8px}
.intv{padding:12px 16px;border-left:4px solid;margin:8px 0;background:rgba(255,255,255,0.02)}
.intv .lvl{display:inline-block;font-size:8px;padding:3px 8px;font-weight:bold;margin-right:8px;text-transform:uppercase;border:1px solid}
.footer{margin-top:40px;padding:20px 0;border-top:2px solid #111;text-align:center;color:#666;font-size:10px}
.footer .brand{color:#00d4ff;font-size:12px;font-weight:bold;letter-spacing:2px}

/* ════════════════════════════════════════════════════════
   PRINT STYLES — Full override for white-paper readability
   ════════════════════════════════════════════════════════ */
@media print{
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}

  /* Base: white background, black text */
  body{background:#fff!important;color:#111!important}
  .page{padding:20px}

  /* Headings */
  h1{color:#cc0000!important;border-bottom-color:#cc0000!important}
  h2{color:#005599!important;border-bottom-color:#005599!important}

  /* Metadata */
  .meta{color:#444!important}
  .meta strong{color:#111!important}

  /* Metric grid */
  .metric{border-color:#ddd!important;background:#fafafa!important}
  .metric .v{color:#cc0000!important}
  .metric .l{color:#555!important}

  /* Alert cards */
  .alert{background:#fafafa!important}
  .alert strong{color:#111!important}
  .alert span[style*="color:#888"]{color:#555!important}

  /* Badges — keep colored but ensure contrast */
  .badge.critical{color:#cc0000!important;border-color:#cc0000!important;background:#fff0f0!important}
  .badge.high{color:#cc7700!important;border-color:#cc7700!important;background:#fff8f0!important}
  .badge.medium{color:#997700!important;border-color:#997700!important;background:#fffdf0!important}

  /* Quotes / evidence text */
  .quote{color:#333!important}

  /* Bar chart — labels and track */
  .bl{color:#333!important}
  .bt{background:#eee!important;border-color:#ccc!important}
  .bf{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .bv{-webkit-print-color-adjust:exact!important}

  /* Transcript lines */
  .tline{color:#222!important}
  .tline.flagged{background:#fff0f0!important;border-left-color:#cc0000!important}
  .tline.me{border-left-color:#008833!important}
  .ts{color:#005599!important}
  .speaker{-webkit-print-color-adjust:exact!important}
  .flag{color:#cc0000!important}

  /* ME speaker green → dark green for print */
  .speaker[style*="color:#30d158"],
  .speaker[style*="color: #30d158"]{color:#007722!important}

  /* CALLER speaker orange → dark orange for print */
  .speaker[style*="color:#ff9500"],
  .speaker[style*="color: #ff9500"]{color:#995500!important}

  /* Intervention section */
  .intv{background:#fafafa!important}
  .intv strong{color:#111!important}
  .intv .lvl{-webkit-print-color-adjust:exact!important}
  .intv .quote{color:#333!important}
  .intv span[style*="color:#888"]{color:#555!important}

  /* Action items */
  .action{background:#f0fff4!important;border-color:#007700!important;color:#222!important}
  .action .pri{-webkit-print-color-adjust:exact!important}

  /* Footer */
  .footer{border-color:#ddd!important;color:#666!important}
  .footer .brand{color:#005599!important}

  /* Intervention level-specific overrides for print readability */
  .intv .lvl[style*="#ff2d55"]{color:#cc0000!important;border-color:#cc0000!important}
  .intv .lvl[style*="#ff9500"]{color:#cc7700!important;border-color:#cc7700!important}
  .intv .lvl[style*="#ffd60a"]{color:#997700!important;border-color:#997700!important}

  /* Intervened badge in alerts */
  span[style*="color:#ff2d55"]{color:#cc0000!important}

  /* Generic: any inline rgba(255,255,255,*) text → dark */
  [style*="rgba(255,255,255"]{color:#333!important}
  [style*="color:#888"]{color:#555!important}
  [style*="color:#999"]{color:#555!important}
  [style*="color:#666"]{color:#555!important}
  [style*="color:#ccc"]{color:#333!important}
}
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

${(report.transcript||[]).length>0?`<h2>FULL TRANSCRIPT</h2>${(report.transcript||[]).map(l=>{
  const isMe=l.speaker==='me'
  return `<div class="tline${l.flagged?' flagged':''}${isMe?' me':''}"><span class="ts">[${l.time}]</span><span class="speaker" style="color:${isMe?'#30d158':'#ff9500'}">${isMe?'ME':'CALLER'}</span>${l.text}${l.flagged?'<span class="flag">⚠ FLAGGED</span>':''}</div>`
}).join('')}`:''}

${(report.interventionHistory||[]).length>0?`<h2>LIVE INTERVENTIONS (${report.interventionHistory.length})</h2>
<p style="color:#999;font-size:11px;margin-bottom:12px">VoxGuard actively intervened ${report.interventionHistory.length} time${report.interventionHistory.length>1?'s':''} during this session.</p>
${report.interventionHistory.map(e=>{
  const c=e.level==='LOCKDOWN'?'#ff2d55':e.level==='BLOCK'?'#ff9500':'#ffd60a'
  return `<div class="intv" style="border-color:${c}">
    <span class="lvl" style="color:${c};border-color:${c}">${e.level}</span>
    <strong>${e.pattern}</strong> <span style="color:#888;font-size:10px">Score: ${e.threatScore} · ${e.trigger==='instant_pattern'?'⚡ Instant':'📊 Score'}</span>
    <div class="quote">User action: ${e.userAction||'—'}</div>
  </div>`
}).join('')}`:''}

<h2>ALERT TIMELINE</h2>
${(report.alerts||[]).map(a=>`<div class="alert ${a.severity}"><span class="badge ${a.severity}">${a.severity}</span><strong>${a.pattern}</strong> <span style="color:#888;font-size:10px">${a.time} · ${a.confidence}%</span>${a.triggered_intervention?'<span style="color:#ff2d55;font-size:9px;margin-left:8px">🛑 INTERVENED</span>':''}<div class="quote">"${a.quote.replace(/"/g,'')}"</div></div>`).join('')}

${barHTML(Object.entries(report.psychScores||{}),'PSYCHOLOGICAL VECTORS')}
${barHTML(Object.entries(report.lieScores||{}),'LIE DETECTION ANALYSIS')}

<h2>RECOMMENDED ACTIONS — ${actionsData.country}</h2>
${actionsData.actions.map(a=>`<div class="action">${a.icon} ${a.text}<span class="pri" style="color:${a.priority==='critical'?'#ff2d55':a.priority==='high'?'#ff9500':'#30d158'}">[${a.priority.toUpperCase()}]</span></div>`).join('')}

<div class="footer">
  <div class="brand">VOXGUARD</div>
  <div style="margin-top:6px">Built by Wiqi Lee · © 2026 · MIT License · #GeminiLiveAgentChallenge</div>
  <div style="margin-top:4px;color:#555">Powered by Gemini Live API · Page 1/1</div>
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
  // Add audio player if recording exists
  if(report.audioUrl) {
    html = html.replace('</div></body>',`<h2>SESSION RECORDING</h2><audio controls src="${report.audioUrl}" style="width:100%;margin:10px 0"></audio></div></body>`)
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
  // Wait for render then print
  w.onload = () => setTimeout(()=>w.print(),600)
}

/* ═══ Vector Bar — with interpretation + shimmer on active tip (POLISHED) ═══ */
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
        {/* Header */}
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
            {/* Audio playback if recording exists */}
            {report.audioUrl&&(
              <audio controls src={report.audioUrl} style={{ height:28,maxWidth:180,opacity:0.8 }} />
            )}
            <button onClick={e=>{e.stopPropagation();onDelete?.()}} style={{fontFamily:PF,fontSize:7,padding:'8px 14px',border:'1px solid #ff2d5555',color:'#ff2d55',background:'rgba(255,45,85,0.08)',cursor:'pointer'}}>🗑 DELETE</button>
            <button onClick={onClose} style={{fontFamily:PF,fontSize:7,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.5)',color:'#fff',background:'rgba(255,255,255,0.06)',cursor:'pointer'}}>✕ CLOSE</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid rgba(0,212,255,0.1)',flexShrink:0}}>
          {['transcript','alerts',hasInterventions?'interventions':null,'psych','actions'].filter(Boolean).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'12px',fontFamily:PF,fontSize:7,border:'none',borderBottom:tab===t?'2px solid #00d4ff':'2px solid transparent',background:'transparent',color:tab===t?'#00d4ff':t==='interventions'?'#ff2d55aa':'rgba(255,255,255,0.55)',cursor:'pointer',textTransform:'uppercase',letterSpacing:1}}>{t}{t==='interventions'?` (${(report.interventionHistory||[]).length})`:''}</button>
          ))}
        </div>
        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 28px'}}>
          {tab==='transcript'&&((report.transcript||[]).length>0?(report.transcript||[]).map((l,i)=>{const isMe=l.speaker==='me';return<div key={i} style={{fontFamily:MF,fontSize:12,color:isMe?'#30d158':'rgba(255,255,255,0.75)',padding:'6px 0',borderLeft:l.flagged?'3px solid #ff2d55':isMe?'3px solid #30d15844':'3px solid transparent',paddingLeft:12,lineHeight:1.8}}><span style={{color:'rgba(0,212,255,0.5)',fontSize:10,marginRight:10}}>[{l.time}]</span><span style={{fontFamily:PF,fontSize:6,color:isMe?'#30d158':'#ff9500',marginRight:6}}>{isMe?'ME':'CALLER'}</span>{l.text}{l.flagged&&<span style={{color:'#ff2d55',fontSize:9,marginLeft:6}}>⚠</span>}</div>}):<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.25)',fontFamily:MF}}>No transcript</div>)}
          {tab==='alerts'&&(report.alerts||[]).map((a,i)=><AlertCard key={i} alert={a} index={i}/>)}
          {tab==='interventions'&&<InterventionHistorySection interventions={report.interventionHistory||[]} language={report.language||'en'}/>}
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
        {/* Footer */}
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
      {/* Methodology info */}
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
          <PBox key={m.title} color={m.color+'40'} style={{padding:14,background:m.color+'06'}}>
            <div style={{fontSize:20,marginBottom:6}}>{m.icon}</div>
            <div style={{fontFamily:PF,fontSize:6,color:m.color,marginBottom:6}}>{m.title}</div>
            <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>{m.desc}</div>
          </PBox>
        ))}
      </div>

      {/* Scoring rubric */}
      <div style={{marginBottom:24,padding:'12px 16px',border:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.015)'}}>
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

      {/* ── SECTION 1: Caller Manipulation Vectors ── */}
      <PBox color="#ff950044" style={{padding:20,marginBottom:16}}>
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

      {/* ── SECTION 2: Lie Detection ── */}
      <PBox color="#ff2d5544" style={{padding:20,marginBottom:16}}>
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

      {/* ── SECTION 3: User Vulnerability ── */}
      <PBox color="#00d4ff44" style={{padding:20,marginBottom:16}}>
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

    {/* Fullscreen Pattern Detail */}
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
   REPORT TAB
══════════════════════════════════════════════════════════ */
export function ReportTab({alerts,sessionTime,threatScore,psychScores,lieScores={},transcript=[],language='en',audioUrl=null,interventionHistory=[]}){
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const[saved,setSaved]=useState([]);const[msg,setMsg]=useState('')
  useEffect(()=>setSaved(loadReports()),[])
  const cur={alerts,sessionTime,threatScore,psychScores,lieScores,transcript,language,interventionHistory,id:Date.now().toString(),savedAt:new Date().toISOString()}
  const actionsData=getActionsForLang(language)
  const doSave=()=>{if(!alerts.length)return;saveReport({alerts,sessionTime,threatScore,psychScores,lieScores,transcript,language,interventionHistory,audioUrl});setSaved(loadReports());setMsg('✓ Saved!');setTimeout(()=>setMsg(''),2500)}

  return(<div style={{maxWidth:900,margin:'0 auto'}}>
    <style>{tabsCSS}</style>
    <div style={{marginBottom:20,paddingLeft:16,borderLeft:'3px solid #00d4ff'}}><div style={{fontFamily:PF,fontSize:11,color:'#00d4ff'}}>SESSION FORENSIC REPORT</div></div>
    {alerts.length===0?(<PBox color="#00d4ff20" style={{padding:60,textAlign:'center'}}><div style={{fontFamily:PF,fontSize:8,color:'rgba(255,255,255,0.25)',lineHeight:3}}>NO SESSION DATA<br/>START A SESSION FIRST</div></PBox>):(
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <PBox color="#ff2d55" style={{padding:24,background:'rgba(255,45,85,0.04)'}}>
          <div style={{fontFamily:PF,fontSize:9,color:'#ff2d55',marginBottom:16}}>⚠ HIGH RISK — SCAM DETECTED</div>
          <div className="vg-report-metrics" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {[{l:'DURATION',v:fmt(sessionTime),c:'#00d4ff'},{l:'THREATS',v:alerts.length,c:'#ff2d55'},{l:'RISK SCORE',v:`${threatScore}/100`,c:'#ff2d55'},{l:'INTERVENTIONS',v:interventionHistory.length,c:interventionHistory.length>0?'#ff9500':'#30d158'}].map(item=>(
              <div key={item.l}><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.45)',marginBottom:5}}>{item.l}</div><div style={{fontFamily:PF,fontSize:15,color:item.c,textShadow:`0 0 12px ${item.c}`}}>{item.v}</div></div>
            ))}
          </div>
        </PBox>
        {transcript.length>0&&(<PBox color="#00d4ff25" style={{padding:20}}><div style={{fontFamily:PF,fontSize:8,color:'#00d4ff',marginBottom:14}}>FULL TRANSCRIPT ({transcript.length})</div><div style={{maxHeight:200,overflowY:'auto'}}>{transcript.map((l,i)=>{const isMe=l.speaker==='me';return<div key={i} style={{fontFamily:MF,fontSize:10,color:isMe?'#30d158':'rgba(255,255,255,0.65)',lineHeight:1.7,padding:'3px 0',borderLeft:l.flagged?'2px solid #ff2d55':isMe?'2px solid #30d15844':'2px solid transparent',paddingLeft:8}}><span style={{color:'rgba(0,212,255,0.5)',fontSize:9,marginRight:6}}>[{l.time}]</span><span style={{fontFamily:PF,fontSize:5,color:isMe?'#30d158':'#ff9500',marginRight:4}}>{isMe?'ME':'CALLER'}</span>{l.text}{l.flagged&&<span style={{color:'#ff2d55',fontSize:8,marginLeft:6}}>⚠</span>}</div>})}</div></PBox>)}
        {/* Intervention History */}
        {interventionHistory.length>0&&(
          <InterventionHistorySection interventions={interventionHistory} language={language}/>
        )}
        <PBox color="#00d4ff25" style={{padding:20}}><div style={{fontFamily:PF,fontSize:8,color:'#00d4ff',marginBottom:14}}>ALERT TIMELINE</div>{alerts.map((a,i)=><AlertCard key={a.id} alert={a} index={i}/>)}</PBox>
        {/* Psych + Lie together */}
        <PBox color="#ff950040" style={{padding:20}}>
          <div style={{fontFamily:PF,fontSize:8,color:'#ff9500',marginBottom:14}}>PSYCHOLOGICAL VECTORS</div>
          {PSYCH_TACTICS.map(t=><VectorBar key={t.id} tac={t} score={psychScores[t.id]||0}/>)}
          <div style={{fontFamily:PF,fontSize:8,color:'#ff2d55',marginTop:16,marginBottom:14}}>LIE DETECTION</div>
          {(LIE_INDICATORS||[]).map(l=><VectorBar key={l.id} tac={l} score={lieScores[l.id]||0}/>)}
        </PBox>
        <PBox color="#30d158" style={{padding:20}}>
          <div style={{fontFamily:PF,fontSize:8,color:'#30d158',marginBottom:6}}>RECOMMENDED ACTIONS</div>
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
   ABOUT TAB
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
    <PBox color="#30d158" style={{padding:24}}><div style={{fontFamily:PF,fontSize:8,color:'#30d158',marginBottom:14}}>DATA SOURCES</div><div className="vg-datasources-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
      <DataSourceCard name="FBI IC3 2024 Annual Report" url="ic3.gov/AnnualReport/Reports/2024" href="https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf" c="#ff2d55"/>
      <DataSourceCard name="FTC Consumer Sentinel" url="ftc.gov/enforcement" href="https://www.ftc.gov/enforcement/consumer-sentinel-network" c="#00d4ff"/>
      <DataSourceCard name="GASA Global Scam Report" url="gasa.org" href="https://www.gasa.org" c="#ffd60a"/>
      <DataSourceCard name="MAS ScamShield (SG)" url="scamshield.org.sg" href="https://www.scamshield.org.sg" c="#7b61ff"/>
      <DataSourceCard name="ACCC ScamWatch (AU)" url="scamwatch.gov.au" href="https://www.scamwatch.gov.au" c="#30d158"/>
    </div></PBox>
  </div>)
}