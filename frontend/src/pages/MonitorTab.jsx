import { useState, useEffect, useRef, useCallback } from 'react'
import { PBox, PBtn, StatCard } from '../components/Primitives'
import { WaveformVisualizer } from '../components/WaveformVisualizer'
import { ThreatMeter } from '../components/ThreatMeter'
import { AlertCard } from '../components/AlertCard'
import { InterventionOverlay } from '../components/InterventionOverlay'
import { PF, MF, getInterventionLevel, isInstantInterventionPattern } from '../utils/constants'

/* ══════════════════════════════════════════════════════════
   [FIX #3] Gemini TTS — Natural voice for demo mode
   ────────────────────────────────────────────────────────
   Calls Gemini TTS API directly from the browser.
   Falls back to browser SpeechSynthesis if API unavailable.
══════════════════════════════════════════════════════════ */
const GEMINI_TTS_MODEL = import.meta.env.VITE_GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// Voice profiles — Gemini TTS prebuilt voices
// Kore = clear female, Puck = warm male, Charon = deep authoritative
const GEMINI_VOICE_MAP = {
  en: 'Kore', id: 'Kore', zh: 'Kore', ja: 'Kore', ko: 'Kore',
  es: 'Kore', fr: 'Kore', hi: 'Kore', ar: 'Kore',
}

// Cache for generated audio to avoid re-calling API for same text
const _ttsCache = new Map()

async function generateGeminiTTS(text, lang = 'en') {
  if (!GEMINI_API_KEY) return null

  // Check cache
  const cacheKey = `${lang}:${text}`
  if (_ttsCache.has(cacheKey)) return _ttsCache.get(cacheKey)

  try {
    const voice = GEMINI_VOICE_MAP[lang?.split('-')[0]] || 'Kore'
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            response_modalities: ['AUDIO'],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: { voice_name: voice }
              }
            }
          }
        })
      }
    )

    if (!resp.ok) {
      console.warn(`[GeminiTTS] API error ${resp.status}`)
      return null
    }

    const data = await resp.json()
    const audioPart = data.candidates?.[0]?.content?.parts?.find(
      p => p.inlineData?.mimeType?.startsWith('audio/')
    )
    if (!audioPart?.inlineData?.data) {
      console.warn('[GeminiTTS] No audio in response')
      return null
    }

    const audioBytes = atob(audioPart.inlineData.data)
    const arr = new Uint8Array(audioBytes.length)
    for (let i = 0; i < audioBytes.length; i++) arr[i] = audioBytes.charCodeAt(i)
    const blob = new Blob([arr], { type: audioPart.inlineData.mimeType || 'audio/wav' })

    // Cache it (limit cache to 50 entries)
    if (_ttsCache.size > 50) _ttsCache.clear()
    _ttsCache.set(cacheKey, blob)

    return blob
  } catch (err) {
    console.warn('[GeminiTTS] Failed:', err.message)
    return null
  }
}

/* ── Browser voice selection ── */
const VOICE_PREFS={en:{langPrefix:['en-US','en-GB','en']},id:{langPrefix:['id-ID','id']},zh:{langPrefix:['zh-CN','zh-TW','zh']},ja:{langPrefix:['ja-JP','ja']},ko:{langPrefix:['ko-KR','ko']},es:{langPrefix:['es-ES','es-MX','es']},fr:{langPrefix:['fr-FR','fr']},de:{langPrefix:['de-DE','de']},hi:{langPrefix:['hi-IN','hi']},ar:{langPrefix:['ar-SA','ar-EG','ar']},pt:{langPrefix:['pt-BR','pt-PT','pt']},ru:{langPrefix:['ru-RU','ru']},th:{langPrefix:['th-TH','th']},vi:{langPrefix:['vi-VN','vi']},ms:{langPrefix:['ms-MY','ms']},tr:{langPrefix:['tr-TR','tr']},it:{langPrefix:['it-IT','it']},nl:{langPrefix:['nl-NL','nl']},pl:{langPrefix:['pl-PL','pl']},sv:{langPrefix:['sv-SE','sv']}}
function getVoiceForLang(lang){const voices=window.speechSynthesis.getVoices();if(!voices.length)return null;const prefs=VOICE_PREFS[lang]||VOICE_PREFS['en'];for(const prefix of prefs.langPrefix){const match=voices.find(v=>v.lang.startsWith(prefix));if(match)return match}return voices.find(v=>v.lang.startsWith('en'))||voices[0]}

/* ── Active Gemini TTS audio refs for cleanup ── */
let _activeGeminiAudio = null

const cvCSS=`
@keyframes cv-rZ{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes cv-rR{0%{transform:rotate(360deg)}100%{transform:rotate(0deg)}}
@keyframes cv-fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes cv-pu{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.7;transform:scale(1.06)}}
@keyframes cv-sc{0%{top:0}100%{top:100%}}
@keyframes cv-sh{0%{left:-20%}100%{left:120%}}
@keyframes cv-da{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-80}}
@keyframes cv-fi{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
@keyframes cv-rp{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.4;transform:scale(1.06)}}
@keyframes cv-o1{0%{transform:rotate(0deg) translateX(62px) rotate(0deg)}100%{transform:rotate(360deg) translateX(62px) rotate(-360deg)}}
@keyframes cv-o2{0%{transform:rotate(120deg) translateX(70px) rotate(-120deg)}100%{transform:rotate(480deg) translateX(70px) rotate(-480deg)}}
@keyframes cv-o3{0%{transform:rotate(240deg) translateX(56px) rotate(-240deg)}100%{transform:rotate(600deg) translateX(56px) rotate(-600deg)}}
@keyframes cv-rb{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes cv-hs{0%{transform:rotate(0deg)}100%{transform:rotate(60deg)}}
@keyframes cv-ds{0%{background-position:0 0}100%{background-position:0 200px}}
@keyframes cv-ch{0%{text-shadow:2px 0 #ff2d5555,-2px 0 #00d4ff55}50%{text-shadow:-1px 0 #ff2d5555,1px 0 #00d4ff55}100%{text-shadow:2px 0 #ff2d5555,-2px 0 #00d4ff55}}
@keyframes cv-sw-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
@keyframes cv-sw-pulse{0%,100%{box-shadow:inset 0 0 30px rgba(123,97,255,0.08)}50%{box-shadow:inset 0 0 60px rgba(123,97,255,0.18),0 0 20px rgba(123,97,255,0.1)}}
@keyframes cv-sw-grid{0%{opacity:.06}50%{opacity:.12}100%{opacity:.06}}
@keyframes cv-crt-line{0%{top:-2px}100%{top:100%}}
@keyframes rec-pulse{0%,100%{box-shadow:0 0 8px #ff2d55,0 0 16px rgba(255,45,85,0.3)}50%{box-shadow:0 0 14px #ff2d55,0 0 28px rgba(255,45,85,0.5),0 0 40px rgba(255,45,85,0.15)}}
@keyframes rec-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
`

function CallerVisual({mode='phone',active,screenWatchOn,isRecording}){
  const[tick,setTick]=useState(0)
  useEffect(()=>{if(!active)return;const t=setInterval(()=>setTick(v=>v+1),80);return()=>clearInterval(t)},[active])
  if(!active)return null
  const aC='#00d4ff',aV='#2d8cff',aR='#ff2d55',ac=mode==='phone'?aC:aV
  const borderColor = screenWatchOn ? '#7b61ff' : ac+'22'
  return(
    <div style={{position:'relative',width:'100%',height:200,marginBottom:14,overflow:'hidden',border:`1px solid ${borderColor}`,background:'linear-gradient(180deg,rgba(0,0,0,.95),rgba(4,8,20,.98),rgba(0,0,0,.95))',transition:'border-color 0.4s ease',animation:screenWatchOn?'cv-sw-pulse 3s ease-in-out infinite':'none'}}>
      <style>{cvCSS}</style>
      <div style={{position:'absolute',inset:0,opacity:.035,backgroundImage:'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:0,left:'10%',right:'10%',height:'40%',opacity:.04,pointerEvents:'none',backgroundImage:`linear-gradient(${ac} 1px,transparent 1px),linear-gradient(90deg,${ac} 1px,transparent 1px)`,backgroundSize:'30px 30px',transform:'perspective(200px) rotateX(60deg)',transformOrigin:'bottom center'}}/>
      <div style={{position:'absolute',top:0,bottom:0,width:2,opacity:.08,background:`linear-gradient(180deg,transparent,${ac},transparent)`,animation:'cv-sh 4s linear infinite',pointerEvents:'none'}}/>
      <div style={{position:'absolute',left:0,right:0,height:1,opacity:.12,background:`linear-gradient(90deg,transparent,${ac},transparent)`,animation:'cv-sc 3.5s linear infinite',pointerEvents:'none'}}/>
      <div style={{position:'absolute',left:10,top:0,bottom:0,width:35,opacity:.04,pointerEvents:'none',backgroundImage:`repeating-linear-gradient(0deg,transparent 0px,transparent 6px,${ac} 6px,${ac} 7px)`,backgroundSize:'100% 16px',animation:'cv-ds 3s linear infinite'}}/>
      <div style={{position:'absolute',right:10,top:0,bottom:0,width:35,opacity:.04,pointerEvents:'none',backgroundImage:`repeating-linear-gradient(0deg,transparent 0px,transparent 6px,${ac} 6px,${ac} 7px)`,backgroundSize:'100% 16px',animation:'cv-ds 2.5s linear infinite reverse'}}/>
      {screenWatchOn&&(<>
        <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:4}}><div style={{position:'absolute',left:0,right:0,height:'50%',background:'linear-gradient(180deg,transparent,rgba(123,97,255,0.12),transparent)',animation:'cv-sw-scan 2.5s linear infinite'}}/></div>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:3,backgroundImage:'linear-gradient(rgba(123,97,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(123,97,255,0.5) 1px,transparent 1px)',backgroundSize:'40px 40px',animation:'cv-sw-grid 2s ease-in-out infinite'}}/>
        {[{top:8,left:8},{top:8,right:8},{bottom:8,left:8},{bottom:8,right:8}].map((pos,i)=>(<div key={i} style={{position:'absolute',...pos,width:24,height:24,pointerEvents:'none',zIndex:5}}><div style={{position:'absolute',top:0,left:i%2===0?0:undefined,right:i%2===1?0:undefined,width:24,height:2,background:'#7b61ff',boxShadow:'0 0 8px #7b61ff'}}/><div style={{position:'absolute',top:0,left:i%2===0?0:undefined,right:i%2===1?0:undefined,width:2,height:24,background:'#7b61ff',boxShadow:'0 0 8px #7b61ff'}}/></div>))}
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:6,fontFamily:PF,fontSize:7,color:'#7b61ff',letterSpacing:3,textShadow:'0 0 12px #7b61ff,0 0 24px rgba(123,97,255,0.4)',padding:'8px 20px',border:'1px solid rgba(123,97,255,0.4)',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}}>◈ SCREEN CAPTURING</div>
      </>)}
      {mode==='phone'&&(<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{position:'absolute',width:200,height:200,borderRadius:'50%',background:`radial-gradient(circle,${aC}15,${aC}06 40%,transparent 70%)`,animation:'cv-pu 3s ease-in-out infinite'}}/>
        <svg style={{position:'absolute',width:170,height:170,animation:'cv-rZ 18s linear infinite'}} viewBox="0 0 170 170"><circle cx="85" cy="85" r="78" fill="none" stroke={`${aC}20`} strokeWidth="1" strokeDasharray="10 6"/><circle cx="85" cy="7" r="4" fill={aC} opacity=".6"><animate attributeName="opacity" values=".3;.8;.3" dur="2s" repeatCount="indefinite"/></circle></svg>
        <svg style={{position:'absolute',width:140,height:140,animation:'cv-rR 12s linear infinite'}} viewBox="0 0 140 140"><circle cx="70" cy="70" r="64" fill="none" stroke={`${aC}15`} strokeWidth=".8" strokeDasharray="6 8"/><circle cx="70" cy="6" r="3" fill="#7b61ff" opacity=".5"/></svg>
        <div style={{position:'absolute',width:100,height:100,borderRadius:'50%',border:`2px solid ${aC}35`,animation:'cv-rp 2.5s ease-in-out infinite',boxShadow:`inset 0 0 25px ${aC}08,0 0 15px ${aC}08`}}/>
        <div style={{position:'relative',animation:'cv-fl 3.5s ease-in-out infinite',zIndex:2}}>
          <svg width="60" height="70" viewBox="0 0 60 70" style={{filter:`drop-shadow(0 0 12px ${aC}66) drop-shadow(0 0 24px ${aC}33)`}}>
            <defs><linearGradient id="phG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4aeaff"/><stop offset="40%" stopColor={aC} stopOpacity=".9"/><stop offset="100%" stopColor="#7b61ff" stopOpacity=".7"/></linearGradient><linearGradient id="phF" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={aC} stopOpacity=".15"/><stop offset="100%" stopColor="#7b61ff" stopOpacity=".05"/></linearGradient></defs>
            <path d="M14,12 C10,12 8,16 8,20 L8,24 C8,27 10,30 13,30 L16,30 C18,30 20,32 20,35 L20,36 C20,39 18,41 16,41 L13,41 C10,41 8,44 8,47 L8,51 C8,55 10,58 14,58 L18,58 C22,58 25,55 25,51 L25,47 C25,46 26,45 27,45 L33,45 C34,45 35,46 35,47 L35,51 C35,55 38,58 42,58 L46,58 C50,58 52,55 52,51 L52,47 C52,44 50,41 47,41 L44,41 C42,41 40,39 40,36 L40,35 C40,32 42,30 44,30 L47,30 C50,30 52,27 52,24 L52,20 C52,16 50,12 46,12 Z" fill="url(#phF)" stroke="url(#phG)" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="17" cy="20" r="2" fill={`${aC}55`}/><circle cx="17" cy="24" r="1.5" fill={`${aC}40`}/>
            <circle cx="43" cy="48" r="2" fill={`${aC}55`}/><circle cx="43" cy="52" r="1.5" fill={`${aC}40`}/>
            <path d="M22,14 C26,10 34,10 38,14" fill="none" stroke={aC} strokeWidth="1" opacity=".4"><animate attributeName="opacity" values=".15;.5;.15" dur="1.8s" repeatCount="indefinite"/></path>
            <path d="M20,10 C26,4 34,4 40,10" fill="none" stroke={aC} strokeWidth=".8" opacity=".25"><animate attributeName="opacity" values=".1;.35;.1" dur="1.8s" repeatCount="indefinite" begin=".4s"/></path>
            <path d="M18,6 C26,-2 36,-2 44,6" fill="none" stroke={aC} strokeWidth=".6" opacity=".15"><animate attributeName="opacity" values=".05;.2;.05" dur="1.8s" repeatCount="indefinite" begin=".8s"/></path>
          </svg>
        </div>
        <div style={{position:'absolute',width:7,height:7,borderRadius:'50%',background:aC,boxShadow:`0 0 10px ${aC},0 0 20px ${aC}44`,animation:'cv-o1 5s linear infinite'}}/>
        <div style={{position:'absolute',width:5,height:5,borderRadius:'50%',background:'#7b61ff',boxShadow:'0 0 8px #7b61ff',animation:'cv-o2 7s linear infinite'}}/>
        <div style={{position:'absolute',width:4,height:4,borderRadius:'50%',background:'#30d158',boxShadow:'0 0 6px #30d158',animation:'cv-o3 9s linear infinite'}}/>
        <div style={{position:'absolute',top:14,left:18,animation:'cv-fi .5s ease'}}><div style={{fontFamily:PF,fontSize:6,color:aC,letterSpacing:1,padding:'5px 12px',border:`1px solid ${aC}44`,background:`${aC}0c`,display:'flex',alignItems:'center',gap:6,backdropFilter:'blur(4px)'}}><span style={{fontSize:11}}>📞</span> CALL<span style={{width:5,height:5,borderRadius:'50%',background:aC,animation:'blink 1.2s step-end infinite',boxShadow:`0 0 6px ${aC}`}}/></div></div>
        <div style={{position:'absolute',top:14,right:18,textAlign:'right',animation:'cv-fi .5s ease .1s both'}}><div style={{fontFamily:PF,fontSize:7,color:aC,opacity:.8,letterSpacing:1}}>◉ VOICE ONLY</div><div style={{fontFamily:'monospace',fontSize:6,color:'rgba(255,255,255,.35)',marginTop:4}}>AUDIO ANALYSIS</div></div>
        <div style={{position:'absolute',bottom:14,left:'50%',transform:'translateX(-50%)',fontFamily:'monospace',fontSize:6,color:`${aC}35`,letterSpacing:3,animation:'cv-ch 4s ease infinite'}}>── SECURE CHANNEL ──</div>
      </div>)}
      {mode==='zoom'&&(<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{position:'absolute',width:220,height:220,borderRadius:'50%',background:`radial-gradient(circle,${aV}12,${aV}04 40%,transparent 70%)`,animation:'cv-pu 3.5s ease-in-out infinite'}}/>
        <svg style={{position:'absolute',width:180,height:180,animation:'cv-hs 25s linear infinite',opacity:.3}} viewBox="0 0 180 180"><polygon points="90,8 165,48 165,132 90,172 15,132 15,48" fill="none" stroke={aV} strokeWidth=".8" strokeDasharray="12 5"/><polygon points="90,25 148,55 148,125 90,155 32,125 32,55" fill="none" stroke={`${aV}44`} strokeWidth=".5" strokeDasharray="6 8"/></svg>
        <svg style={{position:'absolute',width:150,height:150,animation:'cv-rZ 10s linear infinite'}} viewBox="0 0 150 150"><circle cx="75" cy="75" r="68" fill="none" stroke={`${aV}18`} strokeWidth="1" strokeDasharray="8 5"/><rect x="71" y="3" width="8" height="4" rx="1" fill={aV} opacity=".7"><animate attributeName="opacity" values=".4;.9;.4" dur="1.5s" repeatCount="indefinite"/></rect></svg>
        <div style={{position:'absolute',width:110,height:110,borderRadius:'50%',border:`1.5px solid ${aV}25`,animation:'cv-rp 3s ease-in-out infinite',boxShadow:`inset 0 0 30px ${aV}06`}}/>
        <div style={{position:'relative',animation:'cv-fl 4s ease-in-out infinite',zIndex:2}}>
          <svg width="80" height="110" viewBox="0 0 80 110" style={{filter:`drop-shadow(0 0 10px ${aV}55) drop-shadow(0 0 20px ${aV}22)`}}>
            <defs><linearGradient id="pgV" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4aeaff" stopOpacity=".9"/><stop offset="35%" stopColor={aV} stopOpacity=".7"/><stop offset="70%" stopColor="#7b61ff" stopOpacity=".4"/><stop offset="100%" stopColor={aV} stopOpacity=".15"/></linearGradient><linearGradient id="pfV" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={aV} stopOpacity=".08"/><stop offset="100%" stopColor="#7b61ff" stopOpacity=".03"/></linearGradient></defs>
            <ellipse cx="40" cy="30" rx="18" ry="22" fill="url(#pfV)" stroke="url(#pgV)" strokeWidth="1.8"/>
            {[16,22,28,34,42].map(y=><line key={`h${y}`} x1="24" y1={y} x2="56" y2={y} stroke={`${aV}25`} strokeWidth=".5"/>)}
            {[30,35,40,45,50].map(x=><line key={`v${x}`} x1={x} y1="10" x2={x} y2="50" stroke={`${aV}18`} strokeWidth=".5"/>)}
            <rect x="29" y="25" width="8" height="4" rx="2" fill={`${aV}44`} stroke={`${aV}66`} strokeWidth=".5"/><rect x="43" y="25" width="8" height="4" rx="2" fill={`${aV}44`} stroke={`${aV}66`} strokeWidth=".5"/>
            <circle cx="33" cy="27" r="1.5" fill={aV}><animate attributeName="opacity" values=".5;1;.5" dur="2.5s" repeatCount="indefinite"/></circle>
            <circle cx="47" cy="27" r="1.5" fill={aV}><animate attributeName="opacity" values=".5;1;.5" dur="2.5s" repeatCount="indefinite" begin=".3s"/></circle>
            <line x1="40" y1="30" x2="40" y2="36" stroke={`${aV}30`} strokeWidth=".6"/><path d="M35,40 Q40,43 45,40" fill="none" stroke={`${aV}30`} strokeWidth=".6"/>
            <path d="M10,108 Q10,82 22,72 Q32,64 40,62 Q48,64 58,72 Q70,82 70,108" fill="url(#pfV)" stroke="url(#pgV)" strokeWidth="1.8"/>
            {[72,80,88,96].map(y=><line key={`bh${y}`} x1={14+(y-72)*.15} y1={y} x2={66-(y-72)*.15} y2={y} stroke={`${aV}15`} strokeWidth=".4"/>)}
            <circle cx="18" cy="78" r="2" fill={`${aV}30`}/><circle cx="62" cy="78" r="2" fill={`${aV}30`}/>
            <line x1="22" y1="10" x2="58" y2="10" stroke={aV} strokeWidth="1.2" opacity=".35"><animate attributeName="y1" values="10;50;10" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="10;50;10" dur="3s" repeatCount="indefinite"/></line>
            <line x1="12" y1="65" x2="68" y2="65" stroke="#7b61ff" strokeWidth=".8" opacity=".2"><animate attributeName="y1" values="65;105;65" dur="4s" repeatCount="indefinite"/><animate attributeName="y2" values="65;105;65" dur="4s" repeatCount="indefinite"/></line>
          </svg>
        </div>
        <div style={{position:'absolute',bottom:16,right:22,width:58,height:38,border:'1px solid rgba(48,209,88,.35)',background:'rgba(48,209,88,.04)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 12px rgba(48,209,88,.06)'}}><div style={{position:'absolute',top:-1,left:-1,width:8,height:1,background:'#30d15866'}}/><div style={{position:'absolute',top:-1,left:-1,width:1,height:8,background:'#30d15866'}}/><span style={{fontFamily:PF,fontSize:6,color:'#30d158',opacity:.6,letterSpacing:2}}>YOU</span></div>
        <div style={{position:'absolute',top:14,left:18,animation:'cv-fi .5s ease'}}><div style={{fontFamily:PF,fontSize:6,color:aV,letterSpacing:1,padding:'5px 12px',border:`1px solid ${aV}44`,background:`${aV}0c`,display:'flex',alignItems:'center',gap:6,backdropFilter:'blur(4px)'}}><span style={{fontSize:11}}>🖥</span> VIDEO</div></div>
        <div style={{position:'absolute',top:14,right:18,textAlign:'right',animation:'cv-fi .5s ease .1s both'}}><div style={{fontFamily:PF,fontSize:7,color:aV,opacity:.8,letterSpacing:1}}>◉ VIDEO CALL</div><div style={{fontFamily:'monospace',fontSize:6,color:'rgba(255,255,255,.35)',marginTop:4}}>AUDIO + VISUAL</div></div>
        <div style={{position:'absolute',bottom:14,left:22,fontFamily:'monospace',fontSize:6,color:`${aV}40`,letterSpacing:2}}>FACE ANALYSIS ACTIVE</div>
      </div>)}
      {isRecording&&(<><div style={{position:'absolute',top:14,right:mode==='zoom'?180:160,zIndex:10,display:'flex',alignItems:'center',gap:6,padding:'4px 10px',border:`1px solid ${aR}55`,background:`${aR}12`,animation:'cv-fi .3s ease',backdropFilter:'blur(4px)'}}><div style={{width:8,height:8,borderRadius:'50%',background:aR,animation:'cv-rb 1s ease-in-out infinite',boxShadow:`0 0 8px ${aR},0 0 16px ${aR}44`}}/><span style={{fontFamily:PF,fontSize:6,color:aR,letterSpacing:1}}>REC</span></div>
        <svg style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:180,height:180,zIndex:5,pointerEvents:'none'}} viewBox="0 0 180 180"><circle cx="90" cy="90" r="85" fill="none" stroke={`${aR}08`} strokeWidth="1"/><circle cx="90" cy="90" r="85" fill="none" stroke={`${aR}30`} strokeWidth="1.5" strokeDasharray="534" strokeDashoffset={534-(tick%120)*4.45} strokeLinecap="round" transform="rotate(-90 90 90)" opacity=".4"/></svg>
        <div style={{position:'absolute',bottom:14,right:22,zIndex:10,fontFamily:'monospace',fontSize:6,color:`${aR}66`,letterSpacing:2}}>● SESSION CAPTURE ACTIVE</div>
      </>)}
      {screenWatchOn&&<div style={{position:'absolute',bottom:14,right:isRecording?200:18,zIndex:10,fontFamily:'monospace',fontSize:6,color:'#7b61ff',letterSpacing:1,opacity:.7}}>◈ SCREEN WATCH</div>}
      {[{pos:{top:0,left:0},d:'M2,18 L2,2 L18,2'},{pos:{top:0,right:0},d:'M2,2 L18,2 M18,2 L18,18'},{pos:{bottom:0,left:0},d:'M2,2 L2,18 M2,18 L18,18'},{pos:{bottom:0,right:0},d:'M18,2 L18,18 M18,18 L2,18'}].map((c,i)=>(<svg key={i} style={{position:'absolute',...c.pos,width:20,height:20,pointerEvents:'none',zIndex:3}} viewBox="0 0 20 20"><path d={c.d} stroke={screenWatchOn?'#7b61ff':ac} strokeWidth="1.2" fill="none" opacity=".45"/></svg>))}
    </div>
  )
}

const idleCSS=`
@keyframes idle-scan{0%{top:-2px}100%{top:100%}}
@keyframes idle-blink{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes idle-cursor{0%,100%{opacity:1}50%{opacity:0}}
@keyframes idle-drift{0%{transform:translateY(0)}50%{transform:translateY(-4px)}100%{transform:translateY(0)}}
@keyframes idle-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes idle-pulse-ring{0%,100%{opacity:0.08;transform:scale(1)}50%{opacity:0.2;transform:scale(1.05)}}
@keyframes idle-grid{0%{opacity:0.03}50%{opacity:0.06}100%{opacity:0.03}}
@keyframes idle-text-cycle{0%{color:#00d4ff}25%{color:#7b61ff}50%{color:#30d158}75%{color:#ff9500}100%{color:#00d4ff}}
@keyframes idle-shield-glow{0%,100%{filter:drop-shadow(0 0 6px #00d4ff44)}50%{filter:drop-shadow(0 0 14px #00d4ff88) drop-shadow(0 0 28px #7b61ff44)}}
@keyframes idle-dot-trail{0%{opacity:0}20%{opacity:1}100%{opacity:0;transform:translateX(40px)}}
`
function IdleScreen(){
  const[tick,setTick]=useState(0)
  useEffect(()=>{const t=setInterval(()=>setTick(v=>v+1),1200);return()=>clearInterval(t)},[])
  const msgs=['AWAITING SIGNAL','SYSTEMS NOMINAL','STANDING BY','READY TO PROTECT','ALL CHANNELS CLEAR','THREAT ENGINE IDLE','MONITORING OFFLINE']
  const msg=msgs[tick%msgs.length]
  return(
    <div style={{position:'relative',width:'100%',height:200,marginBottom:14,overflow:'hidden',border:'1px solid rgba(0,212,255,0.12)',background:'linear-gradient(180deg,rgba(0,0,0,0.95),rgba(2,4,8,0.98),rgba(0,0,0,0.95))'}}>
      <style>{idleCSS}</style>
      <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)',backgroundSize:'20px 20px',animation:'idle-grid 3s ease-in-out infinite',pointerEvents:'none'}}/>
      <div style={{position:'absolute',left:0,right:0,height:1,opacity:0.1,background:'linear-gradient(90deg,transparent,#00d4ff,transparent)',animation:'idle-scan 4s linear infinite',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:120,height:120,borderRadius:'50%',border:'1px solid rgba(0,212,255,0.1)',animation:'idle-pulse-ring 3s ease-in-out infinite',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:90,height:90,borderRadius:'50%',border:'1px solid rgba(123,97,255,0.08)',animation:'idle-pulse-ring 3s ease-in-out infinite 0.5s',pointerEvents:'none'}}/>
      <svg style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:160,height:160,animation:'idle-rotate 20s linear infinite',pointerEvents:'none'}} viewBox="0 0 160 160">
        <circle cx="80" cy="8" r="2.5" fill="#00d4ff" opacity="0.4"><animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="152" cy="80" r="2" fill="#7b61ff" opacity="0.3"><animate attributeName="opacity" values="0.15;0.5;0.15" dur="2.5s" repeatCount="indefinite"/></circle>
        <circle cx="80" cy="152" r="1.5" fill="#30d158" opacity="0.3"><animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite"/></circle>
      </svg>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',animation:'idle-drift 4s ease-in-out infinite',zIndex:2}}>
        <svg width="40" height="46" viewBox="0 0 40 46" style={{animation:'idle-shield-glow 3s ease-in-out infinite'}}>
          <path d="M20,2 L36,10 L36,24 C36,34 28,42 20,44 C12,42 4,34 4,24 L4,10 Z" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.5"/>
          <path d="M20,8 L30,14 L30,24 C30,30 26,36 20,38 C14,36 10,30 10,24 L10,14 Z" fill="rgba(0,212,255,0.06)" stroke="#00d4ff" strokeWidth="0.8" opacity="0.3"/>
          <text x="20" y="26" textAnchor="middle" fill="#00d4ff" fontSize="14" fontFamily="'Press Start 2P',monospace" opacity="0.6">🛡</text>
        </svg>
      </div>
      <div style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:2}}>
        <div style={{fontFamily:PF,fontSize:6,letterSpacing:3,animation:'idle-text-cycle 8s ease infinite',whiteSpace:'nowrap'}}>■ {msg}<span style={{animation:'idle-cursor 0.8s step-end infinite'}}>_</span></div>
      </div>
      <div style={{position:'absolute',top:10,left:14,fontFamily:PF,fontSize:5,color:'rgba(0,212,255,0.25)',letterSpacing:2}}>VOXGUARD v1.0.0</div>
      <div style={{position:'absolute',top:10,right:14,display:'flex',alignItems:'center',gap:6}}>
        <div style={{width:5,height:5,background:'#30d158',opacity:0.5,animation:'idle-blink 2s ease-in-out infinite',boxShadow:'0 0 4px #30d158'}}/>
        <span style={{fontFamily:MF,fontSize:8,color:'rgba(48,209,88,0.4)'}}>SYSTEMS OK</span>
      </div>
      {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i)=>(
        <svg key={i} style={{position:'absolute',...pos,width:16,height:16,pointerEvents:'none',opacity:0.2}} viewBox="0 0 16 16">
          <path d={i===0?'M2,14 L2,2 L14,2':i===1?'M2,2 L14,2 L14,14':i===2?'M2,2 L2,14 L14,14':'M14,2 L14,14 L2,14'} stroke="#00d4ff" strokeWidth="1" fill="none"/>
        </svg>
      ))}
    </div>
  )
}

function AnalysisProgressBar({progress,threatColor}){const c=progress>=100;return(<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontFamily:PF,fontSize:6,color:'rgba(0,212,255,.5)',letterSpacing:1}}>ANALYSIS PROGRESS</span><span style={{fontFamily:MF,fontSize:9,color:c?'#30d158':'#00d4ff'}}>{c?'✓ COMPLETE':progress+'%'}</span></div><div style={{height:6,background:'rgba(0,212,255,.08)',overflow:'hidden',position:'relative',border:'1px solid rgba(0,212,255,.1)'}}><div style={{height:'100%',width:`${progress}%`,background:c?'linear-gradient(90deg,#30d158,#4aeaff,#30d158)':`linear-gradient(90deg,#00d4ff,${threatColor},#7b61ff,#00d4ff)`,backgroundSize:'200% 100%',animation:c?'none':'progressShimmer 2s linear infinite',boxShadow:`0 0 12px ${c?'#30d158':'#00d4ff'}66`,transition:'width .5s ease'}}/>{!c&&progress>0&&<div style={{position:'absolute',top:0,height:'100%',width:30,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)',animation:'progressScan 1.5s ease-in-out infinite',left:`${Math.max(0,progress-10)}%`}}/>}</div><div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>{[0,25,50,75,100].map(v=><div key={v} style={{width:2,height:4,background:progress>=v?'#00d4ff':'rgba(0,212,255,.15)',boxShadow:progress>=v?'0 0 4px #00d4ff':'none',transition:'all .3s'}}/>)}</div></div>)}

const SCRIPTS_EN=[{id:'bank',label:'🏦 Bank Fraud',category:'critical',sentences:[{text:"Hello, this is the fraud prevention department from your bank.",delay:0,speaker:'caller'},{text:"Hello? Who is this?",delay:3500,speaker:'me'},{text:"We have detected suspicious activity on your checking account.",delay:6000,speaker:'caller'},{text:"What kind of suspicious activity?",delay:11000,speaker:'me'},{text:"Someone attempted to transfer three thousand dollars to an overseas account just minutes ago.",delay:13500,speaker:'caller'},{text:"Your account will be permanently frozen within the next ten minutes unless you verify your identity immediately.",delay:19000,speaker:'caller',alert:{id:'b1',severity:'critical',pattern:'Bank Impersonation',quote:'"Your account will be permanently frozen in 10 minutes unless you verify."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'FTC Sentinel',time:'00:19'}},{text:"Oh no, what do I need to do?",delay:26000,speaker:'me'},{text:"I need you to confirm your full account number and the one time passcode we just sent to your phone.",delay:28500,speaker:'caller',alert:{id:'b2',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"Confirm your full account number and the one-time passcode."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FBI IC3 2024',time:'00:28'}},{text:"Please do not contact your branch directly. This is a confidential internal investigation.",delay:36000,speaker:'caller',alert:{id:'b3',severity:'high',pattern:'Isolation Tactic',quote:'"Do not contact your branch. Confidential investigation."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:36'}}]},{id:'tech',label:'💻 Tech Support',category:'high',sentences:[{text:"Hello, this is the security center calling about your computer.",delay:0,speaker:'caller'},{text:"Wait, how do you know about my computer?",delay:5000,speaker:'me'},{text:"Our monitoring systems detected your device has been infected with a critical Trojan virus.",delay:7500,speaker:'caller',alert:{id:'t1',severity:'high',pattern:'Tech Support Impersonation',quote:'"Security Center — your device is infected with a Trojan."',confidence:93,tactics:['AUTHORITY','FEAR'],source:'FBI IC3 2024',time:'00:07'}},{text:"You must install our certified remote access tool immediately.",delay:15000,speaker:'caller',alert:{id:'t2',severity:'critical',pattern:'Tech Support Impersonation',quote:'"Install remote access tool immediately."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'FTC Sentinel',time:'00:15'}},{text:"If you do not act within thirty minutes, your credit card information will be compromised.",delay:23000,speaker:'caller',alert:{id:'t3',severity:'critical',pattern:'Artificial Urgency',quote:'"Within 30 minutes your credit card will be compromised."',confidence:95,tactics:['SCARCITY','FEAR'],source:'FBI IC3 2024',time:'00:23'}}]},{id:'gov',label:'🏛 Government / Tax',category:'critical',sentences:[{text:"This is an officer from the tax enforcement division.",delay:0,speaker:'caller',alert:{id:'g1',severity:'critical',pattern:'Government Impersonation',quote:'"Officer from tax enforcement division."',confidence:96,tactics:['AUTHORITY'],source:'FBI IC3 2024',time:'00:00'}},{text:"What is this about?",delay:6000,speaker:'me'},{text:"A warrant has been issued for your arrest. Settle this balance right now or face arrest.",delay:8500,speaker:'caller',alert:{id:'g2',severity:'critical',pattern:'Artificial Urgency',quote:'"Settle this balance right now or face arrest."',confidence:95,tactics:['AUTHORITY','FEAR'],source:'FTC Sentinel',time:'00:08'}},{text:"Purchase prepaid debit cards and read me the card numbers.",delay:16000,speaker:'caller',alert:{id:'g3',severity:'high',pattern:'Gift Card Demand',quote:'"Purchase prepaid debit cards and read me the numbers."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FTC Sentinel',time:'00:16'}}]},{id:'invest',label:'📈 Investment Fraud',category:'critical',sentences:[{text:"Hey, I got your number from a mutual friend. I have been making incredible returns on this new trading platform.",delay:0,speaker:'caller'},{text:"Who is this? I don't think I know you.",delay:5000,speaker:'me'},{text:"Trust me, I have been doing this for six months and my portfolio is up three hundred percent. Zero risk, guaranteed weekly payouts.",delay:7500,speaker:'caller',alert:{id:'inv1',severity:'high',pattern:'Investment Fraud',quote:'"300% returns, zero risk, guaranteed weekly payouts."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'FBI IC3 2024',time:'00:07'}},{text:"That sounds too good to be true.",delay:15000,speaker:'me'},{text:"I will walk you through it right now. You just need to deposit five thousand dollars to activate your account. But the window closes tonight.",delay:17500,speaker:'caller',alert:{id:'inv2',severity:'critical',pattern:'Artificial Urgency',quote:'"Deposit $5,000 to activate. Window closes tonight."',confidence:96,tactics:['SCARCITY','COMMITMENT'],source:'FBI IC3 2024',time:'00:17'}},{text:"Send the deposit to this crypto wallet address and I will personally manage your account.",delay:25000,speaker:'caller',alert:{id:'inv3',severity:'critical',pattern:'Crypto Transfer Scam',quote:'"Send deposit to this crypto wallet address."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FTC Sentinel',time:'00:25'}}]},{id:'family',label:'👨‍👩‍👧 Family Emergency',category:'critical',sentences:[{text:"Grandma? Grandma, it's me. I'm in so much trouble right now.",delay:0,speaker:'caller'},{text:"Who is this? Is that you?",delay:4500,speaker:'me'},{text:"Yes, it's me. I was in a car accident and I got arrested. I need bail money right now or they won't let me out.",delay:7000,speaker:'caller',alert:{id:'fam1',severity:'high',pattern:'Family Impersonation',quote:'"Car accident, arrested, need bail money right now."',confidence:92,tactics:['RECIPROCITY','FEAR'],source:'FBI IC3 2024',time:'00:07'}},{text:"Oh my God, are you okay? How much do you need?",delay:14000,speaker:'me'},{text:"The lawyer says I need eight thousand dollars for bail. Please don't tell Mom or Dad. They will be so angry with me.",delay:16500,speaker:'caller',alert:{id:'fam2',severity:'high',pattern:'Isolation Tactic',quote:'"Don\'t tell Mom or Dad."',confidence:91,tactics:['ISOLATION','FEAR'],source:'GASA 2024',time:'00:16'}},{text:"Go to the nearest store and buy gift cards for eight thousand dollars. Then read me the numbers on the back. That is the fastest way to get me out.",delay:24000,speaker:'caller',alert:{id:'fam3',severity:'critical',pattern:'Gift Card Demand',quote:'"Buy gift cards for $8,000 and read me the numbers."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FTC Sentinel',time:'00:24'}}]},{id:'prize',label:'🎁 Fake Prize',category:'medium',sentences:[{text:"Congratulations! You have been selected as our grand prize winner for this month's promotional sweepstakes!",delay:0,speaker:'caller'},{text:"Wait, what sweepstakes? I never entered anything.",delay:5500,speaker:'me'},{text:"Your phone number was automatically enrolled. You have won fifty thousand dollars in cash!",delay:8000,speaker:'caller',alert:{id:'prz1',severity:'medium',pattern:'Fake Prize / Lottery',quote:'"Automatically enrolled. Won $50,000 in cash."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'FTC Sentinel',time:'00:08'}},{text:"All we need is a small processing fee of four hundred and ninety-nine dollars to release your winnings. This must be paid within the hour.",delay:15000,speaker:'caller',alert:{id:'prz2',severity:'critical',pattern:'Artificial Urgency',quote:'"Processing fee of $499. Must be paid within the hour."',confidence:96,tactics:['SCARCITY','FEAR'],source:'FTC Sentinel',time:'00:15'}},{text:"Wire the fee to this account and your fifty thousand dollars will be deposited immediately.",delay:23000,speaker:'caller',alert:{id:'prz3',severity:'critical',pattern:'Wire Transfer Instruction',quote:'"Wire the fee to this account."',confidence:97,tactics:['AUTHORITY','COMMITMENT'],source:'FBI IC3 2024',time:'00:23'}}]},{id:'crypto',label:'₿ Crypto Scam',category:'critical',sentences:[{text:"Hi there. I am a certified blockchain recovery specialist. We detected that your cryptocurrency wallet has been compromised.",delay:0,speaker:'caller',alert:{id:'cry1',severity:'high',pattern:'Tech Support Impersonation',quote:'"Certified blockchain recovery specialist. Wallet compromised."',confidence:93,tactics:['AUTHORITY','FEAR'],source:'FBI IC3 2024',time:'00:00'}},{text:"What? How do you know about my wallet?",delay:7000,speaker:'me'},{text:"Our security audit flagged unauthorized access to your account. If you do not act now, your entire balance will be drained within the hour.",delay:9500,speaker:'caller',alert:{id:'cry2',severity:'critical',pattern:'Artificial Urgency',quote:'"Balance drained within the hour if you don\'t act."',confidence:95,tactics:['SCARCITY','FEAR'],source:'GASA 2024',time:'00:09'}},{text:"To secure your funds, transfer your crypto to our protected escrow wallet. Here is the address.",delay:17000,speaker:'caller',alert:{id:'cry3',severity:'critical',pattern:'Crypto Transfer Scam',quote:'"Transfer crypto to our protected escrow wallet."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FTC Sentinel',time:'00:17'}},{text:"Do not share this recovery process with anyone. This is a confidential security operation.",delay:25000,speaker:'caller',alert:{id:'cry4',severity:'high',pattern:'Isolation Tactic',quote:'"Do not share this with anyone. Confidential operation."',confidence:92,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:25'}}]}]
const SCRIPTS_ID=[{id:'bank_id',label:'🏦 Penipuan Bank',category:'critical',sentences:[{text:"Halo selamat siang. Saya dari pusat keamanan bank XYZ.",delay:0,speaker:'caller'},{text:"Halo, dari bank mana ya?",delay:5500,speaker:'me'},{text:"Ada transaksi 15 juta rupiah yang tidak dikenal dari rekening Anda ke luar negeri.",delay:8000,speaker:'caller'},{text:"Rekening Anda akan kami blokir permanen dalam 10 menit jika tidak segera verifikasi identitas.",delay:14500,speaker:'caller',alert:{id:'id1',severity:'critical',pattern:'Penipuan Perbankan',quote:'"Rekening akan diblokir permanen dalam 10 menit."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'OJK 2024',time:'00:14'}},{text:"Waduh, gimana caranya?",delay:22000,speaker:'me'},{text:"Sebutkan nomor rekening lengkap dan kode OTP yang baru saja kami kirim.",delay:24500,speaker:'caller',alert:{id:'id2',severity:'critical',pattern:'Pencurian OTP / Kredensial',quote:'"Sebutkan nomor rekening dan kode OTP."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'OJK 2024',time:'00:24'}},{text:"Jangan hubungi cabang bank. Ini investigasi internal rahasia.",delay:32000,speaker:'caller',alert:{id:'id3',severity:'high',pattern:'Taktik Isolasi',quote:'"Jangan hubungi cabang. Investigasi rahasia."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'Bareskrim 2024',time:'00:32'}}]},{id:'pinjol',label:'💰 Pemerasan Pinjol',category:'high',sentences:[{text:"Selamat pagi. Bagian penagihan pinjaman. Anda punya tunggakan 3 juta rupiah yang harus dilunasi hari ini.",delay:0,speaker:'caller',alert:{id:'id4',severity:'high',pattern:'Pemerasan / Intimidasi',quote:'"Tunggakan 3 juta harus dilunasi hari ini."',confidence:88,tactics:['AUTHORITY','FEAR'],source:'OJK 2024',time:'00:00'}},{text:"Saya tidak pernah pinjam uang!",delay:6500,speaker:'me'},{text:"Kalau tidak dibayar dalam satu jam, kami hubungi seluruh kontak di HP Anda.",delay:9000,speaker:'caller',alert:{id:'id5',severity:'critical',pattern:'Ancaman Pemerasan',quote:'"Hubungi seluruh kontak HP tentang hutang."',confidence:95,tactics:['FEAR','SCARCITY'],source:'Bareskrim 2024',time:'00:09'}},{text:"Foto KTP dan data pribadi Anda akan kami sebarkan ke media sosial.",delay:17000,speaker:'caller',alert:{id:'id6',severity:'critical',pattern:'Ancaman Penyebaran Data',quote:'"KTP disebarkan ke media sosial."',confidence:96,tactics:['FEAR','ISOLATION'],source:'Kominfo 2024',time:'00:17'}}]},{id:'mama',label:'📱 Mama Minta Pulsa',category:'medium',sentences:[{text:"Halo nak, ini mama. Mama lagi di rumah sakit, adikmu sakit parah.",delay:0,speaker:'caller'},{text:"Mama? Kok suaranya beda?",delay:6000,speaker:'me'},{text:"HP mama kehabisan pulsa. Tolong kirimkan pulsa 100 ribu ke nomor ini.",delay:8500,speaker:'caller',alert:{id:'id8',severity:'medium',pattern:'Penipuan Identitas Keluarga',quote:'"Mama di rumah sakit, kirimkan pulsa 100 ribu."',confidence:85,tactics:['RECIPROCITY','FEAR'],source:'Kominfo 2024',time:'00:08'}},{text:"Cepat ya nak, ini darurat. Jangan bilang papa dulu.",delay:16000,speaker:'caller',alert:{id:'id9',severity:'high',pattern:'Taktik Isolasi',quote:'"Jangan bilang papa dulu."',confidence:90,tactics:['ISOLATION','SCARCITY'],source:'Bareskrim 2024',time:'00:16'}},{text:"Mama butuh transfer 3 juta untuk biaya rumah sakit sekarang juga.",delay:23000,speaker:'caller',alert:{id:'id10',severity:'critical',pattern:'Transfer Paksa Darurat',quote:'"Butuh transfer 3 juta untuk biaya RS."',confidence:92,tactics:['FEAR','COMMITMENT'],source:'OJK 2024',time:'00:23'}}]},{id:'giveaway',label:'🎁 Giveaway Palsu',category:'medium',sentences:[{text:"Selamat! Anda terpilih sebagai pemenang giveaway!",delay:0,speaker:'caller'},{text:"Hah serius? Saya ikut giveaway apa?",delay:5500,speaker:'me'},{text:"Hadiah uang tunai 50 juta rupiah. Untuk klaim, bayar pajak hadiah 2 juta.",delay:8000,speaker:'caller',alert:{id:'id11',severity:'high',pattern:'Undian / Hadiah Palsu',quote:'"Menang 50 juta, bayar pajak 2 juta untuk klaim."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'Kominfo 2024',time:'00:08'}},{text:"Transfer sekarang sebelum hadiah hangus 30 menit.",delay:16000,speaker:'caller',alert:{id:'id12',severity:'critical',pattern:'Urgensi Palsu',quote:'"Transfer sebelum hangus 30 menit."',confidence:96,tactics:['SCARCITY','FEAR'],source:'Bareskrim 2024',time:'00:16'}}]}]
const SCRIPTS_ZH=[{id:'police_zh',label:'🚔 冒充公安诈骗',category:'critical',sentences:[{text:"你好，这里是公安局。我们发现你的身份证涉及一起重大洗钱案件。",delay:0,speaker:'caller',alert:{id:'zh1',severity:'critical',pattern:'冒充政府机关',quote:'"公安局 — 身份证涉及洗钱案。"',confidence:97,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:00'}},{text:"什么？我没有做过这样的事！",delay:7000,speaker:'me'},{text:"不配合调查将立即冻结所有资产。",delay:10000,speaker:'caller',alert:{id:'zh2',severity:'critical',pattern:'虚假紧迫性',quote:'"不配合将冻结所有资产。"',confidence:96,tactics:['FEAR','SCARCITY'],source:'GASA 2024',time:'00:10'}},{text:"将全部存款转入安全监管账户。",delay:18000,speaker:'caller',alert:{id:'zh3',severity:'critical',pattern:'安全账户转账',quote:'"存款转入安全监管账户。"',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:18'}},{text:"这是国家机密案件，严禁向任何人透露。",delay:26000,speaker:'caller',alert:{id:'zh4',severity:'high',pattern:'隔离策略',quote:'"国家机密，严禁透露。"',confidence:94,tactics:['ISOLATION','FEAR'],source:'GASA 2024',time:'00:26'}}]}]
const SCRIPTS_JA=[{id:'oreore',label:'📞 オレオレ詐欺',category:'critical',sentences:[{text:"もしもし、お母さん？俺だよ。大変なことになっちゃって。",delay:0,speaker:'caller'},{text:"え？誰？",delay:5000,speaker:'me'},{text:"会社のお金を間違えて使って、今日中に三百万円返さないとクビになる。",delay:7500,speaker:'caller',alert:{id:'ja1',severity:'high',pattern:'家族なりすまし',quote:'"会社のお金、300万円必要。"',confidence:92,tactics:['RECIPROCITY','FEAR'],source:'NPA 2024',time:'00:07'}},{text:"誰にも言わないで。今すぐこの口座に振り込んで。",delay:15000,speaker:'caller',alert:{id:'ja2',severity:'critical',pattern:'緊急送金要求',quote:'"誰にも言わないで、振り込んで。"',confidence:94,tactics:['ISOLATION','COMMITMENT'],source:'NPA 2024',time:'00:15'}}]}]
const SCRIPTS_KO=[{id:'vp_kr',label:'🏦 보이스피싱',category:'critical',sentences:[{text:"안녕하세요. 금융당국입니다. 고객님 계좌가 범죄에 연루되었습니다.",delay:0,speaker:'caller',alert:{id:'ko1',severity:'critical',pattern:'정부기관 사칭',quote:'"금융당국 — 계좌 범죄 연루."',confidence:96,tactics:['AUTHORITY','FEAR'],source:'FSS 2024',time:'00:00'}},{text:"네? 무슨 말씀이세요?",delay:7000,speaker:'me'},{text:"안전계좌로 이체하지 않으면 계좌가 동결됩니다.",delay:10000,speaker:'caller',alert:{id:'ko2',severity:'critical',pattern:'안전계좌 이체',quote:'"안전계좌 이체 안하면 동결."',confidence:98,tactics:['FEAR','SCARCITY'],source:'FSS 2024',time:'00:10'}},{text:"수사 기밀이므로 가족이나 은행에 절대 말하면 안 됩니다.",delay:18000,speaker:'caller',alert:{id:'ko3',severity:'high',pattern:'고립 전술',quote:'"수사 기밀 — 말하면 안 됩니다."',confidence:93,tactics:['ISOLATION','AUTHORITY'],source:'FSS 2024',time:'00:18'}}]}]
const SCRIPTS_ES=[{id:'banco_es',label:'🏦 Fraude Bancario',category:'critical',sentences:[{text:"Buenas tardes. Seguridad de su banco. Detectamos movimientos sospechosos.",delay:0,speaker:'caller'},{text:"¿Qué banco? No entiendo.",delay:5500,speaker:'me'},{text:"Su cuenta será bloqueada en diez minutos si no verifica su identidad.",delay:8000,speaker:'caller',alert:{id:'es1',severity:'critical',pattern:'Suplantación Bancaria',quote:'"Cuenta bloqueada en 10 minutos."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08'}},{text:"Confirme su número de cuenta y el código de verificación.",delay:16000,speaker:'caller',alert:{id:'es2',severity:'critical',pattern:'Robo de Credenciales',quote:'"Confirme cuenta y código."',confidence:98,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:16'}}]}]
const SCRIPTS_FR=[{id:'cpf_fr',label:'🏛 Arnaque CPF',category:'high',sentences:[{text:"Bonjour, service formation. Votre compte formation arrive à expiration.",delay:0,speaker:'caller',alert:{id:'fr1',severity:'high',pattern:'Usurpation gouvernementale',quote:'"Compte formation expire."',confidence:92,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:00'}},{text:"De quoi parlez-vous ?",delay:7000,speaker:'me'},{text:"Deux mille quatre cents euros seront perdus à la fin du mois.",delay:10000,speaker:'caller',alert:{id:'fr2',severity:'high',pattern:'Urgence Artificielle',quote:'"2400€ perdus fin du mois."',confidence:90,tactics:['SCARCITY','FEAR'],source:'GASA 2024',time:'00:10'}}]}]
const SCRIPTS_HI=[{id:'aadh',label:'🏛 डिजिटल अरेस्ट',category:'critical',sentences:[{text:"नमस्ते, दूरसंचार विभाग से बोल रहा हूं। आपका नंबर अवैध गतिविधियों में इस्तेमाल हो रहा है।",delay:0,speaker:'caller',alert:{id:'hi1',severity:'critical',pattern:'सरकारी एजेंसी का रूप',quote:'"दूरसंचार विभाग — अवैध गतिविधि।"',confidence:95,tactics:['AUTHORITY','FEAR'],source:'MHA 2024',time:'00:00'}},{text:"क्या? मैंने कुछ नहीं किया!",delay:7500,speaker:'me'},{text:"चौबीस घंटे में नंबर बंद हो जाएगा। आधार और OTP बताइए।",delay:10000,speaker:'caller',alert:{id:'hi2',severity:'critical',pattern:'OTP चोरी',quote:'"आधार और OTP बताइए।"',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'RBI 2024',time:'00:10'}}]}]
const SCRIPTS_AR=[{id:'bank_ar',label:'🏦 احتيال مصرفي',category:'critical',sentences:[{text:"مرحباً، قسم الأمان في البنك. اكتشفنا عملية مشبوهة على حسابكم.",delay:0,speaker:'caller',alert:{id:'ar1',severity:'critical',pattern:'انتحال موظف بنكي',quote:'"قسم الأمان — عملية مشبوهة."',confidence:95,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:00'}},{text:"من أنتم؟",delay:6500,speaker:'me'},{text:"نحتاج رمز التحقق لإيقاف العملية فوراً وإلا سيتم تجميد حسابكم.",delay:9000,speaker:'caller',alert:{id:'ar2',severity:'critical',pattern:'سرقة بيانات',quote:'"رمز التحقق لإيقاف العملية."',confidence:97,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:09'}}]}]
function getScriptsForLang(lang){return({id:SCRIPTS_ID,zh:SCRIPTS_ZH,ja:SCRIPTS_JA,ko:SCRIPTS_KO,es:SCRIPTS_ES,fr:SCRIPTS_FR,hi:SCRIPTS_HI,ar:SCRIPTS_AR})[lang]||SCRIPTS_EN}

const TECH_ITEMS=[{icon:'🦀',name:'RUST WASM',sub:'Audio Engine · Zero-copy',c:'#ff9500'},{icon:'🐍',name:'PYTHON',sub:'FastAPI · Cloud Run',c:'#30d158'},{icon:'✦',name:'GEMINI LIVE',sub:'Real-time AI Analysis',c:'#00d4ff'},{icon:'☁',name:'CLOUD RUN',sub:'GCP · Auto-scale',c:'#7b61ff'}]
function getNow(){return new Date().toLocaleString('en-US',{timeZone:'America/New_York',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' EST'}
function TechChip({item}){const[h,setH]=useState(false);return(<div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',marginBottom:3,borderLeft:`2px solid ${h?item.c:item.c+'35'}`,background:h?item.c+'0f':'rgba(255,255,255,.01)',transition:'all .18s ease',cursor:'default'}}><span style={{fontSize:16,filter:h?`drop-shadow(0 0 6px ${item.c})`:'none',transition:'filter .2s'}}>{item.icon}</span><div style={{flex:1}}><div style={{fontFamily:PF,fontSize:7,color:h?item.c:item.c+'cc',transition:'all .2s'}}>{item.name}</div><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,.38)',marginTop:2}}>{item.sub}</div></div></div>)}
function LiveTranscript({lines,speaking}){const ref=useRef(null);useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[lines]);return(<div ref={ref} style={{background:'rgba(0,0,0,.6)',border:'1px solid rgba(0,212,255,.12)',padding:'12px 16px',maxHeight:180,overflowY:'auto',marginBottom:16}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><div style={{fontFamily:PF,fontSize:6,color:'rgba(0,212,255,.6)',letterSpacing:2}}>LIVE TRANSCRIPT</div>{speaking&&<span style={{fontFamily:MF,fontSize:8,color:'#ff2d55',animation:'blink .8s step-end infinite'}}>● SPEAKING</span>}</div>{lines.length===0?<div style={{fontFamily:MF,fontSize:10,color:'rgba(255,255,255,.2)',fontStyle:'italic'}}>Waiting for audio input...</div>:lines.map((l,i)=>{const m=l.speaker==='me';return(<div key={i} style={{fontFamily:MF,fontSize:11,color:m?'#30d158':'rgba(255,255,255,.75)',lineHeight:1.7,padding:'3px 0',borderLeft:l.flagged?'2px solid #ff2d55':m?'2px solid #30d15844':'2px solid transparent',paddingLeft:8,background:l.flagged?'rgba(255,45,85,.06)':'transparent'}}><span style={{color:m?'#30d15877':'rgba(0,212,255,.4)',fontSize:9,marginRight:6}}>[{l.time}]</span><span style={{fontFamily:PF,fontSize:5,color:m?'#30d158':'#ff9500',marginRight:5,letterSpacing:1}}>{m?'ME':'CALLER'}</span>{l.text}{l.flagged&&<span style={{color:'#ff2d55',fontSize:8,marginLeft:6}}>⚠</span>}</div>)})}</div>)}

function RecButton({ isRecording, onClick }) {
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)
  const active = isRecording
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setPressed(false) }} onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      style={{
        fontFamily: PF, fontSize: 7, letterSpacing: 2, padding: '8px 16px',
        border: active ? '1px solid #ff2d55' : `1px solid ${hov ? '#ff2d55cc' : '#ff2d5555'}`,
        background: active ? 'linear-gradient(135deg, rgba(255,45,85,0.25), rgba(255,45,85,0.12))' : hov ? 'linear-gradient(135deg, rgba(255,45,85,0.15), rgba(255,45,85,0.06))' : 'linear-gradient(135deg, rgba(255,45,85,0.06), transparent)',
        color: '#ff2d55', cursor: 'pointer',
        boxShadow: active ? '0 0 16px rgba(255,45,85,0.4), 0 0 32px rgba(255,45,85,0.15), inset 0 0 12px rgba(255,45,85,0.1)' : hov ? '0 0 12px rgba(255,45,85,0.3), inset 0 0 8px rgba(255,45,85,0.06)' : '0 0 6px rgba(255,45,85,0.1)',
        transform: pressed ? 'scale(0.96) translateY(1px)' : hov ? 'translateY(-1px)' : 'none',
        transition: 'all 0.14s ease', textTransform: 'uppercase', position: 'relative', overflow: 'hidden',
        animation: active ? 'rec-pulse 2s ease-in-out infinite' : 'none',
        textShadow: active ? '0 0 8px rgba(255,45,85,0.6)' : hov ? '0 0 6px rgba(255,45,85,0.4)' : 'none',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
      {[['0','0'],['calc(100% - 3px)','0'],['0','calc(100% - 3px)'],['calc(100% - 3px)','calc(100% - 3px)']].map(([l,t],i) => (
        <span key={i} style={{ position:'absolute',left:l,top:t,width:3,height:3,background:'#ff2d55',display:'block',opacity:active||hov?0.8:0.3,transition:'opacity 0.15s' }} />
      ))}
      <span style={{ width:8,height:8,borderRadius:'50%',flexShrink:0, background:active?'#ff2d55':hov?'#ff2d5588':'#ff2d5544', boxShadow:active?'0 0 8px #ff2d55, 0 0 16px rgba(255,45,85,0.4)':'none', animation:active?'rec-dot 1s ease-in-out infinite':'none', transition:'all 0.2s' }} />
      <span>{active ? 'REC ON' : 'REC'}</span>
    </button>
  )
}

// ══════════════════════════════════════════════════════════
// ── MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export function MonitorTab({monitoring,threatLevel,sessionTime,alerts,threatScore,audioLevel,screenOn,onStart,onStop,onToggleScreen,onDemoAlert,onTranscriptLine,onInterventionEvent,onSafeExit,language='en'}){
  const[script,setScript]=useState(null),[now,setNow]=useState(getNow()),[speaking,setSpeaking]=useState(false),[transcriptLines,setTranscriptLines]=useState([]),[voiceDemo,setVoiceDemo]=useState(false),[demoProgress,setDemoProgress]=useState(0),[voiceMuted,setVoiceMuted]=useState(false),[volume,setVolume]=useState(1.0)
  const volumeRef=useRef(1.0)
  const handleVolume=(v)=>{setVolume(v);volumeRef.current=v}
  const[callMode,setCallMode]=useState('phone'),[isRecording,setIsRecording]=useState(false)
  const speechTimers=useRef([]),startTimeRef=useRef(null),pendingCount=useRef(0),finished=useRef(false)
  const availableScripts=getScriptsForLang(language)

  const[activeIntervention,setActiveIntervention]=useState(null)
  const[interventionHistory,setInterventionHistory]=useState([])
  const lastInterventionLevel=useRef('')

  useEffect(()=>{
    if(!monitoring) return
    const latestAlert=alerts[alerts.length-1]||null
    const level=getInterventionLevel(threatScore,latestAlert)
    if(!level) return
    const rank={WARN:1,BLOCK:2,LOCKDOWN:3}
    const lastRank=rank[lastInterventionLevel.current]||0
    const curRank=rank[level.label.split(' ')[0]]||0
    const isInstant=latestAlert&&isInstantInterventionPattern(latestAlert.pattern)
    if(!isInstant&&curRank<=lastRank) return
    const lvKey=level.label.split(' ')[0]
    lastInterventionLevel.current=lvKey
    const event={ id:`INT-${Date.now()}`, level:lvKey, trigger:isInstant?'instant_pattern':'score_threshold', pattern:latestAlert?.pattern||'Cumulative Risk', threatScore, timestamp:Date.now() }
    setActiveIntervention(event)
    setInterventionHistory(h=>[...h,event])
    if(onInterventionEvent) onInterventionEvent(event)
    // [FIX #3] Also pause any Gemini TTS audio
    if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}
    if(window.speechSynthesis?.speaking) window.speechSynthesis.pause()
  },[threatScore,alerts.length,monitoring])

  const handleInterventionDismiss = (action) => {
    const updated = { ...activeIntervention, userAction: action }
    setInterventionHistory(h => h.map(e => e.id === updated.id ? updated : e))
    setActiveIntervention(null)
    if (action === 'safe_exit') {
      window.speechSynthesis?.cancel()
      if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}
      speechTimers.current.forEach(t => clearTimeout(t))
      speechTimers.current = []
      setSpeaking(false);setVoiceDemo(false);setIsRecording(false)
      if (onSafeExit) { onSafeExit() } else { handleStop() }
      return
    }
    if (action === 'challenge_passed' || action === 'dismissed') {
      if (window.speechSynthesis?.paused) window.speechSynthesis.resume()
      return
    }
    if (window.speechSynthesis?.paused) window.speechSynthesis.resume()
  }

  useEffect(()=>{setScript(null)},[language]);useEffect(()=>{const t=setInterval(()=>setNow(getNow()),1000);return()=>clearInterval(t)},[]);useEffect(()=>{return()=>{speechTimers.current.forEach(t=>clearTimeout(t));window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause()}catch(e){}}}},[])
  useEffect(()=>{if(!monitoring){setTranscriptLines([]);setVoiceDemo(false);setSpeaking(false);setDemoProgress(0);finished.current=false;pendingCount.current=0;speechTimers.current.forEach(t=>clearTimeout(t));speechTimers.current=[];window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}setIsRecording(false);setActiveIntervention(null);lastInterventionLevel.current=''}},[monitoring])
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`,avgConf=alerts.length>0?Math.round(alerts.reduce((a,b)=>a+b.confidence,0)/alerts.length):null,tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#00d4ff'

  /* ══════════════════════════════════════════════════════════
     [FIX #3] startVoiceDemo — Gemini TTS first, browser fallback
  ══════════════════════════════════════════════════════════ */
  const startVoiceDemo=useCallback((sel)=>{if(!sel)return;speechTimers.current.forEach(t=>clearTimeout(t));speechTimers.current=[];window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}setVoiceDemo(true);setTranscriptLines([]);setDemoProgress(0);finished.current=false;startTimeRef.current=Date.now();const sents=sel.sentences,tc=sents.filter(s=>s.speaker==='caller').length;pendingCount.current=tc;const go=()=>{const browserVoice=getVoiceForLang(language);sents.forEach((s,idx)=>{const timer=setTimeout(()=>{const el=Date.now()-startTimeRef.current,ts=fmt(Math.floor(el/1000)),line={text:s.text,time:ts,flagged:!!s.alert,speaker:s.speaker||'caller'};setTranscriptLines(p=>[...p,line]);if(onTranscriptLine)onTranscriptLine(line);if(s.speaker==='me'){if(s.alert){const at=setTimeout(()=>{if(onDemoAlert)onDemoAlert(s.alert)},500);speechTimers.current.push(at)};return}

          /* ── [FIX #3] Speech: try Gemini TTS, fallback browser ── */
          if(!voiceMuted){
            const onSpeechDone=()=>{
              setSpeaking(false)
              const cd=sents.filter((x,j)=>j<=idx&&x.speaker==='caller').length
              setDemoProgress(Math.round((cd/tc)*100))
              pendingCount.current--
              if(pendingCount.current<=0&&!finished.current){
                finished.current=true
                const st=setTimeout(()=>onStop(),3000)
                speechTimers.current.push(st)
              }
            }

            // Try Gemini TTS first (async)
            ;(async()=>{
              const audioBlob = await generateGeminiTTS(s.text, language)
              if(audioBlob){
                // Play Gemini audio
                const url = URL.createObjectURL(audioBlob)
                const audio = new Audio(url)
                _activeGeminiAudio = audio
                audio.volume = volumeRef.current
                audio.onplay = ()=>setSpeaking(true)
                audio.onended = ()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;onSpeechDone()}
                audio.onerror = ()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;fallbackBrowser()}
                audio.play().catch(()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;fallbackBrowser()})
              } else {
                fallbackBrowser()
              }

              function fallbackBrowser(){
                if(!window.speechSynthesis)return onSpeechDone()
                const u=new SpeechSynthesisUtterance(s.text)
                if(browserVoice)u.voice=browserVoice
                u.rate=1;u.pitch=1;u.volume=volumeRef.current
                u.onstart=()=>setSpeaking(true)
                u.onend=onSpeechDone
                u.onerror=onSpeechDone
                window.speechSynthesis.speak(u)
              }
            })()
          } else {
            // Muted — just progress
            const cd=sents.filter((x,j)=>j<=idx&&x.speaker==='caller').length
            setDemoProgress(Math.round((cd/tc)*100))
            pendingCount.current--
            if(pendingCount.current<=0&&!finished.current){finished.current=true;const st=setTimeout(()=>onStop(),3000);speechTimers.current.push(st)}
          }

          if(s.alert){const at=setTimeout(()=>{if(onDemoAlert)onDemoAlert(s.alert)},1800);speechTimers.current.push(at)}
        },s.delay);speechTimers.current.push(timer)})};if(window.speechSynthesis&&window.speechSynthesis.getVoices().length===0){window.speechSynthesis.addEventListener('voiceschanged',go,{once:true});setTimeout(go,300)}else go()},[onDemoAlert,onStop,onTranscriptLine,language,voiceMuted])

  const handleStartWithVoice=()=>{onStart();if(script)setTimeout(()=>startVoiceDemo(script),500)},handleStop=()=>{window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}speechTimers.current.forEach(t=>clearTimeout(t));onStop()}

  return(<div className="vg-monitor-grid" style={{display:'grid',gridTemplateColumns:'1fr 296px',gap:20,position:'relative'}}>
    <style>{`
      @keyframes progressShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      @keyframes progressScan{0%{opacity:0;transform:translateX(-20px)}50%{opacity:1}100%{opacity:0;transform:translateX(20px)}}
      @keyframes rec-pulse{0%,100%{box-shadow:0 0 8px #ff2d55,0 0 16px rgba(255,45,85,0.3)}50%{box-shadow:0 0 14px #ff2d55,0 0 28px rgba(255,45,85,0.5),0 0 40px rgba(255,45,85,0.15)}}
      @keyframes rec-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
      @keyframes cv-crt-line{0%{top:-2px}100%{top:100%}}
      @keyframes scriptBtnGlow{0%{border-color:#ffd60a44;text-shadow:none}33%{border-color:#ff950066;text-shadow:0 0 6px #ff950044}66%{border-color:#30d15866;text-shadow:0 0 6px #30d15844}100%{border-color:#ffd60a44;text-shadow:none}}
      .vg-demo-script-btn:hover{border-color:#ffd60a!important;color:#ffd60a!important;background:rgba(255,214,10,.1)!important;animation:scriptBtnGlow 2s ease infinite!important;box-shadow:0 0 12px rgba(255,214,10,.15),inset 0 0 8px rgba(255,214,10,.05)}
      @media(max-width:900px){.vg-monitor-grid{grid-template-columns:1fr!important}.vg-monitor-sidebar{order:2}.vg-monitor-sidebar-inner{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important}}
      @media(max-width:600px){.vg-monitor-sidebar-inner{grid-template-columns:1fr!important}.vg-monitor-controls{gap:6px!important;justify-content:stretch!important}.vg-monitor-controls>*{flex:1 1 auto!important;min-width:0!important}.vg-monitor-controls>button{font-size:5px!important;padding:8px 8px!important;letter-spacing:1px!important}.vg-monitor-controls .vg-callmode-toggle{flex:0 0 auto!important}.vg-monitor-header{flex-direction:column!important;align-items:stretch!important}.vg-monitor-header>div:first-child{margin-bottom:4px}.vg-monitor-title{font-size:8px!important}.vg-monitor-stats{flex-wrap:wrap!important}.vg-monitor-stats>*{min-width:calc(50% - 4px)!important;flex:1 1 calc(50% - 4px)!important}.vg-main-box{padding:14px!important}.vg-main-box .vg-monitor-controls{overflow-x:auto;-webkit-overflow-scrolling:touch}}
      @media(max-width:400px){.vg-monitor-controls{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important}.vg-monitor-controls .vg-callmode-toggle{grid-column:span 2}.vg-monitor-controls .vg-btn-start{grid-column:span 2}.vg-monitor-title{font-size:7px!important}}
    `}</style>

    {activeIntervention&&monitoring&&(
      <InterventionOverlay intervention={activeIntervention} language={language} onDismiss={handleInterventionDismiss} onStop={handleStop}/>
    )}

    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <PBox className="vg-main-box" color={monitoring&&threatLevel==='critical'?'#ff2d55':'#00d4ff'} style={{padding:24,background:'rgba(0,212,255,.01)',transition:'all .5s',position:'relative',overflow:'hidden'}}>
        {monitoring&&<div style={{position:'absolute',left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,rgba(0,212,255,0.06),transparent)',animation:'cv-crt-line 4s linear infinite',pointerEvents:'none',zIndex:1}}/>}

        <div className="vg-monitor-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:10,position:'relative',zIndex:2}}>
          <div><div className="vg-monitor-title" style={{fontFamily:PF,fontSize:10,color:'#00d4ff',marginBottom:6,textShadow:'0 0 14px #00d4ff'}}>LIVE SESSION MONITOR</div><div style={{fontFamily:MF,fontSize:11,color:'rgba(255,255,255,.48)'}}>{monitoring?voiceDemo?`► VOICE DEMO — ${fmt(sessionTime)} — ${demoProgress}%`:`► ANALYZING — ${fmt(sessionTime)}`:'■ READY — SELECT DEMO → START'}</div>
          {/* [FIX #3] Show TTS status */}
          {voiceDemo&&GEMINI_API_KEY&&<div style={{fontFamily:MF,fontSize:8,color:'#30d158',marginTop:2}}>✦ Gemini TTS Active</div>}
          {voiceDemo&&!GEMINI_API_KEY&&<div style={{fontFamily:MF,fontSize:8,color:'#ff9500',marginTop:2}}>⚠ Browser TTS (add VITE_GEMINI_API_KEY for natural voice)</div>}
          </div>
          <div className="vg-monitor-controls" style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end',alignItems:'center'}}>
            <div className="vg-callmode-toggle" style={{display:'flex',gap:0,border:'1px solid rgba(0,212,255,.2)'}}>{[{m:'phone',icon:'📞',label:'CALL'},{m:'zoom',icon:'🖥',label:'VIDEO'}].map(({m,icon,label})=>(<button key={m} onClick={()=>setCallMode(m)} style={{fontFamily:PF,fontSize:5,padding:'6px 10px',border:'none',borderRight:'1px solid rgba(0,212,255,.1)',background:callMode===m?'rgba(0,212,255,.12)':'transparent',color:callMode===m?'#00d4ff':'rgba(255,255,255,.35)',cursor:'pointer',display:'flex',alignItems:'center',gap:4,transition:'all .15s'}}><span style={{fontSize:10}}>{icon}</span>{label}</button>))}</div>
            <RecButton isRecording={isRecording} onClick={()=>setIsRecording(r=>!r)} />
            {voiceDemo&&<PBtn onClick={()=>{setVoiceMuted(m=>!m);if(!voiceMuted){window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}}}} color={voiceMuted?'#ff9500':'#30d158'} style={{padding:'10px 14px'}}>{voiceMuted?'🔇 UNMUTE':'🔊 MUTE'}</PBtn>}
            <PBtn onClick={onToggleScreen} color={screenOn?'#7b61ff':'#7b61ff'}>{screenOn?'■ SCREEN OFF':'◈ SCREEN WATCH'}</PBtn>
            {!monitoring?<PBtn className="vg-btn-start" onClick={handleStartWithVoice} color="#30d158">{script?'▶ START VOICE DEMO':'▶ START'}</PBtn>:<PBtn className="vg-btn-start" onClick={handleStop} danger>■ STOP</PBtn>}
          </div>
        </div>
        <CallerVisual mode={callMode} active={voiceDemo&&monitoring} screenWatchOn={screenOn} isRecording={isRecording}/>
        {!monitoring&&<IdleScreen/>}
        {screenOn&&monitoring&&(<div style={{padding:'8px 12px',marginBottom:12,border:'1px solid rgba(123,97,255,.3)',background:'rgba(123,97,255,.08)',display:'flex',alignItems:'center',gap:8}}><div style={{width:6,height:6,background:'#7b61ff',animation:'blink 1.5s step-end infinite',boxShadow:'0 0 6px #7b61ff'}}/><span style={{fontFamily:MF,fontSize:9,color:'#7b61ff'}}>◈ SCREEN WATCH ACTIVE — Capturing screen every 2s</span></div>)}
        {isRecording&&monitoring&&(<div style={{padding:'8px 12px',marginBottom:12,border:'1px solid rgba(255,45,85,.3)',background:'rgba(255,45,85,.06)',display:'flex',alignItems:'center',gap:8}}><div style={{width:6,height:6,borderRadius:'50%',background:'#ff2d55',animation:'blink .8s step-end infinite',boxShadow:'0 0 8px #ff2d55'}}/><span style={{fontFamily:MF,fontSize:9,color:'#ff2d55'}}>● RECORDING — Session audio captured for forensic export</span></div>)}

        {interventionHistory.length>0&&monitoring&&(
          <div style={{padding:'8px 12px',marginBottom:12,border:'2px solid #ff2d55',background:'rgba(255,45,85,.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:16}}>🛑</span>
              <span style={{fontFamily:PF,fontSize:7,color:'#ff2d55',letterSpacing:1}}>INTERVENTIONS FIRED: {interventionHistory.length}</span>
            </div>
            <div style={{display:'flex',gap:4}}>
              {interventionHistory.map((e,i)=>(
                <div key={i} style={{width:10,height:10,background:e.level==='LOCKDOWN'?'#ff2d55':e.level==='BLOCK'?'#ff9500':'#ffd60a',boxShadow:`0 0 6px ${e.level==='LOCKDOWN'?'#ff2d55':e.level==='BLOCK'?'#ff9500':'#ffd60a'}`,border:'1px solid rgba(0,0,0,.3)'}} title={`${e.level} — ${e.pattern}`}/>
              ))}
            </div>
          </div>
        )}

        <div style={{background:'rgba(0,0,0,.5)',padding:'10px 14px',marginBottom:16,border:`1px solid ${tColor}18`,position:'relative',transition:'border-color .5s'}}><div style={{fontFamily:MF,fontSize:9,color:`${tColor}60`,marginBottom:8,letterSpacing:2}}>{voiceDemo?(GEMINI_API_KEY?'VOICE DEMO ── GEMINI TTS ── REAL-TIME DETECTION':'VOICE DEMO ── BROWSER TTS ── REAL-TIME DETECTION'):'AUDIO STREAM ── GEMINI LIVE API ── RUST WASM ENGINE'}</div><WaveformVisualizer active={monitoring} threatLevel={threatLevel} audioLevel={speaking?.7:audioLevel}/>{speaking&&!voiceMuted&&<div style={{position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff2d55',textShadow:'0 0 8px #ff2d55',animation:'blink .6s step-end infinite'}}>🔊 VOICE</div>}{voiceMuted&&<div style={{position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff9500',opacity:.6}}>🔇 MUTED</div>}</div>
        {voiceDemo&&!voiceMuted&&(<div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12,padding:'8px 12px',background:'rgba(0,0,0,.3)',border:'1px solid rgba(0,212,255,.08)'}}><span style={{fontFamily:PF,fontSize:6,color:'rgba(0,212,255,.6)',letterSpacing:1,flexShrink:0}}>VOL</span><div style={{flex:1,position:'relative',height:20,display:'flex',alignItems:'center'}}><div style={{position:'absolute',left:0,right:0,height:6,background:'rgba(0,212,255,.08)',border:'1px solid rgba(0,212,255,.12)'}}><div style={{height:'100%',width:`${volume*100}%`,background:'linear-gradient(90deg,#00d4ff55,#00d4ff)',boxShadow:'0 0 8px #00d4ff44',transition:'width .1s'}}/></div><input type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>handleVolume(parseFloat(e.target.value))} style={{position:'absolute',left:0,right:0,height:20,opacity:0,cursor:'pointer',zIndex:2}}/><div style={{position:'absolute',left:`calc(${volume*100}% - 6px)`,width:12,height:12,background:'#00d4ff',boxShadow:'0 0 8px #00d4ff',pointerEvents:'none',zIndex:1,transition:'left .1s'}}/></div><span style={{fontFamily:PF,fontSize:8,color:'#00d4ff',width:36,textAlign:'right',textShadow:'0 0 6px #00d4ff'}}>{Math.round(volume*100)}%</span></div>)}
        {voiceDemo&&<LiveTranscript lines={transcriptLines} speaking={speaking&&!voiceMuted}/>}
        {voiceDemo&&<AnalysisProgressBar progress={demoProgress} threatColor={tColor}/>}
        <div className="vg-monitor-stats" style={{display:'flex',gap:8,flexWrap:'wrap'}}><StatCard label="THREATS" value={alerts.length} color="#ff2d55" icon="⚠"/><StatCard label="PATTERNS" value="50+" color="#00d4ff" icon="◎"/><StatCard label="LATENCY" value="<80ms" color="#30d158" icon="⚡"/><StatCard label="CONFIDENCE" value={avgConf?`${avgConf}%`:'—'} color="#7b61ff" icon="◆"/></div>
      </PBox>
      <PBox color="rgba(255,214,10,.2)" style={{padding:16,background:'rgba(255,214,10,.01)'}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><div style={{width:6,height:6,background:'#ffd60a',animation:'blink 1s step-end infinite'}}/><span style={{fontFamily:PF,fontSize:7,color:'#ffd60a',letterSpacing:1}}>VOICE DEMO SCRIPTS</span><span style={{fontFamily:MF,fontSize:9,color:'rgba(255,214,10,.45)'}}>— {language.toUpperCase()}</span></div><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,214,10,.35)',marginBottom:12,paddingLeft:14}}>🔊 2-way dialog (ME + CALLER) · Auto-stop · Use 🔇 MUTE for text-only mode</div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{availableScripts.map(s=>{const isActive=script?.id===s.id;return(<button key={s.id} onClick={()=>setScript(isActive?null:s)} className="vg-demo-script-btn" style={{fontFamily:MF,fontSize:10,padding:'7px 14px',cursor:'pointer',border:`1px solid ${isActive?'#ffd60a':'rgba(255,214,10,.22)'}`,background:isActive?'rgba(255,214,10,.12)':'transparent',color:isActive?'#ffd60a':'rgba(255,214,10,.52)',transition:'all .15s',display:'flex',alignItems:'center',gap:6}}>{s.label}{isActive&&<span style={{fontSize:8}}>✓</span>}</button>)})}</div></PBox>
      <PBox color={alerts.length>0?'#ff2d55':'rgba(0,212,255,.15)'} style={{padding:20,background:'rgba(0,0,0,.2)',flex:1}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:8}}><div><div style={{fontFamily:PF,fontSize:9,color:'#00d4ff'}}>REAL-TIME ALERTS</div><div style={{fontFamily:MF,fontSize:9,color:'rgba(0,212,255,.55)',marginTop:5}}>{now}</div></div>{alerts.length>0&&<div style={{fontFamily:PF,fontSize:7,padding:'5px 12px',border:'2px solid #ff2d55',color:'#ff2d55',background:'rgba(255,45,85,.08)',animation:'ppulse 1.5s infinite',flexShrink:0}}>{alerts.length} DETECTED</div>}</div>{alerts.length===0?(<div style={{textAlign:'center',padding:'52px 0'}}><div style={{fontSize:38,marginBottom:14,color:'rgba(0,212,255,.15)'}}>🛡</div><div style={{fontFamily:PF,fontSize:7,color:'rgba(255,255,255,.2)',lineHeight:2.5}}>{monitoring?'LISTENING...\nANALYZING':'SELECT DEMO\nTHEN START'}</div></div>):(<div style={{maxHeight:380,overflowY:'auto',paddingRight:4}}>{alerts.map((a,i)=><AlertCard key={a.id} alert={a} index={i}/>)}</div>)}</PBox>
    </div>

    <div className="vg-monitor-sidebar" style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="vg-monitor-sidebar-inner" style={{display:'flex',flexDirection:'column',gap:16}}>
        <PBox color="#7b61ff" style={{padding:20,background:'rgba(0,0,0,.2)'}}><div style={{fontFamily:PF,fontSize:8,color:'#7b61ff',marginBottom:16,textShadow:'0 0 10px #7b61ff'}}>THREAT SCORE</div><ThreatMeter score={threatScore}/></PBox>
        <PBox color="#00d4ff" style={{padding:16,background:'rgba(0,0,0,.1)'}}><div style={{fontFamily:PF,fontSize:7,color:'rgba(0,212,255,.55)',marginBottom:12,letterSpacing:1}}>TECH STACK</div>{TECH_ITEMS.map(item=><TechChip key={item.name} item={item}/>)}</PBox>
      </div>
    </div>
  </div>)
}
