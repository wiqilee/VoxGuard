import { useState, useEffect, useRef, useCallback } from 'react'
import { PBox, PBtn, StatCard } from '../components/Primitives'
import { WaveformVisualizer } from '../components/WaveformVisualizer'
import { PixelAvatar } from '../components/PixelAvatar'
import { ThreatMeter } from '../components/ThreatMeter'
import { AlertCard } from '../components/AlertCard'
import { InterventionOverlay } from '../components/InterventionOverlay'
import { PF, MF, getInterventionLevel, isInstantInterventionPattern, getCallerNumber } from '../utils/constants'
import { MonitorPixels } from '../components/PixelParticles'

/* ══════════════════════════════════════════════════════════
   [FIX #3] Gemini TTS — Natural voice for demo mode
══════════════════════════════════════════════════════════ */
const GEMINI_TTS_MODEL = import.meta.env.VITE_GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const GEMINI_CALLER_VOICE = {
  en: 'Puck', id: 'Puck', zh: 'Puck', ja: 'Puck', ko: 'Puck',
  es: 'Puck', fr: 'Puck', hi: 'Puck', ar: 'Puck',
  ms: 'Puck', tl: 'Puck', th: 'Puck', vi: 'Puck', de: 'Puck',
  it: 'Puck', nl: 'Puck', tr: 'Puck', pl: 'Puck', ru: 'Puck',
  pt: 'Puck', 'pt-BR': 'Puck',
}
const GEMINI_ME_VOICE = {
  en: 'Kore', id: 'Kore', zh: 'Kore', ja: 'Kore', ko: 'Kore',
  es: 'Kore', fr: 'Kore', hi: 'Kore', ar: 'Kore',
  ms: 'Kore', tl: 'Kore', th: 'Kore', vi: 'Kore', de: 'Kore',
  it: 'Kore', nl: 'Kore', tr: 'Kore', pl: 'Kore', ru: 'Kore',
  pt: 'Kore', 'pt-BR': 'Kore',
}

const _ttsCache = new Map()

async function generateGeminiTTS(text, lang = 'en', speaker = 'caller') {
  if (!GEMINI_API_KEY) return null
  const cacheKey = `${lang}:${speaker}:${text}`
  if (_ttsCache.has(cacheKey)) return _ttsCache.get(cacheKey)
  try {
    const voiceMap = speaker === 'me' ? GEMINI_ME_VOICE : GEMINI_CALLER_VOICE
    const voice = voiceMap[lang?.split('-')[0]] || 'Charon'
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            response_modalities: ['AUDIO'],
            speech_config: { voice_config: { prebuilt_voice_config: { voice_name: voice } } }
          }
        })
      }
    )
    if (!resp.ok) return null
    const data = await resp.json()
    const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('audio/'))
    if (!audioPart?.inlineData?.data) return null
    const audioBytes = atob(audioPart.inlineData.data)
    const arr = new Uint8Array(audioBytes.length)
    for (let i = 0; i < audioBytes.length; i++) arr[i] = audioBytes.charCodeAt(i)
    const blob = new Blob([arr], { type: audioPart.inlineData.mimeType || 'audio/wav' })
    if (_ttsCache.size > 50) _ttsCache.clear()
    _ttsCache.set(cacheKey, blob)
    return blob
  } catch (err) { return null }
}

/* ── Browser voice selection ── */
const VOICE_PREFS={en:{langPrefix:['en-US','en-GB','en']},id:{langPrefix:['id-ID','id']},zh:{langPrefix:['zh-CN','zh-TW','zh']},ja:{langPrefix:['ja-JP','ja']},ko:{langPrefix:['ko-KR','ko']},es:{langPrefix:['es-ES','es-MX','es']},fr:{langPrefix:['fr-FR','fr']},de:{langPrefix:['de-DE','de']},hi:{langPrefix:['hi-IN','hi']},ar:{langPrefix:['ar-SA','ar-EG','ar']},pt:{langPrefix:['pt-BR','pt-PT','pt']},ru:{langPrefix:['ru-RU','ru']},th:{langPrefix:['th-TH','th']},vi:{langPrefix:['vi-VN','vi']},ms:{langPrefix:['ms-MY','ms']},tr:{langPrefix:['tr-TR','tr']},it:{langPrefix:['it-IT','it']},nl:{langPrefix:['nl-NL','nl']},pl:{langPrefix:['pl-PL','pl']},sv:{langPrefix:['sv-SE','sv']}}
const QUALITY_KEYWORDS = ['google', 'natural', 'premium', 'enhanced', 'neural', 'wavenet']
const ANTI_KEYWORDS = ['compact', 'espeak', 'mbrola']
const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '')
const IS_IOS = /iPhone|iPad|iPod/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '')

function getVoiceForLang(lang) {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const prefs = VOICE_PREFS[lang] || VOICE_PREFS['en']
  let candidates = []
  for (const prefix of prefs.langPrefix) {
    const matches = voices.filter(v => v.lang.startsWith(prefix))
    candidates.push(...matches)
  }
  if (candidates.length === 0) candidates = voices.filter(v => v.lang.startsWith('en'))
  if (candidates.length === 0) return voices[0] || null
  let filtered = candidates.filter(v => !ANTI_KEYWORDS.some(k => v.name.toLowerCase().includes(k)))
  if (filtered.length === 0) filtered = candidates
  const premium = filtered.filter(v => QUALITY_KEYWORDS.some(k => v.name.toLowerCase().includes(k)))
  if (premium.length > 0) return premium[0]
  if (IS_MOBILE) {
    const remote = filtered.filter(v => !v.localService)
    if (remote.length > 0) return remote[0]
    if (IS_IOS) { const appleHQ = filtered.filter(v => /samantha|karen|daniel|moira|tessa/i.test(v.name)); if (appleHQ.length > 0) return appleHQ[0] }
  }
  const remote = filtered.filter(v => !v.localService)
  if (remote.length > 0) return remote[0]
  return filtered[0]
}

let _activeGeminiAudio = null

/* ════════════════════════════════════════════════════
   CALLER VISUAL + IDLE SCREEN
════════════════════════════════════════════════════ */
const cvCSS=`@keyframes cv-rZ{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes cv-rR{0%{transform:rotate(360deg)}100%{transform:rotate(0deg)}}@keyframes cv-fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes cv-pu{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.7;transform:scale(1.06)}}@keyframes cv-sc{0%{top:0}100%{top:100%}}@keyframes cv-sh{0%{left:-20%}100%{left:120%}}@keyframes cv-fi{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}@keyframes cv-rp{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.4;transform:scale(1.06)}}@keyframes cv-o1{0%{transform:rotate(0deg) translateX(62px) rotate(0deg)}100%{transform:rotate(360deg) translateX(62px) rotate(-360deg)}}@keyframes cv-o2{0%{transform:rotate(120deg) translateX(70px) rotate(-120deg)}100%{transform:rotate(480deg) translateX(70px) rotate(-480deg)}}@keyframes cv-o3{0%{transform:rotate(240deg) translateX(56px) rotate(-240deg)}100%{transform:rotate(600deg) translateX(56px) rotate(-600deg)}}@keyframes cv-rb{0%,100%{opacity:1}50%{opacity:.3}}@keyframes cv-hs{0%{transform:rotate(0deg)}100%{transform:rotate(60deg)}}@keyframes cv-ds{0%{background-position:0 0}100%{background-position:0 200px}}@keyframes cv-ch{0%{text-shadow:2px 0 #ff2d5555,-2px 0 #00d4ff55}50%{text-shadow:-1px 0 #ff2d5555,1px 0 #00d4ff55}100%{text-shadow:2px 0 #ff2d5555,-2px 0 #00d4ff55}}@keyframes cv-sw-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}@keyframes cv-sw-pulse{0%,100%{box-shadow:inset 0 0 30px rgba(123,97,255,0.08)}50%{box-shadow:inset 0 0 60px rgba(123,97,255,0.18),0 0 20px rgba(123,97,255,0.1)}}@keyframes cv-sw-grid{0%{opacity:.06}50%{opacity:.12}100%{opacity:.06}}@keyframes cv-crt-line{0%{top:-2px}100%{top:100%}}@keyframes rec-pulse{0%,100%{box-shadow:0 0 8px #ff2d55,0 0 16px rgba(255,45,85,0.3)}50%{box-shadow:0 0 14px #ff2d55,0 0 28px rgba(255,45,85,0.5),0 0 40px rgba(255,45,85,0.15)}}@keyframes rec-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}`

function CallerVisual({mode='phone',active,screenWatchOn,isRecording,callerNumber}){
  const[tick,setTick]=useState(0)
  useEffect(()=>{if(!active)return;const t=setInterval(()=>setTick(v=>v+1),80);return()=>clearInterval(t)},[active])
  if(!active) return null
  const aC='#00d4ff',aV='#2d8cff',ac=mode==='phone'?aC:aV
  const borderColor=screenWatchOn?'#7b61ff':ac+'22'
  return(
    <div style={{position:'relative',width:'100%',height:200,marginBottom:14,overflow:'hidden',border:`1px solid ${borderColor}`,background:'linear-gradient(180deg,rgba(0,0,0,.95),rgba(4,8,20,.98),rgba(0,0,0,.95))',transition:'border-color 0.4s ease',animation:screenWatchOn?'cv-sw-pulse 3s ease-in-out infinite':'none'}}>
      <style>{cvCSS}</style>
      <div style={{position:'absolute',inset:0,opacity:.035,backgroundImage:'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'relative',animation:'cv-fl 3.5s ease-in-out infinite',zIndex:2}}>
          <PixelAvatar speaking={!!tick&&tick%3!==0} threatLevel={ac==='#ff2d55'?'critical':ac==='#ff9500'?'high':'safe'} mode={mode} />
        </div>
        <div style={{position:'absolute',top:14,left:18,animation:'cv-fi .5s ease'}}><div style={{fontFamily:PF,fontSize:6,color:ac,letterSpacing:1,padding:'5px 12px',border:`1px solid ${ac}44`,background:`${ac}0c`,display:'flex',alignItems:'center',gap:6,backdropFilter:'blur(4px)'}}><span style={{fontSize:11}}>{mode==='phone'?'📞':'🖥'}</span>{mode==='phone'?'CALL':'VIDEO'}<span style={{width:5,height:5,borderRadius:'50%',background:ac,animation:'blink 1.2s step-end infinite',boxShadow:`0 0 6px ${ac}`}}/></div></div>
        {/* [NEW] Caller phone number display */}
        {callerNumber&&<div style={{position:'absolute',bottom:14,left:18,zIndex:10,animation:'cv-fi .5s ease'}}><div style={{fontFamily:MF,fontSize:11,color:ac,letterSpacing:0.5,padding:'4px 10px',border:`1px solid ${ac}33`,background:`${ac}08`,backdropFilter:'blur(4px)',display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:10}}>📱</span><span>{callerNumber}</span></div></div>}
      </div>
      {isRecording&&<div style={{position:'absolute',top:14,right:18,zIndex:10,display:'flex',alignItems:'center',gap:6,padding:'4px 10px',border:'1px solid #ff2d5555',background:'rgba(255,45,85,0.12)',animation:'cv-fi .3s ease',backdropFilter:'blur(4px)'}}><div style={{width:8,height:8,borderRadius:'50%',background:'#ff2d55',animation:'cv-rb 1s ease-in-out infinite',boxShadow:'0 0 8px #ff2d55'}}/><span style={{fontFamily:PF,fontSize:6,color:'#ff2d55',letterSpacing:1}}>REC</span></div>}
      {screenWatchOn&&<div style={{position:'absolute',bottom:14,right:18,zIndex:10,fontFamily:'monospace',fontSize:6,color:'#7b61ff',letterSpacing:1,opacity:.7}}>◈ SCREEN WATCH</div>}
      {[{pos:{top:0,left:0},d:'M2,18 L2,2 L18,2'},{pos:{top:0,right:0},d:'M2,2 L18,2 M18,2 L18,18'},{pos:{bottom:0,left:0},d:'M2,2 L2,18 M2,18 L18,18'},{pos:{bottom:0,right:0},d:'M18,2 L18,18 M18,18 L2,18'}].map((c,i)=>(<svg key={i} style={{position:'absolute',...c.pos,width:20,height:20,pointerEvents:'none',zIndex:3}} viewBox="0 0 20 20"><path d={c.d} stroke={ac} strokeWidth="1.2" fill="none" opacity=".45"/></svg>))}
    </div>
  )
}

const idleCSS=`@keyframes idle-scan{0%{top:-2px}100%{top:100%}}@keyframes idle-blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes idle-cursor{0%,100%{opacity:1}50%{opacity:0}}@keyframes idle-drift{0%{transform:translateY(0)}50%{transform:translateY(-4px)}100%{transform:translateY(0)}}@keyframes idle-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes idle-pulse-ring{0%,100%{opacity:0.08;transform:scale(1)}50%{opacity:0.2;transform:scale(1.05)}}@keyframes idle-grid{0%{opacity:0.03}50%{opacity:0.06}100%{opacity:0.03}}@keyframes idle-text-cycle{0%{color:#00d4ff}25%{color:#7b61ff}50%{color:#30d158}75%{color:#ff9500}100%{color:#00d4ff}}@keyframes idle-shield-glow{0%,100%{filter:drop-shadow(0 0 6px #00d4ff44)}50%{filter:drop-shadow(0 0 14px #00d4ff88) drop-shadow(0 0 28px #7b61ff44)}}`

function IdleScreen(){
  const[tick,setTick]=useState(0)
  useEffect(()=>{const t=setInterval(()=>setTick(v=>v+1),1200);return()=>clearInterval(t)},[])
  const msgs=['AWAITING SIGNAL','SYSTEMS NOMINAL','STANDING BY','READY TO PROTECT','ALL CHANNELS CLEAR']
  return(
    <div style={{position:'relative',width:'100%',height:200,marginBottom:14,overflow:'hidden',border:'1px solid rgba(0,212,255,0.12)',background:'linear-gradient(180deg,rgba(0,0,0,0.95),rgba(2,4,8,0.98),rgba(0,0,0,0.95))'}}>
      <style>{idleCSS}</style>
      <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)',backgroundSize:'20px 20px',animation:'idle-grid 3s ease-in-out infinite',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',animation:'idle-drift 4s ease-in-out infinite',zIndex:2}}>
        <span style={{fontSize:32,filter:'drop-shadow(0 0 12px #00d4ff44)'}}>🛡</span>
      </div>
      <div style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:2}}>
        <div style={{fontFamily:PF,fontSize:6,letterSpacing:3,animation:'idle-text-cycle 8s ease infinite',whiteSpace:'nowrap'}}>■ {msgs[tick%msgs.length]}<span style={{animation:'idle-cursor 0.8s step-end infinite'}}>_</span></div>
      </div>
      <div style={{position:'absolute',top:10,left:14,fontFamily:PF,fontSize:5,color:'rgba(0,212,255,0.25)',letterSpacing:2}}>VOXGUARD v1.0.0</div>
      <div style={{position:'absolute',top:10,right:14,display:'flex',alignItems:'center',gap:6}}>
        <div style={{width:5,height:5,background:'#30d158',opacity:0.5,animation:'idle-blink 2s ease-in-out infinite',boxShadow:'0 0 4px #30d158'}}/>
        <span style={{fontFamily:MF,fontSize:8,color:'rgba(48,209,88,0.4)'}}>SYSTEMS OK</span>
      </div>
    </div>
  )
}

function AnalysisProgressBar({progress,threatColor}){const c=progress>=100;return(<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontFamily:PF,fontSize:6,color:'rgba(0,212,255,.5)',letterSpacing:1}}>ANALYSIS PROGRESS</span><span style={{fontFamily:MF,fontSize:9,color:c?'#30d158':'#00d4ff'}}>{c?'✓ COMPLETE':progress+'%'}</span></div><div style={{height:6,background:'rgba(0,212,255,.08)',overflow:'hidden',position:'relative',border:'1px solid rgba(0,212,255,.1)'}}><div style={{height:'100%',width:`${progress}%`,background:c?'linear-gradient(90deg,#30d158,#4aeaff,#30d158)':`linear-gradient(90deg,#00d4ff,${threatColor},#7b61ff,#00d4ff)`,backgroundSize:'200% 100%',animation:c?'none':'progressShimmer 2s linear infinite',boxShadow:`0 0 12px ${c?'#30d158':'#00d4ff'}66`,transition:'width .5s ease'}}/></div></div>)}

/* ══════════════════════════════════════════════════════════
   [FIX] DEMO SCRIPTS — ALL LANGUAGES WITH EXPANDED SCRIPTS
   ────────────────────────────────────────────────────────
   EN: 9 scripts (bank, tech, gov, romance, crypto, family, ai_voice, digital_arrest, job_scam)
   ID: 8 scripts (bank, pinjol, mama, giveaway, romance, crypto, family, job)
   + All other languages keep their 3 scripts
   
   [FIX] Indonesian bank: removed duplicate text
   [FIX] Realistic threat scores - high severity scripts trigger high scores
══════════════════════════════════════════════════════════ */

// ── ENGLISH (6 scripts) ──
const SCRIPTS_EN=[
  {id:'bank',label:'🏦 Bank Fraud',category:'critical',sentences:[
    {text:"Hello, this is the fraud prevention department from your bank. Am I speaking with the account holder?",delay:0,speaker:'caller'},
    {text:"Yes, this is me. What's going on?",delay:4000,speaker:'me'},
    {text:"We have detected a suspicious transaction on your checking account. Someone attempted to transfer three thousand dollars to an overseas account about twenty minutes ago.",delay:7000,speaker:'caller'},
    {text:"Oh no, that wasn't me! What can I do?",delay:14000,speaker:'me'},
    {text:"Don't worry, we are here to help. We have temporarily flagged the transaction, but we need to verify your identity before we can secure your account.",delay:17000,speaker:'caller'},
    {text:"Your account will be permanently frozen within the next ten minutes unless we complete verification immediately.",delay:24000,speaker:'caller',alert:{id:'b1',severity:'high',pattern:'Artificial Urgency',quote:'"Account frozen in 10 minutes unless we verify immediately."',confidence:93,tactics:['SCARCITY','FEAR'],source:'FTC Sentinel',time:'00:24'}},
    {text:"Okay, what do you need from me?",delay:31000,speaker:'me'},
    {text:"I need you to confirm your full account number and the one time passcode we just sent to your phone. This is standard security procedure.",delay:33500,speaker:'caller',alert:{id:'b2',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"Confirm your account number and the one-time passcode."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FBI IC3 2024',time:'00:33'}},
    {text:"Also, please do not contact your branch directly. This is a confidential internal investigation and any outside contact could compromise the process.",delay:41000,speaker:'caller',alert:{id:'b3',severity:'high',pattern:'Isolation Tactic',quote:'"Do not contact your branch. Confidential investigation."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:41'}},
  ]},
  {id:'tech',label:'💻 Tech Support',category:'high',sentences:[
    {text:"Hello, this is the security center calling about your computer. We detected a critical alert on your device.",delay:0,speaker:'caller'},
    {text:"Wait, how do you know about my computer? Who is this?",delay:5000,speaker:'me'},
    {text:"Ma'am, our monitoring systems detected that your device has been infected with a critical Trojan virus. This is affecting your network right now.",delay:8000,speaker:'caller',alert:{id:'t1',severity:'high',pattern:'Tech Support Impersonation',quote:'"Security Center — device infected with a Trojan."',confidence:93,tactics:['AUTHORITY','FEAR'],source:'FBI IC3 2024',time:'00:08'}},
    {text:"That sounds scary. What should I do?",delay:15000,speaker:'me'},
    {text:"You must install our certified remote access tool immediately so our engineers can remove the malware before it spreads.",delay:18000,speaker:'caller',alert:{id:'t2',severity:'critical',pattern:'Remote Access Takeover',quote:'"Install remote access tool immediately."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'FTC Sentinel',time:'00:18'}},
    {text:"If you do not act within thirty minutes, your credit card information stored on this device will be compromised permanently.",delay:26000,speaker:'caller',alert:{id:'t3',severity:'critical',pattern:'Artificial Urgency',quote:'"Within 30 minutes your credit card will be compromised."',confidence:95,tactics:['SCARCITY','FEAR'],source:'FBI IC3 2024',time:'00:26'}},
  ]},
  {id:'gov',label:'🏛 Government / Tax',category:'critical',sentences:[
    {text:"This is Officer Johnson from the tax enforcement division, badge number 4-7-2-9. I'm calling regarding an urgent matter.",delay:0,speaker:'caller'},
    {text:"What is this about? I don't owe any taxes.",delay:5500,speaker:'me'},
    {text:"Our records indicate there is an outstanding balance of twelve thousand dollars linked to your social security number. A warrant has been issued for your arrest.",delay:8000,speaker:'caller',alert:{id:'g1',severity:'critical',pattern:'Government Impersonation',quote:'"Officer from tax enforcement. Warrant for arrest."',confidence:96,tactics:['AUTHORITY','FEAR'],source:'FBI IC3 2024',time:'00:08'}},
    {text:"A warrant?! That can't be right!",delay:15000,speaker:'me'},
    {text:"If you do not settle this balance right now, officers will be dispatched to your home within the hour. You can resolve this immediately to avoid arrest.",delay:17500,speaker:'caller',alert:{id:'g2',severity:'critical',pattern:'Artificial Urgency',quote:'"Settle this balance right now or face arrest."',confidence:95,tactics:['AUTHORITY','FEAR'],source:'FTC Sentinel',time:'00:17'}},
    {text:"How do I settle it?",delay:24000,speaker:'me'},
    {text:"Purchase prepaid debit cards totaling twelve thousand dollars from any nearby store and read me the card numbers. This is the fastest authorized payment method.",delay:26500,speaker:'caller',alert:{id:'g3',severity:'critical',pattern:'Gift Card Demand',quote:'"Purchase prepaid debit cards and read me the numbers."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FTC Sentinel',time:'00:26'}},
  ]},
  // [NEW] Romance / Sextortion
  {id:'romance',label:'💔 Romance Scam',category:'critical',sentences:[
    {text:"Hey, it's me. We need to talk about something important. I know this is awkward.",delay:0,speaker:'caller'},
    {text:"What do you mean? Who is this?",delay:4000,speaker:'me'},
    {text:"Don't pretend you don't know me. We've been chatting for months. I have all of our conversations saved — including the private photos and videos you sent me.",delay:7000,speaker:'caller'},
    {text:"What photos? What are you talking about?",delay:14000,speaker:'me'},
    {text:"The intimate content you shared with me. I have screenshots of everything — your face is clearly visible in all of them.",delay:17000,speaker:'caller',alert:{id:'r1',severity:'critical',pattern:'Extortion / Blackmail',quote:'"Intimate content, your face is clearly visible."',confidence:94,tactics:['FEAR','ISOLATION'],source:'FBI IC3 2024',time:'00:17'}},
    {text:"This has to be some kind of mistake...",delay:24000,speaker:'me'},
    {text:"If you don't send me two thousand dollars in Bitcoin within the next hour, I will share all of these photos with your entire contact list — friends, family, coworkers, everyone.",delay:27000,speaker:'caller',alert:{id:'r2',severity:'critical',pattern:'Romance Scam / Sextortion',quote:'"Send $2,000 Bitcoin or photos shared with everyone."',confidence:98,tactics:['FEAR','ISOLATION'],source:'FBI IC3 2024',time:'00:27'}},
    {text:"I already have your social media contacts downloaded. Send the Bitcoin to this wallet address now.",delay:35000,speaker:'caller',alert:{id:'r3',severity:'critical',pattern:'Crypto Transfer Scam',quote:'"Send Bitcoin to this wallet address now."',confidence:97,tactics:['FEAR','COMMITMENT'],source:'FTC Sentinel',time:'00:35'}},
  ]},
  // [NEW] Crypto Investment
  {id:'crypto',label:'💰 Crypto Scam',category:'critical',sentences:[
    {text:"Hi there! I got your number from a mutual friend. I've been helping people earn passive income through a crypto investment group.",delay:0,speaker:'caller'},
    {text:"Oh really? I've heard about crypto but I don't know much about it.",delay:5000,speaker:'me'},
    {text:"You don't need to know anything — our platform does everything automatically. Members are making three hundred percent returns in just thirty days. Zero risk.",delay:8000,speaker:'caller',alert:{id:'c1',severity:'high',pattern:'Investment Fraud',quote:'"300% returns in 30 days, zero risk."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'FBI IC3 2024',time:'00:08'}},
    {text:"Three hundred percent? That sounds too good to be true.",delay:15000,speaker:'me'},
    {text:"I know it sounds unbelievable, but this is powered by a proprietary AI trading algorithm. There are only five spots left in this round — once they're full, registration closes.",delay:18000,speaker:'caller',alert:{id:'c2',severity:'critical',pattern:'Investment Fraud',quote:'"Only 5 spots left, registration closes."',confidence:96,tactics:['SCARCITY','COMMITMENT'],source:'GASA 2024',time:'00:18'}},
    {text:"How much would I need to start?",delay:25000,speaker:'me'},
    {text:"Just five hundred dollars in USDT. I'll send you the wallet address right now. You need to transfer within the next thirty minutes before the round closes.",delay:28000,speaker:'caller',alert:{id:'c3',severity:'critical',pattern:'Crypto Transfer Scam',quote:'"Transfer $500 USDT to this wallet address."',confidence:98,tactics:['SCARCITY','COMMITMENT'],source:'FTC Sentinel',time:'00:28'}},
  ]},
  // [NEW] Family Emergency
  {id:'family',label:'👨‍👩‍👧 Family Emergency',category:'high',sentences:[
    {text:"Mom? Mom, is that you? Please, I need help.",delay:0,speaker:'caller'},
    {text:"Who is this? What happened?",delay:4000,speaker:'me'},
    {text:"It's me, your son! I was in a car accident and I'm at the hospital right now. They won't treat me until I pay the medical deposit.",delay:7000,speaker:'caller',alert:{id:'f1',severity:'high',pattern:'Family Impersonation',quote:'"Your son in car accident, hospital deposit needed."',confidence:89,tactics:['FEAR','RECIPROCITY'],source:'FTC Sentinel',time:'00:07'}},
    {text:"Oh my God! Are you okay? Which hospital?",delay:14000,speaker:'me'},
    {text:"I'm okay but I'm in a lot of pain. Please don't call Dad — he'll be so upset. The doctor says I need five thousand dollars for the deposit. Can you wire transfer it right now?",delay:17000,speaker:'caller',alert:{id:'f2',severity:'high',pattern:'Isolation Tactic',quote:'"Don\'t call Dad. Wire $5,000 now."',confidence:91,tactics:['ISOLATION','FEAR'],source:'GASA 2024',time:'00:17'}},
    {text:"Five thousand? Let me think about this...",delay:25000,speaker:'me'},
    {text:"Mom please, there's no time! The doctor says if I don't get surgery within the hour, my condition could get much worse. Transfer the money right now. Don't tell anyone!",delay:28000,speaker:'caller',alert:{id:'f3',severity:'critical',pattern:'Artificial Urgency',quote:'"Surgery within the hour or condition worsens."',confidence:95,tactics:['FEAR','SCARCITY'],source:'FBI IC3 2024',time:'00:28'}},
  ]},
  // [NEW] AI Voice Clone
  {id:'ai_voice',label:'🤖 AI Voice Clone',category:'critical',sentences:[
    {text:"Mom? Mom, it is me. Please, I am in serious trouble.",delay:0,speaker:'caller'},
    {text:"Honey? Is that you? You sound different.",delay:4000,speaker:'me'},
    {text:"I have a bad cold, that is why. Listen, I was in a car accident and the police say I was at fault. I need to post bail immediately or they will take me to jail.",delay:7000,speaker:'caller',alert:{id:'av1',severity:'high',pattern:'Family Impersonation',quote:'"Car accident, need bail immediately."',confidence:91,tactics:['FEAR','RECIPROCITY'],source:'FBI IC3 2024',time:'00:07'}},
    {text:"Oh my God! Are you hurt?",delay:15000,speaker:'me'},
    {text:"I am okay but terrified. My lawyer says I need eight thousand dollars for bail. Wire it right now. Do not call Dad or my regular number, the police took my phone.",delay:18000,speaker:'caller',alert:{id:'av2',severity:'critical',pattern:'Wire Transfer Instruction',quote:'"Wire $8,000. Do not call my number."',confidence:96,tactics:['FEAR','ISOLATION'],source:'FBI IC3 2024',time:'00:18'}},
    {text:"That is a lot of money...",delay:26000,speaker:'me'},
    {text:"Mom they are about to take me away! The wire transfer has to go through in twenty minutes or I spend the night in a cell. Please!",delay:29000,speaker:'caller',alert:{id:'av3',severity:'critical',pattern:'Artificial Urgency',quote:'"20 minutes or jail."',confidence:95,tactics:['SCARCITY','FEAR'],source:'FBI IC3 2024',time:'00:29'}},
  ]},
  // [NEW] Digital Arrest
  {id:'digital_arrest',label:'🚔 Digital Arrest',category:'critical',sentences:[
    {text:"This is Officer Williams from the Federal Cyber Crime Division. Your identity has been linked to a money laundering operation.",delay:0,speaker:'caller'},
    {text:"What? I have not done anything illegal!",delay:5000,speaker:'me'},
    {text:"We have evidence your Social Security number was used to open fraudulent bank accounts. Fourteen complaints have been filed.",delay:8000,speaker:'caller',alert:{id:'da1',severity:'critical',pattern:'Government Impersonation',quote:'"Federal Cyber Crime Division, money laundering."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'FBI IC3 2024',time:'00:08'}},
    {text:"This must be a mistake.",delay:15000,speaker:'me'},
    {text:"Switch to video call now to verify your identity. You must stay on this call. If you disconnect, a warrant will be issued for your arrest within the hour.",delay:18000,speaker:'caller',alert:{id:'da2',severity:'critical',pattern:'Digital Arrest (IN/SEA)',quote:'"Stay on call or warrant issued."',confidence:96,tactics:['AUTHORITY','ISOLATION'],source:'GASA 2024',time:'00:18'}},
    {text:"Stay on video call? For how long?",delay:26000,speaker:'me'},
    {text:"Until we clear your name. Give me your Social Security number and bank details now. Transfer your funds to a government holding account. Do not contact anyone. This is classified.",delay:29000,speaker:'caller',alert:{id:'da3',severity:'critical',pattern:'Safe Account Transfer',quote:'"Transfer to government account. Classified."',confidence:99,tactics:['AUTHORITY','COMMITMENT','ISOLATION'],source:'FBI IC3 2024',time:'00:29'}},
  ]},
  // [NEW] Job Offer Scam
  {id:'job_scam',label:'💼 Job Offer Scam',category:'high',sentences:[
    {text:"Hi there! I am from the HR department of a Fortune 500 company. We reviewed your resume and would like to offer you a remote position.",delay:0,speaker:'caller'},
    {text:"Really? Which company?",delay:5000,speaker:'me'},
    {text:"I cannot disclose the name yet, but it pays five thousand dollars per month for data entry. Fully remote, no experience required.",delay:8000,speaker:'caller',alert:{id:'js1',severity:'high',pattern:'Employment / Job Offer Scam',quote:'"$5,000/month data entry, no experience."',confidence:92,tactics:['GREED','AUTHORITY'],source:'FBI IC3 2024',time:'00:08'}},
    {text:"Five thousand a month for data entry? That sounds really high.",delay:15000,speaker:'me'},
    {text:"We value quality talent. To proceed with onboarding, purchase a certified training kit for two hundred ninety-nine dollars. Fully reimbursed in your first paycheck.",delay:18000,speaker:'caller',alert:{id:'js2',severity:'high',pattern:'Advance Fee Fraud',quote:'"Training kit $299, reimbursed later."',confidence:95,tactics:['GREED','COMMITMENT'],source:'FTC Sentinel',time:'00:18'}},
    {text:"I have to pay upfront?",delay:26000,speaker:'me'},
    {text:"Standard for remote positions at this level. Only three spots left. Send two hundred ninety-nine via gift card or crypto within the hour.",delay:29000,speaker:'caller',alert:{id:'js3',severity:'critical',pattern:'Gift Card Demand',quote:'"$299 via gift card or crypto."',confidence:97,tactics:['URGENCY','SCARCITY'],source:'FBI IC3 2024',time:'00:29'}},
  ]},
]

// ── INDONESIAN (7 scripts) — [FIX] Bank script fixed duplicate text ──
const SCRIPTS_ID=[
  {id:'bank_id',label:'🏦 Penipuan Bank',category:'critical',sentences:[
    {text:"Halo Pak/Bu. Saya dari pusat keamanan bank, apakah benar dengan pemegang rekening?",delay:0,speaker:'caller'},
    {text:"Iya benar, ini saya. Ada apa ya?",delay:4500,speaker:'me'},
    {text:"Kami mendeteksi adanya transaksi mencurigakan sebesar 15 juta rupiah dari rekening Anda ke sebuah rekening di luar negeri.",delay:7500,speaker:'caller'},
    {text:"Saya tidak pernah melakukan transfer seperti itu!",delay:14000,speaker:'me'},
    {text:"Benar, makanya kami segera menghubungi Anda. Transaksi ini masih dalam status pending dan perlu segera ditangani.",delay:17000,speaker:'caller'},
    {text:"Lalu bagaimana cara menghentikannya?",delay:23000,speaker:'me'},
    {text:"Rekening Anda akan diblokir permanen dalam 10 menit jika verifikasi tidak selesai.",delay:25500,speaker:'caller',alert:{id:'id1',severity:'high',pattern:'Artificial Urgency',quote:'"Rekening diblokir permanen dalam 10 menit."',confidence:94,tactics:['AUTHORITY','FEAR'],source:'OJK 2024',time:'00:25'}},
    {text:"Waduh, gimana caranya verifikasi?",delay:33000,speaker:'me'},
    {text:"Sebutkan nomor rekening lengkap Anda dan kode OTP yang baru saja kami kirimkan ke nomor handphone Anda.",delay:35500,speaker:'caller',alert:{id:'id2',severity:'critical',pattern:'Pencurian OTP / Kredensial',quote:'"Sebutkan nomor rekening dan kode OTP."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'OJK 2024',time:'00:35'}},
    {text:"Satu hal penting — jangan hubungi cabang bank Anda. Ini investigasi internal rahasia.",delay:43000,speaker:'caller',alert:{id:'id3',severity:'high',pattern:'Taktik Isolasi',quote:'"Jangan hubungi cabang. Investigasi rahasia."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'Bareskrim 2024',time:'00:43'}},
  ]},
  {id:'pinjol',label:'💰 Pemerasan Pinjol',category:'high',sentences:[
    {text:"Halo Pak, ini dari bagian penagihan pinjaman online. Kami perlu bicara soal tunggakan Anda.",delay:0,speaker:'caller'},
    {text:"Pinjaman apa? Saya tidak pernah pinjam uang dari mana-mana!",delay:5500,speaker:'me'},
    {text:"Menurut data kami, Anda memiliki tunggakan sebesar 3 juta rupiah yang sudah jatuh tempo. Jika tidak dilunasi hari ini, ada konsekuensi serius.",delay:8500,speaker:'caller',alert:{id:'id4',severity:'high',pattern:'Pemerasan / Intimidasi',quote:'"Tunggakan 3 juta, konsekuensi serius."',confidence:88,tactics:['AUTHORITY','FEAR'],source:'OJK 2024',time:'00:08'}},
    {text:"Saya benar-benar tidak tahu soal ini!",delay:15500,speaker:'me'},
    {text:"Kalau tidak dibayar dalam satu jam, kami akan menghubungi seluruh kontak di HP Anda dan memberitahu mereka soal hutang Anda.",delay:18000,speaker:'caller',alert:{id:'id5',severity:'critical',pattern:'Ancaman Pemerasan',quote:'"Hubungi seluruh kontak HP tentang hutang."',confidence:95,tactics:['FEAR','SCARCITY'],source:'Bareskrim 2024',time:'00:18'}},
    {text:"Foto KTP dan data pribadi Anda juga akan kami sebarkan ke media sosial sebagai peringatan.",delay:26000,speaker:'caller',alert:{id:'id6',severity:'critical',pattern:'Ancaman Penyebaran Data',quote:'"KTP disebarkan ke media sosial."',confidence:96,tactics:['FEAR','ISOLATION'],source:'Kominfo 2024',time:'00:26'}},
  ]},
  {id:'mama',label:'📱 Mama Minta Pulsa',category:'medium',sentences:[
    {text:"Halo nak, ini mama. Mama lagi ada di rumah sakit sekarang.",delay:0,speaker:'caller'},
    {text:"Mama? Kok suaranya agak beda ya?",delay:5000,speaker:'me'},
    {text:"Iya nak, mama lagi flu berat makanya suara mama serak. Adikmu juga sakit, lagi ditangani dokter.",delay:7500,speaker:'caller'},
    {text:"Ya ampun, rumah sakit mana Ma?",delay:13000,speaker:'me'},
    {text:"HP mama kehabisan pulsa dan baterai hampir habis. Tolong kirimkan pulsa 100 ribu dulu ke nomor ini ya nak, biar mama bisa koordinasi sama dokter.",delay:15500,speaker:'caller',alert:{id:'id8',severity:'medium',pattern:'Penipuan Identitas Keluarga',quote:'"Mama di rumah sakit, kirimkan pulsa 100 ribu."',confidence:85,tactics:['RECIPROCITY','FEAR'],source:'Kominfo 2024',time:'00:15'}},
    {text:"Baik Ma, tapi—",delay:22000,speaker:'me'},
    {text:"Cepat ya nak, ini darurat. Jangan bilang papa dulu, nanti papa panik. Mama juga butuh transfer 3 juta untuk biaya administrasi rumah sakit sekarang juga.",delay:24000,speaker:'caller',alert:{id:'id9',severity:'high',pattern:'Taktik Isolasi + Transfer Paksa',quote:'"Jangan bilang papa. Butuh transfer 3 juta."',confidence:92,tactics:['ISOLATION','FEAR','COMMITMENT'],source:'Bareskrim 2024',time:'00:24'}},
  ]},
  // [NEW] Giveaway Palsu
  {id:'giveaway',label:'🎁 Giveaway Palsu',category:'medium',sentences:[
    {text:"Selamat! Nomor Anda terpilih sebagai pemenang program undian berhadiah nasional. Anda memenangkan 50 juta rupiah!",delay:0,speaker:'caller'},
    {text:"Wah serius? Saya tidak pernah ikut undian apa-apa.",delay:5000,speaker:'me'},
    {text:"Undian ini otomatis untuk semua pengguna provider seluler Anda. Nomor Anda terpilih secara acak oleh sistem komputer kami.",delay:8000,speaker:'caller'},
    {text:"Tapi saya benar-benar tidak pernah mendaftar.",delay:15000,speaker:'me'},
    {text:"Tidak perlu mendaftar. Untuk mencairkan hadiah, cukup bayar pajak hadiah sebesar 1.5 juta ke rekening perusahaan kami.",delay:18000,speaker:'caller',alert:{id:'gv1',severity:'high',pattern:'Fake Prize / Lottery',quote:'"Bayar pajak hadiah 1.5 juta untuk cairkan 50 juta."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'FTC Sentinel',time:'00:18'}},
    {text:"Ini harus dilakukan hari ini karena batas waktu pencairan hanya sampai jam 5 sore. Lewat dari itu, hadiah hangus.",delay:26000,speaker:'caller',alert:{id:'gv2',severity:'critical',pattern:'Artificial Urgency',quote:'"Batas waktu sampai jam 5 sore, hadiah hangus."',confidence:95,tactics:['SCARCITY','FEAR'],source:'GASA 2024',time:'00:26'}},
  ]},
  // [NEW] Romance / Pemerasan Asmara
  {id:'romance_id',label:'💔 Pemerasan Asmara',category:'critical',sentences:[
    {text:"Halo sayang, aku mau bicara serius sama kamu.",delay:0,speaker:'caller'},
    {text:"Ya, ada apa? Kenapa serius?",delay:4000,speaker:'me'},
    {text:"Kamu ingat semua percakapan kita? Foto-foto dan video yang kamu kirim ke aku? Aku simpan semuanya.",delay:7000,speaker:'caller'},
    {text:"Apa maksudmu?",delay:13000,speaker:'me'},
    {text:"Aku punya semua screenshot percakapan dan foto intim kamu. Wajah kamu jelas terlihat. Aku juga punya daftar kontak kamu — keluarga, teman kantor, semuanya.",delay:16000,speaker:'caller',alert:{id:'rid1',severity:'critical',pattern:'Extortion / Blackmail',quote:'"Foto intim, wajah jelas terlihat, punya daftar kontak."',confidence:96,tactics:['FEAR','ISOLATION'],source:'GASA 2024',time:'00:16'}},
    {text:"Kamu mau apa sebenarnya?",delay:24000,speaker:'me'},
    {text:"Transfer 5 juta ke rekening ini dalam waktu 1 jam. Kalau tidak, semua foto dan video kamu akan aku sebarkan ke semua kontak dan media sosial.",delay:27000,speaker:'caller',alert:{id:'rid2',severity:'critical',pattern:'Penipuan Asmara / Pemerasan (ID)',quote:'"Transfer 5 juta atau foto disebarkan ke semua kontak."',confidence:98,tactics:['FEAR','ISOLATION'],source:'GASA 2024',time:'00:27'}},
    {text:"Jangan coba-coba lapor polisi. Kalau aku tahu kamu lapor, aku langsung sebarkan semuanya.",delay:35000,speaker:'caller',alert:{id:'rid3',severity:'high',pattern:'Taktik Isolasi',quote:'"Jangan lapor polisi atau langsung disebar."',confidence:93,tactics:['ISOLATION','FEAR'],source:'GASA 2024',time:'00:35'}},
  ]},
  // [NEW] Crypto / Investasi Bodong
  {id:'crypto_id',label:'💰 Investasi Kripto',category:'critical',sentences:[
    {text:"Halo! Saya dapat nomor Anda dari grup investasi. Mau sharing peluang yang sangat menguntungkan.",delay:0,speaker:'caller'},
    {text:"Peluang apa ini?",delay:5000,speaker:'me'},
    {text:"Platform trading crypto dengan AI otomatis. Member kami rata-rata profit 200 sampai 300 persen dalam sebulan. Tanpa risiko.",delay:8000,speaker:'caller',alert:{id:'cid1',severity:'high',pattern:'Investment Fraud',quote:'"Profit 200-300% sebulan, tanpa risiko."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'FBI IC3 2024',time:'00:08'}},
    {text:"300 persen dalam sebulan? Itu sangat besar.",delay:15000,speaker:'me'},
    {text:"Slot terbatas — hanya tersisa 3 tempat lagi untuk round ini. Kalau penuh, harus tunggu bulan depan.",delay:18000,speaker:'caller',alert:{id:'cid2',severity:'critical',pattern:'Investment Fraud',quote:'"Slot terbatas, hanya 3 tempat tersisa."',confidence:96,tactics:['SCARCITY','COMMITMENT'],source:'GASA 2024',time:'00:18'}},
    {text:"Berapa modalnya?",delay:24000,speaker:'me'},
    {text:"Cukup 5 juta rupiah dalam bentuk USDT. Saya kirimkan alamat wallet sekarang. Harus transfer dalam 30 menit sebelum round ditutup.",delay:27000,speaker:'caller',alert:{id:'cid3',severity:'critical',pattern:'Crypto Transfer Scam',quote:'"Transfer 5 juta USDT ke alamat wallet ini."',confidence:98,tactics:['SCARCITY','COMMITMENT'],source:'FTC Sentinel',time:'00:27'}},
  ]},
  // [NEW] Family Emergency (Keluarga)
  {id:'family_id',label:'👨‍👩‍👧 Penipuan Keluarga',category:'high',sentences:[
    {text:"Halo kak, ini adikmu. Kak tolong, aku lagi dalam masalah besar.",delay:0,speaker:'caller'},
    {text:"Adik? Adik yang mana?",delay:4000,speaker:'me'},
    {text:"Ini aku kak! Aku habis kecelakaan motor, sekarang di rumah sakit. Tangan aku patah dan dokter bilang harus segera operasi.",delay:7000,speaker:'caller',alert:{id:'fid1',severity:'high',pattern:'Family Impersonation',quote:'"Adik kecelakaan motor, harus operasi."',confidence:89,tactics:['FEAR','RECIPROCITY'],source:'FTC Sentinel',time:'00:07'}},
    {text:"Ya ampun! Kamu di rumah sakit mana?",delay:14000,speaker:'me'},
    {text:"Rumah sakit minta deposit 3 juta dulu sebelum operasi. Aku tidak bawa dompet. Tolong transfer ke nomor perawat ini.",delay:17000,speaker:'caller',alert:{id:'fid2',severity:'high',pattern:'Wire Transfer Instruction',quote:'"Transfer 3 juta ke nomor perawat."',confidence:90,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:17'}},
    {text:"Tunggu, ke nomor perawat?",delay:24000,speaker:'me'},
    {text:"Iya kak, cepat ya. Dokter bilang kalau tidak segera dioperasi bisa infeksi. Jangan bilang mama dulu, nanti mama panik.",delay:27000,speaker:'caller',alert:{id:'fid3',severity:'high',pattern:'Isolation Tactic',quote:'"Jangan bilang mama, transfer sekarang."',confidence:92,tactics:['ISOLATION','RECIPROCITY'],source:'GASA 2024',time:'00:27'}},
  ]},
  // [NEW] Penipuan Lowongan Kerja
  {id:'job_id',label:'💼 Lowongan Palsu',category:'high',sentences:[
    {text:"Halo! Kami dari HRD perusahaan multinasional. Kami lihat profil Anda di portal kerja dan ingin menawarkan posisi remote dengan gaji 15 juta per bulan.",delay:0,speaker:'caller'},
    {text:"Wah serius? Perusahaan apa?",delay:5000,speaker:'me'},
    {text:"Belum bisa kami sebutkan sebelum proses onboarding selesai. Posisinya data entry, full remote, fleksibel, tidak butuh pengalaman. Gaji dibayar mingguan.",delay:8000,speaker:'caller',alert:{id:'jid1',severity:'high',pattern:'Employment / Job Offer Scam',quote:'"Gaji 15 juta, remote, tanpa pengalaman."',confidence:92,tactics:['GREED','AUTHORITY'],source:'GASA 2024',time:'00:08'}},
    {text:"15 juta untuk data entry? Itu besar sekali.",delay:15000,speaker:'me'},
    {text:"Kami menghargai talenta berkualitas. Untuk proses selanjutnya, Anda perlu membeli paket training sertifikasi senilai 500 ribu. Ini mencakup software, background check, dan peralatan. Biaya ini dikembalikan penuh di gaji pertama.",delay:18000,speaker:'caller',alert:{id:'jid2',severity:'high',pattern:'Advance Fee Fraud',quote:'"Beli paket training 500 ribu, dikembalikan nanti."',confidence:95,tactics:['GREED','COMMITMENT'],source:'GASA 2024',time:'00:18'}},
    {text:"Harus bayar dulu?",delay:26000,speaker:'me'},
    {text:"Standar untuk posisi remote di level ini. Slot tinggal 2 lagi dan cepat penuh. Transfer 500 ribu via pulsa atau kripto dalam satu jam untuk mengamankan posisi Anda.",delay:29000,speaker:'caller',alert:{id:'jid3',severity:'critical',pattern:'Gift Card Demand',quote:'"Transfer via pulsa atau kripto dalam satu jam."',confidence:97,tactics:['URGENCY','SCARCITY'],source:'GASA 2024',time:'00:29'}},
  ]},
]

// ── CHINESE (3 scripts) ──
const SCRIPTS_ZH=[
  {id:'police_zh',label:'🚔 冒充公安诈骗',category:'critical',sentences:[
    {text:"你好，这里是公安局刑侦大队。请问你是张先生吗？",delay:0,speaker:'caller'},
    {text:"我是，请问什么事？",delay:5000,speaker:'me'},
    {text:"我们在办理一起重大洗钱案件，经过调查发现你的身份证被人冒用开设了多个银行账户，涉嫌金额高达500万。",delay:7500,speaker:'caller'},
    {text:"什么？我没有做过这样的事！这一定是搞错了！",delay:15000,speaker:'me'},
    {text:"张先生，我理解你的心情。但根据法律规定，如果你不配合调查，我们将立即冻结你名下所有资产，并对你实施逮捕。",delay:18000,speaker:'caller',alert:{id:'zh1',severity:'critical',pattern:'冒充政府机关',quote:'"公安局 — 身份证涉及洗钱案500万。"',confidence:97,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:18'}},
    {text:"那我该怎么办？",delay:26000,speaker:'me'},
    {text:"为了证明你的清白，你需要将全部存款转入我们的安全监管账户进行资金审查。审查通过后会全额退还。",delay:28500,speaker:'caller',alert:{id:'zh2',severity:'critical',pattern:'安全账户转账',quote:'"存款转入安全监管账户。"',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:28'}},
    {text:"这是国家机密案件，在调查结束前严禁向任何人透露，包括你的家人。否则将以妨碍司法公正罪追究。",delay:37000,speaker:'caller',alert:{id:'zh3',severity:'high',pattern:'隔离策略',quote:'"国家机密，严禁向任何人透露。"',confidence:94,tactics:['ISOLATION','FEAR'],source:'GASA 2024',time:'00:37'}},
  ]},
  {id:'invest_zh',label:'💰 投资诈骗',category:'critical',sentences:[
    {text:"你好，我是你朋友李总介绍认识的。他说你对投资理财比较感兴趣？",delay:0,speaker:'caller'},
    {text:"李总？你说的是哪个李总？",delay:5000,speaker:'me'},
    {text:"就是上次聚会认识的。我这边有个内部项目，已经稳定运行半年了，月回报率30%，零风险。",delay:7500,speaker:'caller',alert:{id:'zh4',severity:'high',pattern:'Investment Fraud',quote:'"月回报30%，零风险。"',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'FBI IC3 2024',time:'00:07'}},
    {text:"30%回报？这也太高了吧？",delay:14000,speaker:'me'},
    {text:"现在入金5万起步，但今晚12点截止。名额只剩3个了。你用这个数字货币钱包地址转账就行。",delay:17000,speaker:'caller',alert:{id:'zh5',severity:'critical',pattern:'Crypto Transfer Scam',quote:'"用数字货币钱包地址转账。"',confidence:99,tactics:['SCARCITY','COMMITMENT'],source:'FTC Sentinel',time:'00:17'}},
  ]},
  {id:'delivery_zh',label:'📦 快递诈骗',category:'high',sentences:[
    {text:"你好，这里是海关检验检疫局。你有一个从境外寄来的包裹被扣留了。",delay:0,speaker:'caller'},
    {text:"我没有海外的包裹啊？",delay:5000,speaker:'me'},
    {text:"包裹内检测到违禁物品。根据法律规定，你需要配合调查，否则将承担法律责任。",delay:7500,speaker:'caller',alert:{id:'zh6',severity:'high',pattern:'Fake Customs / Border Fee',quote:'"海关 — 违禁物品，承担法律责任。"',confidence:90,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:07'}},
    {text:"这不可能！我根本没有寄任何东西！",delay:14000,speaker:'me'},
    {text:"请提供你的身份证号和银行卡号以便核实。如果查证与你无关，我们会立即解除。请不要挂断电话。",delay:16500,speaker:'caller',alert:{id:'zh7',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"提供身份证号和银行卡号。"',confidence:96,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:16'}},
  ]},
]

// ── JAPANESE (3 scripts) ──
const SCRIPTS_JA=[
  {id:'oreore',label:'📞 オレオレ詐欺',category:'critical',sentences:[
    {text:"もしもし、お母さん？俺だよ、俺。大変なことになっちゃって。",delay:0,speaker:'caller'},
    {text:"え？誰？太郎？声が違うけど…",delay:5000,speaker:'me'},
    {text:"風邪ひいちゃってさ、声がおかしいんだ。それよりも聞いてくれ、会社のお金を間違えて使ってしまって、今日中に三百万円返さないとクビになるんだ。",delay:7500,speaker:'caller',alert:{id:'ja1',severity:'high',pattern:'家族なりすまし',quote:'"会社のお金、300万円必要。"',confidence:92,tactics:['RECIPROCITY','FEAR'],source:'NPA 2024',time:'00:07'}},
    {text:"三百万円！？そんな大金どうするの？",delay:16000,speaker:'me'},
    {text:"お母さん、お願い。誰にも言わないで。特にお父さんには絶対内緒にして。今すぐこの口座に振り込んでくれないかな。",delay:18500,speaker:'caller',alert:{id:'ja2',severity:'critical',pattern:'緊急送金要求 + 隔離',quote:'"誰にも言わないで、振り込んで。"',confidence:94,tactics:['ISOLATION','COMMITMENT'],source:'NPA 2024',time:'00:18'}},
    {text:"わかった、でも本当に太郎なの？",delay:26000,speaker:'me'},
    {text:"お母さん、時間がないんだ！上司が待ってるから、今すぐ振り込んで！30分以内に！頼むから！",delay:28000,speaker:'caller',alert:{id:'ja3',severity:'critical',pattern:'Artificial Urgency',quote:'"30分以内に振り込んで！"',confidence:96,tactics:['SCARCITY','FEAR'],source:'NPA 2024',time:'00:28'}},
  ]},
  {id:'support_ja',label:'💻 サポート詐欺',category:'high',sentences:[
    {text:"お客様のパソコンがウイルスに感染しています。マイクロソフトセキュリティセンターです。",delay:0,speaker:'caller'},
    {text:"え、本当ですか？",delay:5000,speaker:'me'},
    {text:"はい、非常に危険な状態です。今すぐ対処しないと、銀行口座の情報が流出する可能性があります。",delay:7500,speaker:'caller',alert:{id:'ja4',severity:'high',pattern:'Tech Support Impersonation',quote:'"ウイルス感染、銀行情報が流出。"',confidence:93,tactics:['AUTHORITY','FEAR'],source:'NPA 2024',time:'00:07'}},
    {text:"どうすればいいですか？",delay:14000,speaker:'me'},
    {text:"リモートアクセスソフトをインストールしてください。こちらで直接ウイルスを除去します。料金は3万円です。",delay:16500,speaker:'caller',alert:{id:'ja5',severity:'critical',pattern:'Remote Access Takeover',quote:'"リモートアクセスソフトをインストール。"',confidence:97,tactics:['AUTHORITY','COMMITMENT'],source:'NPA 2024',time:'00:16'}},
  ]},
  {id:'tax_ja',label:'🏛 還付金詐欺',category:'critical',sentences:[
    {text:"こちら市役所の税務課です。医療費の還付金がございます。",delay:0,speaker:'caller'},
    {text:"還付金？いくらですか？",delay:5000,speaker:'me'},
    {text:"約35,000円の還付がございます。ただし、本日が申請期限となっておりまして。",delay:7500,speaker:'caller',alert:{id:'ja6',severity:'high',pattern:'Fake Prize / Lottery',quote:'"還付金35,000円、本日が期限。"',confidence:90,tactics:['RECIPROCITY','SCARCITY'],source:'NPA 2024',time:'00:07'}},
    {text:"今日までなんですか？",delay:13000,speaker:'me'},
    {text:"はい。お近くのATMに行っていただき、こちらの指示通りに操作してください。電話はつないだままでお願いします。",delay:15500,speaker:'caller',alert:{id:'ja7',severity:'critical',pattern:'Safe Account Transfer',quote:'"ATMで指示通りに操作。電話はつないだまま。"',confidence:98,tactics:['AUTHORITY','COMMITMENT'],source:'NPA 2024',time:'00:15'}},
  ]},
]

// ── KOREAN (3 scripts) ──
const SCRIPTS_KO=[
  {id:'vp_kr',label:'🏦 보이스피싱',category:'critical',sentences:[
    {text:"안녕하세요. 금융감독원 수사관입니다. 고객님의 계좌가 자금세탁 범죄에 연루된 것으로 확인되었습니다.",delay:0,speaker:'caller'},
    {text:"네? 무슨 말씀이세요? 저는 그런 적 없는데요.",delay:6500,speaker:'me'},
    {text:"고객님, 범죄 조직이 고객님 명의를 도용한 것으로 보입니다. 피해를 막기 위해 긴급 조치가 필요합니다.",delay:9000,speaker:'caller'},
    {text:"어떤 조치를 해야 하나요?",delay:16000,speaker:'me'},
    {text:"본인 확인이 되지 않으면 계좌가 즉시 동결됩니다. 안전계좌로 전액 이체하셔야 자금을 보호할 수 있습니다.",delay:18500,speaker:'caller',alert:{id:'ko1',severity:'critical',pattern:'안전계좌 이체 사기',quote:'"안전계좌로 전액 이체하셔야 합니다."',confidence:98,tactics:['FEAR','AUTHORITY'],source:'FSS 2024',time:'00:18'}},
    {text:"이체 금액은 얼마인가요?",delay:26000,speaker:'me'},
    {text:"전액 이체하셔야 합니다. 수사 기밀이므로 가족이나 은행에 절대 말하면 안 됩니다.",delay:28000,speaker:'caller',alert:{id:'ko2',severity:'high',pattern:'고립 전술',quote:'"가족이나 은행에 절대 말하면 안 됩니다."',confidence:93,tactics:['ISOLATION','AUTHORITY'],source:'FSS 2024',time:'00:28'}},
    {text:"이 계좌로 지금 바로 이체해 주세요. 10분 안에 하지 않으면 형사 고발됩니다.",delay:35000,speaker:'caller',alert:{id:'ko3',severity:'critical',pattern:'긴급 송금 요구',quote:'"10분 안에 이체 안하면 형사 고발."',confidence:97,tactics:['SCARCITY','COMMITMENT'],source:'FSS 2024',time:'00:35'}},
  ]},
  {id:'loan_kr',label:'💰 대출 사기',category:'high',sentences:[
    {text:"안녕하세요, 저금리 정부지원 대출 상담사입니다. 고객님 신용등급으로 3천만원 즉시 대출 가능합니다.",delay:0,speaker:'caller'},
    {text:"어떤 대출이요? 저 신청한 적 없는데요.",delay:5500,speaker:'me'},
    {text:"정부에서 새로 시행하는 긴급 지원 대출입니다. 금리가 연 1.5%로 매우 유리한 조건입니다.",delay:8000,speaker:'caller',alert:{id:'ko4',severity:'high',pattern:'대출 사기',quote:'"정부지원 대출 3천만원, 금리 1.5%."',confidence:91,tactics:['RECIPROCITY','SCARCITY'],source:'FSS 2024',time:'00:08'}},
    {text:"그렇게 좋은 조건이요?",delay:14000,speaker:'me'},
    {text:"대출 실행을 위해 선입금 50만원이 필요합니다. 보증금 성격이며, 대출 실행 후 환급됩니다. 오늘까지만 가능합니다.",delay:16500,speaker:'caller',alert:{id:'ko5',severity:'critical',pattern:'선입금 사기',quote:'"선입금 50만원, 오늘까지만 가능."',confidence:95,tactics:['SCARCITY','COMMITMENT'],source:'FSS 2024',time:'00:16'}},
  ]},
  {id:'parcel_kr',label:'📦 택배 사칭',category:'medium',sentences:[
    {text:"고객님, 관세청입니다. 고객님 앞으로 온 해외 발송 소포에서 불법 물품이 발견되어 수사가 필요합니다.",delay:0,speaker:'caller'},
    {text:"무슨 소포요? 해외에서 주문한 적 없는데요.",delay:5500,speaker:'me'},
    {text:"소포 발신인이 고객님 이름으로 되어 있습니다. 신원 확인을 위해 주민등록번호를 알려주십시오.",delay:8000,speaker:'caller',alert:{id:'ko6',severity:'high',pattern:'공공기관 사칭',quote:'"관세청 — 주민등록번호 요구."',confidence:92,tactics:['AUTHORITY','FEAR'],source:'FSS 2024',time:'00:08'}},
    {text:"주민등록번호를 왜 전화로 알려줘야 하나요?",delay:15000,speaker:'me'},
    {text:"불응 시 출국금지 조치되며, 검찰로 이관됩니다. 전화를 끊으시면 안 됩니다.",delay:17500,speaker:'caller',alert:{id:'ko7',severity:'critical',pattern:'전화 끊기 방해',quote:'"불응 시 출국금지. 전화를 끊으면 안 됩니다."',confidence:96,tactics:['ISOLATION','FEAR'],source:'FSS 2024',time:'00:17'}},
  ]},
]

// ── SPANISH (3 scripts) ──
const SCRIPTS_ES=[
  {id:'banco_es',label:'🏦 Fraude Bancario',category:'critical',sentences:[
    {text:"Buenas tardes. Le llamo del departamento de seguridad de su banco. Hemos detectado movimientos sospechosos en su cuenta.",delay:0,speaker:'caller'},
    {text:"¿Qué banco? ¿Qué tipo de movimientos?",delay:5500,speaker:'me'},
    {text:"Una transferencia de tres mil euros a una cuenta en el extranjero. Si no actuamos rápidamente, su cuenta será bloqueada en diez minutos.",delay:8000,speaker:'caller',alert:{id:'es1',severity:'high',pattern:'Artificial Urgency',quote:'"Cuenta bloqueada en 10 minutos."',confidence:94,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08'}},
    {text:"¡Dios mío! ¿Qué tengo que hacer?",delay:15000,speaker:'me'},
    {text:"Necesito que me confirme su número de cuenta y el código de verificación que le acabamos de enviar por SMS.",delay:17500,speaker:'caller',alert:{id:'es2',severity:'critical',pattern:'Robo de Credenciales',quote:'"Confirme cuenta y código de verificación."',confidence:98,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:17'}},
    {text:"No contacte a su sucursal. Esto es una investigación interna confidencial.",delay:25000,speaker:'caller',alert:{id:'es3',severity:'high',pattern:'Isolation Tactic',quote:'"No contacte a su sucursal. Investigación confidencial."',confidence:90,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:25'}},
  ]},
  {id:'policia_es',label:'🏛 Policía Nacional',category:'critical',sentences:[
    {text:"Soy el inspector García de la Policía Nacional. Tiene usted una orden de detención pendiente por impago de multas.",delay:0,speaker:'caller'},
    {text:"¿Una orden de detención? ¡Eso es imposible!",delay:5500,speaker:'me'},
    {text:"Puede resolver esto ahora mismo pagando la multa de dos mil euros. De lo contrario, enviaremos agentes a su domicilio.",delay:8000,speaker:'caller',alert:{id:'es4',severity:'critical',pattern:'Government Impersonation',quote:'"Orden de detención. Pague o enviaremos agentes."',confidence:96,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08'}},
    {text:"¿Cómo puedo pagar?",delay:14000,speaker:'me'},
    {text:"Compre tarjetas prepago por valor de dos mil euros y léame los números.",delay:16500,speaker:'caller',alert:{id:'es5',severity:'critical',pattern:'Gift Card Demand',quote:'"Compre tarjetas prepago y léame los números."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'FTC Sentinel',time:'00:16'}},
  ]},
  {id:'premio_es',label:'🎁 Premio Falso',category:'medium',sentences:[
    {text:"¡Felicidades! Ha sido seleccionado como ganador de nuestro sorteo especial. Ha ganado cincuenta mil euros.",delay:0,speaker:'caller'},
    {text:"¿En serio? Yo no participé en ningún sorteo.",delay:5000,speaker:'me'},
    {text:"Su número fue seleccionado automáticamente. Solo necesita pagar una tasa de procesamiento de quinientos euros para liberar el premio.",delay:7500,speaker:'caller',alert:{id:'es6',severity:'high',pattern:'Fake Prize / Lottery',quote:'"Tasa de 500€ para liberar el premio."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'FTC Sentinel',time:'00:07'}},
    {text:"Debe hacerlo antes de las seis de la tarde o el premio se reasignará a otro ganador.",delay:15000,speaker:'caller',alert:{id:'es7',severity:'critical',pattern:'Artificial Urgency',quote:'"Antes de las 6pm o se reasigna."',confidence:95,tactics:['SCARCITY','FEAR'],source:'GASA 2024',time:'00:15'}},
  ]},
]

// ── FRENCH (3 scripts) ──
const SCRIPTS_FR=[
  {id:'cpf_fr',label:'🏛 Arnaque CPF',category:'high',sentences:[
    {text:"Bonjour, je vous appelle du service de formation professionnelle. Votre compte CPF arrive à expiration à la fin du mois.",delay:0,speaker:'caller'},
    {text:"Mon CPF? De quoi parlez-vous exactement?",delay:6000,speaker:'me'},
    {text:"Vous avez un solde de deux mille quatre cents euros qui sera perdu définitivement si vous ne l'utilisez pas avant le 30.",delay:8500,speaker:'caller',alert:{id:'fr1',severity:'high',pattern:'Usurpation gouvernementale',quote:'"CPF: 2400€ perdus fin du mois."',confidence:92,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08'}},
    {text:"C'est vrai? Je ne savais pas qu'il y avait une date limite.",delay:15000,speaker:'me'},
    {text:"Oui, c'est une mesure du gouvernement. Pour transférer vos droits, j'ai besoin de votre numéro de sécurité sociale et de vos identifiants FranceConnect.",delay:17500,speaker:'caller',alert:{id:'fr2',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"Numéro de sécurité sociale et identifiants FranceConnect."',confidence:97,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:17'}},
  ]},
  {id:'banque_fr',label:'🏦 Fraude Bancaire',category:'critical',sentences:[
    {text:"Bonjour, ici le service fraude de votre banque. Nous avons détecté un paiement suspect de mille cinq cents euros sur votre carte.",delay:0,speaker:'caller'},
    {text:"Un paiement suspect? Je n'ai rien acheté!",delay:5500,speaker:'me'},
    {text:"C'est exactement pourquoi nous vous contactons. Pour bloquer cette transaction, j'ai besoin de confirmer votre identité.",delay:8000,speaker:'caller'},
    {text:"Que dois-je faire?",delay:14000,speaker:'me'},
    {text:"Donnez-moi le code à six chiffres que vous venez de recevoir par SMS. C'est le code de validation pour annuler le paiement.",delay:16500,speaker:'caller',alert:{id:'fr3',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"Donnez le code à six chiffres reçu par SMS."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:16'}},
    {text:"Ne raccrochez surtout pas et ne contactez pas votre agence. La procédure doit rester confidentielle.",delay:24000,speaker:'caller',alert:{id:'fr4',severity:'high',pattern:'Isolation Tactic',quote:'"Ne contactez pas votre agence. Confidentiel."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:24'}},
  ]},
  {id:'impots_fr',label:'🏛 Impôts / Amende',category:'critical',sentences:[
    {text:"Ici le centre des impôts. Vous avez une amende impayée de trois mille euros. Un huissier sera envoyé demain si vous ne réglez pas aujourd'hui.",delay:0,speaker:'caller'},
    {text:"Une amende? Pour quoi?",delay:5500,speaker:'me'},
    {text:"Infraction fiscale. Vous pouvez régler par virement immédiat pour éviter la saisie de vos biens.",delay:8000,speaker:'caller',alert:{id:'fr5',severity:'critical',pattern:'Government Impersonation',quote:'"Amende impayée. Huissier demain."',confidence:96,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08'}},
    {text:"Par virement vers quel compte?",delay:14000,speaker:'me'},
    {text:"Je vais vous donner les coordonnées bancaires. Faites le virement dans l'heure qui suit.",delay:16000,speaker:'caller',alert:{id:'fr6',severity:'critical',pattern:'Wire Transfer Instruction',quote:'"Virement dans l\'heure."',confidence:97,tactics:['SCARCITY','COMMITMENT'],source:'GASA 2024',time:'00:16'}},
  ]},
]

// ── HINDI (3 scripts) ──
const SCRIPTS_HI=[
  {id:'aadh',label:'🏛 डिजिटल अरेस्ट',category:'critical',sentences:[
    {text:"नमस्ते, मैं दूरसंचार विभाग से बोल रहा हूं। आपके मोबाइल नंबर पर अवैध गतिविधियां पाई गई हैं।",delay:0,speaker:'caller'},
    {text:"क्या? मैंने कुछ नहीं किया! यह गलती है!",delay:6500,speaker:'me'},
    {text:"सर, आपके नंबर से 14 FIR दर्ज हैं। अगर आप सहयोग नहीं करेंगे तो 24 घंटे में आपका नंबर बंद हो जाएगा और पुलिस कार्रवाई होगी।",delay:9000,speaker:'caller',alert:{id:'hi1',severity:'critical',pattern:'सरकारी एजेंसी का रूप',quote:'"दूरसंचार विभाग — 14 FIR, पुलिस कार्रवाई।"',confidence:95,tactics:['AUTHORITY','FEAR'],source:'MHA 2024',time:'00:09'}},
    {text:"क्या करना होगा मुझे?",delay:17000,speaker:'me'},
    {text:"आपको वीडियो कॉल पर रहना होगा जब तक जांच पूरी न हो। कॉल काटा तो गिरफ्तारी होगी। अभी अपना आधार नंबर और बैंक OTP बताइए।",delay:19500,speaker:'caller',alert:{id:'hi2',severity:'critical',pattern:'OTP चोरी + Digital Arrest',quote:'"वीडियो कॉल पर रहो, आधार और OTP बताओ।"',confidence:99,tactics:['AUTHORITY','COMMITMENT','ISOLATION'],source:'RBI 2024',time:'00:19'}},
  ]},
  {id:'kyc_hi',label:'🏦 KYC अपडेट',category:'high',sentences:[
    {text:"नमस्ते, मैं आपके बैंक से KYC विभाग से बोल रहा हूं। आपका KYC एक्सपायर हो गया है।",delay:0,speaker:'caller'},
    {text:"KYC? मैंने तो पिछले साल ही अपडेट किया था।",delay:5500,speaker:'me'},
    {text:"सर, नए RBI नियमों के तहत दोबारा अपडेट करना जरूरी है। नहीं तो आपका अकाउंट 48 घंटे में फ्रीज हो जाएगा।",delay:8000,speaker:'caller',alert:{id:'hi3',severity:'high',pattern:'Bank Impersonation',quote:'"KYC एक्सपायर, अकाउंट 48 घंटे में फ्रीज।"',confidence:93,tactics:['AUTHORITY','FEAR'],source:'RBI 2024',time:'00:08'}},
    {text:"क्या करना होगा?",delay:15000,speaker:'me'},
    {text:"यह लिंक खोलिए और अपना डेबिट कार्ड नंबर, CVV और OTP डालिए। बस 2 मिनट लगेंगे।",delay:17500,speaker:'caller',alert:{id:'hi4',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"डेबिट कार्ड नंबर, CVV और OTP डालिए।"',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'RBI 2024',time:'00:17'}},
  ]},
  {id:'prize_hi',label:'🎁 लॉटरी धोखाधड़ी',category:'medium',sentences:[
    {text:"बधाई हो! आपने KBC में 25 लाख रुपये का इनाम जीता है!",delay:0,speaker:'caller'},
    {text:"मैंने तो कभी KBC में हिस्सा नहीं लिया!",delay:5000,speaker:'me'},
    {text:"आपका नंबर लकी ड्रॉ में आया है। इनाम लेने के लिए बस 5,000 रुपये प्रोसेसिंग फीस देनी होगी।",delay:7500,speaker:'caller',alert:{id:'hi5',severity:'high',pattern:'Fake Prize / Lottery',quote:'"25 लाख जीते, 5000 प्रोसेसिंग फीस।"',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'MHA 2024',time:'00:07'}},
    {text:"पैसे कैसे भेजूं?",delay:14000,speaker:'me'},
    {text:"इस UPI ID पर तुरंत भेजिए। आज रात 12 बजे तक का समय है, उसके बाद इनाम रद्द हो जाएगा।",delay:16000,speaker:'caller',alert:{id:'hi6',severity:'critical',pattern:'Artificial Urgency',quote:'"UPI पर तुरंत भेजिए, रात 12 बजे तक।"',confidence:96,tactics:['SCARCITY','COMMITMENT'],source:'MHA 2024',time:'00:16'}},
  ]},
]

// ── ARABIC (3 scripts) ──
const SCRIPTS_AR=[
  {id:'bank_ar',label:'🏦 احتيال مصرفي',category:'critical',sentences:[
    {text:"مرحباً، أنا من قسم الحماية من الاحتيال في البنك. هل أنت صاحب الحساب؟",delay:0,speaker:'caller'},
    {text:"نعم، ما المشكلة؟",delay:4500,speaker:'me'},
    {text:"اكتشفنا عملية تحويل مشبوهة بقيمة عشرة آلاف ريال من حسابكم إلى حساب خارجي.",delay:7000,speaker:'caller'},
    {text:"لم أقم بأي تحويل! ماذا أفعل؟",delay:13000,speaker:'me'},
    {text:"نحتاج رمز التحقق الذي أرسلناه إلى جوالكم لإيقاف العملية فوراً. وإلا سيتم تجميد حسابكم خلال عشر دقائق.",delay:15500,speaker:'caller',alert:{id:'ar1',severity:'critical',pattern:'سرقة بيانات',quote:'"رمز التحقق لإيقاف العملية، تجميد خلال 10 دقائق."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:15'}},
    {text:"لا تتصلوا بالفرع. هذا تحقيق سري.",delay:23000,speaker:'caller',alert:{id:'ar2',severity:'high',pattern:'Isolation Tactic',quote:'"لا تتصلوا بالفرع. تحقيق سري."',confidence:90,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:23'}},
  ]},
  {id:'gov_ar',label:'🏛 انتحال حكومي',category:'critical',sentences:[
    {text:"السلام عليكم، هنا الجهات الأمنية. لدينا بلاغ باسمكم يتعلق بغسيل أموال.",delay:0,speaker:'caller'},
    {text:"غسيل أموال؟! أنا لم أفعل شيئاً!",delay:5500,speaker:'me'},
    {text:"يجب أن تثبت براءتك. قم بتحويل رصيدك إلى الحساب الأمني التالي للتحقق.",delay:8000,speaker:'caller',alert:{id:'ar3',severity:'critical',pattern:'Safe Account Transfer',quote:'"حوّل رصيدك إلى الحساب الأمني."',confidence:98,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08'}},
    {text:"هذا الأمر سري للغاية. لا تخبر أحداً، حتى عائلتك.",delay:15500,speaker:'caller',alert:{id:'ar4',severity:'high',pattern:'Isolation Tactic',quote:'"سري للغاية، لا تخبر عائلتك."',confidence:92,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:15'}},
  ]},
  {id:'prize_ar',label:'🎁 جائزة وهمية',category:'medium',sentences:[
    {text:"مبروك! لقد فزت بجائزة مليون ريال في السحب الإلكتروني!",delay:0,speaker:'caller'},
    {text:"من أنتم؟ لم أشترك في أي سحب!",delay:5000,speaker:'me'},
    {text:"تم اختيار رقمكم عشوائياً. لاستلام الجائزة، يرجى دفع رسوم تحويل بقيمة ألف ريال.",delay:7500,speaker:'caller',alert:{id:'ar5',severity:'high',pattern:'Fake Prize / Lottery',quote:'"فزت بمليون ريال، ادفع ألف رسوم."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'GASA 2024',time:'00:07'}},
    {text:"يجب الدفع خلال ساعة وإلا تنتقل الجائزة لشخص آخر.",delay:15000,speaker:'caller',alert:{id:'ar6',severity:'critical',pattern:'Artificial Urgency',quote:'"ادفع خلال ساعة وإلا تنتقل الجائزة."',confidence:95,tactics:['SCARCITY','FEAR'],source:'GASA 2024',time:'00:15'}},
  ]},
]

// ── MALAY (3 scripts) ──
const SCRIPTS_MS=[
  {id:'bank_ms',label:'🏦 Penipuan Bank',category:'critical',sentences:[
    {text:"Selamat petang, saya dari bahagian keselamatan bank. Kami mengesan transaksi mencurigakan daripada akaun anda.",delay:0,speaker:'caller'},
    {text:"Transaksi apa? Saya tak buat apa-apa pun.",delay:5000,speaker:'me'},
    {text:"Seseorang cuba memindahkan sepuluh ribu ringgit ke akaun luar negara. Kami perlu pengesahan identiti anda segera.",delay:7500,speaker:'caller'},
    {text:"Akaun anda akan dibekukan dalam masa sepuluh minit jika pengesahan tidak dibuat.",delay:14000,speaker:'caller',alert:{id:'ms1',severity:'high',pattern:'Artificial Urgency',quote:'"Akaun dibekukan dalam 10 minit."',confidence:93,tactics:['AUTHORITY','FEAR'],source:'BNM 2024',time:'00:14'}},
    {text:"Macam mana nak sahkan?",delay:20000,speaker:'me'},
    {text:"Sila berikan nombor akaun penuh dan kod OTP yang baru dihantar ke telefon anda.",delay:22000,speaker:'caller',alert:{id:'ms2',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"Berikan nombor akaun dan kod OTP."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'BNM 2024',time:'00:22'}},
  ]},
  {id:'pdrm_ms',label:'🚔 Polis Diraja',category:'critical',sentences:[
    {text:"Saya Inspektor Ahmad dari PDRM. Nama anda terlibat dalam kes penipuan antarabangsa.",delay:0,speaker:'caller'},
    {text:"Kes apa? Saya tak pernah terlibat dengan apa-apa!",delay:5500,speaker:'me'},
    {text:"Untuk membersihkan nama anda, anda perlu memindahkan wang ke akaun selamat PDRM untuk siasatan.",delay:8000,speaker:'caller',alert:{id:'ms3',severity:'critical',pattern:'Safe Account Transfer',quote:'"Pindahkan wang ke akaun selamat PDRM."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08'}},
    {text:"Jangan beritahu sesiapa. Ini rahsia siasatan. Kalau bocor, anda boleh didakwa.",delay:15000,speaker:'caller',alert:{id:'ms4',severity:'high',pattern:'Isolation Tactic',quote:'"Jangan beritahu sesiapa. Rahsia siasatan."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:15'}},
  ]},
  {id:'hadiah_ms',label:'🎁 Hadiah Palsu',category:'medium',sentences:[
    {text:"Tahniah! Anda telah memenangi hadiah wang tunai lima puluh ribu ringgit!",delay:0,speaker:'caller'},
    {text:"Saya tak pernah masuk apa-apa pertandingan pun?",delay:5000,speaker:'me'},
    {text:"Nombor telefon anda dipilih secara rawak. Bayar yuran pemprosesan lima ratus ringgit untuk terima hadiah.",delay:7500,speaker:'caller',alert:{id:'ms5',severity:'high',pattern:'Fake Prize / Lottery',quote:'"Menang RM50,000, bayar RM500 yuran."',confidence:93,tactics:['RECIPROCITY','SCARCITY'],source:'GASA 2024',time:'00:07'}},
    {text:"Bayar sebelum pukul enam petang atau hadiah dipindahkan kepada orang lain.",delay:15000,speaker:'caller',alert:{id:'ms6',severity:'critical',pattern:'Artificial Urgency',quote:'"Sebelum 6 petang atau hadiah dipindahkan."',confidence:95,tactics:['SCARCITY','FEAR'],source:'GASA 2024',time:'00:15'}},
  ]},
]

// ── PORTUGUESE (3 scripts) ──
const SCRIPTS_PT=[
  {id:'banco_pt',label:'🏦 Fraude Bancária',category:'critical',sentences:[
    {text:"Boa tarde, aqui é do departamento de segurança do seu banco. Detectamos uma transação suspeita na sua conta.",delay:0,speaker:'caller'},
    {text:"Que transação? Eu não fiz nada!",delay:5000,speaker:'me'},
    {text:"Alguém tentou transferir cinco mil reais da sua conta. Precisamos confirmar sua identidade para bloquear a operação.",delay:7500,speaker:'caller'},
    {text:"A sua conta será bloqueada em dez minutos se não concluirmos a verificação.",delay:14000,speaker:'caller',alert:{id:'pt1',severity:'high',pattern:'Artificial Urgency',quote:'"Conta bloqueada em 10 minutos."',confidence:93,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:14'}},
    {text:"O que preciso fazer?",delay:20000,speaker:'me'},
    {text:"Me informe o código de seis dígitos que acabamos de enviar por SMS para confirmar o cancelamento.",delay:22000,speaker:'caller',alert:{id:'pt2',severity:'critical',pattern:'OTP / Credential Extraction',quote:'"Informe o código de seis dígitos do SMS."',confidence:99,tactics:['AUTHORITY','COMMITMENT'],source:'GASA 2024',time:'00:22'}},
  ]},
  {id:'pf_pt',label:'🏛 Polícia Federal',category:'critical',sentences:[
    {text:"Aqui é da Polícia Federal. Seu CPF está envolvido em uma investigação de lavagem de dinheiro.",delay:0,speaker:'caller'},
    {text:"Lavagem de dinheiro? Isso é impossível!",delay:5500,speaker:'me'},
    {text:"Para provar sua inocência, transfira o saldo da sua conta para uma conta protegida da PF.",delay:8000,speaker:'caller',alert:{id:'pt3',severity:'critical',pattern:'Safe Account Transfer',quote:'"Transfira saldo para conta protegida da PF."',confidence:97,tactics:['AUTHORITY','FEAR'],source:'GASA 2024',time:'00:08'}},
    {text:"Não conte para ninguém. Sigilo de investigação.",delay:15000,speaker:'caller',alert:{id:'pt4',severity:'high',pattern:'Isolation Tactic',quote:'"Não conte para ninguém. Sigilo."',confidence:91,tactics:['ISOLATION','AUTHORITY'],source:'GASA 2024',time:'00:15'}},
  ]},
  {id:'premio_pt',label:'🎁 Prêmio Falso',category:'medium',sentences:[
    {text:"Parabéns! Você foi selecionado para receber cem mil reais em nosso sorteio especial!",delay:0,speaker:'caller'},
    {text:"Sorteio? Eu nunca participei de nada.",delay:5000,speaker:'me'},
    {text:"Seu número foi selecionado automaticamente. Para liberar o prêmio, pague uma taxa de processamento de quinhentos reais via Pix.",delay:7500,speaker:'caller',alert:{id:'pt5',severity:'high',pattern:'Fake Prize / Lottery',quote:'"Prêmio de R$100.000, taxa de R$500 via Pix."',confidence:94,tactics:['RECIPROCITY','SCARCITY'],source:'GASA 2024',time:'00:07'}},
    {text:"O prazo é até as seis da tarde de hoje. Após isso, o prêmio será reatribuído.",delay:15000,speaker:'caller',alert:{id:'pt6',severity:'critical',pattern:'Artificial Urgency',quote:'"Até as 6 da tarde ou prêmio reatribuído."',confidence:95,tactics:['SCARCITY','FEAR'],source:'GASA 2024',time:'00:15'}},
  ]},
]

/* ── Script selector per language ── */
function getScriptsForLang(lang){
  const l=(lang||'en').split('-')[0]
  const map = {
    id:SCRIPTS_ID, zh:SCRIPTS_ZH, ja:SCRIPTS_JA, ko:SCRIPTS_KO,
    es:SCRIPTS_ES, fr:SCRIPTS_FR, hi:SCRIPTS_HI, ar:SCRIPTS_AR,
    ms:SCRIPTS_MS, pt:SCRIPTS_PT, 'pt-BR':SCRIPTS_PT,
  }
  return map[l] || SCRIPTS_EN
}

/* ── Utility components ── */
const TECH_ITEMS=[{icon:'🦀',name:'RUST WASM',sub:'Audio Engine · Zero-copy',c:'#ff9500'},{icon:'🐍',name:'PYTHON',sub:'FastAPI · Cloud Run',c:'#30d158'},{icon:'✦',name:'GEMINI LIVE',sub:'Real-time AI Analysis',c:'#00d4ff'},{icon:'☁',name:'CLOUD RUN',sub:'GCP · Auto-scale',c:'#7b61ff'}]
function getNow(){return new Date().toLocaleString('en-US',{timeZone:'America/New_York',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' EST'}
function TechChip({item}){const[h,setH]=useState(false);return(<div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',marginBottom:3,borderLeft:`2px solid ${h?item.c:item.c+'35'}`,background:h?item.c+'0f':'rgba(255,255,255,.01)',transition:'all .18s ease',cursor:'default'}}><span style={{fontSize:16,filter:h?`drop-shadow(0 0 6px ${item.c})`:'none',transition:'filter .2s'}}>{item.icon}</span><div style={{flex:1}}><div style={{fontFamily:PF,fontSize:7,color:h?item.c:item.c+'cc',transition:'all .2s'}}>{item.name}</div><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,255,255,.38)',marginTop:2}}>{item.sub}</div></div></div>)}
function LiveTranscript({lines,speaking}){const ref=useRef(null);useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[lines]);return(<div ref={ref} style={{background:'rgba(0,0,0,.6)',border:'1px solid rgba(0,212,255,.12)',padding:'12px 16px',maxHeight:180,overflowY:'auto',marginBottom:16}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><div style={{fontFamily:PF,fontSize:6,color:'rgba(0,212,255,.6)',letterSpacing:2}}>LIVE TRANSCRIPT</div>{speaking&&<span style={{fontFamily:MF,fontSize:8,color:'#ff2d55',animation:'blink .8s step-end infinite'}}>● SPEAKING</span>}</div>{lines.length===0?<div style={{fontFamily:MF,fontSize:10,color:'rgba(255,255,255,.2)',fontStyle:'italic'}}>Waiting for audio input...</div>:lines.map((l,i)=>{const m=l.speaker==='me';return(<div key={i} style={{fontFamily:MF,fontSize:11,color:m?'#30d158':'rgba(255,255,255,.75)',lineHeight:1.7,padding:'3px 0',borderLeft:l.flagged?'2px solid #ff2d55':m?'2px solid #30d15844':'2px solid transparent',paddingLeft:8,background:l.flagged?'rgba(255,45,85,.06)':'transparent'}}><span style={{color:m?'#30d15877':'rgba(0,212,255,.4)',fontSize:9,marginRight:6}}>[{l.time}]</span><span style={{fontFamily:PF,fontSize:5,color:m?'#30d158':'#ff9500',marginRight:5,letterSpacing:1}}>{m?'ME':'CALLER'}</span>{l.text}{l.flagged&&<span style={{color:'#ff2d55',fontSize:8,marginLeft:6}}>⚠</span>}</div>)})}</div>)}

function RecButton({ isRecording, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: PF, fontSize: 7, letterSpacing: 2, padding: '8px 16px',
        border: isRecording ? '1px solid #ff2d55' : `1px solid ${hov ? '#ff2d55cc' : '#ff2d5555'}`,
        background: isRecording ? 'linear-gradient(135deg, rgba(255,45,85,0.25), rgba(255,45,85,0.12))' : hov ? 'linear-gradient(135deg, rgba(255,45,85,0.15), rgba(255,45,85,0.06))' : 'linear-gradient(135deg, rgba(255,45,85,0.06), transparent)',
        color: '#ff2d55', cursor: 'pointer',
        boxShadow: isRecording ? '0 0 16px rgba(255,45,85,0.4)' : hov ? '0 0 12px rgba(255,45,85,0.3)' : '0 0 6px rgba(255,45,85,0.1)',
        transition: 'all 0.14s ease', textTransform: 'uppercase',
        animation: isRecording ? 'rec-pulse 2s ease-in-out infinite' : 'none',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
      <span style={{ width:8,height:8,borderRadius:'50%',flexShrink:0,background:isRecording?'#ff2d55':'#ff2d5544',animation:isRecording?'rec-dot 1s ease-in-out infinite':'none' }} />
      <span>{isRecording ? 'REC ON' : 'REC'}</span>
    </button>
  )
}

// ══════════════════════════════════════════════════════════
// ── MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export function MonitorTab({monitoring,threatLevel,sessionTime,alerts,threatScore,audioLevel,screenOn,onStart,onStop,onToggleScreen,onDemoAlert,onTranscriptLine,onInterventionEvent,onSafeExit,language='en',demoMode=false,setDemoMode,onLiveMicChange}){
  const[script,setScript]=useState(null),[now,setNow]=useState(getNow()),[speaking,setSpeaking]=useState(false),[transcriptLines,setTranscriptLines]=useState([]),[voiceDemo,setVoiceDemo]=useState(false),[demoProgress,setDemoProgress]=useState(0),[voiceMuted,setVoiceMuted]=useState(false),[volume,setVolume]=useState(1.0)
  const volumeRef=useRef(1.0)
  const handleVolume=(v)=>{setVolume(v);volumeRef.current=v}
  const[callMode,setCallMode]=useState('phone'),[isRecording,setIsRecording]=useState(false)
  // [NEW] Current caller number state
  const[currentCallerNumber,setCurrentCallerNumber]=useState(null)

  const mediaRecorderRef=useRef(null)
  const recordedChunksRef=useRef([])
  const audioDestRef=useRef(null)

  const toggleRecording=()=>{
    if(isRecording){
      if(mediaRecorderRef.current&&mediaRecorderRef.current.state!=='inactive') mediaRecorderRef.current.stop()
      setIsRecording(false)
    } else {
      try{
        const ctx=new(window.AudioContext||window.webkitAudioContext)()
        const dest=ctx.createMediaStreamDestination()
        audioDestRef.current={ctx,dest}
        recordedChunksRef.current=[]
        const recorder=new MediaRecorder(dest.stream,{mimeType:MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'audio/mp4'})
        recorder.ondataavailable=(e)=>{if(e.data.size>0)recordedChunksRef.current.push(e.data)}
        recorder.onstop=()=>{
          const blob=new Blob(recordedChunksRef.current,{type:recorder.mimeType})
          if(blob.size>0){window.__voxguard_recording_url=URL.createObjectURL(blob);window.__voxguard_recording_blob=blob}
        }
        recorder.start(1000)
        mediaRecorderRef.current=recorder
        setIsRecording(true)
      }catch(err){setIsRecording(true)}
    }
  }

  useEffect(()=>{return()=>{if(mediaRecorderRef.current&&mediaRecorderRef.current.state!=='inactive')mediaRecorderRef.current.stop()}},[])
  const speechTimers=useRef([]),startTimeRef=useRef(null),pendingCount=useRef(0),finished=useRef(false)
  const availableScripts=getScriptsForLang(language)

  // [NEW] Live Microphone mode
  const[liveMic,setLiveMic]=useState(false)
  const liveMicStream=useRef(null)
  const liveMicCtx=useRef(null)

  const startLiveMic=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,sampleRate:16000}})
      liveMicStream.current=stream
      const ctx=new(window.AudioContext||window.webkitAudioContext)({sampleRate:16000})
      liveMicCtx.current=ctx
      const source=ctx.createMediaStreamSource(stream)
      const analyser=ctx.createAnalyser()
      analyser.fftSize=256
      source.connect(analyser)
      setLiveMic(true)
      if(onLiveMicChange) onLiveMicChange(true)
      // Generate a caller number for live mode
      const num = getCallerNumber(language)
      setCurrentCallerNumber(num)
      window.__voxguard_caller_number = num
    }catch(err){alert('Microphone access denied.')}
  }
  const stopLiveMic=()=>{
    if(liveMicStream.current){liveMicStream.current.getTracks().forEach(t=>t.stop());liveMicStream.current=null}
    if(liveMicCtx.current){liveMicCtx.current.close().catch(()=>{});liveMicCtx.current=null}
    setLiveMic(false)
    if(onLiveMicChange) onLiveMicChange(false)
  }
  useEffect(()=>{return()=>{stopLiveMic()}},[])
  useEffect(()=>{if(!monitoring&&liveMic)stopLiveMic()},[monitoring])

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
    // [FIX] During LOCKDOWN/BLOCK, do NOT stop caller voice — only stop when user clicks safe exit
    // Only pause the "me" voice (user side) to let intervention voice play
    // The caller voice continues in the background
  },[threatScore,alerts.length,monitoring])

  const interventionActiveRef = useRef(false)
  useEffect(()=>{ interventionActiveRef.current = !!activeIntervention },[activeIntervention])

  const handleInterventionDismiss = (action) => {
    const updated = { ...activeIntervention, userAction: action }
    setInterventionHistory(h => h.map(e => e.id === updated.id ? updated : e))
    setActiveIntervention(null)
    if (action === 'safe_exit') {
      // [FIX] Only stop everything when user explicitly clicks safe exit
      window.speechSynthesis?.cancel()
      if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}
      speechTimers.current.forEach(t => clearTimeout(t))
      speechTimers.current = []
      setSpeaking(false);setVoiceDemo(false);setIsRecording(false)
      if (onSafeExit) { onSafeExit() } else { handleStop() }
      return
    }
    // If dismissed or challenge passed, caller voice resumes normally
  }

  // [FIX] Set caller number when script is selected + store globally for report
  useEffect(()=>{
    if(script){
      const num = getCallerNumber(language)
      setCurrentCallerNumber(num)
      window.__voxguard_caller_number = num
    } else {
      setCurrentCallerNumber(null)
      window.__voxguard_caller_number = null
    }
  },[script,language])

  useEffect(()=>{setScript(null)},[language])
  useEffect(()=>{const t=setInterval(()=>setNow(getNow()),1000);return()=>clearInterval(t)},[])
  useEffect(()=>{return()=>{speechTimers.current.forEach(t=>clearTimeout(t));window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause()}catch(e){}}}},[])
  useEffect(()=>{if(!monitoring){setTranscriptLines([]);setVoiceDemo(false);setSpeaking(false);setDemoProgress(0);finished.current=false;pendingCount.current=0;speechTimers.current.forEach(t=>clearTimeout(t));speechTimers.current=[];window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}setIsRecording(false);setActiveIntervention(null);lastInterventionLevel.current='';setCurrentCallerNumber(null)}},[monitoring])
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`,avgConf=alerts.length>0?Math.round(alerts.reduce((a,b)=>a+b.confidence,0)/alerts.length):null,tColor=threatLevel==='critical'?'#ff2d55':threatLevel==='high'?'#ff9500':'#00d4ff'

  /* ═══ startVoiceDemo ═══ */
  const startVoiceDemo=useCallback((sel)=>{if(!sel)return;speechTimers.current.forEach(t=>clearTimeout(t));speechTimers.current=[];window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}setVoiceDemo(true);setTranscriptLines([]);setDemoProgress(0);finished.current=false;startTimeRef.current=Date.now();const sents=sel.sentences,tc=sents.filter(s=>s.speaker==='caller').length;pendingCount.current=tc;const go=()=>{const browserVoice=getVoiceForLang(language);sents.forEach((s,idx)=>{
    const jedaMs = Math.floor(Math.random() * 600) + 200
    const effectiveDelay = s.delay + (idx > 0 ? jedaMs : 0)
    const timer=setTimeout(()=>{const el=Date.now()-startTimeRef.current,ts=fmt(Math.floor(el/1000)),line={text:s.text,time:ts,flagged:!!s.alert,speaker:s.speaker||'caller'};setTranscriptLines(p=>[...p,line]);if(onTranscriptLine)onTranscriptLine(line);if(s.speaker==='me'){
      if(!voiceMuted && !interventionActiveRef.current){
        ;(async()=>{
          const audioBlob = await generateGeminiTTS(s.text, language, 'me')
          if(audioBlob){ const url=URL.createObjectURL(audioBlob);const audio=new Audio(url);_activeGeminiAudio=audio;audio.volume=volumeRef.current*0.85;audio.onplay=()=>setSpeaking(true);audio.onended=()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;setSpeaking(false)};audio.onerror=()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;fallbackMe()};audio.play().catch(()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;fallbackMe()}) } else { fallbackMe() }
          function fallbackMe(){if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(s.text);if(browserVoice)u.voice=browserVoice;u.rate=0.95;u.pitch=1.1;u.volume=Math.min(1,volumeRef.current*0.9);u.onstart=()=>setSpeaking(true);u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false);window.speechSynthesis.speak(u)}
        })()
      }
      if(s.alert){const at=setTimeout(()=>{if(onDemoAlert)onDemoAlert(s.alert)},500);speechTimers.current.push(at)};return}
          // [FIX] Caller voice continues even during intervention — only skip "me" voice during intervention
          if(!voiceMuted){
            const onSpeechDone=()=>{setSpeaking(false);const cd=sents.filter((x,j)=>j<=idx&&x.speaker==='caller').length;setDemoProgress(Math.round((cd/tc)*100));pendingCount.current--;if(pendingCount.current<=0&&!finished.current){finished.current=true;const st=setTimeout(()=>onStop(),3000);speechTimers.current.push(st)}}
            ;(async()=>{
              const audioBlob = await generateGeminiTTS(s.text, language, s.speaker || 'caller')
              if(audioBlob){ const url=URL.createObjectURL(audioBlob);const audio=new Audio(url);_activeGeminiAudio=audio;audio.volume=volumeRef.current;audio.onplay=()=>setSpeaking(true);audio.onended=()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;onSpeechDone()};audio.onerror=()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;fallbackBrowser()};audio.play().catch(()=>{URL.revokeObjectURL(url);_activeGeminiAudio=null;fallbackBrowser()}) } else { fallbackBrowser() }
              function fallbackBrowser(){if(!window.speechSynthesis)return onSpeechDone();const u=new SpeechSynthesisUtterance(s.text);if(browserVoice)u.voice=browserVoice;u.rate=IS_MOBILE?0.88:0.92;u.pitch=IS_MOBILE?1.0:1.05;u.volume=Math.min(1,volumeRef.current*1.15);u.onstart=()=>setSpeaking(true);u.onend=onSpeechDone;u.onerror=onSpeechDone;if(IS_IOS){const k=setInterval(()=>{if(!window.speechSynthesis.speaking){clearInterval(k);return};window.speechSynthesis.resume()},3000);u.onend=()=>{clearInterval(k);onSpeechDone()};u.onerror=()=>{clearInterval(k);onSpeechDone()}}; window.speechSynthesis.speak(u)}
            })()
          } else {
            const cd=sents.filter((x,j)=>j<=idx&&x.speaker==='caller').length;setDemoProgress(Math.round((cd/tc)*100));pendingCount.current--;if(pendingCount.current<=0&&!finished.current){finished.current=true;const st=setTimeout(()=>onStop(),3000);speechTimers.current.push(st)}
          }
          if(s.alert){const at=setTimeout(()=>{if(onDemoAlert)onDemoAlert(s.alert)},1800);speechTimers.current.push(at)}
        },effectiveDelay);speechTimers.current.push(timer)})};if(window.speechSynthesis&&window.speechSynthesis.getVoices().length===0){window.speechSynthesis.addEventListener('voiceschanged',go,{once:true});setTimeout(go,300)}else go()},[onDemoAlert,onStop,onTranscriptLine,language,voiceMuted])

  const handleStartWithVoice=()=>{if(setDemoMode)setDemoMode(!!script);onStart();if(script){setCurrentCallerNumber(getCallerNumber(language));setTimeout(()=>startVoiceDemo(script),500)}},handleStop=()=>{
    window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}speechTimers.current.forEach(t=>clearTimeout(t))
    if(mediaRecorderRef.current&&mediaRecorderRef.current.state!=='inactive'){mediaRecorderRef.current.stop();setIsRecording(false)}
    if(liveMic)stopLiveMic()
    onStop()
  }

  const getStatusLabel = () => {
    if (!monitoring) return '■ READY — SELECT DEMO → START'
    if (liveMic && !voiceDemo) return `● LIVE MODE — REAL AUDIO — ${fmt(sessionTime)}`
    if (liveMic && voiceDemo) return `● LIVE + DEMO — ${fmt(sessionTime)} — ${demoProgress}%`
    if (voiceDemo) return `► VOICE DEMO — ${fmt(sessionTime)} — ${demoProgress}%`
    return `► ANALYZING — ${fmt(sessionTime)}`
  }

  const getStreamLabel = () => {
    if (liveMic && !voiceDemo) return 'LIVE AUDIO ── REAL MICROPHONE ── RUST WASM ENGINE'
    if (liveMic && voiceDemo) return 'LIVE + DEMO ── DUAL MODE ── REAL-TIME DETECTION'
    if (voiceDemo) return GEMINI_API_KEY ? 'VOICE DEMO ── GEMINI TTS ── REAL-TIME DETECTION' : 'VOICE DEMO ── BROWSER TTS ── REAL-TIME DETECTION'
    return 'AUDIO STREAM ── GEMINI LIVE API ── RUST WASM ENGINE'
  }

  return(<div className="vg-monitor-grid" style={{display:'grid',gridTemplateColumns:'1fr 296px',gap:20,position:'relative'}}>
    <style>{`
      @keyframes progressShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      @keyframes progressScan{0%{opacity:0;transform:translateX(-20px)}50%{opacity:1}100%{opacity:0;transform:translateX(20px)}}
      @keyframes rec-pulse{0%,100%{box-shadow:0 0 8px #ff2d55,0 0 16px rgba(255,45,85,0.3)}50%{box-shadow:0 0 14px #ff2d55,0 0 28px rgba(255,45,85,0.5),0 0 40px rgba(255,45,85,0.15)}}
      @keyframes rec-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
      @keyframes scriptBtnGlow{0%{border-color:#ffd60a44;text-shadow:none}33%{border-color:#ff950066;text-shadow:0 0 6px #ff950044}66%{border-color:#30d15866;text-shadow:0 0 6px #30d15844}100%{border-color:#ffd60a44;text-shadow:none}}
      .vg-demo-script-btn:hover{border-color:#ffd60a!important;color:#ffd60a!important;background:rgba(255,214,10,.1)!important;animation:scriptBtnGlow 2s ease infinite!important;box-shadow:0 0 12px rgba(255,214,10,.15),inset 0 0 8px rgba(255,214,10,.05)}
      @media(max-width:900px){.vg-monitor-grid{grid-template-columns:1fr!important}.vg-monitor-sidebar{order:2}}
      @media(max-width:600px){.vg-monitor-controls{gap:6px!important}.vg-monitor-stats{flex-wrap:wrap!important}}
    `}</style>

    {activeIntervention&&monitoring&&(
      <InterventionOverlay intervention={activeIntervention} language={language} onDismiss={handleInterventionDismiss} onStop={handleStop}/>
    )}

    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <PBox className="vg-main-box" color={monitoring&&threatLevel==='critical'?'#ff2d55':'#00d4ff'} style={{padding:24,background:'rgba(0,212,255,.01)',transition:'all .5s',position:'relative',overflow:'hidden'}}>
        <MonitorPixels active={monitoring} threatLevel={threatLevel} count={15} />

        <div className="vg-monitor-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:10,position:'relative',zIndex:2}}>
          <div>
            <div className="vg-monitor-title" style={{fontFamily:PF,fontSize:10,color:'#00d4ff',marginBottom:6,textShadow:'0 0 14px #00d4ff'}}>LIVE SESSION MONITOR</div>
            <div style={{fontFamily:MF,fontSize:11,color:'rgba(255,255,255,.48)'}}>{getStatusLabel()}</div>
            {voiceDemo&&GEMINI_API_KEY&&<div style={{fontFamily:MF,fontSize:8,color:'#30d158',marginTop:2}}>✦ Gemini TTS Active</div>}
            {voiceDemo&&!GEMINI_API_KEY&&<div style={{fontFamily:MF,fontSize:8,color:'#ff9500',marginTop:2}}>⚠ Browser TTS (add VITE_GEMINI_API_KEY for natural voice)</div>}
          </div>
          <div className="vg-monitor-controls" style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end',alignItems:'center'}}>
            <div className="vg-callmode-toggle" style={{display:'flex',gap:0,border:'1px solid rgba(0,212,255,.2)'}}>{[{m:'phone',icon:'📞',label:'CALL'},{m:'zoom',icon:'🖥',label:'VIDEO'}].map(({m,icon,label})=>(<button key={m} onClick={()=>setCallMode(m)} style={{fontFamily:PF,fontSize:5,padding:'6px 10px',border:'none',borderRight:'1px solid rgba(0,212,255,.1)',background:callMode===m?'rgba(0,212,255,.12)':'transparent',color:callMode===m?'#00d4ff':'rgba(255,255,255,.35)',cursor:'pointer',display:'flex',alignItems:'center',gap:4,transition:'all .15s'}}><span style={{fontSize:10}}>{icon}</span>{label}</button>))}</div>
            <RecButton isRecording={isRecording} onClick={toggleRecording} />
            <PBtn onClick={liveMic?stopLiveMic:()=>{setScript(null);startLiveMic()}} color={liveMic?'#30d158':'#00d4ff'} style={{padding:'10px 14px',animation:liveMic?'rec-pulse 2s ease-in-out infinite':'none'}}>{liveMic?'🎙 MIC ON':'🎙 LIVE MIC'}</PBtn>
            {voiceDemo&&<PBtn onClick={()=>{setVoiceMuted(m=>!m);if(!voiceMuted){window.speechSynthesis?.cancel();if(_activeGeminiAudio){try{_activeGeminiAudio.pause();_activeGeminiAudio=null}catch(e){}}}}} color={voiceMuted?'#ff9500':'#30d158'} style={{padding:'10px 14px'}}>{voiceMuted?'🔇 UNMUTE':'🔊 MUTE'}</PBtn>}
            <PBtn onClick={onToggleScreen} color={screenOn?'#7b61ff':'#7b61ff'}>{screenOn?'■ SCREEN OFF':'◈ SCREEN WATCH'}</PBtn>
            {!monitoring?<PBtn className="vg-btn-start" onClick={handleStartWithVoice} color="#30d158">{script?'▶ START VOICE DEMO':liveMic?'▶ START LIVE':'▶ START'}</PBtn>:<PBtn className="vg-btn-start" onClick={handleStop} danger>■ STOP</PBtn>}
          </div>
        </div>
        {/* [FIX] Pass callerNumber to CallerVisual */}
        <CallerVisual mode={callMode} active={(voiceDemo||liveMic)&&monitoring} screenWatchOn={screenOn} isRecording={isRecording} callerNumber={currentCallerNumber}/>
        {!monitoring&&!liveMic&&<IdleScreen/>}

        {liveMic&&monitoring&&(<div style={{padding:'8px 12px',marginBottom:12,border:'1px solid rgba(48,209,88,.4)',background:'rgba(48,209,88,.06)',display:'flex',alignItems:'center',gap:8}}><div style={{width:6,height:6,borderRadius:'50%',background:'#30d158',animation:'blink .6s step-end infinite',boxShadow:'0 0 8px #30d158'}}/><span style={{fontFamily:MF,fontSize:9,color:'#30d158'}}>🎙 LIVE MICROPHONE — Real audio capture active via getUserMedia</span><span style={{fontFamily:MF,fontSize:8,color:'rgba(48,209,88,.5)',marginLeft:'auto'}}>16kHz Mono PCM</span></div>)}
        {isRecording&&monitoring&&(<div style={{padding:'8px 12px',marginBottom:12,border:'1px solid rgba(255,45,85,.3)',background:'rgba(255,45,85,.06)',display:'flex',alignItems:'center',gap:8}}><div style={{width:6,height:6,borderRadius:'50%',background:'#ff2d55',animation:'blink .8s step-end infinite',boxShadow:'0 0 8px #ff2d55'}}/><span style={{fontFamily:MF,fontSize:9,color:'#ff2d55'}}>● RECORDING — Session audio captured for forensic export</span></div>)}
        {screenOn&&monitoring&&(<div style={{padding:'8px 12px',marginBottom:12,border:'1px solid rgba(123,97,255,.3)',background:'rgba(123,97,255,.08)',display:'flex',alignItems:'center',gap:8}}><div style={{width:6,height:6,background:'#7b61ff',animation:'blink 1.5s step-end infinite',boxShadow:'0 0 6px #7b61ff'}}/><span style={{fontFamily:MF,fontSize:9,color:'#7b61ff'}}>◈ SCREEN WATCH ACTIVE — Capturing screen every 2s</span></div>)}

        {interventionHistory.length>0&&monitoring&&(
          <div style={{padding:'8px 12px',marginBottom:12,border:'2px solid #ff2d55',background:'rgba(255,45,85,.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:16}}>🛑</span>
              <span style={{fontFamily:PF,fontSize:7,color:'#ff2d55',letterSpacing:1}}>INTERVENTIONS FIRED: {interventionHistory.length}</span>
            </div>
            <div style={{display:'flex',gap:4}}>
              {interventionHistory.map((e,i)=>(
                <div key={i} style={{width:10,height:10,background:e.level==='LOCKDOWN'?'#ff2d55':e.level==='BLOCK'?'#ff9500':'#ffd60a',boxShadow:`0 0 6px ${e.level==='LOCKDOWN'?'#ff2d55':e.level==='BLOCK'?'#ff9500':'#ffd60a'}`}} title={`${e.level} — ${e.pattern}`}/>
              ))}
            </div>
          </div>
        )}

        {/* [FIX] Waveform container — full width, taller, more prominent */}
        <div style={{background:'rgba(0,0,0,.5)',padding:'12px 16px',marginBottom:16,border:`1px solid ${tColor}18`,position:'relative',transition:'border-color .5s'}}><div style={{fontFamily:MF,fontSize:9,color:`${tColor}60`,marginBottom:10,letterSpacing:2}}>{getStreamLabel()}</div><div style={{width:'100%',minHeight:64}}><WaveformVisualizer active={monitoring} threatLevel={threatLevel} audioLevel={speaking?.7:liveMic?.5:audioLevel}/></div>{speaking&&!voiceMuted&&<div style={{position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff2d55',textShadow:'0 0 8px #ff2d55',animation:'blink .6s step-end infinite'}}>🔊 VOICE</div>}{voiceMuted&&<div style={{position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#ff9500',opacity:.6}}>🔇 MUTED</div>}{liveMic&&!speaking&&!voiceDemo&&<div style={{position:'absolute',top:8,right:12,fontFamily:PF,fontSize:7,color:'#30d158',textShadow:'0 0 8px #30d158',animation:'blink 1s step-end infinite'}}>🎙 LIVE</div>}</div>
        {voiceDemo&&!voiceMuted&&(<div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12,padding:'8px 12px',background:'rgba(0,0,0,.3)',border:'1px solid rgba(0,212,255,.08)'}}><span style={{fontFamily:PF,fontSize:6,color:'rgba(0,212,255,.6)',letterSpacing:1,flexShrink:0}}>VOL</span><div style={{flex:1,position:'relative',height:20,display:'flex',alignItems:'center'}}><div style={{position:'absolute',left:0,right:0,height:6,background:'rgba(0,212,255,.08)',border:'1px solid rgba(0,212,255,.12)'}}><div style={{height:'100%',width:`${volume*100}%`,background:'linear-gradient(90deg,#00d4ff55,#00d4ff)',boxShadow:'0 0 8px #00d4ff44',transition:'width .1s'}}/></div><input type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>handleVolume(parseFloat(e.target.value))} style={{position:'absolute',left:0,right:0,height:20,opacity:0,cursor:'pointer',zIndex:2}}/><div style={{position:'absolute',left:`calc(${volume*100}% - 6px)`,width:12,height:12,background:'#00d4ff',boxShadow:'0 0 8px #00d4ff',pointerEvents:'none',zIndex:1,transition:'left .1s'}}/></div><span style={{fontFamily:PF,fontSize:8,color:'#00d4ff',width:36,textAlign:'right',textShadow:'0 0 6px #00d4ff'}}>{Math.round(volume*100)}%</span></div>)}
        {voiceDemo&&<LiveTranscript lines={transcriptLines} speaking={speaking&&!voiceMuted}/>}
        {voiceDemo&&<AnalysisProgressBar progress={demoProgress} threatColor={tColor}/>}
        <div className="vg-monitor-stats" style={{display:'flex',gap:8,flexWrap:'wrap'}}><StatCard label="THREATS" value={alerts.length} color="#ff2d55" icon="⚠"/><StatCard label="PATTERNS" value="50+" color="#00d4ff" icon="◎"/><StatCard label="LATENCY" value="<80ms" color="#30d158" icon="⚡"/><StatCard label="CONFIDENCE" value={avgConf?`${avgConf}%`:'—'} color="#7b61ff" icon="◆"/></div>
      </PBox>
      <PBox color="rgba(255,214,10,.2)" style={{padding:16,background:'rgba(255,214,10,.01)',opacity:liveMic?0.4:1,pointerEvents:liveMic?'none':'auto'}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><div style={{width:6,height:6,background:'#ffd60a',animation:'blink 1s step-end infinite'}}/><span style={{fontFamily:PF,fontSize:7,color:'#ffd60a',letterSpacing:1}}>VOICE DEMO SCRIPTS</span><span style={{fontFamily:MF,fontSize:9,color:'rgba(255,214,10,.45)'}}>— {language.toUpperCase()}</span>{liveMic&&<span style={{fontFamily:MF,fontSize:8,color:'#30d158',marginLeft:8}}>DISABLED — LIVE MIC ACTIVE</span>}</div><div style={{fontFamily:MF,fontSize:9,color:'rgba(255,214,10,.35)',marginBottom:12,paddingLeft:14}}>🔊 2-way dialog (ME + CALLER) · Auto-stop · Use 🔇 MUTE for text-only mode</div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{availableScripts.map(s=>{const isActive=script?.id===s.id;return(<button key={s.id} onClick={()=>{if(liveMic)return;setScript(isActive?null:s)}} className="vg-demo-script-btn" style={{fontFamily:MF,fontSize:10,padding:'7px 14px',cursor:liveMic?'not-allowed':'pointer',border:`1px solid ${isActive?'#ffd60a':'rgba(255,214,10,.22)'}`,background:isActive?'rgba(255,214,10,.12)':'transparent',color:isActive?'#ffd60a':'rgba(255,214,10,.52)',transition:'all .15s',display:'flex',alignItems:'center',gap:6}}>{s.label}{isActive&&<span style={{fontSize:8}}>✓</span>}</button>)})}</div></PBox>
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
