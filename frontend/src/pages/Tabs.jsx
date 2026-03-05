import { useState, useEffect }  from 'react'
import { PBox, PBtn }            from '../components/Primitives'
import { AlertCard }             from '../components/AlertCard'
import { PixelLogo }             from '../components/PixelLogo'
import { SCAM_PATTERNS, PSYCH_TACTICS, SEV, PF, MF } from '../utils/constants'

/* ── Social SVG icons ──────────────────────────────────────── */
const XIcon = ({ size=12,color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.422l4.256 5.624 5.316-5.624Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const DiscordIcon = ({ size=13,color='#7b8cde' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.128 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
const GitHubIcon = ({ size=13,color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>

/* ── Reusable social link button ───────────────────────────── */
function SLink({ href, icon, label, c = 'rgba(255,255,255,0.7)', bc = 'rgba(255,255,255,0.14)', bg = 'rgba(255,255,255,0.04)', hc, hbg }) {
  const [h, setH] = useState(false)
  return (
    <a href={href} target="_blank" rel="noreferrer" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:7,padding:'8px 14px',fontFamily:MF,fontSize:10,color:h?(hc||'#fff'):c,textDecoration:'none',border:`1px solid ${h?(hc||'rgba(255,255,255,0.3)'):bc}`,background:h?(hbg||'rgba(255,255,255,0.08)'):bg,boxShadow:h?`0 0 12px ${hc||'rgba(255,255,255,0.15)'}44`:'none',transform:h?'translateY(-2px)':'none',transition:'all 0.16s ease' }}>
      {icon}{label}
    </a>
  )
}

/* ── Storage helpers ──────────────────────────────────────── */
const saveReport  = r => { try { const list = JSON.parse(localStorage.getItem('ss_reports')||'[]'); const e={...r,id:Date.now().toString(),savedAt:new Date().toISOString()}; list.unshift(e); localStorage.setItem('ss_reports',JSON.stringify(list.slice(0,50))); return e.id } catch{return null} }
const loadReports = () => { try{return JSON.parse(localStorage.getItem('ss_reports')||'[]')}catch{return[]} }
const delReport   = id => { try{ localStorage.setItem('ss_reports',JSON.stringify(loadReports().filter(r=>r.id!==id))) }catch{} }

/* ── HTML export ─────────────────────────────────────────── */
function genHTML(report) {
  const fmt = s => s!=null?`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:'—'
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Scam Shield Forensic Report</title>
<style>body{font-family:'Courier New',monospace;background:#020408;color:#e0e0e0;padding:40px;max-width:860px;margin:0 auto}h1{color:#ff2d55;border-bottom:2px solid #ff2d55;padding-bottom:10px;margin-bottom:8px;font-size:18px}h2{color:#00d4ff;margin:24px 0 10px;font-size:11px;letter-spacing:2px}.meta{color:#555;font-size:10px;margin-bottom:20px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:12px 0}.metric{padding:14px;border:1px solid #1a1a2e;text-align:center}.metric .v{font-size:22px;font-weight:bold;color:#ff2d55}.metric .l{font-size:9px;color:#666;margin-top:4px;letter-spacing:1px;text-transform:uppercase}.alert{margin:8px 0;padding:12px;border-left:4px solid}.critical{border-color:#ff2d55;background:rgba(255,45,85,0.07)}.high{border-color:#ff9500;background:rgba(255,149,0,0.07)}.medium{border-color:#ffd60a;background:rgba(255,214,10,0.05)}.low{border-color:#30d158;background:rgba(48,209,88,0.05)}.badge{display:inline-block;font-size:8px;padding:2px 7px;font-weight:bold;margin-right:8px;text-transform:uppercase}.badge.critical{background:#ff2d5520;color:#ff2d55;border:1px solid #ff2d5560}.badge.high{background:#ff950020;color:#ff9500;border:1px solid #ff950060}.badge.medium{background:#ffd60a20;color:#ffd60a;border:1px solid #ffd60a60}.badge.low{background:#30d15820;color:#30d158;border:1px solid #30d15860}.quote{color:rgba(255,255,255,0.45);font-size:11px;margin-top:5px;line-height:1.6}.bar{display:flex;align-items:center;gap:10px;margin:6px 0}.barlabel{width:95px;font-size:10px;color:#aaa}.bartrack{flex:1;height:6px;background:#111;border-radius:2px}.barfill{height:100%;background:#ff9500;border-radius:2px}.barval{font-size:10px;color:#ff9500;width:33px;text-align:right}.actions{list-style:none;padding:0}.actions li{padding:7px 0;border-bottom:1px solid #0c0c18;color:rgba(255,255,255,0.6);font-size:11px}.actions li::before{content:"► ";color:#30d158}.footer{margin-top:36px;padding-top:14px;border-top:1px solid #111;color:#444;font-size:9px;text-align:center}a{color:#00d4ff}@media print{body{background:#fff!important;color:#000!important}}</style>
</head><body>
<h1>🛡 SCAM SHIELD — FORENSIC REPORT</h1>
<div class="meta">Saved: ${report.savedAt?new Date(report.savedAt).toLocaleString():'Now'} · Duration: ${fmt(report.sessionTime)} · ID: ${report.id}</div>
<h2>THREAT SUMMARY</h2>
<div class="grid"><div class="metric"><div class="v">${report.threatScore}</div><div class="l">Risk Score</div></div><div class="metric"><div class="v">${report.alerts?.length||0}</div><div class="l">Alerts</div></div><div class="metric"><div class="v">${fmt(report.sessionTime)}</div><div class="l">Duration</div></div><div class="metric"><div class="v">${Object.values(report.psychScores||{}).filter(x=>x>0).length}</div><div class="l">Tactics</div></div></div>
<h2>ALERT TIMELINE</h2>
${(report.alerts||[]).map(a=>`<div class="alert ${a.severity}"><span class="badge ${a.severity}">${a.severity}</span><strong>${a.pattern}</strong> <span style="color:#555;font-size:10px">${a.time} · ${a.confidence}%</span><div class="quote">${a.quote}</div></div>`).join('')}
<h2>PSYCHOLOGICAL VECTORS</h2>
${Object.entries(report.psychScores||{}).map(([k,v])=>`<div class="bar"><span class="barlabel">${k}</span><div class="bartrack"><div class="barfill" style="width:${v}%"></div></div><span class="barval">${v}%</span></div>`).join('')}
<h2>RECOMMENDED ACTIONS</h2>
<ul class="actions"><li>Do NOT transfer money or provide any further information</li><li>Report to FTC: <a href="https://reportfraud.ftc.gov">reportfraud.ftc.gov</a></li><li>File FBI IC3 complaint: <a href="https://ic3.gov">ic3.gov</a></li><li>Contact your bank's official fraud hotline (number on back of card)</li><li>Preserve all records and screenshots for law enforcement</li></ul>
<div class="footer">SCAM SHIELD © 2026 · WIQI LEE · MIT License · #GeminiLiveAgentChallenge · Powered by Gemini Live API<br>To save as PDF: File → Print → Save as PDF</div>
</body></html>`
}

function exportHTML(report) {
  const blob = new Blob([genHTML(report)],{type:'text/html'})
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href=url; a.download=`scamshield-${report.id}.html`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

function exportPDF(report) {
  const fmt = s => s!=null?`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:'—'
  const win = window.open('','_blank')
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Scam Shield Report</title>
<style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;padding:28px;color:#111;font-size:12px}h1{font-size:18px;color:#cc0000;border-bottom:2px solid #cc0000;padding-bottom:8px;margin-bottom:6px}h2{font-size:11px;color:#005599;margin:22px 0 8px;text-transform:uppercase;letter-spacing:1px}.meta{color:#777;font-size:10px;margin-bottom:18px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:12px 0}.metric{padding:12px;border:1px solid #ddd;text-align:center;border-radius:4px}.metric .v{font-size:22px;font-weight:bold;color:#cc0000}.metric .l{font-size:9px;color:#777;margin-top:3px;text-transform:uppercase;letter-spacing:1px}.alert{margin:8px 0;padding:10px 12px;border-left:4px solid;border-radius:0 4px 4px 0;page-break-inside:avoid}.critical{border-color:#cc0000;background:#fff5f5}.high{border-color:#e65c00;background:#fff7f0}.medium{border-color:#aa8800;background:#fffef0}.low{border-color:#007700;background:#f0fff4}.badge{display:inline-block;font-size:8px;padding:2px 7px;font-weight:bold;margin-right:7px;border-radius:2px;text-transform:uppercase}.badge.critical{background:#ffebeb;color:#cc0000}.badge.high{background:#fff0e0;color:#e65c00}.badge.medium{background:#fffbe0;color:#aa8800}.badge.low{background:#efffef;color:#007700}.quote{color:#555;font-size:11px;margin-top:4px;line-height:1.5;font-style:italic}.bar{display:flex;align-items:center;gap:8px;margin:5px 0}.bl{width:90px;font-size:10px;color:#555;flex-shrink:0}.bt{flex:1;height:8px;background:#eee;border-radius:4px;overflow:hidden}.bf{height:100%;background:#e65c00;border-radius:4px}.bv{font-size:10px;color:#e65c00;width:32px;text-align:right;flex-shrink:0}.actions{list-style:none;padding:0}.actions li{padding:7px 0;border-bottom:1px solid #eee;font-size:11px;color:#333}.actions li::before{content:"► ";color:#007700;font-weight:bold}.footer{margin-top:28px;padding-top:12px;border-top:1px solid #eee;color:#aaa;font-size:9px;text-align:center}@page{margin:15mm}</style>
</head><body>
<h1>🛡 SCAM SHIELD — FORENSIC REPORT</h1>
<div class="meta">Date: ${report.savedAt?new Date(report.savedAt).toLocaleString():'Now'} · Duration: ${fmt(report.sessionTime)} · ID: ${report.id}</div>
<h2>Threat Summary</h2>
<div class="grid"><div class="metric"><div class="v">${report.threatScore}</div><div class="l">Risk Score</div></div><div class="metric"><div class="v">${report.alerts?.length||0}</div><div class="l">Alerts</div></div><div class="metric"><div class="v">${fmt(report.sessionTime)}</div><div class="l">Duration</div></div><div class="metric"><div class="v">${Object.values(report.psychScores||{}).filter(x=>x>0).length}</div><div class="l">Tactics</div></div></div>
<h2>Alert Timeline</h2>
${(report.alerts||[]).map(a=>`<div class="alert ${a.severity}"><span class="badge ${a.severity}">${a.severity}</span><strong>${a.pattern}</strong> <span style="color:#888;font-size:10px">${a.time} · ${a.confidence}% confidence</span><div class="quote">${a.quote}</div></div>`).join('')}
<h2>Psychological Manipulation Vectors</h2>
${Object.entries(report.psychScores||{}).map(([k,v])=>`<div class="bar"><span class="bl">${k}</span><div class="bt"><div class="bf" style="width:${v}%"></div></div><span class="bv">${v}%</span></div>`).join('')}
<h2>Recommended Actions</h2>
<ul class="actions"><li>Do NOT transfer money or provide any further information to the caller</li><li>Report to FTC: reportfraud.ftc.gov</li><li>File FBI IC3 complaint: ic3.gov</li><li>Contact your bank's official fraud hotline</li><li>Preserve all call records and screenshots as evidence</li></ul>
<div class="footer">SCAM SHIELD © 2026 · WIQI LEE · MIT License · #GeminiLiveAgentChallenge · Powered by Gemini Live API</div>
<script>window.onload=()=>window.print()</script>
</body></html>`)
  win.document.close()
}

/* ═══════════════════════════════════════════════════════════
   PSYCH TAB — dramatic asymmetric layout
═══════════════════════════════════════════════════════════ */
export function PsychTab({ psychScores }) {
  // Split: top row has 2 big cards, bottom 4 smaller — breaks the boring 3-col grid
  const top  = PSYCH_TACTICS.slice(0,2)
  const bot  = PSYCH_TACTICS.slice(2)

  return (
    <div>
      {/* Header with diagonal accent */}
      <div style={{ marginBottom:28,position:'relative',paddingLeft:18,borderLeft:'3px solid #ff9500',boxShadow:'inset 3px 0 20px rgba(255,149,0,0.1)' }}>
        <div style={{ fontFamily:PF,fontSize:11,color:'#ff9500',textShadow:'0 0 16px #ff9500,0 0 32px rgba(255,149,0,0.4)',marginBottom:10 }}>
          PSYCHOLOGICAL MANIPULATION ANALYZER
        </div>
        <div style={{ fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.9,maxWidth:780 }}>
          The only scam detection system that maps the{' '}
          <span style={{ color:'#ff9500',textShadow:'0 0 8px #ff9500' }}>psychological architecture</span> of a manipulation attempt —
          not just what the scammer says, but{' '}
          <span style={{ color:'#ff2d55',textShadow:'0 0 8px #ff2d55' }}>how they are engineering your decisions</span>.
          Grounded in Cialdini's influence principles and FBI behavioral analysis of phone fraud perpetrators.
        </div>
      </div>

      {/* Top 2 — wide cards */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
        {top.map(tac => <TacticCard key={tac.id} tac={tac} score={psychScores[tac.id]||0} large />)}
      </div>

      {/* Bottom 4 — compact cards */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
        {bot.map(tac => <TacticCard key={tac.id} tac={tac} score={psychScores[tac.id]||0} />)}
      </div>

      {/* Unprecedented callout */}
      <PBox color="#ff9500" style={{ padding:'22px 28px',background:'rgba(255,149,0,0.03)',position:'relative',overflow:'hidden' }}>
        {/* Big number decoration */}
        <div style={{ position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',fontFamily:PF,fontSize:60,color:'rgba(255,149,0,0.06)',pointerEvents:'none',lineHeight:1 }}>6</div>
        <div style={{ fontFamily:PF,fontSize:8,color:'#ff9500',marginBottom:12,letterSpacing:1 }}>WHY THIS IS UNPRECEDENTED</div>
        <div style={{ fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:2,maxWidth:780 }}>
          Every other tool detects scam <span style={{ color:'#00d4ff' }}>keywords</span>.
          Scam Shield detects scam <span style={{ color:'#ff9500',textShadow:'0 0 8px #ff9500' }}>cognition</span>.<br/>
          Using Gemini's extended reasoning, we model which influence vectors are active in the conversation and at what
          intensity — giving users not just an alert, but a complete psychological breakdown of exactly how they are being manipulated.<br/><br/>
          This is the feature that has <em>never</em> existed in any scam detection product. Ever.
        </div>
      </PBox>
    </div>
  )
}

function TacticCard({ tac, score, large = false }) {
  const active = score > 0
  return (
    <PBox color={active?tac.color:tac.color+'25'}
      style={{ padding:large?24:18,background:active?tac.color+'0a':'rgba(0,0,0,0.2)',animation:active&&score>60?'ppulse 2s infinite':'none',transition:'all 0.3s',position:'relative',overflow:'hidden' }}>
      {/* Score as large bg number */}
      {active&&<div style={{ position:'absolute',right:12,bottom:-4,fontFamily:PF,fontSize:large?48:36,color:tac.color+'14',pointerEvents:'none',lineHeight:1 }}>{score}</div>}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:large?16:12 }}>
        <span style={{ fontSize:large?28:20,lineHeight:1,filter:active?`drop-shadow(0 0 8px ${tac.color})`:'none',transition:'filter 0.4s' }}>{tac.icon}</span>
        <span style={{ fontFamily:PF,fontSize:large?16:13,color:active?tac.color:tac.color+'50',textShadow:active?`0 0 16px ${tac.color},0 0 32px ${tac.color}66`:'none',transition:'all 0.4s' }}>{score}%</span>
      </div>
      <div style={{ fontFamily:PF,fontSize:large?9:7,color:active?tac.color:'rgba(255,255,255,0.5)',marginBottom:large?10:7,letterSpacing:0.5,lineHeight:1.6 }}>{tac.label}</div>
      <div style={{ fontFamily:MF,fontSize:large?11:9,color:'rgba(255,255,255,0.58)',marginBottom:large?16:12,lineHeight:1.65 }}>{tac.desc}</div>
      <div style={{ display:'flex',gap:2 }}>
        {Array.from({length:10}).map((_,i)=>(
          <div key={i} style={{ flex:1,height:large?7:5,background:i<Math.round(score/10)?tac.color:tac.color+'18',boxShadow:i<Math.round(score/10)?`0 0 6px ${tac.color}`:'none',transition:'all 0.5s ease' }} />
        ))}
      </div>
      {active&&<div style={{ fontFamily:PF,fontSize:6,color:tac.color,marginTop:10,animation:'blink 1s step-end infinite' }}>► ACTIVE</div>}
    </PBox>
  )
}

/* ═══════════════════════════════════════════════════════════
   PATTERNS TAB
═══════════════════════════════════════════════════════════ */
export function PatternsTab({ detectedIds=[] }) {
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('all')
  const filtered=SCAM_PATTERNS.filter(p=>(!search||p.category.toLowerCase().includes(search.toLowerCase())||p.description.toLowerCase().includes(search.toLowerCase()))&&(filter==='all'||p.severity===filter))

  return (
    <div>
      <div style={{ marginBottom:20,paddingLeft:16,borderLeft:'3px solid #00d4ff',boxShadow:'inset 3px 0 20px rgba(0,212,255,0.08)' }}>
        <div style={{ fontFamily:PF,fontSize:11,color:'#00d4ff',textShadow:'0 0 14px #00d4ff',marginBottom:6 }}>SCAM PATTERN LIBRARY</div>
        <div style={{ fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.55)' }}>50+ verified patterns — FTC Sentinel · FBI IC3 2024 · GASA · MAS ScamShield · ACCC ScamWatch</div>
      </div>

      <div style={{ display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patterns..."
          style={{ flex:1,minWidth:200,padding:'9px 14px',background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.18)',color:'#e0e0e0',fontFamily:MF,fontSize:11,outline:'none',transition:'border-color 0.2s' }}
          onFocus={e=>e.target.style.borderColor='rgba(0,212,255,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(0,212,255,0.18)'} />
        <div style={{ display:'flex',gap:6 }}>
          {['all','critical','high','medium','low'].map(f=>{
            const fc=f==='all'?'#00d4ff':SEV[f]?.text||'#00d4ff'
            return <button key={f} onClick={()=>setFilter(f)} style={{ padding:'9px 14px',fontFamily:PF,fontSize:6,cursor:'pointer',border:`1px solid ${filter===f?fc:fc+'33'}`,background:filter===f?fc+'16':'transparent',color:filter===f?fc:'rgba(255,255,255,0.38)',transition:'all 0.15s',letterSpacing:1 }}>{f.toUpperCase()}</button>
          })}
        </div>
      </div>
      <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.25)',marginBottom:14 }}>{filtered.length} patterns shown</div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(330px,1fr))',gap:12 }}>
        {filtered.map(p=>{
          const c=SEV[p.severity]; const hit=detectedIds.includes(p.category)
          return (
            <PBox key={p.id} color={hit?c.border:c.border+'28'} style={{ padding:16,background:hit?c.bg:'rgba(0,0,0,0.18)',transition:'all 0.3s' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                <div style={{ fontFamily:PF,fontSize:7,color:hit?c.text:'rgba(255,255,255,0.8)',lineHeight:1.6,flex:1,paddingRight:8 }}>{p.category}</div>
                <div style={{ display:'flex',gap:6,alignItems:'center',flexShrink:0 }}>
                  {hit&&<div style={{ fontFamily:PF,fontSize:6,color:c.text,animation:'blink 1s step-end infinite' }}>► HIT</div>}
                  <div style={{ fontFamily:PF,fontSize:6,padding:'3px 7px',border:`1px solid ${c.border}`,color:c.text,background:c.bg,whiteSpace:'nowrap' }}>{p.severity.toUpperCase()}</div>
                </div>
              </div>
              <div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.62)',marginBottom:10,lineHeight:1.65 }}>{p.description}</div>
              <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:10 }}>
                {p.markers.map((m,i)=><span key={i} style={{ fontFamily:MF,fontSize:9,padding:'3px 7px',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.55)',background:'rgba(255,255,255,0.03)' }}>"{m}"</span>)}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <span style={{ fontFamily:MF,fontSize:9,color:'#ff9500' }}>⚙ {p.mechanism}</span>
                <span style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.38)' }}>{p.source}</span>
              </div>
            </PBox>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   REPORT TAB
═══════════════════════════════════════════════════════════ */
export function ReportTab({ alerts,sessionTime,threatScore,psychScores }) {
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const activeTactics=Object.values(psychScores).filter(x=>x>0).length
  const [saved,setSaved]=useState([])
  const [msg,setMsg]=useState('')
  const [open,setOpen]=useState(null)
  useEffect(()=>setSaved(loadReports()),[])
  const cur={alerts,sessionTime,threatScore,psychScores,id:Date.now().toString(),savedAt:new Date().toISOString()}

  const doSave=()=>{
    if(!alerts.length)return
    saveReport({alerts,sessionTime,threatScore,psychScores})
    setSaved(loadReports()); setMsg('✓ Saved!'); setTimeout(()=>setMsg(''),2500)
  }

  return (
    <div style={{ maxWidth:900,margin:'0 auto' }}>
      <div style={{ marginBottom:20,paddingLeft:16,borderLeft:'3px solid #00d4ff',boxShadow:'inset 3px 0 20px rgba(0,212,255,0.08)' }}>
        <div style={{ fontFamily:PF,fontSize:11,color:'#00d4ff',textShadow:'0 0 14px #00d4ff' }}>SESSION FORENSIC REPORT</div>
      </div>

      {alerts.length===0 ? (
        <PBox color="#00d4ff20" style={{ padding:60,textAlign:'center' }}>
          <div style={{ fontFamily:PF,fontSize:8,color:'rgba(255,255,255,0.25)',lineHeight:3 }}>NO SESSION DATA<br/>START A SESSION FIRST</div>
        </PBox>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <PBox color="#ff2d55" style={{ padding:24,background:'rgba(255,45,85,0.04)' }}>
            <div style={{ fontFamily:PF,fontSize:9,color:'#ff2d55',marginBottom:16 }}>⚠ HIGH RISK CALL — SCAM DETECTED</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16 }}>
              {[{l:'DURATION',v:fmt(sessionTime),c:'#00d4ff'},{l:'THREATS',v:alerts.length,c:'#ff2d55'},{l:'RISK SCORE',v:`${threatScore}/100`,c:'#ff2d55'},{l:'TACTICS',v:activeTactics,c:'#ff9500'}].map(item=>(
                <div key={item.l}>
                  <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.35)',marginBottom:5 }}>{item.l}</div>
                  <div style={{ fontFamily:PF,fontSize:15,color:item.c,textShadow:`0 0 12px ${item.c}` }}>{item.v}</div>
                </div>
              ))}
            </div>
          </PBox>
          <PBox color="#00d4ff25" style={{ padding:20 }}>
            <div style={{ fontFamily:PF,fontSize:8,color:'#00d4ff',marginBottom:14 }}>THREAT TIMELINE</div>
            {alerts.map((a,i)=><AlertCard key={a.id} alert={a} index={i} />)}
          </PBox>
          <PBox color="#ff950040" style={{ padding:20 }}>
            <div style={{ fontFamily:PF,fontSize:8,color:'#ff9500',marginBottom:14 }}>PSYCHOLOGICAL VECTORS</div>
            {Object.entries(psychScores).map(([k,v])=>(
              <div key={k} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:8 }}>
                <span style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.55)',width:100 }}>{k}</span>
                <div style={{ flex:1,height:5,background:'rgba(255,255,255,0.06)' }}><div style={{ width:`${v}%`,height:'100%',background:'#ff9500',transition:'width 0.5s',boxShadow:v>0?'0 0 6px #ff9500':'none' }} /></div>
                <span style={{ fontFamily:MF,fontSize:10,color:'#ff9500',width:35,textAlign:'right' }}>{v}%</span>
              </div>
            ))}
          </PBox>
          <PBox color="#30d158" style={{ padding:20,background:'rgba(48,209,88,0.03)' }}>
            <div style={{ fontFamily:PF,fontSize:8,color:'#30d158',marginBottom:14 }}>RECOMMENDED ACTIONS</div>
            {["Do NOT transfer money or provide any further information","Report to FTC: reportfraud.ftc.gov","File FBI IC3 complaint: ic3.gov","Contact your bank's official fraud hotline","Preserve all records and screenshots for evidence"].map((a,i)=>(
              <div key={i} style={{ fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.65)',padding:'8px 0',borderBottom:'1px solid rgba(48,209,88,0.08)',display:'flex',gap:10 }}><span style={{ color:'#30d158',flexShrink:0 }}>►</span>{a}</div>
            ))}
          </PBox>

          {/* Export row */}
          <div style={{ display:'flex',gap:10,alignItems:'center',flexWrap:'wrap' }}>
            <PBtn onClick={doSave} color="#00d4ff" style={{ flex:1,padding:'12px' }}>💾 SAVE</PBtn>
            <PBtn onClick={()=>exportHTML(cur)} color="#7b61ff" style={{ flex:1,padding:'12px' }}>↓ HTML</PBtn>
            <PBtn onClick={()=>exportPDF(cur)} color="#ff9500" style={{ flex:1,padding:'12px' }}>↓ PDF</PBtn>
            {msg&&<span style={{ fontFamily:MF,fontSize:11,color:'#30d158' }}>{msg}</span>}
          </div>
          <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.22)',marginTop:-6 }}>HTML: dark theme for screen · PDF: print dialog → Save as PDF</div>
        </div>
      )}

      {/* Saved list */}
      {saved.length>0&&(
        <div style={{ marginTop:32 }}>
          <div style={{ fontFamily:PF,fontSize:8,color:'rgba(0,212,255,0.55)',marginBottom:14 }}>SAVED REPORTS ({saved.length})</div>
          {saved.map(r=>{
            const isOpen=open?.id===r.id
            return <div key={r.id} style={{ marginBottom:6 }}>
              <div onClick={()=>setOpen(isOpen?null:r)} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',cursor:'pointer',border:`1px solid ${isOpen?'rgba(0,212,255,0.28)':'rgba(0,212,255,0.08)'}`,background:isOpen?'rgba(0,212,255,0.04)':'rgba(0,0,0,0.2)',transition:'all 0.15s' }}>
                <div style={{ display:'flex',gap:16,alignItems:'center' }}>
                  <span style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.5)' }}>{new Date(r.savedAt).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})} EST</span>
                  <span style={{ fontFamily:PF,fontSize:7,color:'#ff2d55' }}>{r.threatScore}/100</span>
                  <span style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.3)' }}>{r.alerts?.length||0} alerts</span>
                </div>
                <div style={{ display:'flex',gap:6 }}>
                  <button onClick={e=>{e.stopPropagation();exportPDF(r)}} style={{ fontFamily:PF,fontSize:6,padding:'5px 9px',border:'1px solid #ff950055',color:'#ff9500',background:'rgba(255,149,0,0.07)',cursor:'pointer' }}>↓ PDF</button>
                  <button onClick={e=>{e.stopPropagation();exportHTML(r)}} style={{ fontFamily:PF,fontSize:6,padding:'5px 9px',border:'1px solid #7b61ff55',color:'#7b61ff',background:'rgba(123,97,255,0.07)',cursor:'pointer' }}>↓ HTML</button>
                  <button onClick={e=>{e.stopPropagation();delReport(r.id);setSaved(loadReports());if(open?.id===r.id)setOpen(null)}} style={{ fontFamily:PF,fontSize:6,padding:'5px 9px',border:'1px solid #ff2d5555',color:'#ff2d55',background:'rgba(255,45,85,0.07)',cursor:'pointer' }}>✕</button>
                </div>
              </div>
              {isOpen&&(
                <div style={{ padding:'14px 16px',border:'1px solid rgba(0,212,255,0.08)',borderTop:'none',background:'rgba(0,0,0,0.25)' }}>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14 }}>
                    {[{l:'RISK',v:`${r.threatScore}/100`,c:'#ff2d55'},{l:'ALERTS',v:r.alerts?.length||0,c:'#ff9500'},{l:'DURATION',v:`${String(Math.floor((r.sessionTime||0)/60)).padStart(2,'0')}:${String((r.sessionTime||0)%60).padStart(2,'0')}`,c:'#00d4ff'},{l:'TACTICS',v:Object.values(r.psychScores||{}).filter(x=>x>0).length,c:'#7b61ff'}].map(item=>(
                      <div key={item.l} style={{ padding:'10px',border:'1px solid #1a1a2e',textAlign:'center' }}>
                        <div style={{ fontFamily:PF,fontSize:13,color:item.c }}>{item.v}</div>
                        <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.28)',marginTop:4 }}>{item.l}</div>
                      </div>
                    ))}
                  </div>
                  {(r.alerts||[]).slice(0,3).map((a,i)=><AlertCard key={i} alert={a} index={i} />)}
                  {(r.alerts||[]).length>3&&<div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.25)',textAlign:'center',marginTop:8 }}>+{r.alerts.length-3} more — export to view all</div>}
                </div>
              )}
            </div>
          })}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ABOUT TAB — premium dramatic layout
═══════════════════════════════════════════════════════════ */
export function AboutTab() {
  return (
    <div style={{ maxWidth:900,margin:'0 auto' }}>
      {/* Hero row — full bleed */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
        <PBox color="#00d4ff" style={{ padding:32,background:'rgba(0,212,255,0.02)',gridRow:'span 2' }}>
          <div style={{ fontFamily:PF,fontSize:9,color:'#00d4ff',marginBottom:16 }}>THE PROBLEM</div>
          <div style={{ fontFamily:MF,fontSize:13,color:'rgba(255,255,255,0.7)',lineHeight:2.1 }}>
            Every 30 seconds, someone in the world loses money to a phone or video call scam.<br/><br/>
            In 2023, the FBI recorded{' '}
            <span style={{ fontFamily:PF,fontSize:14,color:'#ff2d55',textShadow:'0 0 12px #ff2d55',display:'block',margin:'8px 0' }}>$4.57B</span>
            in losses from voice and video call fraud in the United States alone. Globally, the GASA estimates annual losses exceeding{' '}
            <span style={{ fontFamily:PF,fontSize:14,color:'#ff2d55',textShadow:'0 0 12px #ff2d55',display:'block',margin:'8px 0' }}>$1 TRILLION</span><br/>
            Every existing solution shares one fatal flaw:{' '}
            <span style={{ color:'#ff9500' }}>they act after the damage is done</span>.
          </div>
        </PBox>

        <PBox color="#ff9500" style={{ padding:28,background:'rgba(255,149,0,0.02)' }}>
          <div style={{ fontFamily:PF,fontSize:9,color:'#ff9500',marginBottom:12 }}>WHAT'S NEW</div>
          <div style={{ fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.68)',lineHeight:1.9 }}>
            World's <span style={{ color:'#ff9500' }}>first</span> real-time multimodal scam detection agent protecting you <em>during</em> a live call.
            Gemini Live API + Rust WASM = &lt;80ms alert latency.
          </div>
        </PBox>

        <PBox color="#7b61ff" style={{ padding:28,background:'rgba(123,97,255,0.02)' }}>
          <div style={{ fontFamily:PF,fontSize:9,color:'#7b61ff',marginBottom:12 }}>PSYCH SCORING</div>
          <div style={{ fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.68)',lineHeight:1.9 }}>
            First system to model <span style={{ color:'#7b61ff' }}>cognitive influence vectors</span> —
            not just what a scammer says, but which of Cialdini's 6 principles they're exploiting.
          </div>
        </PBox>
      </div>

      {/* Creator — premium card with PixelLogo as animated avatar */}
      <PBox color="#7b61ff" style={{ padding:0,background:'rgba(123,97,255,0.015)',marginBottom:16,overflow:'hidden' }}>
        {/* Top accent stripe */}
        <div style={{ height:3,background:'linear-gradient(90deg,#7b61ff,#00d4ff,#ff2d55,#ff9500,#30d158)',backgroundSize:'200%',animation:'rotateHue 4s linear infinite' }} />

        <div style={{ display:'flex',gap:0,flexWrap:'wrap' }}>
          {/* Left — logo + identity */}
          <div style={{ padding:32,borderRight:'1px solid rgba(123,97,255,0.15)',display:'flex',flexDirection:'column',alignItems:'center',gap:16,minWidth:220 }}>
            {/* Animated PixelLogo as avatar */}
            <div style={{ padding:20,border:'1px solid rgba(123,97,255,0.25)',background:'rgba(123,97,255,0.06)',position:'relative' }}>
              <PixelLogo />
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:PF,fontSize:8,color:'#7b61ff',marginBottom:6,textShadow:'0 0 8px #7b61ff' }}>WIQI LEE</div>
              <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.4)',lineHeight:1.7 }}>
                Data Scientist<br/>AI/ML Researcher<br/>Software Engineer<br/>Cellist
              </div>
            </div>
            <div style={{ fontFamily:MF,fontSize:8,color:'rgba(255,214,10,0.7)',textAlign:'center',lineHeight:1.6,padding:'8px 12px',border:'1px solid rgba(255,214,10,0.2)',background:'rgba(255,214,10,0.04)' }}>
              Gemini Live Agent<br/>Challenge 2026
            </div>
          </div>

          {/* Right — bio + social */}
          <div style={{ padding:32,flex:1,minWidth:280 }}>
            <div style={{ fontFamily:PF,fontSize:9,color:'#7b61ff',marginBottom:16,textShadow:'0 0 10px #7b61ff' }}>THE CREATOR</div>
            <div style={{ fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.68)',lineHeight:2,marginBottom:24 }}>
              Python · Java · Rust · Julia<br/><br/>
              I am a researcher and engineer at the intersection of machine learning systems and human safety.
              My work focuses on building AI that acts as a protective layer between humans and the adversarial
              systems designed to exploit them.<br/><br/>
              The choice of Rust for the audio engine was not performative — it was a deliberate engineering decision.
              When a scammer is pressuring someone to act in 10 minutes, the difference between 200ms and 80ms
              is the difference between panic and clarity.
              <span style={{ color:'#ff9500' }}> I do not ship hallucinations.</span>
            </div>

            {/* Social links */}
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              <SLink href="https://x.com/wiqi_lee"
                icon={<XIcon size={11} color="currentColor" />} label="@wiqi_lee"
                c="rgba(255,255,255,0.75)" bc="rgba(255,255,255,0.15)" bg="rgba(255,255,255,0.05)" hc="#fff" hbg="rgba(255,255,255,0.1)" />
              <SLink href="https://discord.com/users/209385020912173066"
                icon={<DiscordIcon size={13} color="#7b8cde" />} label="Discord"
                c="#7b8cde" bc="rgba(123,140,222,0.25)" bg="rgba(123,140,222,0.06)" hc="#a5b4fc" hbg="rgba(123,140,222,0.14)" />
              <SLink href="https://github.com/wiqilee"
                icon={<GitHubIcon size={12} color="currentColor" />} label="github.com/wiqilee"
                c="rgba(255,255,255,0.7)" bc="rgba(255,255,255,0.14)" bg="rgba(255,255,255,0.04)" hc="#fff" hbg="rgba(255,255,255,0.1)" />
            </div>
          </div>
        </div>
      </PBox>

      {/* Data sources */}
      <PBox color="#30d15840" style={{ padding:24,background:'rgba(48,209,88,0.02)' }}>
        <div style={{ fontFamily:PF,fontSize:8,color:'#30d158',marginBottom:14 }}>DATA SOURCES</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10 }}>
          {[{name:'FTC Consumer Sentinel',url:'ftc.gov/enforcement',c:'#00d4ff'},{name:'FBI IC3 Annual Report',url:'ic3.gov/AnnualReport',c:'#ff9500'},{name:'GASA Global Scam Report',url:'gasa.org',c:'#ffd60a'},{name:'MAS ScamShield (SG)',url:'scamshield.org.sg',c:'#7b61ff'},{name:'ACCC ScamWatch',url:'scamwatch.gov.au',c:'#30d158'}].map(s=>(
            <div key={s.name} style={{ padding:'10px 12px',borderLeft:`2px solid ${s.c}55`,background:'rgba(255,255,255,0.015)' }}>
              <div style={{ fontFamily:MF,fontSize:11,color:s.c,marginBottom:3 }}>{s.name}</div>
              <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.4)' }}>{s.url}</div>
            </div>
          ))}
        </div>
      </PBox>
    </div>
  )
}
