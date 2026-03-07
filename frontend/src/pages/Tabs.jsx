import { useState, useEffect }  from 'react'
import { PBox, PBtn }            from '../components/Primitives'
import { AlertCard }             from '../components/AlertCard'
import { PixelLogo }             from '../components/PixelLogo'
import { SCAM_PATTERNS, PSYCH_TACTICS, SEV, PF, MF, LIE_INDICATORS, getActionsForLang } from '../utils/constants'

/* ── Social SVGs ── */
const XIcon=({size=12,color='currentColor'})=><svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.422l4.256 5.624 5.316-5.624Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const DiscordIcon=({size=13,color='#7b8cde'})=><svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.225-1.993a.077.077 0 0 0-.041-.107 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.094.246-.194.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419s.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419s.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
const GitHubIcon=({size=13,color='currentColor'})=><svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
function SLink({href,icon,label,c='rgba(255,255,255,0.7)',bc='rgba(255,255,255,0.14)',bg='rgba(255,255,255,0.04)',hc,hbg}){const[h,setH]=useState(false);return<a href={href} target="_blank" rel="noreferrer" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 14px',fontFamily:MF,fontSize:10,color:h?(hc||'#fff'):c,textDecoration:'none',border:`1px solid ${h?(hc||'rgba(255,255,255,0.3)'):bc}`,background:h?(hbg||'rgba(255,255,255,0.08)'):bg,transition:'all 0.16s ease'}}>{icon}{label}</a>}

/* ── Storage ── */
const saveReport=r=>{try{const l=JSON.parse(localStorage.getItem('vg_reports')||'[]');const e={...r,id:Date.now().toString(),savedAt:new Date().toISOString()};l.unshift(e);localStorage.setItem('vg_reports',JSON.stringify(l.slice(0,50)));return e.id}catch{return null}}
const loadReports=()=>{try{return JSON.parse(localStorage.getItem('vg_reports')||'[]')}catch{return[]}}
const delReport=id=>{try{localStorage.setItem('vg_reports',JSON.stringify(loadReports().filter(r=>r.id!==id)))}catch{}}

/* ══════════════════════════════════════════════════════════
   PREMIUM HTML/PDF EXPORT — colored bars, all sections, footer
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
.footer{margin-top:40px;padding:20px 0;border-top:2px solid #111;text-align:center;color:#666;font-size:10px}
.footer .brand{color:#00d4ff;font-size:12px;font-weight:bold;letter-spacing:2px}
@media print{body{background:#fff!important;color:#111!important}.page{padding:20px}h1{color:#cc0000}h2{color:#005599}.metric{border-color:#ddd}.metric .v{color:#cc0000}.bar .bl{color:#555}.bt{background:#eee;border-color:#ddd}.tline{color:#333}.tline.flagged{background:#fff5f5}.action{background:#f0fff4;border-color:#007700}.footer{border-color:#eee}.footer .brand{color:#005599}}
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
  <div class="metric"><div class="v">${Object.values(report.psychScores||{}).filter(x=>x>0).length}</div><div class="l">Tactics</div></div>
</div>

${(report.transcript||[]).length>0?`<h2>FULL TRANSCRIPT</h2>${(report.transcript||[]).map(l=>{
  const isMe=l.speaker==='me'
  return `<div class="tline${l.flagged?' flagged':''}${isMe?' me':''}"><span class="ts">[${l.time}]</span><span class="speaker" style="color:${isMe?'#30d158':'#ff9500'}">${isMe?'ME':'CALLER'}</span>${l.text}${l.flagged?'<span class="flag">⚠ FLAGGED</span>':''}</div>`
}).join('')}`:''}

<h2>ALERT TIMELINE</h2>
${(report.alerts||[]).map(a=>`<div class="alert ${a.severity}"><span class="badge ${a.severity}">${a.severity}</span><strong>${a.pattern}</strong> <span style="color:#888;font-size:10px">${a.time} · ${a.confidence}%</span><div class="quote">"${a.quote.replace(/"/g,'')}"</div></div>`).join('')}

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

function exportHTML(report){const b=new Blob([genHTML(report)],{type:'text/html'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`voxguard-${report.id}.html`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}
function exportPDF(report){const w=window.open('','_blank');if(!w)return;w.document.write(genHTML(report)+'<script>window.onload=()=>setTimeout(()=>window.print(),500)<\/script>');w.document.close()}

/* ═══ Vector Bar — brighter text ═══ */
function VectorBar({tac,score}){
  const[h,setH]=useState(false);const active=score>0
  const barColors=[tac.color+'55',tac.color+'99',tac.color]
  return(
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',marginBottom:4,border:`1px solid ${h?tac.color+'55':tac.color+'18'}`,background:h?tac.color+'0a':'transparent',transition:'all 0.2s ease'}}>
      <span style={{fontSize:16,filter:h||active?`drop-shadow(0 0 6px ${tac.color})`:'none',transition:'filter 0.3s',flexShrink:0}}>{tac.icon}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <span style={{fontFamily:PF,fontSize:7,color:h?tac.color:(active?tac.color:'rgba(255,255,255,0.55)'),letterSpacing:0.5}}>{tac.label}</span>
          <span style={{fontFamily:PF,fontSize:10,color:tac.color,textShadow:active?`0 0 10px ${tac.color}`:'none'}}>{score}%</span>
        </div>
        <div style={{display:'flex',gap:1,height:h?8:6,transition:'height 0.2s'}}>
          {Array.from({length:20}).map((_,i)=>{const filled=i<Math.round(score/5);const ci=i<7?0:i<14?1:2;return<div key={i} style={{flex:1,background:filled?barColors[ci]:tac.color+'12',boxShadow:filled&&i>=14?`0 0 6px ${tac.color}`:'none',transition:'all 0.4s'}}/>})}
        </div>
        {h&&<div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.6)',marginTop:4,lineHeight:1.5}}>{tac.desc}</div>}
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

/* ═══ Fullscreen Gallery — lie detect under psych, not separate tab ═══ */
function GalleryFullscreen({report,onClose,onDelete}){
  if(!report) return null
  const fmt=s=>s!=null?`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:'—'
  const sc=report.threatScore>75?'#ff2d55':report.threatScore>45?'#ff9500':'#30d158'
  const[tab,setTab]=useState('transcript')
  const actionsData=getActionsForLang(report.language||'en')

  return(
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.95)',backdropFilter:'blur(10px)',display:'flex',flexDirection:'column'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{flex:1,maxWidth:1000,width:'100%',margin:'0 auto',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header */}
        <div style={{padding:'20px 28px',borderBottom:'1px solid rgba(0,212,255,0.15)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0,flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontFamily:PF,fontSize:11,color:'#00d4ff',textShadow:'0 0 10px #00d4ff'}}>SESSION DETAIL</div>
            <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:6}}>
              {new Date(report.savedAt).toLocaleString()} · Duration: <strong style={{color:'#00d4ff'}}>{fmt(report.sessionTime)}</strong> · {(report.language||'en').toUpperCase()} · {actionsData.country}
            </div>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <span style={{fontFamily:PF,fontSize:22,color:sc,textShadow:`0 0 14px ${sc}`}}>{report.threatScore}/100</span>
            {/* Audio playback if recording exists */}
            {report.audioUrl&&(
              <audio controls src={report.audioUrl} style={{ height:28,maxWidth:180,opacity:0.8 }} />
            )}
            <button onClick={e=>{e.stopPropagation();onDelete?.()}} style={{fontFamily:PF,fontSize:7,padding:'8px 14px',border:'1px solid #ff2d5555',color:'#ff2d55',background:'rgba(255,45,85,0.08)',cursor:'pointer'}}>🗑 DELETE</button>
            <button onClick={onClose} style={{fontFamily:PF,fontSize:7,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',background:'rgba(255,255,255,0.06)',cursor:'pointer'}}>✕ CLOSE</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid rgba(0,212,255,0.1)',flexShrink:0}}>
          {['transcript','alerts','psych','actions'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'12px',fontFamily:PF,fontSize:7,border:'none',borderBottom:tab===t?'2px solid #00d4ff':'2px solid transparent',background:'transparent',color:tab===t?'#00d4ff':'rgba(255,255,255,0.4)',cursor:'pointer',textTransform:'uppercase',letterSpacing:1}}>{t}</button>
          ))}
        </div>
        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 28px'}}>
          {tab==='transcript'&&((report.transcript||[]).length>0?(report.transcript||[]).map((l,i)=>{const isMe=l.speaker==='me';return<div key={i} style={{fontFamily:MF,fontSize:12,color:isMe?'#30d158':'rgba(255,255,255,0.75)',padding:'6px 0',borderLeft:l.flagged?'3px solid #ff2d55':isMe?'3px solid #30d15844':'3px solid transparent',paddingLeft:12,lineHeight:1.8}}><span style={{color:'rgba(0,212,255,0.5)',fontSize:10,marginRight:10}}>[{l.time}]</span><span style={{fontFamily:PF,fontSize:6,color:isMe?'#30d158':'#ff9500',marginRight:6}}>{isMe?'ME':'CALLER'}</span>{l.text}{l.flagged&&<span style={{color:'#ff2d55',fontSize:9,marginLeft:6}}>⚠</span>}</div>}):<div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.25)',fontFamily:MF}}>No transcript</div>)}
          {tab==='alerts'&&(report.alerts||[]).map((a,i)=><AlertCard key={i} alert={a} index={i}/>)}
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
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
        {saved.map(r=>{const sc=r.threatScore>75?'#ff2d55':r.threatScore>45?'#ff9500':'#30d158';return<GalleryCard key={r.id} r={r} sc={sc} fmt={fmt} onOpen={()=>setFs(r)} onDel={()=>{delReport(r.id);onRefresh();if(fs?.id===r.id)setFs(null)}}/>})}
      </div>
      <GalleryFullscreen report={fs} onClose={()=>setFs(null)} onDelete={()=>{if(fs){delReport(fs.id);onRefresh();setFs(null)}}}/>
    </div>
  )
}
function GalleryCard({r,sc,fmt,onOpen,onDel}){
  const[h,setH]=useState(false);const ad=getActionsForLang(r.language||'en')
  return(
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onOpen} style={{padding:'14px 16px',cursor:'pointer',border:`1px solid ${h?sc+'66':'rgba(0,212,255,0.18)'}`,background:h?`linear-gradient(135deg,${sc}0c,transparent)`:'rgba(0,0,0,0.2)',boxShadow:h?`0 0 16px ${sc}22`:'none',transform:h?'translateY(-2px)':'none',transition:'all 0.2s',position:'relative'}}>
      <div style={{position:'absolute',top:-1,left:-1,width:12,height:2,background:h?sc:sc+'55'}}/><div style={{position:'absolute',top:-1,left:-1,width:2,height:12,background:h?sc:sc+'55'}}/>
      <div style={{position:'absolute',bottom:-1,right:-1,width:12,height:2,background:h?sc:sc+'55'}}/><div style={{position:'absolute',bottom:-1,right:-1,width:2,height:12,background:h?sc:sc+'55'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <div>
          <div style={{fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.55)'}}>{new Date(r.savedAt).toLocaleString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}</div>
          <div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.35)',marginTop:2}}>{(r.language||'en').toUpperCase()} · {ad.country} · {r.alerts?.length||0} alerts · {fmt(r.sessionTime)}</div>
        </div>
        <span style={{fontFamily:PF,fontSize:14,color:sc,textShadow:`0 0 8px ${sc}`}}>{r.threatScore}</span>
      </div>
      <div style={{display:'flex',gap:1,marginBottom:6}}>{Array.from({length:10}).map((_,i)=><div key={i} style={{flex:1,height:4,background:i<Math.round(r.threatScore/10)?sc:sc+'22'}}/>)}</div>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <span style={{fontFamily:MF,fontSize:8,color:h?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.2)'}}>{r.audioUrl?'🎙 Has recording · ':''} Click for full report</span>
        <button onClick={e=>{e.stopPropagation();onDel()}} style={{fontFamily:PF,fontSize:5,padding:'3px 8px',border:'1px solid #ff2d5544',color:'#ff2d55',background:'rgba(255,45,85,0.06)',cursor:'pointer',opacity:h?1:0.3}}>✕</button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PSYCH TAB
══════════════════════════════════════════════════════════ */
export function PsychTab({psychScores,lieScores={}}){
  return(
    <div>
      <div style={{marginBottom:28,paddingLeft:18,borderLeft:'3px solid #ff9500'}}>
        <div style={{fontFamily:PF,fontSize:11,color:'#ff9500',textShadow:'0 0 16px #ff9500',marginBottom:10}}>PSYCHOLOGICAL MANIPULATION ANALYZER</div>
        <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.9,maxWidth:780}}>Maps the <span style={{color:'#ff9500'}}>psychological architecture</span> of a manipulation attempt — not just what the scammer says, but <span style={{color:'#ff2d55'}}>how they are engineering your decisions</span> and <span style={{color:'#ff2d55'}}>where they are lying</span>.</div>
      </div>
      <div style={{fontFamily:PF,fontSize:8,color:'#ff9500',marginBottom:10}}>CALLER — Manipulation Vectors</div>
      <div style={{marginBottom:24}}>{PSYCH_TACTICS.map(t=><VectorBar key={t.id} tac={t} score={psychScores[t.id]||0}/>)}</div>

      <div style={{marginBottom:28,paddingLeft:18,borderLeft:'3px solid #ff2d55'}}>
        <div style={{fontFamily:PF,fontSize:11,color:'#ff2d55',textShadow:'0 0 16px #ff2d55',marginBottom:10}}>LIE DETECTION ANALYSIS</div>
        <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.9,maxWidth:780}}>FBI behavioral deception indicators. Detects <span style={{color:'#ff2d55'}}>patterns of dishonesty</span> — inconsistencies, deflections, and pressure tactics.</div>
      </div>
      <div style={{fontFamily:PF,fontSize:8,color:'#ff2d55',marginBottom:10}}>CALLER — Lie Indicators</div>
      <div style={{marginBottom:24}}>{(LIE_INDICATORS||[]).map(l=><VectorBar key={l.id} tac={l} score={lieScores[l.id]||0}/>)}</div>

      <div style={{marginBottom:28,paddingLeft:18,borderLeft:'3px solid #00d4ff'}}>
        <div style={{fontFamily:PF,fontSize:11,color:'#00d4ff',textShadow:'0 0 16px #00d4ff',marginBottom:10}}>USER VULNERABILITY STATE</div>
        <div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.9}}>Your estimated susceptibility based on caller's manipulation intensity.</div>
      </div>
      <div style={{marginBottom:20}}>
        {[{id:'PANIC',icon:'😰',label:'Panic Level',desc:'Elevated stress may impair decision-making',color:'#ff2d55'},
          {id:'COMPLIANCE',icon:'🫡',label:'Compliance Risk',desc:'Willingness to follow instructions without questioning',color:'#ff9500'},
          {id:'TRUST',icon:'🤝',label:'Misplaced Trust',desc:'False credibility established by caller',color:'#ffd60a'},
        ].map(item=>{const s=Math.min(100,Math.round(item.id==='PANIC'?(psychScores.FEAR||0)*0.8+(psychScores.SCARCITY||0)*0.3:item.id==='COMPLIANCE'?(psychScores.AUTHORITY||0)*0.6+(psychScores.COMMITMENT||0)*0.5:(psychScores.RECIPROCITY||0)*0.7+(psychScores.AUTHORITY||0)*0.4));return<VectorBar key={item.id} tac={item} score={s}/>})}
      </div>

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
  const filtered=SCAM_PATTERNS.filter(p=>(!search||p.category.toLowerCase().includes(search.toLowerCase())||p.description.toLowerCase().includes(search.toLowerCase()))&&(filter==='all'||p.severity===filter))
  return(<div>
    <div style={{marginBottom:20,paddingLeft:16,borderLeft:'3px solid #00d4ff'}}><div style={{fontFamily:PF,fontSize:11,color:'#00d4ff',marginBottom:6}}>PATTERN LIBRARY</div><div style={{fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.55)'}}>50+ verified patterns — FTC · FBI IC3 · GASA · MAS · ACCC</div></div>
    <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{flex:1,minWidth:200,padding:'9px 14px',background:'rgba(0,212,255,0.04)',border:'1px solid rgba(0,212,255,0.18)',color:'#e0e0e0',fontFamily:MF,fontSize:11,outline:'none'}}/>
      <div style={{display:'flex',gap:6}}>{['all','critical','high','medium','low'].map(f=>{const fc=f==='all'?'#00d4ff':SEV[f]?.text||'#00d4ff';return<button key={f} onClick={()=>setFilter(f)} style={{padding:'9px 14px',fontFamily:PF,fontSize:6,border:`1px solid ${filter===f?fc:fc+'44'}`,background:filter===f?fc+'18':'transparent',color:filter===f?fc:'rgba(255,255,255,0.5)',cursor:'pointer'}}>{f.toUpperCase()}</button>})}</div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(330px,1fr))',gap:14}}>{filtered.map(p=>{const c=SEV[p.severity];return<PatternCard key={p.id} p={p} c={c} hit={detectedIds.includes(p.category)}/>})}</div>
  </div>)
}
function PatternCard({p,c,hit}){const[h,setH]=useState(false);return(
  <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:16,border:`1px solid ${h?c.border:c.border+'50'}`,background:h?c.bg:'rgba(0,0,0,0.22)',boxShadow:h?`0 0 20px ${c.border}28`:'none',transition:'all 0.2s',position:'relative'}}>
    <div style={{position:'absolute',top:-1,left:-1,width:16,height:2,background:c.border+'88'}}/><div style={{position:'absolute',top:-1,left:-1,width:2,height:16,background:c.border+'88'}}/>
    <div style={{position:'absolute',bottom:-1,right:-1,width:16,height:2,background:c.border+'88'}}/><div style={{position:'absolute',bottom:-1,right:-1,width:2,height:16,background:c.border+'88'}}/>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><div style={{fontFamily:PF,fontSize:7,color:h?c.text:'rgba(255,255,255,0.82)',flex:1,paddingRight:8,lineHeight:1.6}}>{p.category}</div><div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>{hit&&<div style={{fontFamily:PF,fontSize:6,color:c.text,animation:'blink 1s step-end infinite'}}>► HIT</div>}<div style={{fontFamily:PF,fontSize:6,padding:'3px 8px',border:`1px solid ${c.border}`,color:c.text,background:c.bg}}>{p.severity.toUpperCase()}</div></div></div>
    <div style={{fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.58)',marginBottom:10,lineHeight:1.65}}>{p.description}</div>
    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>{p.markers.map((m,i)=><span key={i} style={{fontFamily:MF,fontSize:9,padding:'3px 7px',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.52)',background:'rgba(255,255,255,0.03)'}}>"{m}"</span>)}</div>
    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontFamily:MF,fontSize:9,color:'#ff9500'}}>⚙ {p.mechanism}</span><span style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.4)'}}>{p.source}</span></div>
  </div>
)}

/* ══════════════════════════════════════════════════════════
   REPORT TAB — lie detect under psych, not separate
══════════════════════════════════════════════════════════ */
export function ReportTab({alerts,sessionTime,threatScore,psychScores,lieScores={},transcript=[],language='en',audioUrl=null}){
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const[saved,setSaved]=useState([]);const[msg,setMsg]=useState('')
  useEffect(()=>setSaved(loadReports()),[])
  const cur={alerts,sessionTime,threatScore,psychScores,lieScores,transcript,language,id:Date.now().toString(),savedAt:new Date().toISOString()}
  const actionsData=getActionsForLang(language)
  const doSave=()=>{if(!alerts.length)return;saveReport({alerts,sessionTime,threatScore,psychScores,lieScores,transcript,language,audioUrl});setSaved(loadReports());setMsg('✓ Saved!');setTimeout(()=>setMsg(''),2500)}

  return(<div style={{maxWidth:900,margin:'0 auto'}}>
    <div style={{marginBottom:20,paddingLeft:16,borderLeft:'3px solid #00d4ff'}}><div style={{fontFamily:PF,fontSize:11,color:'#00d4ff'}}>SESSION FORENSIC REPORT</div></div>
    {alerts.length===0?(<PBox color="#00d4ff20" style={{padding:60,textAlign:'center'}}><div style={{fontFamily:PF,fontSize:8,color:'rgba(255,255,255,0.25)',lineHeight:3}}>NO SESSION DATA<br/>START A SESSION FIRST</div></PBox>):(
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <PBox color="#ff2d55" style={{padding:24,background:'rgba(255,45,85,0.04)'}}>
          <div style={{fontFamily:PF,fontSize:9,color:'#ff2d55',marginBottom:16}}>⚠ HIGH RISK — SCAM DETECTED</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {[{l:'DURATION',v:fmt(sessionTime),c:'#00d4ff'},{l:'THREATS',v:alerts.length,c:'#ff2d55'},{l:'RISK SCORE',v:`${threatScore}/100`,c:'#ff2d55'},{l:'TACTICS',v:Object.values(psychScores).filter(x=>x>0).length,c:'#ff9500'}].map(item=>(
              <div key={item.l}><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.45)',marginBottom:5}}>{item.l}</div><div style={{fontFamily:PF,fontSize:15,color:item.c,textShadow:`0 0 12px ${item.c}`}}>{item.v}</div></div>
            ))}
          </div>
        </PBox>
        {transcript.length>0&&(<PBox color="#00d4ff25" style={{padding:20}}><div style={{fontFamily:PF,fontSize:8,color:'#00d4ff',marginBottom:14}}>FULL TRANSCRIPT ({transcript.length})</div><div style={{maxHeight:200,overflowY:'auto'}}>{transcript.map((l,i)=>{const isMe=l.speaker==='me';return<div key={i} style={{fontFamily:MF,fontSize:10,color:isMe?'#30d158':'rgba(255,255,255,0.65)',lineHeight:1.7,padding:'3px 0',borderLeft:l.flagged?'2px solid #ff2d55':isMe?'2px solid #30d15844':'2px solid transparent',paddingLeft:8}}><span style={{color:'rgba(0,212,255,0.5)',fontSize:9,marginRight:6}}>[{l.time}]</span><span style={{fontFamily:PF,fontSize:5,color:isMe?'#30d158':'#ff9500',marginRight:4}}>{isMe?'ME':'CALLER'}</span>{l.text}{l.flagged&&<span style={{color:'#ff2d55',fontSize:8,marginLeft:6}}>⚠</span>}</div>})}</div></PBox>)}
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
          <div style={{fontFamily:MF,fontSize:9,color:'rgba(48,209,88,0.5)',marginBottom:14}}>📍 {actionsData.country}</div>
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
function DataSourceCard({name,url,href,c}){const[h,setH]=useState(false);return<a href={href} target="_blank" rel="noreferrer" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{padding:'12px 14px',border:`1px solid ${h?c+'88':c+'22'}`,borderLeft:`2px solid ${h?c:c+'55'}`,background:h?c+'0f':'rgba(255,255,255,0.015)',transition:'all 0.18s',textDecoration:'none',display:'block'}}><div style={{fontFamily:MF,fontSize:11,color:h?c:c+'cc',marginBottom:3}}>{name}</div><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.35)'}}>{url}</div></a>}
function Tag({label,c}){const[h,setH]=useState(false);return<span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'inline-block',padding:'5px 12px',fontFamily:MF,fontSize:10,color:h?c:'rgba(255,255,255,0.7)',border:`1px solid ${h?c:c+'44'}`,background:h?c+'12':'rgba(255,255,255,0.03)',transition:'all 0.16s',whiteSpace:'nowrap'}}>{label}</span>}

export function AboutTab(){
  const R=['Data Scientist','AI/ML Researcher','Software Engineer','Cellist'],L=['Python','Java','Rust','Julia']
  const RC=['#00d4ff','#7b61ff','#30d158','#ffd60a'],LC=['#ff9500','#00d4ff','#ff2d55','#30d158']
  return(<div style={{maxWidth:900,margin:'0 auto'}}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
      <PBox color="#00d4ff" style={{padding:32,background:'rgba(0,212,255,0.02)',gridRow:'span 2'}}><div style={{fontFamily:PF,fontSize:9,color:'#00d4ff',marginBottom:16}}>THE PROBLEM</div><div style={{fontFamily:MF,fontSize:13,color:'rgba(255,255,255,0.7)',lineHeight:2.1}}>Every 30 seconds, someone loses money to a phone scam.<br/><br/>FBI IC3 2024:<span style={{fontFamily:PF,fontSize:16,color:'#ff2d55',display:'block',margin:'10px 0'}}>$16.6B</span>GASA global estimate:<span style={{fontFamily:PF,fontSize:16,color:'#ff2d55',display:'block',margin:'10px 0'}}>$1 TRILLION</span>Every solution shares one flaw: <span style={{color:'#ff9500'}}>they act after the damage is done</span>.</div></PBox>
      <PBox color="#ff9500" style={{padding:28}}><div style={{fontFamily:PF,fontSize:9,color:'#ff9500',marginBottom:12}}>WHAT'S NEW</div><div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.68)',lineHeight:1.9}}>World's <span style={{color:'#ff9500'}}>first</span> real-time multimodal scam detection. Gemini Live API + Rust WASM = &lt;80ms.</div></PBox>
      <PBox color="#7b61ff" style={{padding:28}}><div style={{fontFamily:PF,fontSize:9,color:'#7b61ff',marginBottom:12}}>PSYCH + LIE DETECT</div><div style={{fontFamily:MF,fontSize:12,color:'rgba(255,255,255,0.68)',lineHeight:1.9}}>6 Cialdini vectors + 5 lie indicators + user vulnerability state.</div></PBox>
    </div>
    <PBox color="#7b61ff" style={{padding:0,marginBottom:16,overflow:'hidden'}}>
      <div style={{height:3,background:'linear-gradient(90deg,#7b61ff,#00d4ff,#ff2d55,#ff9500,#30d158)',backgroundSize:'200%',animation:'rotateHue 4s linear infinite'}}/>
      <div style={{display:'flex',flexWrap:'wrap'}}>
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
    <PBox color="#30d15840" style={{padding:24}}><div style={{fontFamily:PF,fontSize:8,color:'#30d158',marginBottom:14}}>DATA SOURCES</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
      <DataSourceCard name="FBI IC3 2024" url="ic3.gov" href="https://www.ic3.gov/AnnualReport" c="#ff2d55"/>
      <DataSourceCard name="FTC Sentinel" url="ftc.gov" href="https://www.ftc.gov/enforcement/consumer-sentinel-network" c="#00d4ff"/>
      <DataSourceCard name="GASA Global" url="gasa.org" href="https://www.gasa.org" c="#ffd60a"/>
      <DataSourceCard name="MAS ScamShield" url="scamshield.org.sg" href="https://www.scamshield.org.sg" c="#7b61ff"/>
      <DataSourceCard name="ACCC ScamWatch" url="scamwatch.gov.au" href="https://www.scamwatch.gov.au" c="#30d158"/>
    </div></PBox>
  </div>)
}
