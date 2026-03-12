/**
 * PixelParticles.jsx
 * ──────────────────
 * Premium retro-cyberpunk floating particle system.
 * 
 * Features:
 * - Multi-layer depth particles (foreground, mid, background)
 * - Holographic grid pulse on threat escalation
 * - Floating "data fragments" — tiny code/hex snippets
 * - Constellation lines connecting nearby particles
 * - Threat-reactive color shifting with smooth transitions
 * - CRT scanline + phosphor glow overlay
 * - Zero canvas — pure CSS + minimal DOM
 * 
 * Drop-in replacement for the original PixelParticles.jsx
 */

import { useState, useEffect, useMemo, useRef } from 'react'

/* ── CSS Animations ── */
const PARTICLE_CSS = `
/* ── Base particle animations ── */
@keyframes pp-rise {
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  8%   { opacity: var(--pp-peak, 0.6); }
  50%  { transform: translateY(-40px) scale(1.15); opacity: calc(var(--pp-peak, 0.6) * 0.7); }
  100% { transform: translateY(-80px) scale(0.6); opacity: 0; }
}
@keyframes pp-drift {
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10%  { opacity: var(--pp-peak, 0.5); }
  50%  { transform: translate(25px, -20px) rotate(45deg); opacity: calc(var(--pp-peak, 0.5) * 0.65); }
  100% { transform: translate(50px, -40px) rotate(90deg); opacity: 0; }
}
@keyframes pp-pulse {
  0%, 100% { opacity: 0.15; box-shadow: 0 0 2px currentColor; transform: scale(1); }
  50%      { opacity: var(--pp-peak, 0.7); box-shadow: 0 0 8px currentColor, 0 0 16px currentColor; transform: scale(1.3); }
}
@keyframes pp-blink {
  0%, 100% { opacity: 0; }
  15%      { opacity: var(--pp-peak, 0.8); }
  25%      { opacity: 0.1; }
  35%      { opacity: var(--pp-peak, 0.6); }
  85%      { opacity: calc(var(--pp-peak, 0.6) * 0.8); }
}
@keyframes pp-orbit {
  0%   { transform: translate(0, 0) rotate(0deg); }
  25%  { transform: translate(8px, -6px) rotate(90deg); }
  50%  { transform: translate(-4px, -12px) rotate(180deg); }
  75%  { transform: translate(6px, -3px) rotate(270deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}
@keyframes pp-glitch {
  0%, 100% { transform: translate(0, 0); opacity: var(--pp-peak, 0.5); }
  10% { transform: translate(-2px, 1px); opacity: 0.8; }
  20% { transform: translate(2px, -1px); opacity: 0.2; }
  30% { transform: translate(0, 0); opacity: var(--pp-peak, 0.5); }
  70% { transform: translate(1px, 0); opacity: var(--pp-peak, 0.5); }
  72% { transform: translate(-3px, 2px); opacity: 0.9; }
  74% { transform: translate(0, 0); opacity: var(--pp-peak, 0.5); }
}
@keyframes pp-float {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
}

/* ── CRT scanline ── */
@keyframes pp-scan {
  0%   { top: -2px; }
  100% { top: 100%; }
}

/* ── Holographic grid pulse ── */
@keyframes pp-grid-pulse {
  0%, 100% { opacity: 0.02; }
  50%      { opacity: 0.06; }
}
@keyframes pp-grid-pulse-threat {
  0%, 100% { opacity: 0.03; }
  50%      { opacity: 0.12; }
}

/* ── Data fragment float ── */
@keyframes pp-data-float {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  10%  { opacity: 0.4; }
  50%  { transform: translateY(-30px) translateX(10px); opacity: 0.25; }
  100% { transform: translateY(-60px) translateX(-5px); opacity: 0; }
}

/* ── Constellation line shimmer ── */
@keyframes pp-line-shimmer {
  0%, 100% { opacity: 0.06; }
  50%      { opacity: 0.18; }
}

/* ── Corner accent pulse ── */
@keyframes pp-corner-glow {
  0%, 100% { opacity: 0.3; box-shadow: none; }
  50%      { opacity: 0.8; box-shadow: 0 0 6px var(--pp-accent, #00d4ff); }
}
`

/* ── Color Palettes ── */
const COLORS = {
  safe: {
    primary: ['#00d4ff', '#7b61ff', '#30d158', '#4aeaff'],
    accent: '#00d4ff',
    grid: 'rgba(0,212,255,0.04)',
    scan: 'rgba(0,212,255,0.04)',
    glow: 'rgba(0,212,255,0.02)',
  },
  high: {
    primary: ['#ff9500', '#ffd60a', '#00d4ff', '#ff9500'],
    accent: '#ff9500',
    grid: 'rgba(255,149,0,0.05)',
    scan: 'rgba(255,149,0,0.06)',
    glow: 'rgba(255,149,0,0.03)',
  },
  critical: {
    primary: ['#ff2d55', '#ff9500', '#ffd60a', '#ff2d55'],
    accent: '#ff2d55',
    grid: 'rgba(255,45,85,0.06)',
    scan: 'rgba(255,45,85,0.08)',
    glow: 'rgba(255,45,85,0.04)',
  },
}

const HEADER_COLORS = ['#00d4ff', '#7b61ff', '#30d158', '#ff9500', '#4aeaff', '#ffd60a']
const ANIMS = ['pp-rise', 'pp-drift', 'pp-pulse', 'pp-blink', 'pp-orbit', 'pp-glitch']
const DATA_FRAGMENTS = ['0x4F', 'FF', '△', '◇', '▪', ':::', '>>>', '◈', '⬡', '0b1', '■□', '※', '⊿', '≡']

function rand(a, b) { return a + Math.random() * (b - a) }
function randInt(a, b) { return Math.floor(rand(a, b)) }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

/* ── Constellation Lines (SVG) ── */
function ConstellationLines({ particles, color, opacity = 0.08 }) {
  if (!particles || particles.length < 3) return null
  const lines = []
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 22 && lines.length < 6) {
        lines.push({ x1: particles[i].x, y1: particles[i].y, x2: particles[j].x, y2: particles[j].y, d: dist })
      }
    }
  }
  if (lines.length === 0) return null
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {lines.map((l, i) => (
        <line key={i}
          x1={`${l.x1}%`} y1={`${l.y1}%`}
          x2={`${l.x2}%`} y2={`${l.y2}%`}
          stroke={color}
          strokeWidth="0.5"
          strokeDasharray="2 3"
          opacity={opacity * (1 - l.d / 22)}
          style={{ animation: `pp-line-shimmer ${rand(3, 6)}s ease-in-out infinite` }}
        />
      ))}
    </svg>
  )
}

/* ── Holographic Grid Background ── */
function HoloGrid({ color, threat = false }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: `
        linear-gradient(${color} 1px, transparent 1px),
        linear-gradient(90deg, ${color} 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      animation: threat ? 'pp-grid-pulse-threat 3s ease-in-out infinite' : 'pp-grid-pulse 5s ease-in-out infinite',
      maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
    }} />
  )
}

/* ── Corner Accent Markers ── */
function CornerAccents({ color }) {
  const style = (pos) => ({
    position: 'absolute', ...pos,
    width: 3, height: 3,
    background: color,
    animation: `pp-corner-glow ${rand(2, 4)}s ease-in-out infinite`,
    '--pp-accent': color,
  })
  return <>
    <div style={style({ top: 4, left: 4 })} />
    <div style={style({ top: 4, right: 4 })} />
    <div style={style({ bottom: 4, left: 4 })} />
    <div style={style({ bottom: 4, right: 4 })} />
  </>
}

/* ═══════════════════════════════════════
   HeaderPixels — Premium header particles
   ═══════════════════════════════════════ */
export function HeaderPixels({ active = true, count = 10 }) {
  const particles = useMemo(() => {
    if (!active) return []
    return Array.from({ length: count }, (_, i) => {
      const layer = i < 3 ? 'far' : i < 7 ? 'mid' : 'near'
      const sizeMap = { far: randInt(1, 2), mid: randInt(2, 3), near: randInt(3, 5) }
      const opMap = { far: 0.3, mid: 0.5, near: 0.7 }
      return {
        id: i, layer,
        x: rand(2, 98),
        y: rand(8, 88),
        size: sizeMap[layer],
        peakOp: opMap[layer],
        color: HEADER_COLORS[i % HEADER_COLORS.length],
        anim: ANIMS[i % ANIMS.length],
        dur: rand(4, 12),
        delay: rand(0, 6),
      }
    })
  }, [active, count])

  if (!active || particles.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      <style>{PARTICLE_CSS}</style>
      <ConstellationLines particles={particles} color="#7b61ff" opacity={0.06} />
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: p.color,
          color: p.color,
          '--pp-peak': String(p.peakOp),
          boxShadow: `0 0 ${p.size + 2}px ${p.color}55`,
          animation: `${p.anim} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          opacity: 0,
          imageRendering: 'pixelated',
          transition: 'background 0.8s ease, box-shadow 0.8s ease',
        }} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════
   MonitorPixels — Premium monitor particles
   with threat-reactive effects
   ═══════════════════════════════════════ */
export function MonitorPixels({ active = true, threatLevel = 'safe', count = 16 }) {
  const palette = COLORS[threatLevel] || COLORS.safe
  const isThreat = threatLevel === 'high' || threatLevel === 'critical'

  /* ── Main particles with depth layers ── */
  const particles = useMemo(() => {
    if (!active) return []
    return Array.from({ length: count }, (_, i) => {
      const layer = i < 4 ? 'far' : i < 10 ? 'mid' : 'near'
      const sizeMap = { far: randInt(1, 2), mid: randInt(2, 4), near: randInt(3, 5) }
      const opMap = { far: 0.25, mid: 0.45, near: 0.65 }
      const speedMap = { far: rand(7, 14), mid: rand(4, 9), near: rand(3, 7) }
      return {
        id: i, layer,
        x: rand(2, 98),
        y: rand(3, 95),
        size: sizeMap[layer],
        peakOp: opMap[layer],
        color: palette.primary[i % palette.primary.length],
        anim: ANIMS[i % ANIMS.length],
        dur: speedMap[layer],
        delay: rand(0, 5),
      }
    })
  }, [active, threatLevel, count])

  /* ── Floating data fragments ── */
  const fragments = useMemo(() => {
    if (!active) return []
    return Array.from({ length: 4 }, (_, i) => ({
      id: `frag-${i}`,
      x: rand(5, 92),
      y: rand(15, 85),
      text: pick(DATA_FRAGMENTS),
      color: palette.primary[i % palette.primary.length],
      dur: rand(6, 14),
      delay: rand(0, 8),
    }))
  }, [active, threatLevel])

  if (!active || particles.length === 0) return null

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1,
      transition: 'all 0.6s ease',
    }}>
      <style>{PARTICLE_CSS}</style>

      {/* Layer 0: Holographic grid */}
      <HoloGrid color={palette.grid} threat={isThreat} />

      {/* Layer 1: Constellation lines */}
      <ConstellationLines particles={particles} color={palette.accent} opacity={isThreat ? 0.12 : 0.06} />

      {/* Layer 2: Corner accents */}
      <CornerAccents color={palette.accent} />

      {/* Layer 3: CRT scanline */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: isThreat ? 2 : 1,
        background: `linear-gradient(90deg, transparent, ${palette.scan}, transparent)`,
        animation: `pp-scan ${isThreat ? 3 : 6}s linear infinite`,
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Layer 4: Phosphor glow (bottom edge) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: `linear-gradient(to top, ${palette.glow}, transparent)`,
        pointerEvents: 'none', zIndex: 0,
        transition: 'background 0.8s ease',
      }} />

      {/* Layer 5: Main particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: p.color,
          color: p.color,
          '--pp-peak': String(p.peakOp),
          boxShadow: p.layer === 'near'
            ? `0 0 ${p.size + 3}px ${p.color}66, 0 0 ${p.size * 3}px ${p.color}22`
            : `0 0 ${p.size + 1}px ${p.color}44`,
          animation: `${p.anim} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          opacity: 0,
          imageRendering: 'pixelated',
          transition: 'background 0.6s ease, box-shadow 0.6s ease',
          zIndex: p.layer === 'near' ? 3 : p.layer === 'mid' ? 2 : 1,
        }} />
      ))}

      {/* Layer 6: Floating data fragments */}
      {fragments.map(f => (
        <div key={f.id} style={{
          position: 'absolute',
          left: `${f.x}%`,
          top: `${f.y}%`,
          fontFamily: "'Courier New', monospace",
          fontSize: 7,
          color: f.color,
          opacity: 0,
          letterSpacing: 1,
          textShadow: `0 0 4px ${f.color}66`,
          animation: `pp-data-float ${f.dur}s ease-in-out ${f.delay}s infinite`,
          pointerEvents: 'none',
          zIndex: 2,
          imageRendering: 'pixelated',
        }}>
          {f.text}
        </div>
      ))}
    </div>
  )
}

export default { HeaderPixels, MonitorPixels }
