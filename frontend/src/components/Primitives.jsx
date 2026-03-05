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
        ...style,
      }}
    >
      {/* Top-left L corner */}
      <div style={{ position:'absolute',top:-1,left:-1,width:18,height:18,pointerEvents:'none',zIndex:2 }}>
        <div style={{ position:'absolute',top:0,left:0,width:18,height:2,background:hov?color:color+'99',transition:'background 0.2s',boxShadow:hov?`0 0 6px ${color}`:'' }} />
        <div style={{ position:'absolute',top:0,left:0,width:2,height:18,background:hov?color:color+'99',transition:'background 0.2s',boxShadow:hov?`0 0 6px ${color}`:'' }} />
      </div>
      {/* Bottom-right L corner */}
      <div style={{ position:'absolute',bottom:-1,right:-1,width:18,height:18,pointerEvents:'none',zIndex:2 }}>
        <div style={{ position:'absolute',bottom:0,right:0,width:18,height:2,background:hov?color:color+'99',transition:'background 0.2s',boxShadow:hov?`0 0 6px ${color}`:'' }} />
        <div style={{ position:'absolute',bottom:0,right:0,width:2,height:18,background:hov?color:color+'99',transition:'background 0.2s',boxShadow:hov?`0 0 6px ${color}`:'' }} />
      </div>
      {/* Corner dots */}
      <div style={{ position:'absolute',top:-1,right:-1,width:5,height:5,background:hov?color+'bb':color+'44',transition:'background 0.2s',zIndex:2 }} />
      <div style={{ position:'absolute',bottom:-1,left:-1,width:5,height:5,background:hov?color+'bb':color+'44',transition:'background 0.2s',zIndex:2 }} />
      {children}
    </div>
  )
}

export function PBtn({ children, onClick, color = '#00d4ff', danger = false, disabled = false, style = {} }) {
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)
  const c = disabled ? 'rgba(255,255,255,0.15)' : danger ? '#ff2d55' : color

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        fontFamily: PF, fontSize: 7, letterSpacing: 1.5, padding: '10px 20px',
        border: `1px solid ${hov && !disabled ? c : c + '55'}`,
        background: hov && !disabled ? `linear-gradient(135deg, ${c}28, ${c}0c)` : `linear-gradient(135deg, ${c}0e, transparent)`,
        color: c, cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: hov && !disabled ? `0 0 24px ${c}55, 0 0 48px ${c}1a, inset 0 0 16px ${c}12` : `0 0 8px ${c}18`,
        transform: pressed ? 'scale(0.96) translateY(1px)' : hov && !disabled ? 'translateY(-2px)' : 'none',
        transition: 'all 0.14s ease', textTransform: 'uppercase',
        position: 'relative', opacity: disabled ? 0.35 : 1, overflow: 'hidden',
        ...style,
      }}
    >
      {/* Pixel corners */}
      {[['0','0'],['calc(100% - 3px)','0'],['0','calc(100% - 3px)'],['calc(100% - 3px)','calc(100% - 3px)']].map(([l,t],i) => (
        <span key={i} style={{ position:'absolute',left:l,top:t,width:3,height:3,background:c,display:'block',opacity:hov?1:0.5,transition:'opacity 0.15s' }} />
      ))}
      {/* Shimmer */}
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
        flex:1, minWidth:0, padding:'14px 12px 12px',
        border:`1px solid ${hov?color+'66':color+'20'}`,
        background:hov?`linear-gradient(135deg,${color}18,${color}06)`:`linear-gradient(135deg,${color}07,transparent)`,
        boxShadow:hov?`0 0 24px ${color}28,inset 0 0 18px ${color}0a`:'none',
        transition:'all 0.18s ease', position:'relative', overflow:'hidden',
      }}
    >
      <div style={{ position:'absolute',top:0,left:0,width:10,height:1,background:color,opacity:hov?1:0.35,transition:'opacity 0.2s' }} />
      <div style={{ position:'absolute',top:0,left:0,width:1,height:10,background:color,opacity:hov?1:0.35,transition:'opacity 0.2s' }} />
      <div style={{ fontFamily:MF,fontSize:14,marginBottom:5,filter:hov?`drop-shadow(0 0 4px ${color})`:'none',transition:'filter 0.2s' }}>{icon}</div>
      <div style={{ fontFamily:PF,fontSize:14,color,textShadow:hov?`0 0 16px ${color}`:`0 0 6px ${color}66`,lineHeight:1 }}>{value}</div>
      <div style={{ fontFamily:MF,fontSize:8,color:'rgba(255,255,255,0.35)',marginTop:6,letterSpacing:1 }}>{label}</div>
    </div>
  )
}
