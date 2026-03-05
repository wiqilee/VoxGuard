import { useState, useEffect, useRef } from 'react'
import { PixelLogo }      from './components/PixelLogo'
import { MonitorTab }     from './pages/MonitorTab'
import { PsychTab, PatternsTab, ReportTab, AboutTab } from './pages/Tabs'
import { useWebSocket }   from './hooks/useWebSocket'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useScreenCapture } from './hooks/useScreenCapture'
import { MOCK_ALERTS, PF, MF } from './utils/constants'

const TABS = ['monitor','psych','patterns','report','about']
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true' || true

/* ── Social logo SVGs ─────────────────────────────────────── */
const XIcon = ({ size = 12, color = '#e0e0e0' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink:0, display:'block' }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.422l4.256 5.624 5.316-5.624Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const DiscordIcon = ({ size = 13, color = '#7b8cde' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink:0, display:'block' }}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.128 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)
const GitHubIcon = ({ size = 13, color = '#e0e0e0' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink:0, display:'block' }}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)

/* ── Social link button ────────────────────────────────────── */
function SocialLink({ href, icon, label, color = 'rgba(255,255,255,0.65)', borderColor = 'rgba(255,255,255,0.12)', bg = 'rgba(255,255,255,0.04)', hoverColor, hoverBg }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href} target="_blank" rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:7, padding:'6px 12px',
        fontFamily:MF, fontSize:10,
        color: hov ? (hoverColor||'#fff') : color,
        textDecoration:'none',
        border:`1px solid ${hov ? (hoverColor||'rgba(255,255,255,0.35)') : borderColor}`,
        background: hov ? (hoverBg||'rgba(255,255,255,0.08)') : bg,
        boxShadow: hov ? `0 0 12px ${hoverColor||'rgba(255,255,255,0.2)'}44` : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition:'all 0.16s ease',
      }}
    >
      {icon}
      {label}
    </a>
  )
}

export default function App() {
  const [tab,         setTab]         = useState('monitor')
  const [monitoring,  setMonitoring]  = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [threatScore, setThreatScore] = useState(8)
  const [threatLevel, setThreatLevel] = useState('safe')
  const [alerts,      setAlerts]      = useState([])
  const [psychScores, setPsychScores] = useState({ SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0 })
  const [detectedIds, setDetectedIds] = useState([])
  const [screenOn,    setScreenOn]    = useState(false)
  const [scanY,       setScanY]       = useState(0)
  const [glitch,      setGlitch]      = useState(false)
  const [audioLevel,  setAudioLevel]  = useState(0)

  const timerRef    = useRef(null)
  const demoRef     = useRef(null)
  const alertIdxRef = useRef(0)

  useEffect(() => {
    const t = setInterval(() => setScanY(y => (y + 1.4) % 100), 16)
    return () => clearInterval(t)
  }, [])

  const ws     = useWebSocket()
  const audio  = useAudioEngine({ active: monitoring && !DEMO, onChunk: ws.sendAudioChunk })
  const screen = useScreenCapture({ active: screenOn && !DEMO, onFrame: ws.sendScreenFrame })

  useEffect(() => {
    if (DEMO) return
    setAlerts(ws.alerts); setThreatScore(ws.threatScore); setPsychScores(ws.psychScores)
    setThreatLevel(ws.threatScore > 75 ? 'critical' : ws.threatScore > 45 ? 'high' : 'safe')
  }, [ws.alerts, ws.threatScore, ws.psychScores])

  useEffect(() => {
    if (!DEMO || !monitoring) { clearInterval(demoRef.current); return }
    demoRef.current = setInterval(() => {
      setAudioLevel(Math.random() * 0.8 + 0.2)
      if (Math.random() > 0.82 && alertIdxRef.current < MOCK_ALERTS.length) {
        const a = MOCK_ALERTS[alertIdxRef.current++]
        setAlerts(prev => [a, ...prev])
        const s = Math.min(95, threatScore + 20 + Math.floor(Math.random() * 12))
        setThreatScore(s)
        setThreatLevel(s > 75 ? 'critical' : s > 45 ? 'high' : 'safe')
        ;(a.tactics||[]).forEach(t => setPsychScores(prev => ({ ...prev, [t]: Math.min(100,(prev[t]||0)+28+Math.floor(Math.random()*18)) })))
        setDetectedIds(prev => prev.includes(a.pattern) ? prev : [...prev, a.pattern])
        if (a.severity === 'critical') { setGlitch(true); setTimeout(() => setGlitch(false), 500) }
      }
    }, 1000)
    return () => clearInterval(demoRef.current)
  }, [monitoring, threatScore])

  useEffect(() => {
    if (monitoring) timerRef.current = setInterval(() => setSessionTime(t => t+1), 1000)
    else clearInterval(timerRef.current)
    return () => clearInterval(timerRef.current)
  }, [monitoring])

  const handleStart = () => {
    setMonitoring(true); setAlerts([]); setThreatScore(8); setThreatLevel('safe')
    setSessionTime(0); setPsychScores({ SCARCITY:0,AUTHORITY:0,FEAR:0,RECIPROCITY:0,ISOLATION:0,COMMITMENT:0 })
    setDetectedIds([]); alertIdxRef.current = 0
    if (!DEMO) { ws.reset(); ws.startSession() }
  }
  const handleStop = () => { setMonitoring(false); if (!DEMO) ws.endSession(); setTab('report') }
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const tColor = threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#30d158'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#020408;color:#e0e0e0;overflow-x:hidden}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:rgba(0,212,255,0.03)}
        ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#00d4ff,#7b61ff)}
        @keyframes marquee  { 0%{transform:translateX(100%)} 100%{transform:translateX(-200%)} }
        @keyframes blink    { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes ppulse   { 0%,100%{box-shadow:0 0 8px #ff2d55}50%{box-shadow:0 0 32px #ff2d55,0 0 64px rgba(255,45,85,0.25)} }
        @keyframes shimmer  { 0%{background-position:-200% center}100%{background-position:200% center} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes rotateHue{ 0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)} }
        @keyframes dataGlow { 0%,100%{opacity:0.4}50%{opacity:1} }
        .tab-btn:hover { color:rgba(255,255,255,0.72)!important }
      `}</style>

      <div style={{
        minHeight:'100vh', background:'#020408', color:'#e0e0e0',
        fontFamily: MF, position:'relative', overflow:'hidden',
        filter: glitch ? 'hue-rotate(18deg) saturate(2.2) brightness(1.05)' : 'none',
        transition: 'filter 0.08s',
      }}>
        {/* Pixel grid background */}
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',opacity:0.028,backgroundImage:'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)',backgroundSize:'8px 8px' }} />

        {/* CRT vignette */}
        <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:999,background:'radial-gradient(ellipse at center,transparent 52%,rgba(0,0,0,0.82) 100%)' }} />

        {/* Moving scanline */}
        <div style={{ position:'fixed',left:0,right:0,height:2,zIndex:998,pointerEvents:'none',background:'linear-gradient(transparent,rgba(0,212,255,0.07),transparent)',top:`${scanY}%`,transition:'top 0.016s linear' }} />

        {/* Threat-reactive ambient light */}
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',transition:'background 1.8s ease',background:monitoring?`radial-gradient(ellipse 55% 35% at 50% 0%, ${tColor}14 0%, transparent 70%)`:'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(0,212,255,0.025) 0%, transparent 70%)' }} />

        {/* Data stream lines — decorative left/right */}
        <div style={{ position:'fixed',top:0,left:0,bottom:0,width:2,zIndex:1,pointerEvents:'none',background:`linear-gradient(180deg,transparent,${tColor}44,${tColor}22,transparent)`,animation:'dataGlow 3s ease-in-out infinite',transition:'background 1s' }} />
        <div style={{ position:'fixed',top:0,right:0,bottom:0,width:2,zIndex:1,pointerEvents:'none',background:`linear-gradient(180deg,transparent,${tColor}44,${tColor}22,transparent)`,animation:'dataGlow 3s ease-in-out infinite 1.5s',transition:'background 1s' }} />

        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',minHeight:'100vh' }}>

          {/* ═══════════════════════════ HEADER ═══════════════════════════ */}
          <header style={{
            background:'rgba(2,4,8,0.98)',
            borderBottom:'1px solid rgba(0,212,255,0.1)',
            position:'sticky',top:0,zIndex:100,
            backdropFilter:'blur(24px)',
          }}>
            {/* Threat-reactive top bar */}
            <div style={{
              height:2,
              background: monitoring
                ? `linear-gradient(90deg,transparent,${tColor}cc,${tColor}88,transparent)`
                : 'linear-gradient(90deg,transparent,rgba(0,212,255,0.5),rgba(123,97,255,0.3),transparent)',
              transition:'background 0.6s ease',
            }} />

            <div style={{ display:'flex',alignItems:'center',gap:0,height:62,padding:'0 28px' }}>
              <PixelLogo />

              {/* Divider */}
              <div style={{ width:1,height:30,background:'rgba(0,212,255,0.15)',margin:'0 20px' }} />

              {/* Ticker */}
              <div style={{ flex:1,overflow:'hidden',height:20,display:'flex',alignItems:'center' }}>
                <div style={{ fontFamily:MF,fontSize:9,color:'rgba(0,212,255,0.3)',whiteSpace:'nowrap',animation:'marquee 30s linear infinite',letterSpacing:1.5 }}>
                  ◄ SCAM SHIELD — REAL-TIME MULTIMODAL AI PROTECTION — GEMINI LIVE API + RUST WASM ENGINE — &lt;80ms LATENCY — GROUNDED: FTC · FBI IC3 · GASA · MAS · ACCC — #GeminiLiveAgentChallenge — BY WIQI LEE ►
                </div>
              </div>

              <div style={{ width:1,height:30,background:'rgba(0,212,255,0.15)',margin:'0 20px' }} />

              {/* Status indicator */}
              <div style={{
                display:'flex',alignItems:'center',gap:10,padding:'8px 16px',
                border:`1px solid ${monitoring?tColor+'44':'rgba(255,255,255,0.1)'}`,
                background:monitoring?`linear-gradient(135deg,${tColor}0e,${tColor}04)`:'rgba(255,255,255,0.025)',
                boxShadow:monitoring?`0 0 20px ${tColor}20`:'none',
                transition:'all 0.5s ease',minWidth:140,
              }}>
                <div style={{ position:'relative',width:10,height:10,flexShrink:0 }}>
                  {monitoring&&<div style={{ position:'absolute',inset:-4,borderRadius:'50%',border:`1px solid ${tColor}88`,animation:'ppulse 1.6s ease-in-out infinite' }} />}
                  <div style={{ width:10,height:10,background:monitoring?tColor:'rgba(255,255,255,0.25)',boxShadow:monitoring?`0 0 12px ${tColor},0 0 24px ${tColor}66`:'none',animation:monitoring?'blink 0.9s step-end infinite':'none',transition:'all 0.4s' }} />
                </div>
                <div>
                  <div style={{ fontFamily:PF,fontSize:6,color:monitoring?tColor:'rgba(255,255,255,0.45)',letterSpacing:2,lineHeight:1,transition:'color 0.4s' }}>
                    {monitoring?'LIVE':'STANDBY'}
                  </div>
                  {monitoring&&<div style={{ fontFamily:MF,fontSize:9,color:tColor+'99',marginTop:2 }}>{fmt(sessionTime)}</div>}
                </div>
                {DEMO&&(
                  <div style={{ marginLeft:'auto',fontFamily:PF,fontSize:5,padding:'3px 7px',border:'1px solid rgba(255,214,10,0.4)',color:'#ffd60a',background:'rgba(255,214,10,0.07)',display:'flex',alignItems:'center',gap:4 }}>
                    <div style={{ width:4,height:4,background:'#ffd60a',animation:'blink 1s step-end infinite' }} /> DEMO
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ═══════════════════════════ TABS ═══════════════════════════ */}
          <nav style={{ display:'flex',alignItems:'stretch',borderBottom:'1px solid rgba(0,212,255,0.08)',background:'rgba(2,4,8,0.95)',padding:'0 28px',position:'sticky',top:64,zIndex:99 }}>
            {TABS.map(t => (
              <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
                fontFamily:PF,fontSize:6,padding:'14px 18px',
                border:'none',borderBottom:tab===t?`2px solid #00d4ff`:'2px solid transparent',
                background:'transparent',
                color:tab===t?'#00d4ff':'rgba(255,255,255,0.2)',
                cursor:'pointer',textTransform:'uppercase',letterSpacing:1.5,
                textShadow:tab===t?'0 0 16px #00d4ff,0 0 32px rgba(0,212,255,0.4)':'none',
                transition:'all 0.15s ease',position:'relative',
              }}>
                {tab===t&&<span style={{ position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:4,height:4,background:'#00d4ff',boxShadow:'0 0 8px #00d4ff' }} />}
                {t}
              </button>
            ))}
          </nav>

          {/* ═══════════════════════════ CONTENT ═══════════════════════════ */}
          <main style={{ flex:1,padding:'28px',maxWidth:1440,margin:'0 auto',width:'100%' }}>
            {tab==='monitor'  && <MonitorTab monitoring={monitoring} threatLevel={threatLevel} sessionTime={sessionTime} alerts={alerts} threatScore={threatScore} audioLevel={audioLevel} screenOn={screenOn} onStart={handleStart} onStop={handleStop} onToggleScreen={() => setScreenOn(x=>!x)} />}
            {tab==='psych'    && <PsychTab    psychScores={psychScores} />}
            {tab==='patterns' && <PatternsTab detectedIds={detectedIds} />}
            {tab==='report'   && <ReportTab   alerts={alerts} sessionTime={sessionTime} threatScore={threatScore} psychScores={psychScores} />}
            {tab==='about'    && <AboutTab />}
          </main>

          {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
          <footer style={{ background:'rgba(2,4,8,0.98)',borderTop:'1px solid rgba(0,212,255,0.1)' }}>
            {/* Accent line */}
            <div style={{ height:1,background:'linear-gradient(90deg,transparent,rgba(0,212,255,0.35),rgba(123,97,255,0.25),rgba(48,209,88,0.15),transparent)' }} />

            <div style={{ padding:'12px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
              {/* Left */}
              <div style={{ fontFamily:PF,fontSize:6,color:'rgba(0,212,255,0.75)',letterSpacing:1.5,lineHeight:1.9 }}>
                SCAM SHIELD © 2026<br/>
                <span style={{ color:'rgba(255,255,255,0.4)',fontSize:5 }}>WIQI LEE · MIT LICENSE</span>
              </div>

              {/* Center — social links with real icons */}
              <div style={{ display:'flex',gap:6,alignItems:'center',flexWrap:'wrap' }}>
                <SocialLink
                  href="https://x.com/wiqi_lee"
                  icon={<XIcon size={11} color="currentColor" />}
                  label="@wiqi_lee"
                  color="rgba(255,255,255,0.7)"
                  borderColor="rgba(255,255,255,0.14)"
                  bg="rgba(255,255,255,0.04)"
                  hoverColor="#fff"
                  hoverBg="rgba(255,255,255,0.1)"
                />
                <SocialLink
                  href="https://discord.com/users/209385020912173066"
                  icon={<DiscordIcon size={13} color="#7b8cde" />}
                  label="Discord"
                  color="#7b8cde"
                  borderColor="rgba(123,140,222,0.22)"
                  bg="rgba(123,140,222,0.05)"
                  hoverColor="#a5b4fc"
                  hoverBg="rgba(123,140,222,0.12)"
                />
                <SocialLink
                  href="https://github.com/wiqilee"
                  icon={<GitHubIcon size={12} color="currentColor" />}
                  label="GitHub"
                  color="rgba(255,255,255,0.65)"
                  borderColor="rgba(255,255,255,0.12)"
                  bg="rgba(255,255,255,0.04)"
                  hoverColor="#fff"
                  hoverBg="rgba(255,255,255,0.09)"
                />
                <div style={{ width:1,height:18,background:'rgba(255,255,255,0.1)',margin:'0 3px' }} />
                <SocialLink
                  href="https://geminiliveagentchallenge.devpost.com"
                  icon={null}
                  label="#GeminiLiveAgentChallenge"
                  color="#ffd60a"
                  borderColor="rgba(255,214,10,0.22)"
                  bg="rgba(255,214,10,0.05)"
                  hoverColor="#ffe55a"
                  hoverBg="rgba(255,214,10,0.1)"
                />
              </div>

              {/* Right */}
              <div style={{ fontFamily:PF,fontSize:6,color:'rgba(0,212,255,0.75)',letterSpacing:1.5,textAlign:'right',lineHeight:1.9 }}>
                POWERED BY<br/>
                <span style={{ color:'#4285F4',textShadow:'0 0 10px #4285F4aa',fontSize:5 }}>GEMINI LIVE API</span>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}
