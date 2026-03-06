import { useState, useEffect, useRef } from 'react'
import { PixelLogo }      from './components/PixelLogo'
import { MonitorTab }     from './pages/MonitorTab'
import { PsychTab, PatternsTab, ReportTab, AboutTab } from './pages/Tabs'
import { useWebSocket }   from './hooks/useWebSocket'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useScreenCapture } from './hooks/useScreenCapture'
import { MOCK_ALERTS, PF, MF } from './utils/constants'
import { LanguageSelector } from './components/LanguageSelector'

const TABS = ['monitor','psych','patterns','report','about']
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true' || true

const XIcon = ({ size=12,color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.422l4.256 5.624 5.316-5.624Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const DiscordIcon = ({ size=13,color='#7b8cde' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.128 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)
const GitHubIcon = ({ size=13,color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{flexShrink:0,display:'block'}}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)

function SocialLink({ href,icon,label,c,bc,bg,hc,hbg }) {
  const [h,setH]=useState(false)
  return (
    <a href={href} target="_blank" rel="noreferrer" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',fontFamily:MF,fontSize:10,color:h?(hc||'#fff'):c,textDecoration:'none',border:`1px solid ${h?(hc||'rgba(255,255,255,0.35)'):bc}`,background:h?(hbg||'rgba(255,255,255,0.08)'):bg,boxShadow:h?`0 0 12px ${hc||'rgba(255,255,255,0.2)'}55`:'none',transform:h?'translateY(-2px)':'none',transition:'all 0.16s ease' }}>
      {icon}{label}
    </a>
  )
}

export default function App() {
  const [tab,setTab]=useState('monitor')
  const [monitoring,setMonitoring]=useState(false)
  const [sessionTime,setSessionTime]=useState(0)
  const [threatScore,setThreatScore]=useState(8)
  const [threatLevel,setThreatLevel]=useState('safe')
  const [alerts,setAlerts]=useState([])
  const [psychScores,setPsychScores]=useState({SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0})
  const [detectedIds,setDetectedIds]=useState([])
  const [screenOn,setScreenOn]=useState(false)
  const [scanY,setScanY]=useState(0)
  const [glitch,setGlitch]=useState(false)
  const [audioLevel,setAudioLevel]=useState(0)
  const [language,setLanguage]=useState('en')
  const [transcript,setTranscript]=useState([])  // NEW: transcript state
  const timerRef=useRef(null), demoRef=useRef(null), alertIdxRef=useRef(0)

  useEffect(()=>{ const t=setInterval(()=>setScanY(y=>(y+1.4)%100),16); return()=>clearInterval(t) },[])

  const ws=useWebSocket()
  const audio=useAudioEngine({active:monitoring&&!DEMO,onChunk:ws.sendAudioChunk})
  const screen=useScreenCapture({active:screenOn&&!DEMO,onFrame:ws.sendScreenFrame})

  useEffect(()=>{ if(DEMO)return; setAlerts(ws.alerts);setThreatScore(ws.threatScore);setPsychScores(ws.psychScores);setThreatLevel(ws.threatScore>75?'critical':ws.threatScore>45?'high':'safe') },[ws.alerts,ws.threatScore,ws.psychScores])

  // Voice demo: audio level simulation while monitoring
  useEffect(()=>{
    if(!monitoring){clearInterval(demoRef.current);return}
    demoRef.current=setInterval(()=>{
      setAudioLevel(Math.random()*0.6+0.1)
    },150)
    return()=>clearInterval(demoRef.current)
  },[monitoring])

  // Handler for voice demo alerts (called by MonitorTab when TTS triggers an alert)
  const handleDemoAlert = (alert) => {
    setAlerts(prev=>[alert,...prev])
    const s=Math.min(95,threatScore+18+Math.floor(Math.random()*10))
    setThreatScore(s);setThreatLevel(s>75?'critical':s>45?'high':'safe')
    ;(alert.tactics||[]).forEach(t=>setPsychScores(prev=>({...prev,[t]:Math.min(100,(prev[t]||0)+25+Math.floor(Math.random()*15))})))
    setDetectedIds(prev=>prev.includes(alert.pattern)?prev:[...prev,alert.pattern])
    if(alert.severity==='critical'){setGlitch(true);setTimeout(()=>setGlitch(false),500)}
  }

  // NEW: Handler for transcript lines from MonitorTab
  const handleTranscriptLine = (line) => {
    setTranscript(prev=>[...prev,line])
  }

  useEffect(()=>{ if(monitoring)timerRef.current=setInterval(()=>setSessionTime(t=>t+1),1000); else clearInterval(timerRef.current); return()=>clearInterval(timerRef.current) },[monitoring])

  const handleStart=()=>{
    setMonitoring(true);setAlerts([]);setThreatScore(8);setThreatLevel('safe')
    setSessionTime(0);setPsychScores({SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0})
    setDetectedIds([]);alertIdxRef.current=0
    setTranscript([])  // NEW: reset transcript
    if(!DEMO){ws.reset();ws.startSession()}
  }
  const handleStop=()=>{setMonitoring(false);if(!DEMO)ws.endSession();setTab('report')}
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#30d158'

  const cursorSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><rect x='4' y='1' width='12' height='14' rx='1' fill='%2300d4ff' opacity='0.9'/><rect x='6' y='4' width='3' height='3' fill='%23020408'/><rect x='11' y='4' width='3' height='3' fill='%23020408'/><rect x='6' y='12' width='2' height='3' fill='%23020408'/><rect x='12' y='12' width='2' height='3' fill='%23020408'/><rect x='8' y='12' width='4' height='2' fill='%2300d4ff' opacity='0.5'/></svg>`
  const cursorURL = `url("data:image/svg+xml,${cursorSVG}") 10 10, crosshair`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;cursor:${cursorURL}}
        body{background:#020408;color:#e0e0e0;overflow-x:hidden}
        a,button{cursor:${cursorURL}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:rgba(0,212,255,0.03)}::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#00d4ff,#7b61ff)}
        @keyframes marquee  {0%{transform:translateX(100%)}100%{transform:translateX(-200%)}}
        @keyframes blink    {0%,100%{opacity:1}50%{opacity:0}}
        @keyframes ppulse   {0%,100%{box-shadow:0 0 8px #ff2d55}50%{box-shadow:0 0 32px #ff2d55,0 0 64px rgba(255,45,85,0.25)}}
        @keyframes shimmer  {0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes rotateHue{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
        @keyframes dataGlow {0%,100%{opacity:0.35}50%{opacity:0.9}}
        @keyframes counterUp{from{opacity:0;transform:scale(0.8) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes colorCycle{0%{color:#00ffff;text-shadow:0 0 8px #00ffff}25%{color:#a78bfa;text-shadow:0 0 8px #a78bfa}50%{color:#4ade80;text-shadow:0 0 8px #4ade80}75%{color:#ffaa00;text-shadow:0 0 8px #ffaa00}100%{color:#00ffff;text-shadow:0 0 8px #00ffff}}
        @keyframes borderGlow{0%{border-color:#00ffff44}33%{border-color:#a78bfa44}66%{border-color:#ff4d8d44}100%{border-color:#00ffff44}}
        .tab-btn{color:rgba(255,255,255,0.6)!important;transition:all 0.15s ease;position:relative}
        .tab-btn:hover{color:rgba(255,255,255,0.95)!important;text-shadow:0 0 12px rgba(255,255,255,0.4)!important;background:rgba(255,255,255,0.04)!important}
        .tab-btn.active-tab{color:#00ffff!important;text-shadow:0 0 16px #00ffff,0 0 32px rgba(0,255,255,0.4)!important}
      `}</style>

      <div style={{ minHeight:'100vh',background:'#020408',color:'#e0e0e0',fontFamily:MF,position:'relative',overflow:'hidden',filter:glitch?'hue-rotate(18deg) saturate(2.2)':'none',transition:'filter 0.08s' }}>
        {/* Grid overlay */}
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',opacity:0.028,backgroundImage:'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)',backgroundSize:'8px 8px' }} />

        <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:999,background:'radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.55) 100%)' }} />

        {/* Scanline */}
        <div style={{ position:'fixed',left:0,right:0,height:2,zIndex:998,pointerEvents:'none',background:'linear-gradient(transparent,rgba(0,212,255,0.07),transparent)',top:`${scanY}%`,transition:'top 0.016s linear' }} />

        {/* Ambient glow */}
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',transition:'background 1.8s ease',background:monitoring?`radial-gradient(ellipse 55% 35% at 50% 0%,${tColor}14 0%,transparent 70%)`:'radial-gradient(ellipse 70% 50% at 50% 35%,rgba(0,212,255,0.025) 0%,transparent 70%)' }} />

        {/* Side glow lines */}
        <div style={{ position:'fixed',top:0,left:0,bottom:0,width:2,zIndex:1,pointerEvents:'none',background:`linear-gradient(180deg,transparent,${tColor}55,${tColor}22,transparent)`,animation:'dataGlow 3s ease-in-out infinite',transition:'background 1s' }} />
        <div style={{ position:'fixed',top:0,right:0,bottom:0,width:2,zIndex:1,pointerEvents:'none',background:`linear-gradient(180deg,transparent,${tColor}55,${tColor}22,transparent)`,animation:'dataGlow 3s ease-in-out infinite 1.5s',transition:'background 1s' }} />

        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',minHeight:'100vh' }}>

          {/* HEADER */}
          <header style={{ background:'rgba(2,4,8,0.92)',borderBottom:'1px solid rgba(0,255,255,0.15)',position:'sticky',top:0,zIndex:100,backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)' }}>
            <div style={{ height:2,background:monitoring?`linear-gradient(90deg,transparent,${tColor}cc,${tColor}88,transparent)`:'linear-gradient(90deg,transparent,rgba(0,255,255,0.6),rgba(167,139,250,0.4),transparent)',transition:'background 0.6s ease' }} />
            <div style={{ display:'flex',alignItems:'center',gap:0,height:90,padding:'0 32px' }}>
              <PixelLogo />
              <div style={{ width:1,height:40,background:'rgba(0,255,255,0.2)',margin:'0 22px',flexShrink:0 }} />
              <div style={{ flex:1,overflow:'hidden',height:20,display:'flex',alignItems:'center',minWidth:0 }}>
                <div style={{ fontFamily:MF,fontSize:10,whiteSpace:'nowrap',animation:'marquee 28s linear infinite,colorCycle 8s ease infinite',letterSpacing:2 }}>
                  ◄ VOXGUARD - REAL-TIME MULTIMODAL AI PROTECTION - GEMINI LIVE API + RUST WASM ENGINE - &lt;80ms LATENCY - GROUNDED: FTC - FBI IC3 - GASA - MAS - ACCC - #GeminiLiveAgentChallenge - BY WIQI LEE ►
                </div>
              </div>
              <div style={{ width:1,height:40,background:'rgba(0,255,255,0.2)',margin:'0 22px',flexShrink:0 }} />
              <LanguageSelector value={language} onChange={setLanguage} />
              <div style={{ width:1,height:40,background:'rgba(0,255,255,0.2)',margin:'0 14px',flexShrink:0 }} />
              {/* Status indicator */}
              <div style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 20px',border:`1px solid ${monitoring?tColor+'66':'rgba(255,255,255,0.15)'}`,background:monitoring?`linear-gradient(135deg,${tColor}14,${tColor}08)`:'rgba(255,255,255,0.04)',boxShadow:monitoring?`0 0 24px ${tColor}28`:'0 0 12px rgba(0,255,255,0.05)',transition:'all 0.5s ease',minWidth:150,flexShrink:0,animation:monitoring?'':'borderGlow 4s ease infinite' }}>
                <div style={{ position:'relative',width:12,height:12,flexShrink:0 }}>
                  {monitoring&&<div style={{ position:'absolute',inset:-4,borderRadius:'50%',border:`1px solid ${tColor}88`,animation:'ppulse 1.6s ease-in-out infinite' }} />}
                  <div style={{ width:12,height:12,background:monitoring?tColor:'rgba(0,255,255,0.5)',boxShadow:monitoring?`0 0 12px ${tColor},0 0 24px ${tColor}66`:'0 0 8px rgba(0,255,255,0.3)',animation:monitoring?'blink 0.9s step-end infinite':'none',transition:'all 0.4s' }} />
                </div>
                <div>
                  <div style={{ fontFamily:PF,fontSize:7,color:monitoring?tColor:'rgba(0,255,255,0.8)',letterSpacing:2,lineHeight:1,transition:'color 0.4s',textShadow:monitoring?`0 0 8px ${tColor}`:'0 0 6px rgba(0,255,255,0.4)' }}>{monitoring?'LIVE':'STANDBY'}</div>
                  {monitoring&&<div style={{ fontFamily:MF,fontSize:10,color:tColor+'cc',marginTop:3 }}>{fmt(sessionTime)}</div>}
                </div>
                {DEMO&&<div style={{ marginLeft:'auto',fontFamily:PF,fontSize:6,padding:'4px 8px',border:'1px solid rgba(255,214,10,0.5)',color:'#ffd60a',background:'rgba(255,214,10,0.1)',display:'flex',alignItems:'center',gap:4,textShadow:'0 0 6px #ffd60a' }}><div style={{ width:5,height:5,background:'#ffd60a',animation:'blink 1s step-end infinite',boxShadow:'0 0 4px #ffd60a' }}/>DEMO</div>}
              </div>
            </div>
          </header>

          {/* TABS */}
          <nav style={{ display:'flex',alignItems:'stretch',borderBottom:'1px solid rgba(0,255,255,0.1)',background:'rgba(2,4,8,0.97)',padding:'0 32px',position:'sticky',top:92,zIndex:99 }}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`tab-btn${tab===t?' active-tab':''}`}
                style={{ fontFamily:PF,fontSize:7,padding:'16px 22px',border:'none',borderBottom:tab===t?'2px solid #00ffff':'2px solid transparent',background:'transparent',cursor:'pointer',textTransform:'uppercase',letterSpacing:2,position:'relative' }}>
                {tab===t&&<span style={{ position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:6,height:6,background:'#00ffff',boxShadow:'0 0 10px #00ffff,0 0 20px #00ffff55' }} />}
                {t}
              </button>
            ))}
          </nav>

          {/* CONTENT */}
          <main style={{ flex:1,padding:'32px',maxWidth:1440,margin:'0 auto',width:'100%' }}>
            {tab==='monitor'  && <MonitorTab monitoring={monitoring} threatLevel={threatLevel} sessionTime={sessionTime} alerts={alerts} threatScore={threatScore} audioLevel={audioLevel} screenOn={screenOn} onStart={handleStart} onStop={handleStop} onToggleScreen={()=>setScreenOn(x=>!x)} onDemoAlert={handleDemoAlert} onTranscriptLine={handleTranscriptLine} language={language} />}
            {tab==='psych'    && <PsychTab   psychScores={psychScores} />}
            {tab==='patterns' && <PatternsTab detectedIds={detectedIds} />}
            {tab==='report'   && <ReportTab  alerts={alerts} sessionTime={sessionTime} threatScore={threatScore} psychScores={psychScores} transcript={transcript} language={language} />}
            {tab==='about'    && <AboutTab />}
          </main>

          {/* FOOTER */}
          <footer style={{ background:'rgba(2,4,8,0.98)',borderTop:'1px solid rgba(0,255,255,0.12)' }}>
            <div style={{ height:1,background:'linear-gradient(90deg,transparent,rgba(0,255,255,0.4),rgba(167,139,250,0.3),rgba(74,222,128,0.2),transparent)' }} />
            <div style={{ padding:'14px 32px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
              <div style={{ fontFamily:PF,fontSize:6,letterSpacing:1.5,lineHeight:2 }}>
                <span style={{ color:'rgba(0,255,255,0.85)',textShadow:'0 0 6px rgba(0,255,255,0.4)' }}>VOXGUARD &copy; 2026</span><br/>
                <span style={{ color:'rgba(255,255,255,0.5)',fontSize:5 }}>WIQI LEE - MIT LICENSE</span>
              </div>
              <div style={{ display:'flex',gap:6,alignItems:'center',flexWrap:'wrap' }}>
                <SocialLink href="https://x.com/wiqi_lee" icon={<XIcon size={11} color="currentColor"/>} label="@wiqi_lee" c="rgba(255,255,255,0.7)" bc="rgba(255,255,255,0.16)" bg="rgba(255,255,255,0.04)" hc="#fff" hbg="rgba(255,255,255,0.1)" />
                <SocialLink href="https://discord.com/users/209385020912173066" icon={<DiscordIcon size={12} color="#7b8cde"/>} label="Discord" c="#7b8cde" bc="rgba(123,140,222,0.25)" bg="rgba(123,140,222,0.06)" hc="#a5b4fc" hbg="rgba(123,140,222,0.14)" />
                <SocialLink href="https://github.com/wiqilee" icon={<GitHubIcon size={12} color="currentColor"/>} label="GitHub" c="rgba(255,255,255,0.7)" bc="rgba(255,255,255,0.14)" bg="rgba(255,255,255,0.04)" hc="#fff" hbg="rgba(255,255,255,0.1)" />
                <div style={{ width:1,height:18,background:'rgba(255,255,255,0.12)',margin:'0 3px' }} />
                <SocialLink href="https://geminiliveagentchallenge.devpost.com" icon={null} label="#GeminiLiveAgentChallenge" c="#ffd60a" bc="rgba(255,214,10,0.25)" bg="rgba(255,214,10,0.06)" hc="#ffe55a" hbg="rgba(255,214,10,0.12)" />
              </div>
              <div style={{ fontFamily:PF,fontSize:6,color:'rgba(0,255,255,0.8)',letterSpacing:1.5,textAlign:'right',lineHeight:1.9,textShadow:'0 0 6px rgba(0,255,255,0.3)' }}>
                POWERED BY<br/><span style={{ color:'#5da9ff',textShadow:'0 0 10px #4285F4aa',fontSize:6 }}>GEMINI LIVE API</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
