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
  for (const prefix of prefs.langPrefix) {
    const match = voices.find(v => v.lang.startsWith(prefix))
    if (match) return match
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0]
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3D HOLOGRAPHIC CALLER VISUAL — phone / video / rec
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const callerVisualCSS = `
@keyframes cv-rotate { 0%{transform:rotateY(0deg)}100%{transform:rotateY(360deg)} }
@keyframes cv-rotateR { 0%{transform:rotateY(360deg)}100%{transform:rotateY(0deg)} }
@keyframes cv-float { 0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)} }
@keyframes cv-pulse { 0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.8;transform:scale(1.05)} }
@keyframes cv-scan { 0%{top:0%}100%{top:100%} }
@keyframes cv-ripple { 0%{transform:scale(0.8);opacity:0.6}100%{transform:scale(2.2);opacity:0} }
@keyframes cv-glow { 0%,100%{box-shadow:0 0 15px rgba(0,212,255,0.3),0 0 30px rgba(0,212,255,0.1)}50%{box-shadow:0 0 25px rgba(0,212,255,0.5),0 0 50px rgba(0,212,255,0.2)} }
@keyframes cv-dash { 0%{stroke-dashoffset:0}100%{stroke-dashoffset:-60} }
@keyframes cv-fadeInUp { 0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)} }
@keyframes cv-particleFloat {
  0%{transform:translateY(0) translateX(0);opacity:0}
  20%{opacity:1}
  80%{opacity:0.6}
  100%{transform:translateY(-60px) translateX(var(--dx));opacity:0}
}
@keyframes cv-ringPulse { 0%,100%{opacity:0.15;transform:scale(1)}50%{opacity:0.4;transform:scale(1.08)} }
@keyframes cv-orbit { 0%{transform:rotate(0deg) translateX(52px) rotate(0deg)}100%{transform:rotate(360deg) translateX(52px) rotate(-360deg)} }
@keyframes cv-orbit2 { 0%{transform:rotate(120deg) translateX(58px) rotate(-120deg)}100%{transform:rotate(480deg) translateX(58px) rotate(-480deg)} }
@keyframes cv-orbit3 { 0%{transform:rotate(240deg) translateX(48px) rotate(-240deg)}100%{transform:rotate(600deg) translateX(48px) rotate(-600deg)} }
@keyframes cv-recPulse { 0%,100%{transform:scale(1);box-shadow:0 0 20px #ff2d55,0 0 40px rgba(255,45,85,0.3)}50%{transform:scale(1.15);box-shadow:0 0 35px #ff2d55,0 0 70px rgba(255,45,85,0.4)} }
@keyframes cv-waveExpand { 0%{transform:scale(0.5);opacity:0.8;border-color:rgba(255,45,85,0.6)}100%{transform:scale(2.8);opacity:0;border-color:rgba(255,45,85,0)} }
@keyframes cv-dataStream {
  0%{background-position:0 0}100%{background-position:0 200px}
}
@keyframes cv-hexSpin { 0%{transform:rotate(0deg)}100%{transform:rotate(60deg)} }
`

function CallerVisual({ mode='phone', active, screenWatchOn }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setTick(v => v + 1), 100)
    return () => clearInterval(t)
  }, [active])

  if (!active) return null
  const accentCall = '#00d4ff'
  const accentVideo = '#2d8cff'
  const accentRec = '#ff2d55'

  return (
    <div style={{ position:'relative', width:'100%', height:170, marginBottom:14, overflow:'hidden',
      border:`1px solid ${screenWatchOn ? 'rgba(123,97,255,0.3)' : mode==='phone' ? 'rgba(0,212,255,0.15)' : mode==='zoom' ? 'rgba(45,140,255,0.15)' : 'rgba(255,45,85,0.15)'}`,
      background:'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(5,8,18,0.95) 50%, rgba(0,0,0,0.9) 100%)',
      borderRadius:0
    }}>
      <style>{callerVisualCSS}</style>

      {/* Background grid */}
      <div style={{ position:'absolute', inset:0, opacity:0.04,
        backgroundImage:'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
        backgroundSize:'24px 24px', pointerEvents:'none' }} />

      {/* Horizontal scan line */}
      <div style={{ position:'absolute', left:0, right:0, height:1, opacity:0.15,
        background:`linear-gradient(90deg, transparent, ${mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec}, transparent)`,
        animation:'cv-scan 3s linear infinite', pointerEvents:'none' }} />

      {/* Data streams on sides */}
      <div style={{ position:'absolute', left:8, top:0, bottom:0, width:40, opacity:0.06, pointerEvents:'none',
        backgroundImage:`repeating-linear-gradient(0deg, transparent 0px, transparent 8px, ${accentCall} 8px, ${accentCall} 9px)`,
        backgroundSize:'100% 20px', animation:'cv-dataStream 4s linear infinite' }} />
      <div style={{ position:'absolute', right:8, top:0, bottom:0, width:40, opacity:0.06, pointerEvents:'none',
        backgroundImage:`repeating-linear-gradient(0deg, transparent 0px, transparent 8px, ${accentCall} 8px, ${accentCall} 9px)`,
        backgroundSize:'100% 20px', animation:'cv-dataStream 3s linear infinite reverse' }} />

      {/* ═══ MODE: PHONE — 3D Holographic Phone ═══ */}
      {mode==='phone' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {/* Ambient radial glow */}
          <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%',
            background:`radial-gradient(circle, ${accentCall}18 0%, transparent 70%)`,
            animation:'cv-pulse 3s ease-in-out infinite' }} />

          {/* Outer rotating ring */}
          <div style={{ position:'absolute', width:130, height:130, borderRadius:'50%',
            border:`1px dashed ${accentCall}33`,
            animation:'cv-rotate 12s linear infinite' }}>
            <div style={{ position:'absolute', top:-3, left:'50%', marginLeft:-3, width:6, height:6,
              background:accentCall, borderRadius:'50%', boxShadow:`0 0 8px ${accentCall}` }} />
          </div>

          {/* Middle rotating ring (reverse) */}
          <div style={{ position:'absolute', width:105, height:105, borderRadius:'50%',
            border:`1px solid ${accentCall}22`,
            animation:'cv-rotateR 8s linear infinite' }}>
            <div style={{ position:'absolute', bottom:-2, right:10, width:4, height:4,
              background:accentCall, borderRadius:'50%', boxShadow:`0 0 6px ${accentCall}`, opacity:0.7 }} />
          </div>

          {/* Inner glow ring */}
          <div style={{ position:'absolute', width:80, height:80, borderRadius:'50%',
            border:`2px solid ${accentCall}44`,
            animation:'cv-ringPulse 2s ease-in-out infinite',
            boxShadow:`inset 0 0 20px ${accentCall}11` }} />

          {/* 3D Phone Icon — center */}
          <div style={{ position:'relative', animation:'cv-float 3s ease-in-out infinite', zIndex:2 }}>
            <svg width="50" height="50" viewBox="0 0 50 50">
              <defs>
                <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={accentCall} stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#7b61ff" stopOpacity="0.7"/>
                </linearGradient>
                <filter id="phoneGlow">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g filter="url(#phoneGlow)">
                <path d="M15,8 C13,8 11,10 11,12 L11,38 C11,40 13,42 15,42 L35,42 C37,42 39,40 39,38 L39,12 C39,10 37,8 35,8 Z"
                  fill="none" stroke="url(#phoneGrad)" strokeWidth="1.8"/>
                <rect x="18" y="13" width="14" height="20" rx="1" fill={`${accentCall}15`} stroke={`${accentCall}44`} strokeWidth="0.8"/>
                <circle cx="25" cy="38" r="2.5" fill="none" stroke={`${accentCall}66`} strokeWidth="0.8"/>
                {/* Signal waves */}
                <path d="M32,6 Q36,4 38,6" fill="none" stroke={accentCall} strokeWidth="0.6" opacity="0.5">
                  <animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.5s" repeatCount="indefinite"/>
                </path>
                <path d="M34,4 Q39,1 42,4" fill="none" stroke={accentCall} strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="opacity" values="0.1;0.5;0.1" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                </path>
              </g>
            </svg>
          </div>

          {/* Orbiting particles */}
          <div style={{ position:'absolute', width:6, height:6, borderRadius:'50%',
            background:accentCall, boxShadow:`0 0 8px ${accentCall}`,
            animation:'cv-orbit 6s linear infinite' }} />
          <div style={{ position:'absolute', width:4, height:4, borderRadius:'50%',
            background:'#7b61ff', boxShadow:'0 0 6px #7b61ff',
            animation:'cv-orbit2 8s linear infinite' }} />
          <div style={{ position:'absolute', width:3, height:3, borderRadius:'50%',
            background:'#30d158', boxShadow:'0 0 5px #30d158',
            animation:'cv-orbit3 10s linear infinite' }} />

          {/* Labels */}
          <div style={{ position:'absolute', top:12, left:16, animation:'cv-fadeInUp 0.5s ease' }}>
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:6, color:accentCall, letterSpacing:1,
              padding:'4px 10px', border:`1px solid ${accentCall}44`, background:`${accentCall}0a`,
              display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:10 }}>📞</span> CALL
              <span style={{ width:5, height:5, borderRadius:'50%', background:accentCall,
                animation:'blink 1.2s step-end infinite', boxShadow:`0 0 4px ${accentCall}` }} />
            </div>
          </div>

          <div style={{ position:'absolute', top:12, right:16, textAlign:'right', animation:'cv-fadeInUp 0.5s ease 0.1s both' }}>
            <div style={{ fontFamily:"monospace", fontSize:7, color:accentCall, opacity:0.7, letterSpacing:1 }}>◉ VOICE ONLY</div>
            <div style={{ fontFamily:"monospace", fontSize:6, color:'rgba(255,255,255,0.3)', marginTop:3 }}>AUDIO ANALYSIS</div>
          </div>

          <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)',
            fontFamily:"monospace", fontSize:6, color:`${accentCall}44`, letterSpacing:3 }}>
            ── SECURE CHANNEL ──
          </div>
        </div>
      )}

      {/* ═══ MODE: VIDEO — 3D Holographic Person ═══ */}
      {mode==='zoom' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {/* Ambient glow */}
          <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%',
            background:`radial-gradient(circle, ${accentVideo}14 0%, transparent 70%)`,
            animation:'cv-pulse 3s ease-in-out infinite' }} />

          {/* Hexagonal frame */}
          <svg style={{ position:'absolute', width:140, height:140, animation:'cv-hexSpin 20s linear infinite' }} viewBox="0 0 140 140">
            <polygon points="70,5 130,35 130,105 70,135 10,105 10,35"
              fill="none" stroke={`${accentVideo}22`} strokeWidth="1"
              strokeDasharray="8 4" style={{ animation:'cv-dash 3s linear infinite' }}/>
          </svg>

          {/* Rotating scan ring */}
          <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%',
            border:`1px solid ${accentVideo}20`,
            animation:'cv-rotate 10s linear infinite' }}>
            <div style={{ position:'absolute', top:-2, left:'50%', marginLeft:-4, width:8, height:4,
              background:accentVideo, borderRadius:2, boxShadow:`0 0 8px ${accentVideo}` }} />
          </div>

          {/* 3D Person silhouette */}
          <div style={{ position:'relative', animation:'cv-float 4s ease-in-out infinite', zIndex:2 }}>
            <svg width="70" height="90" viewBox="0 0 70 90">
              <defs>
                <linearGradient id="personGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={accentVideo} stopOpacity="0.8"/>
                  <stop offset="50%" stopColor="#7b61ff" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor={accentVideo} stopOpacity="0.2"/>
                </linearGradient>
                <filter id="personGlow">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <clipPath id="personClip">
                  <ellipse cx="35" cy="28" rx="16" ry="20"/>
                  <path d="M8,88 Q8,65 20,56 Q30,50 35,48 Q40,50 50,56 Q62,65 62,88 Z"/>
                </clipPath>
              </defs>

              <g filter="url(#personGlow)">
                {/* Head */}
                <ellipse cx="35" cy="28" rx="16" ry="20" fill="none" stroke="url(#personGrad)" strokeWidth="1.5"/>
                {/* Face scan grid */}
                <line x1="22" y1="22" x2="48" y2="22" stroke={`${accentVideo}30`} strokeWidth="0.5"/>
                <line x1="22" y1="28" x2="48" y2="28" stroke={`${accentVideo}30`} strokeWidth="0.5"/>
                <line x1="22" y1="34" x2="48" y2="34" stroke={`${accentVideo}30`} strokeWidth="0.5"/>
                <line x1="29" y1="10" x2="29" y2="46" stroke={`${accentVideo}20`} strokeWidth="0.5"/>
                <line x1="35" y1="10" x2="35" y2="46" stroke={`${accentVideo}20`} strokeWidth="0.5"/>
                <line x1="41" y1="10" x2="41" y2="46" stroke={`${accentVideo}20`} strokeWidth="0.5"/>

                {/* Eyes */}
                <rect x="26" y="24" width="6" height="3" rx="1" fill={`${accentVideo}55`}/>
                <rect x="38" y="24" width="6" height="3" rx="1" fill={`${accentVideo}55`}/>
                <circle cx="29" cy="25.5" r="1" fill={accentVideo} opacity="0.8">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="41" cy="25.5" r="1" fill={accentVideo} opacity="0.8">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.2s"/>
                </circle>

                {/* Body */}
                <path d="M8,88 Q8,65 20,56 Q30,50 35,48 Q40,50 50,56 Q62,65 62,88"
                  fill="none" stroke="url(#personGrad)" strokeWidth="1.5"/>

                {/* Body fill with scan effect */}
                <path d="M8,88 Q8,65 20,56 Q30,50 35,48 Q40,50 50,56 Q62,65 62,88"
                  fill={`${accentVideo}08`}/>
              </g>

              {/* Face scan moving line */}
              <line x1="20" y1="10" x2="50" y2="10" stroke={accentVideo} strokeWidth="1" opacity="0.4">
                <animate attributeName="y1" values="10;46;10" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="y2" values="10;46;10" dur="2.5s" repeatCount="indefinite"/>
              </line>
            </svg>
          </div>

          {/* YOU box (bottom right) */}
          <div style={{ position:'absolute', bottom:16, right:20, width:56, height:36,
            border:`1px solid rgba(48,209,88,0.3)`, background:'rgba(48,209,88,0.04)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 12px rgba(48,209,88,0.08)' }}>
            <span style={{ fontFamily:"monospace", fontSize:7, color:'#30d158', opacity:0.6, letterSpacing:1 }}>YOU</span>
          </div>

          {/* Labels */}
          <div style={{ position:'absolute', top:12, left:16, animation:'cv-fadeInUp 0.5s ease' }}>
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:6, color:accentVideo, letterSpacing:1,
              padding:'4px 10px', border:`1px solid ${accentVideo}44`, background:`${accentVideo}0a`,
              display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:10 }}>🖥</span> VIDEO
            </div>
          </div>

          <div style={{ position:'absolute', top:12, right:16, textAlign:'right', animation:'cv-fadeInUp 0.5s ease 0.1s both' }}>
            <div style={{ fontFamily:"monospace", fontSize:7, color:accentVideo, opacity:0.7, letterSpacing:1 }}>◉ VIDEO CALL</div>
            <div style={{ fontFamily:"monospace", fontSize:6, color:'rgba(255,255,255,0.3)', marginTop:3 }}>AUDIO + VISUAL</div>
          </div>

          <div style={{ position:'absolute', bottom:12, left:20,
            fontFamily:"monospace", fontSize:6, color:`${accentVideo}33`, letterSpacing:2 }}>
            FACE ANALYSIS ACTIVE
          </div>
        </div>
      )}

      {/* ═══ MODE: REC — 3D Recording Orb ═══ */}
      {mode==='video' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {/* Ambient glow */}
          <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%',
            background:`radial-gradient(circle, ${accentRec}18 0%, transparent 70%)`,
            animation:'cv-pulse 2s ease-in-out infinite' }} />

          {/* Ripple waves */}
          {[0,1,2].map(i => (
            <div key={i} style={{ position:'absolute', width:60, height:60, borderRadius:'50%',
              border:`1.5px solid ${accentRec}`,
              animation:`cv-waveExpand 3s ease-out infinite ${i * 1}s`,
              pointerEvents:'none' }} />
          ))}

          {/* Outer ring */}
          <div style={{ position:'absolute', width:110, height:110, borderRadius:'50%',
            border:`1px solid ${accentRec}22`,
            animation:'cv-rotate 15s linear infinite' }}>
            <div style={{ position:'absolute', top:-2, left:'50%', marginLeft:-2, width:4, height:4,
              background:accentRec, borderRadius:'50%', boxShadow:`0 0 6px ${accentRec}` }} />
            <div style={{ position:'absolute', bottom:-2, left:'50%', marginLeft:-2, width:4, height:4,
              background:accentRec, borderRadius:'50%', boxShadow:`0 0 6px ${accentRec}`, opacity:0.5 }} />
          </div>

          {/* Center recording orb */}
          <div style={{ position:'relative', zIndex:2, animation:'cv-float 2.5s ease-in-out infinite' }}>
            <div style={{ width:44, height:44, borderRadius:'50%',
              background:`radial-gradient(circle at 35% 35%, ${accentRec}cc, ${accentRec}88, #881133)`,
              animation:'cv-recPulse 1.5s ease-in-out infinite',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:16, height:16, borderRadius:'50%',
                background:`radial-gradient(circle at 40% 40%, #ff6688, ${accentRec})`,
                boxShadow:`inset 0 0 8px rgba(0,0,0,0.3)` }} />
            </div>
          </div>

          {/* Timer circle */}
          <svg style={{ position:'absolute', width:90, height:90 }} viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="40" fill="none" stroke={`${accentRec}15`} strokeWidth="1"/>
            <circle cx="45" cy="45" r="40" fill="none" stroke={accentRec} strokeWidth="1.5"
              strokeDasharray="251" strokeDashoffset={251 - (tick % 100) * 2.51}
              strokeLinecap="round" transform="rotate(-90 45 45)" opacity="0.4"/>
          </svg>

          {/* Labels */}
          <div style={{ position:'absolute', top:12, left:16, animation:'cv-fadeInUp 0.5s ease' }}>
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:6, color:accentRec, letterSpacing:1,
              padding:'4px 10px', border:`1px solid ${accentRec}44`, background:`${accentRec}0a`,
              display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:10 }}>🎥</span> REC
              <span style={{ width:5, height:5, borderRadius:'50%', background:accentRec,
                animation:'blink 0.8s step-end infinite', boxShadow:`0 0 6px ${accentRec}` }} />
            </div>
          </div>

          <div style={{ position:'absolute', top:12, right:16, textAlign:'right', animation:'cv-fadeInUp 0.5s ease 0.1s both' }}>
            <div style={{ fontFamily:"monospace", fontSize:7, color:accentRec, opacity:0.7, letterSpacing:1 }}>● RECORDING</div>
            <div style={{ fontFamily:"monospace", fontSize:6, color:'rgba(255,255,255,0.3)', marginTop:3 }}>SESSION CAPTURE</div>
          </div>

          <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)',
            fontFamily:"monospace", fontSize:6, color:`${accentRec}44`, letterSpacing:3 }}>
            ── RECORDING ACTIVE ──
          </div>
        </div>
      )}

      {/* Screen Watch overlay indicator */}
      {screenWatchOn && (
        <div style={{ position:'absolute', bottom:10, right:16,
          fontFamily:"monospace", fontSize:6, color:'#7b61ff', letterSpacing:1, opacity:0.6 }}>
          ◈ SCREEN WATCH
        </div>
      )}

      {/* Corner brackets */}
      {[
        { top:4,left:4,paths:'M4,16 L4,4 L16,4' },
        { top:4,right:4,paths:'M-4,4 L8,4 M4,4 L4,16', isRight:true },
        { bottom:4,left:4,paths:'M4,-4 L4,8 M4,4 L16,4', isBottom:true },
        { bottom:4,right:4,paths:'M4,4 L4,-8 M4,4 L-8,4', isCorner:true },
      ].map((c, i) => (
        <svg key={i} style={{ position:'absolute', ...(c.top!==undefined?{top:0}:{}), ...(c.bottom!==undefined?{bottom:0}:{}), ...(c.left!==undefined?{left:0}:{}), ...(c.right!==undefined?{right:0}:{}), width:20, height:20, overflow:'visible', pointerEvents:'none' }} viewBox="0 0 20 20">
          {i===0 && <><line x1="2" y1="18" x2="2" y2="2" stroke={screenWatchOn?'#7b61ff':mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec} strokeWidth="1.2" opacity="0.5"/><line x1="2" y1="2" x2="18" y2="2" stroke={screenWatchOn?'#7b61ff':mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec} strokeWidth="1.2" opacity="0.5"/></>}
          {i===1 && <><line x1="18" y1="18" x2="18" y2="2" stroke={screenWatchOn?'#7b61ff':mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec} strokeWidth="1.2" opacity="0.5"/><line x1="18" y1="2" x2="2" y2="2" stroke={screenWatchOn?'#7b61ff':mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec} strokeWidth="1.2" opacity="0.5"/></>}
          {i===2 && <><line x1="2" y1="2" x2="2" y2="18" stroke={screenWatchOn?'#7b61ff':mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec} strokeWidth="1.2" opacity="0.5"/><line x1="2" y1="18" x2="18" y2="18" stroke={screenWatchOn?'#7b61ff':mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec} strokeWidth="1.2" opacity="0.5"/></>}
          {i===3 && <><line x1="18" y1="2" x2="18" y2="18" stroke={screenWatchOn?'#7b61ff':mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec} strokeWidth="1.2" opacity="0.5"/><line x1="18" y1="18" x2="2" y2="18" stroke={screenWatchOn?'#7b61ff':mode==='phone'?accentCall:mode==='zoom'?accentVideo:accentRec} strokeWidth="1.2" opacity="0.5"/></>}
        </svg>
      ))}
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
  const [volume,setVolume]=useState(1.0)
  const volumeRef=useRef(1.0)
  const handleVolume=(v)=>{setVolume(v);volumeRef.current=v;}
  const [callMode,setCallMode]=useState('phone') // phone, zoom, video — auto or manual
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
            u.rate=1.0;u.pitch=1.0;u.volume=volumeRef.current
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
  },[onDemoAlert,onStop,onTranscriptLine,language,voiceMuted,volume])

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
            <div style={{ display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end',alignItems:'center' }}>
              {/* Call mode selector */}
              <div style={{ display:'flex',gap:0,border:'1px solid rgba(0,212,255,0.2)' }}>
                {[{m:'phone',icon:'📞',label:'CALL'},{m:'zoom',icon:'🖥',label:'VIDEO'},{m:'video',icon:'🎥',label:'REC'}].map(({m,icon,label})=>(
                  <button key={m} onClick={()=>setCallMode(m)} style={{ fontFamily:PF,fontSize:5,padding:'6px 10px',border:'none',borderRight:'1px solid rgba(0,212,255,0.1)',background:callMode===m?'rgba(0,212,255,0.12)':'transparent',color:callMode===m?'#00d4ff':'rgba(255,255,255,0.35)',cursor:'pointer',display:'flex',alignItems:'center',gap:4,transition:'all 0.15s' }}>
                    <span style={{ fontSize:10 }}>{icon}</span>{label}
                  </button>
                ))}
              </div>
              {voiceDemo&&<PBtn onClick={()=>{setVoiceMuted(m=>!m);if(!voiceMuted)window.speechSynthesis?.cancel()}} color={voiceMuted?'#ff9500':'#30d158'} style={{ padding:'10px 14px' }}>{voiceMuted?'🔇 UNMUTE':'🔊 MUTE'}</PBtn>}
              <PBtn onClick={onToggleScreen} color={screenOn?'#ffd60a':'#7b61ff'}>{screenOn?'■ SCREEN OFF':'◈ SCREEN WATCH'}</PBtn>
              {!monitoring ? <PBtn onClick={handleStartWithVoice} color="#30d158">{script?'▶ START VOICE DEMO':'▶ START'}</PBtn> : <PBtn onClick={handleStop} danger>■ STOP</PBtn>}
            </div>
          </div>

          <CallerVisual mode={callMode} active={voiceDemo&&monitoring} screenWatchOn={screenOn} />

          {/* Screen Watch active banner */}
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

          {voiceDemo&&!voiceMuted&&(
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12,padding:'6px 12px',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(0,212,255,0.08)' }}>
              <span style={{ fontFamily:PF,fontSize:5,color:'rgba(0,212,255,0.5)',letterSpacing:1,flexShrink:0 }}>VOL</span>
              <input type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e=>handleVolume(parseFloat(e.target.value))}
                style={{ flex:1,height:4,appearance:'none',WebkitAppearance:'none',background:`linear-gradient(90deg,#00d4ff ${volume*100}%,rgba(0,212,255,0.15) ${volume*100}%)`,outline:'none',cursor:'pointer',borderRadius:2 }} />
              <span style={{ fontFamily:MF,fontSize:9,color:'#00d4ff',width:30,textAlign:'right' }}>{Math.round(volume*100)}%</span>
            </div>
          )}

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
