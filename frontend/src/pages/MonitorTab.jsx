import { useState, useEffect, useRef, useCallback } from 'react'
import { PBox, PBtn, StatCard }  from '../components/Primitives'
import { WaveformVisualizer }    from '../components/WaveformVisualizer'
import { ThreatMeter }           from '../components/ThreatMeter'
import { AlertCard }             from '../components/AlertCard'
import { PF, MF }                from '../utils/constants'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DEMO SCRIPTS — now with timed sentence segments for voice
   Each sentence is spoken by TTS with a delay, then triggers
   detection alerts at specific moments (simulating real-time)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const DEMO_SCRIPTS = [
  {
    id: 'bank',
    label: '🏦 Bank Impersonation',
    category: 'critical',
    sentences: [
      { text: "Hello, this is the fraud prevention department from Chase Bank.", delay: 0 },
      { text: "We have detected suspicious activity on your checking account ending in 4 7 8 2.", delay: 4500 },
      { text: "Someone attempted to transfer $3,200 to an overseas account just minutes ago.", delay: 9500 },
      { text: "Your account will be permanently frozen within the next 10 minutes unless you verify your identity immediately.", delay: 15000,
        alert: { id:'b1', severity:'critical', pattern:'Bank Impersonation', quote:'"Your account will be permanently frozen in 10 minutes unless you verify your identity."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel' }
      },
      { text: "I need you to confirm your full account number and the one-time passcode we just sent to your phone.", delay: 23000,
        alert: { id:'b2', severity:'critical', pattern:'OTP / Credential Extraction', quote:'"Confirm your full account number and the one-time passcode we just sent."', confidence:99, tactics:['AUTHORITY','COMMITMENT'], source:'FBI IC3 2024' }
      },
      { text: "Please do not contact your branch directly. This is a confidential internal investigation.", delay: 30000,
        alert: { id:'b3', severity:'high', pattern:'Isolation Tactic', quote:'"Do not contact your branch. This is a confidential investigation."', confidence:91, tactics:['ISOLATION','AUTHORITY'], source:'GASA 2024' }
      },
      { text: "Time is running out. If you don't act now, we cannot protect your funds.", delay: 36500,
        alert: { id:'b4', severity:'critical', pattern:'Artificial Urgency', quote:'"Time is running out. If you don\'t act now, we cannot protect your funds."', confidence:95, tactics:['SCARCITY','FEAR'], source:'FTC Sentinel' }
      },
    ]
  },
  {
    id: 'investment',
    label: '📈 Investment Scam',
    category: 'critical',
    sentences: [
      { text: "Good afternoon! I'm calling from Global Wealth Partners, an elite investment advisory.", delay: 0 },
      { text: "Congratulations — you've been pre-selected for an exclusive blockchain investment opportunity.", delay: 5000 },
      { text: "Our clients have seen guaranteed returns of 300% in just 30 days, with absolutely zero risk.", delay: 10500,
        alert: { id:'i1', severity:'high', pattern:'Investment Fraud', quote:'"Guaranteed returns of 300% in 30 days, zero risk."', confidence:96, tactics:['SCARCITY','COMMITMENT'], source:'FBI IC3 2024' }
      },
      { text: "There are only 5 positions remaining and this window closes in exactly 10 minutes.", delay: 17000,
        alert: { id:'i2', severity:'critical', pattern:'Artificial Urgency', quote:'"Only 5 positions remaining, window closes in 10 minutes."', confidence:94, tactics:['SCARCITY','FEAR'], source:'GASA 2024' }
      },
      { text: "To secure your position, I need you to transfer $500 in cryptocurrency to our escrow wallet right now.", delay: 23000,
        alert: { id:'i3', severity:'critical', pattern:'Crypto Transfer Scam', quote:'"Transfer $500 in cryptocurrency to our escrow wallet."', confidence:98, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel' }
      },
      { text: "This is strictly confidential. Do not discuss this with your family or financial advisor — it could void your eligibility.", delay: 30000,
        alert: { id:'i4', severity:'high', pattern:'Isolation Tactic', quote:'"Do not discuss with your family — it could void your eligibility."', confidence:92, tactics:['ISOLATION','RECIPROCITY'], source:'GASA 2024' }
      },
    ]
  },
  {
    id: 'tech',
    label: '💻 Tech Support Scam',
    category: 'high',
    sentences: [
      { text: "Hello, this is the Microsoft Windows Security Center calling about your computer.", delay: 0 },
      { text: "Our systems have detected that your device has been infected with a critical Trojan virus.", delay: 5000,
        alert: { id:'t1', severity:'high', pattern:'Tech Support Impersonation', quote:'"Microsoft Security Center — your device has been infected with a Trojan."', confidence:93, tactics:['AUTHORITY','FEAR'], source:'FBI IC3 2024' }
      },
      { text: "Hackers currently have access to your banking passwords and personal files.", delay: 11000 },
      { text: "You must install our certified remote access tool TeamViewer immediately so our engineers can remove the threat.", delay: 16000,
        alert: { id:'t2', severity:'critical', pattern:'Tech Support Impersonation', quote:'"Install TeamViewer immediately so our engineers can remove the threat."', confidence:97, tactics:['AUTHORITY','FEAR'], source:'FTC Sentinel' }
      },
      { text: "If you do not act within the next 30 minutes, your credit card information will be compromised permanently.", delay: 23000,
        alert: { id:'t3', severity:'critical', pattern:'Artificial Urgency', quote:'"Within 30 minutes your credit card information will be compromised permanently."', confidence:95, tactics:['SCARCITY','FEAR'], source:'FBI IC3 2024' }
      },
      { text: "Our protection service costs $299, payable by Google Play gift cards for secure processing.", delay: 30000,
        alert: { id:'t4', severity:'high', pattern:'Gift Card Demand', quote:'"$299, payable by Google Play gift cards for secure processing."', confidence:98, tactics:['AUTHORITY','COMMITMENT'], source:'FTC Sentinel' }
      },
    ]
  },
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

/* ━━━ Live Transcript Display ━━━ */
function LiveTranscript({ lines, speaking }) {
  const containerRef = useRef(null)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div ref={containerRef} style={{
      background:'rgba(0,0,0,0.6)',
      border:'1px solid rgba(0,212,255,0.12)',
      padding:'12px 16px',
      maxHeight:140,
      overflowY:'auto',
      marginBottom:16,
      position:'relative',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <div style={{ fontFamily:PF, fontSize:6, color:'rgba(0,212,255,0.6)', letterSpacing:2 }}>
          LIVE TRANSCRIPT
        </div>
        {speaking && (
          <div style={{ display:'flex', gap:2, alignItems:'center' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width:2, background:'#ff2d55',
                animation:`voiceBar 0.4s ease-in-out ${i*0.1}s infinite alternate`,
                height: 4 + Math.random() * 8,
              }} />
            ))}
            <style>{`@keyframes voiceBar{0%{height:3px;opacity:0.4}100%{height:12px;opacity:1}}`}</style>
            <span style={{ fontFamily:MF, fontSize:8, color:'#ff2d55', marginLeft:4, animation:'blink 0.8s step-end infinite' }}>
              CALLER SPEAKING
            </span>
          </div>
        )}
      </div>
      {lines.length === 0 ? (
        <div style={{ fontFamily:MF, fontSize:10, color:'rgba(255,255,255,0.2)', fontStyle:'italic' }}>
          Waiting for audio input...
        </div>
      ) : (
        lines.map((line, i) => (
          <div key={i} style={{
            fontFamily:MF, fontSize:11, color:'rgba(255,255,255,0.75)',
            lineHeight:1.7, padding:'3px 0',
            borderLeft: line.flagged ? '2px solid #ff2d55' : '2px solid transparent',
            paddingLeft: 8,
            background: line.flagged ? 'rgba(255,45,85,0.06)' : 'transparent',
            animation: i === lines.length - 1 ? 'fadeUp 0.3s ease' : 'none',
          }}>
            <span style={{ color:'rgba(0,212,255,0.4)', fontSize:9, marginRight:8 }}>[{line.time}]</span>
            {line.text}
            {line.flagged && <span style={{ color:'#ff2d55', fontSize:8, marginLeft:8 }}>⚠ FLAGGED</span>}
          </div>
        ))
      )}
    </div>
  )
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function MonitorTab({ monitoring,threatLevel,sessionTime,alerts,threatScore,audioLevel,screenOn,onStart,onStop,onToggleScreen,
  /* new props for voice demo */
  onDemoAlert, onDemoThreatScore, onDemoPsychTactics, onDemoDetectPattern
}) {
  const [script,setScript]=useState(null)
  const [now,setNow]=useState(getNow())
  const [speaking,setSpeaking]=useState(false)
  const [transcriptLines,setTranscriptLines]=useState([])
  const [voiceDemo,setVoiceDemo]=useState(false)
  const [demoProgress,setDemoProgress]=useState(0)
  const speechTimers=useRef([])
  const synthRef=useRef(null)
  const startTimeRef=useRef(null)

  useEffect(()=>{ const t=setInterval(()=>setNow(getNow()),1000); return ()=>clearInterval(t) },[])

  // Cleanup on unmount or stop
  useEffect(() => {
    return () => {
      speechTimers.current.forEach(t => clearTimeout(t))
      if (synthRef.current) {
        window.speechSynthesis?.cancel()
      }
    }
  }, [])

  // Reset transcript when monitoring stops
  useEffect(() => {
    if (!monitoring) {
      setTranscriptLines([])
      setVoiceDemo(false)
      setSpeaking(false)
      setDemoProgress(0)
      speechTimers.current.forEach(t => clearTimeout(t))
      speechTimers.current = []
      window.speechSynthesis?.cancel()
    }
  }, [monitoring])

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const avgConf=alerts.length>0?Math.round(alerts.reduce((a,b)=>a+b.confidence,0)/alerts.length):null
  const tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#00d4ff'

  /* ━━━ Voice Demo Engine ━━━ */
  const startVoiceDemo = useCallback((selectedScript) => {
    if (!selectedScript || !window.speechSynthesis) return

    // Clear any existing timers
    speechTimers.current.forEach(t => clearTimeout(t))
    speechTimers.current = []
    window.speechSynthesis.cancel()

    setVoiceDemo(true)
    setTranscriptLines([])
    setDemoProgress(0)
    startTimeRef.current = Date.now()

    const sentences = selectedScript.sentences
    const totalSentences = sentences.length

    // Get a good voice (prefer English male for scammer effect)
    const getVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      // Try to find a male English voice
      const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.lang.startsWith('en') && (v.name.includes('Daniel') || v.name.includes('James') || v.name.includes('Google UK English Male')))
        || voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'))
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0]
      return preferred
    }

    // Ensure voices are loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {}, { once: true })
    }

    sentences.forEach((sentence, idx) => {
      const timer = setTimeout(() => {
        // Speak the sentence
        const utterance = new SpeechSynthesisUtterance(sentence.text)
        utterance.voice = getVoice()
        utterance.rate = 0.92
        utterance.pitch = 0.85 // slightly lower pitch for scammer
        utterance.volume = 1.0

        const elapsedMs = Date.now() - startTimeRef.current
        const timeStr = fmt(Math.floor(elapsedMs / 1000))

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => {
          setSpeaking(false)
          setDemoProgress(Math.round(((idx + 1) / totalSentences) * 100))
        }

        // Add to transcript
        setTranscriptLines(prev => [...prev, {
          text: sentence.text,
          time: timeStr,
          flagged: !!sentence.alert,
        }])

        window.speechSynthesis.speak(utterance)

        // Trigger alert if this sentence has one (with a small delay for realism)
        if (sentence.alert) {
          const alertTimer = setTimeout(() => {
            if (onDemoAlert) {
              onDemoAlert(sentence.alert)
            }
          }, 1500) // Alert fires 1.5s after speech starts (simulating processing)
          speechTimers.current.push(alertTimer)
        }
      }, sentence.delay)

      speechTimers.current.push(timer)
    })
  }, [onDemoAlert, fmt])

  const handleStartWithVoice = () => {
    onStart()
    if (script) {
      // Small delay to let state settle
      setTimeout(() => startVoiceDemo(script), 500)
    }
  }

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
                {monitoring
                  ? voiceDemo
                    ? `► VOICE DEMO ACTIVE — ${fmt(sessionTime)} ELAPSED — ${demoProgress}% ANALYZED`
                    : `► ANALYZING AUDIO STREAM — ${fmt(sessionTime)} ELAPSED`
                  : '■ READY — SELECT A DEMO SCRIPT, THEN START'}
              </div>
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap',justifyContent:'flex-end' }}>
              <PBtn onClick={onToggleScreen} color={screenOn?'#ffd60a':'#7b61ff'}>{screenOn?'■ SCREEN OFF':'◈ SCREEN WATCH'}</PBtn>
              {!monitoring
                ? <PBtn onClick={handleStartWithVoice} color="#30d158">
                    {script ? '▶ START VOICE DEMO' : '▶ START'}
                  </PBtn>
                : <PBtn onClick={()=>{
                    window.speechSynthesis?.cancel()
                    speechTimers.current.forEach(t=>clearTimeout(t))
                    onStop()
                  }} danger>■ STOP</PBtn>
              }
            </div>
          </div>

          {/* Waveform */}
          <div style={{ background:'rgba(0,0,0,0.5)',padding:'10px 14px',marginBottom:16,border:`1px solid ${tColor}18`,position:'relative',transition:'border-color 0.5s' }}>
            <div style={{ fontFamily:MF,fontSize:9,color:`${tColor}60`,marginBottom:8,letterSpacing:2,transition:'color 0.5s' }}>
              {voiceDemo
                ? 'VOICE DEMO ── WEB SPEECH API ── REAL-TIME DETECTION'
                : 'AUDIO STREAM ── GEMINI LIVE API ── RUST WASM ENGINE'}
            </div>
            <WaveformVisualizer active={monitoring} threatLevel={threatLevel} audioLevel={speaking ? 0.7 : audioLevel} />
            {screenOn&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#7b61ff',textShadow:'0 0 8px #7b61ff',animation:'blink 1.5s step-end infinite' }}>◈ SCREEN ACTIVE</div>}
            {speaking&&<div style={{ position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff2d55',textShadow:'0 0 8px #ff2d55',animation:'blink 0.6s step-end infinite' }}>🔊 VOICE ACTIVE</div>}
          </div>

          {/* Live Transcript — only show during voice demo */}
          {voiceDemo && (
            <LiveTranscript lines={transcriptLines} speaking={speaking} />
          )}

          {/* Voice demo progress bar */}
          {voiceDemo && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontFamily:PF, fontSize:6, color:'rgba(0,212,255,0.5)', letterSpacing:1 }}>ANALYSIS PROGRESS</span>
                <span style={{ fontFamily:MF, fontSize:9, color:'#00d4ff' }}>{demoProgress}%</span>
              </div>
              <div style={{ height:3, background:'rgba(0,212,255,0.1)', position:'relative', overflow:'hidden' }}>
                <div style={{
                  height:'100%',
                  width:`${demoProgress}%`,
                  background:`linear-gradient(90deg, #00d4ff, ${tColor})`,
                  boxShadow:`0 0 8px ${tColor}66`,
                  transition:'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          <div style={{ display:'flex',gap:8 }}>
            <StatCard label="THREATS"    value={alerts.length}               color="#ff2d55" icon="⚠" />
            <StatCard label="PATTERNS"   value="50+"                         color="#00d4ff" icon="◎" />
            <StatCard label="LATENCY"    value="<80ms"                       color="#30d158" icon="⚡" />
            <StatCard label="CONFIDENCE" value={avgConf?`${avgConf}%`:'—'}   color="#7b61ff" icon="◆" />
          </div>
        </PBox>

        {/* Demo scripts — now with VOICE label */}
        <PBox color="rgba(255,214,10,0.2)" style={{ padding:16,background:'rgba(255,214,10,0.01)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
            <div style={{ width:6,height:6,background:'#ffd60a',animation:'blink 1s step-end infinite' }} />
            <span style={{ fontFamily:PF,fontSize:7,color:'#ffd60a',letterSpacing:1 }}>VOICE DEMO SCRIPTS</span>
            <span style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.45)' }}>— select then START</span>
          </div>
          <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,214,10,0.35)',marginBottom:12,paddingLeft:14 }}>
            🔊 Uses browser Text-to-Speech to simulate scam caller voice in real-time
          </div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:script?12:0 }}>
            {DEMO_SCRIPTS.map(s=>(
              <button key={s.id} onClick={()=>setScript(script?.id===s.id?null:s)}
                style={{ fontFamily:MF,fontSize:10,padding:'7px 14px',cursor:'pointer',border:`1px solid ${script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.22)'}`,background:script?.id===s.id?'rgba(255,214,10,0.12)':'transparent',color:script?.id===s.id?'#ffd60a':'rgba(255,214,10,0.52)',transition:'all 0.15s',display:'flex',alignItems:'center',gap:6 }}>
                {s.label}
                {script?.id===s.id && <span style={{ fontSize:8 }}>🔊</span>}
              </button>
            ))}
          </div>
          {script&&!voiceDemo&&(
            <div style={{ fontFamily:MF,fontSize:10,color:'rgba(255,255,255,0.55)',lineHeight:1.75,padding:'12px 14px',background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,214,10,0.1)' }}>
              <div style={{ fontFamily:PF,fontSize:6,color:'rgba(255,214,10,0.6)',marginBottom:8,letterSpacing:1 }}>PREVIEW — {script.sentences.length} SENTENCES · ~{Math.round(script.sentences[script.sentences.length-1].delay/1000+7)}s DURATION</div>
              {script.sentences.map((s,i)=>(
                <div key={i} style={{ padding:'2px 0', borderLeft: s.alert ? '2px solid #ff2d55' : '2px solid transparent', paddingLeft:8, marginBottom:2 }}>
                  <span style={{ color: s.alert ? 'rgba(255,45,85,0.7)' : 'rgba(255,255,255,0.4)' }}>{s.text}</span>
                  {s.alert && <span style={{ fontSize:8, color:'#ff2d55', marginLeft:6 }}>⚠ {s.alert.pattern}</span>}
                </div>
              ))}
            </div>
          )}
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
                {monitoring
                  ? voiceDemo
                    ? 'LISTENING TO CALLER...\nANALYZING IN REAL-TIME'
                    : 'MONITORING...\nNO THREATS DETECTED'
                  : 'SELECT A VOICE DEMO\nTHEN CLICK START'}
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
