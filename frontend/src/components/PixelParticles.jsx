/**
 * PixelParticles.jsx
 * ──────────────────
 * Retro game-inspired floating pixel particles.
 * Small glowing squares (not circles) that float, pulse, and drift.
 * PS1-era aesthetic: pixelated, low-res feel with scanline overlay.
 * Pure CSS animations — no canvas, no ugly sprites.
 */

import { useState, useEffect, useMemo } from 'react'

const PARTICLE_CSS = `
@keyframes pp-rise {
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  8%   { opacity: 0.7; }
  50%  { transform: translateY(-30px) scale(1.1); opacity: 0.5; }
  100% { transform: translateY(-60px) scale(0.7); opacity: 0; }
}
@keyframes pp-drift {
  0%   { transform: translate(0, 0); opacity: 0; }
  10%  { opacity: 0.6; }
  50%  { transform: translate(20px, -15px); opacity: 0.4; }
  100% { transform: translate(40px, -30px); opacity: 0; }
}
@keyframes pp-pulse {
  0%, 100% { opacity: 0.2; box-shadow: 0 0 2px currentColor; }
  50%      { opacity: 0.7; box-shadow: 0 0 6px currentColor, 0 0 10px currentColor; }
}
@keyframes pp-blink {
  0%, 100% { opacity: 0; }
  20%      { opacity: 0.8; }
  80%      { opacity: 0.6; }
}
@keyframes pp-wander {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(6px, -4px); }
  50%  { transform: translate(-3px, -8px); }
  75%  { transform: translate(4px, -2px); }
  100% { transform: translate(0, 0); }
}
@keyframes pp-scan {
  0%   { top: -2px; }
  100% { top: 100%; }
}
`

const COLORS = {
  safe: ['#00d4ff', '#7b61ff', '#30d158', '#4aeaff', '#00d4ff', '#7b61ff'],
  high: ['#ff9500', '#ffd60a', '#ff9500', '#00d4ff', '#ff9500', '#ffd60a'],
  critical: ['#ff2d55', '#ff9500', '#ff2d55', '#ffd60a', '#ff2d55', '#ff9500'],
}
const HEADER_COLORS = ['#00d4ff', '#7b61ff', '#30d158', '#ff9500', '#4aeaff', '#ffd60a']
const ANIMS = ['pp-rise', 'pp-drift', 'pp-pulse', 'pp-blink', 'pp-wander']

function rand(a, b) { return a + Math.random() * (b - a) }

/**
 * HeaderPixels — subtle floating pixel squares for the header/marquee area
 */
export function HeaderPixels({ active = true, count = 8 }) {
  const particles = useMemo(() => {
    if (!active) return []
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand(3, 97),
      y: rand(10, 85),
      size: Math.floor(rand(2, 4)),
      color: HEADER_COLORS[i % HEADER_COLORS.length],
      anim: ANIMS[i % ANIMS.length],
      dur: rand(4, 10),
      delay: rand(0, 6),
    }))
  }, [active, count])

  if (!active || particles.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      <style>{PARTICLE_CSS}</style>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: p.color,
          color: p.color,
          boxShadow: `0 0 ${p.size + 1}px ${p.color}66`,
          animation: `${p.anim} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          opacity: 0,
          imageRendering: 'pixelated',
        }} />
      ))}
    </div>
  )
}

/**
 * MonitorPixels — floating pixel squares for LIVE SESSION MONITOR
 * Changes color palette based on threat level
 * Includes subtle CRT scanline overlay
 */
export function MonitorPixels({ active = true, threatLevel = 'safe', count = 14 }) {
  const colors = COLORS[threatLevel] || COLORS.safe

  const particles = useMemo(() => {
    if (!active) return []
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand(2, 98),
      y: rand(3, 95),
      size: Math.floor(rand(2, 5)),
      color: colors[i % colors.length],
      anim: ANIMS[i % ANIMS.length],
      dur: rand(3, 9),
      delay: rand(0, 5),
    }))
  }, [active, threatLevel, count])

  if (!active || particles.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      <style>{PARTICLE_CSS}</style>

      {/* CRT scanline bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: threatLevel === 'critical'
          ? 'linear-gradient(90deg, transparent, rgba(255,45,85,0.08), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(0,212,255,0.05), transparent)',
        animation: 'pp-scan 5s linear infinite',
        pointerEvents: 'none',
      }} />

      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: p.color,
          color: p.color,
          boxShadow: `0 0 ${p.size + 2}px ${p.color}55`,
          animation: `${p.anim} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          opacity: 0,
          imageRendering: 'pixelated',
        }} />
      ))}
    </div>
  )
}

export default { HeaderPixels, MonitorPixels }
