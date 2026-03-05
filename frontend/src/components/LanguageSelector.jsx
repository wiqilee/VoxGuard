import { useState, useRef, useEffect } from 'react'
import { SUPPORTED_LANGUAGES, LANGUAGE_STATS } from './constants-multilang'

const MF = "'Share Tech Mono', 'Courier New', monospace"
const PF = "'Press Start 2P', monospace"

// Tier badge colors
const TIER_COLOR = { 1:'#ff2d55', 2:'#ff9500', 3:'#30d158' }

export function LanguageSelector({ value = 'en', onChange }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const current = SUPPORTED_LANGUAGES.find(l => l.code === value) || SUPPORTED_LANGUAGES[0]

  // Filter by search
  const filtered = SUPPORTED_LANGUAGES.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  )

  // Group by tier
  const byTier = [1,2,3].map(t => ({
    tier: t,
    langs: filtered.filter(l => l.tier === t),
  })).filter(g => g.langs.length > 0)

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position:'relative', flexShrink:0 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'7px 12px',
          fontFamily:MF, fontSize:11,
          color: open ? '#00d4ff' : 'rgba(255,255,255,0.75)',
          background: open ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)',
          border:`1px solid ${open ? '#00d4ff55' : 'rgba(255,255,255,0.12)'}`,
          transition:'all 0.15s ease',
          whiteSpace:'nowrap',
        }}>
        <span style={{ fontSize:14 }}>{current.flag}</span>
        <span style={{ color: open ? '#00d4ff' : 'rgba(255,255,255,0.65)' }}>{current.code.toUpperCase()}</span>
        <span style={{
          fontFamily:PF, fontSize:5,
          color: open ? '#00d4ff' : 'rgba(255,255,255,0.35)',
          marginLeft:2,
          transition:'transform 0.15s',
          display:'inline-block',
          transform: open ? 'rotate(180deg)' : 'none',
        }}>▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right:0,
          width:280, maxHeight:400, overflowY:'auto',
          background:'#07080f',
          border:'1px solid rgba(0,212,255,0.2)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(0,212,255,0.06)',
          zIndex:999,
        }}>
          {/* Header */}
          <div style={{ padding:'10px 12px', borderBottom:'1px solid rgba(0,212,255,0.1)', background:'rgba(0,212,255,0.04)' }}>
            <div style={{ fontFamily:PF, fontSize:6, color:'#00d4ff', marginBottom:8, letterSpacing:1 }}>
              🌐 LANGUAGE — {LANGUAGE_STATS.total} SUPPORTED
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search language..."
              autoFocus
              style={{
                width:'100%', padding:'6px 10px',
                background:'rgba(0,212,255,0.06)',
                border:'1px solid rgba(0,212,255,0.2)',
                color:'#e0e0e0', fontFamily:MF, fontSize:10,
                outline:'none',
              }}
            />
            <div style={{ fontFamily:MF, fontSize:8, color:'rgba(255,255,255,0.3)', marginTop:6 }}>
              {LANGUAGE_STATS.regionalVariants} regional scam variants · {LANGUAGE_STATS.total} languages
            </div>
          </div>

          {/* Language list grouped by tier */}
          {byTier.map(({ tier, langs }) => (
            <div key={tier}>
              <div style={{
                padding:'6px 12px',
                fontFamily:PF, fontSize:5,
                color:TIER_COLOR[tier],
                background:'rgba(0,0,0,0.3)',
                letterSpacing:1,
                borderTop:'1px solid rgba(255,255,255,0.04)',
              }}>
                TIER {tier} — {tier===1?'HIGH PRIORITY':tier===2?'ACTIVE REGIONS':'EXTENDED'}
              </div>
              {langs.map(lang => {
                const isActive = lang.code === value
                return (
                  <button key={lang.code}
                    onClick={() => { onChange(lang.code); setOpen(false); setSearch('') }}
                    style={{
                      display:'flex', alignItems:'center', gap:10,
                      width:'100%', padding:'8px 14px',
                      background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                      border:'none',
                      borderLeft:`2px solid ${isActive ? '#00d4ff' : 'transparent'}`,
                      color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.7)',
                      textAlign:'left',
                      transition:'all 0.1s',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.9)' }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.7)' }}}>
                    <span style={{ fontSize:16, flexShrink:0 }}>{lang.flag}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:MF, fontSize:10 }}>{lang.native}</div>
                      <div style={{ fontFamily:MF, fontSize:8, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{lang.name} · {lang.code}</div>
                    </div>
                    {isActive && <span style={{ fontFamily:PF, fontSize:5, color:'#00d4ff', flexShrink:0 }}>✓</span>}
                  </button>
                )
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding:'20px', textAlign:'center', fontFamily:MF, fontSize:10, color:'rgba(255,255,255,0.3)' }}>
              No language found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
