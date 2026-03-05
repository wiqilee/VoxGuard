import { useState, useEffect } from 'react'
import { PBox, PBtn, StatCard }  from '../components/Primitives'
import { WaveformVisualizer }    from '../components/WaveformVisualizer'
import { ThreatMeter }           from '../components/ThreatMeter'
import { AlertCard }             from '../components/AlertCard'
import { PF, MF }                from '../utils/constants'

const DEMO_SCRIPTS = [
  { id:'bank',       label:'🏦 Bank Impersonation',  text:'"Hello, I\'m calling from Chase Bank fraud prevention. We\'ve detected suspicious activity on your account. Your account will be frozen in 10 minutes unless you verify your identity — please provide your account number and the OTP we just sent to your phone."' },
  { id:'investment', label:'📈 Investment Scam',     text:'"This is a guaranteed investment opportunity — 300% returns in 30 days, zero risk. To lock in your position before it expires in 10 minutes, I need you to transfer $500 immediately. Don\'t tell your family — this is strictly confidential."' },
  { id:'tech',       label:'💻 Tech Support Scam',   text:'"Your computer has been compromised. I\'m calling from Microsoft Security Center. You must install our remote access tool immediately or we cannot protect your credit cards from fraudulent charges within the hour."' },
]

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

export function MonitorTab({ monitoring,threatLevel,sessionTime,alerts,threatScore,audioLevel,screenOn,onStart,onStop,onToggleScreen }) {
  const [script,setScript]=useState(null)
  const [now,setNow]=useState(getNow())
  useEffect(()=>{ const t=setInterval(()=>setNow(getNow()),1000); return ()=>clearInterval(t) },[])

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const avgConf=alerts.length>0?Math.round(alerts.reduce((a,b)=>a+b.confidence,0)/alerts.length):null
  const tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#00d4ff'

  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 296px',gap:20 }}>

      {/* ── LEFT ── */}
      <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

        {/* Control panel */}
        <PBox color={monitoring&&threatLevel==='critical'?'#ff2d55':'#00d4ff'} style={{ padding:24,background:'rgba(0,212,255,0.01)',transition:'all 0.5s' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:PF,fontSize:10,color:'#00d4ff',marginBottom:6,textShadow:'0 0 14px #00d4ff' }}>LIVE SESSION MONITOR</div>
              <div style={{ fontFamily:MF,fontSize:11,color:'rgba(255,255,255,0.48)' }}>
                {monitoring?`► ANALYZING AUDIO STREAM — ${fmt(sessionTime)} ELAPSED`:'■ READY — GRANT MIC PERMISSIONS TO BEGIN'}
              </div>
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap',justifyContent:'flex-end' }}>
              <PBtn onClick={onToggleScreen} color={screenOn?'#ffd60a':'#7b61ff'}>{screenOn?'■ SCREEN OFF':'◈ SCREEN WATCH'}</PBtn>
              {!monitoring?<PBtn onClick={onStart} color="#30d158">▶ START</PBtn>:<PBtn onClick={onStop} danger>■ STOP</PBtn>}
            </div>
          </div>

          {/* Waveform */}
          <div style={{ background:'rgba(0,0,0,0.5)',padding:'10px 14px',marginBottom:16,border:`1px solid ${tColor}18`,position:'relative',transition:'border-color 0.5s' }}>
            <div style={{ fontFamily:MF,fontSize:9,color:`${tColor}60`,marginBottom:8,letterSpacing:2,transition:'color 0.5s' }}>
              AUDIO STREAM ── GEMINI LIVE API ── RUST WASM ENGINE
            </div>
            <WaveformVisualizer active={monitoring} threatLevel={threatLevel} audioLevel={audioLevel} />
            {screenOn&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#7b61ff',textShadow:'0 0 8px #7b61ff',animation:'blink 1.5s step-end infinite' }}>◈ SCREEN ACTIVE</div>}
          </div>

          <div style={{ display:'flex',gap:8 }}>
            <StatCard label="THREATS"    value={alerts.length}               color="#ff2d55" icon="⚠" />
            <StatCard label="PATTERNS"   value="50+"                         color="#00d4ff" icon="◎" />
            <StatCard label="LATENCY"    value="<80ms"                       color="#30d158" icon="⚡" />
            <StatCard label="CONFIDENCE" value={avgConf?`${avgConf}%`:'—'}   color="#7b61ff" icon="◆" />
          </div>
        </PBox>

        {/* Demo scripts */}
        <PBox color="rgba(255,214,10,0.2)" style={{ padding:16,background:'rgba(255,214,10,0.01)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
            <div style={{ width:6,height:6,background:'#ffd60a',animation:'blink 1s step-end infinite' }} />
            <span style={{ fontFamily:PF,fontSize:7,color:'#ffd60a',letterSpacing:1 }}>DEMO SCRIPTS</span>
            <span style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.45)' }}>— select then START</span>
          </div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:script?12:0 }}>
            {DEMO_SCRIPTS.map(s=>(
              <button key={s.id} onClick={()=>setScript(script?.id===s.id?null:s)}
                style={{ fontFamily:MF,fontSize:10,padding:'7px 14px',cursor:'pointer',border:`1px solid ${script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.22)'}`,background:script?.id===s.id?'rgba(255,214,10,0.12)':'transparent',color:script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.52)',transition:'all 0.15s' }}>
                {s.label}
              </button>
            ))}
          </div>
          {script&&<div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.55)',lineHeight:1.75,padding:'12px 14px',background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,214,10,0.1)' }}>{script.text}</div>}
        </PBox>

        {/* Alerts */}
        <PBox color={alerts.length>0?'#ff2d55':'rgba(0,212,255,0.15)'} style={{ padding:20,background:'rgba(0,0,0,0.2)',flex:1 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:PF,fontSize:9,color:'#00d4ff' }}>REAL-TIME ALERTS</div>
              <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:5 }}>{now}</div>
            </div>
            {alerts.length>0&&(
              <div style={{ fontFamily:PF,fontSize:7,padding:'5px 12px',border:'2px solid #ff2d55',color:'#ff2d55',background:'rgba(255,45,85,0.08)',animation:'ppulse 1.5s infinite',flexShrink:0 }}>
                {alerts.length} DETECTED
              </div>
            )}
          </div>
          {alerts.length===0 ? (
            <div style={{ textAlign:'center',padding:'52px 0' }}>
              <div style={{ fontSize:38,marginBottom:14,color:'rgba(0,212,255,0.15)' }}>🛡</div>
              <div style={{ fontFamily:PF,fontSize:7,color:'rgba(255,255,255,0.2)',lineHeight:2.5 }}>
                {monitoring?'MONITORING...\nNO THREATS DETECTED':'START SESSION\nTO BEGIN PROTECTION'}
              </div>
            </div>
          ) : (
            <div style={{ maxHeight:380,overflowY:'auto',paddingRight:4 }}>
              {alerts.map((a,i)=><AlertCard key={a.id} alert={a} index={i} />)}
            </div>
          )}
        </PBox>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
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
