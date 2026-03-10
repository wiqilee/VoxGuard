import { useState } from 'react'

const PF = "'Press Start 2P', monospace"
const MF = "'Share Tech Mono', 'Courier New', monospace"

export function PBox({ color = '#00d4ff', children, style = {}, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? color + 'cc' : color + '30'}`,
        boxShadow: hov
          ? `0 0 0 1px ${color}22, 0 0 40px ${color}22, inset 0 0 30px ${color}06`
          : `inset 0 0 12px ${color}04`,
        position: 'relative',
        transition: 'all 0.2s ease',
        animation: hov ? 'retroBorderCycle 3s ease infinite' : 'none',
        ...style,
      }}
    >
      <div style={{ position:'absolute',top:-1,left:-1,width:18,height:18,pointerEvents:'none',zIndex:2 }}>
        <div style={{ position:'absolute',top:0,left:0,width:18,height:2,background:hov?color:color+'99',transition:'background 0.2s',boxShadow:hov?`0 0 6px ${color}`:'' }} />
        <div style={{ position:'absolute',top:0,left:0,width:2,height:18,background:hov?color:color+'99',transition:'background 0.2s',boxShadow:hov?`0 0 6px ${color}`:'' }} />
      </div>
      <div style={{ position:'absolute',bottom:-1,right:-1,width:18,height:18,pointerEvents:'none',zIndex:2 }}>
        <div style={{ position:'absolute',bottom:0,right:0,width:18,height:2,background:hov?color:color+'99',transition:'background 0.2s',boxShadow:hov?`0 0 6px ${color}`:'' }} />
        <div style={{ position:'absolute',bottom:0,right:0,width:2,height:18,background:hov?color:color+'99',transition:'background 0.2s',boxShadow:hov?`0 0 6px ${color}`:'' }} />
      </div>
      <div style={{ position:'absolute',top:-1,right:-1,width:5,height:5,background:hov?color+'bb':color+'44',transition:'background 0.2s',zIndex:2 }} />
      <div style={{ position:'absolute',bottom:-1,left:-1,width:5,height:5,background:hov?color+'bb':color+'44',transition:'background 0.2s',zIndex:2 }} />
      {/* Retro scanline on hover */}
      {hov && <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:1,opacity:0.03,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.4) 2px,rgba(255,255,255,0.4) 3px)',backgroundSize:'100% 4px' }} />}
      {children}
    </div>
  )
}

export function PBtn({ children, onClick, color = '#00d4ff', danger = false, disabled = false, style = {}, className = '' }) {
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)
  const c = disabled ? 'rgba(255,255,255,0.15)' : danger ? '#ff2d55' : color

  const hoverTextColor = disabled ? c : '#fff'
  const idleTextColor = c

  return (
    <button
      className={className}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        fontFamily: PF, fontSize: 8, letterSpacing: 2, padding: '12px 24px',
        border: `1px solid ${hov && !disabled ? c : c + '55'}`,
        background: hov && !disabled
          ? `linear-gradient(135deg, ${c}44, ${c}22)`
          : `linear-gradient(135deg, ${c}0e, transparent)`,
        color: hov && !disabled ? hoverTextColor : idleTextColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: pressed
          ? `0 0 12px ${c}33, inset 0 0 20px ${c}18`
          : hov && !disabled
            ? `0 0 24px ${c}55, 0 0 48px ${c}1a, inset 0 0 16px ${c}12`
            : `0 0 8px ${c}18`,
        transform: pressed ? 'scale(0.96) translateY(1px)' : hov && !disabled ? 'translateY(-2px)' : 'none',
        transition: 'all 0.14s ease', textTransform: 'uppercase',
        position: 'relative', opacity: disabled ? 0.35 : 1, overflow: 'hidden',
        textShadow: hov && !disabled ? `0 0 8px ${c}, 0 0 16px ${c}66` : 'none',
        animation: hov && !disabled ? 'retroFlicker 0.3s ease 1' : 'none',
        ...style,
      }}
    >
      {[['0','0'],['calc(100% - 3px)','0'],['0','calc(100% - 3px)'],['calc(100% - 3px)','calc(100% - 3px)']].map(([l,t],i) => (
        <span key={i} style={{ position:'absolute',left:l,top:t,width:3,height:3,background:c,display:'block',opacity:hov?1:0.5,transition:'opacity 0.15s' }} />
      ))}
      {hov && !disabled && (
        <span style={{ position:'absolute',inset:0,background:`linear-gradient(90deg,transparent 0%,${c}1a 50%,transparent 100%)`,backgroundSize:'200% 100%',animation:'shimmer 1s ease infinite',pointerEvents:'none' }} />
      )}
      {children}
    </button>
  )
}

export function StatCard({ label, value, color, icon }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex:1, minWidth:0, padding:'16px 14px 14px',
        border:`1px solid ${hov?color+'66':color+'25'}`,
        background:hov?`linear-gradient(135deg,${color}18,${color}06)`:`linear-gradient(135deg,${color}08,transparent)`,
        boxShadow:hov?`0 0 28px ${color}30,inset 0 0 20px ${color}0a`:'none',
        transition:'all 0.18s ease', position:'relative', overflow:'hidden',
        animation: hov ? 'retroBorderCycle 2.5s ease infinite' : 'none',
      }}
    >
      <div style={{ position:'absolute',top:0,left:0,width:12,height:1,background:color,opacity:hov?1:0.4,transition:'opacity 0.2s' }} />
      <div style={{ position:'absolute',top:0,left:0,width:1,height:12,background:color,opacity:hov?1:0.4,transition:'opacity 0.2s' }} />
      {/* Retro scanline on hover */}
      {hov && <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:1,opacity:0.03,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.4) 2px,rgba(255,255,255,0.4) 3px)',backgroundSize:'100% 4px' }} />}
      <div style={{ fontFamily:MF,fontSize:15,marginBottom:6,filter:hov?`drop-shadow(0 0 6px ${color})`:'none',transition:'filter 0.2s',animation:hov?'retroFlicker 0.4s ease 1':'none' }}>{icon}</div>
      <div style={{ fontFamily:PF,fontSize:15,color,textShadow:hov?`0 0 16px ${color}`:`0 0 6px ${color}66`,lineHeight:1 }}>{value}</div>
      <div style={{ fontFamily:MF,fontSize:9,color:'rgba(255,255,255,0.4)',marginTop:7,letterSpacing:1.5 }}>{label}</div>
    </div>
  )
}