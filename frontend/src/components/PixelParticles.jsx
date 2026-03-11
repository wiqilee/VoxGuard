/**
 * PixelParticles.jsx
 * ──────────────────
 * Animated pixel particles that float across the header and monitor areas.
 * Uses pure CSS animations for performance — no canvas needed.
 * Pixel-art aesthetic matching VoxGuard's retro-futuristic theme.
 */

import { useState, useEffect, useRef } from 'react'

const PARTICLE_CSS = `
@keyframes pp-float-1 { 0%{transform:translate(0,0) scale(1);opacity:0} 10%{opacity:0.8} 90%{opacity:0.6} 100%{transform:translate(120px,-20px) scale(0.6);opacity:0} }
@keyframes pp-float-2 { 0%{transform:translate(0,0) scale(0.8);opacity:0} 15%{opacity:0.7} 85%{opacity:0.5} 100%{transform:translate(-80px,-30px) scale(1.2);opacity:0} }
@keyframes pp-float-3 { 0%{transform:translate(0,0) scale(1.1);opacity:0} 12%{opacity:0.6} 88%{opacity:0.4} 100%{transform:translate(60px,15px) scale(0.5);opacity:0} }
@keyframes pp-drift { 0%{transform:translateX(0)} 50%{transform:translateX(8px)} 100%{transform:translateX(0)} }
@keyframes pp-pulse { 0%,100%{opacity:0.3;box-shadow:0 0 2px currentColor} 50%{opacity:0.8;box-shadow:0 0 6px currentColor,0 0 12px currentColor} }
@keyframes pp-sparkle { 0%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1.2)} 100%{opacity:0;transform:scale(0)} }
@keyframes pp-trail { 0%{width:2px;opacity:0.8} 100%{width:20px;opacity:0} }
`

const COLORS = ['#00d4ff', '#7b61ff', '#30d158', '#ff9500', '#ff2d55', '#ffd60a', '#4aeaff', '#a78bfa']

function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)] }
function randomBetween(a, b) { return a + Math.random() * (b - a) }

/**
 * HeaderPixels — scattered pixel particles for the marquee/header area
 * Light, subtle, floats alongside the scrolling text
 */
export function HeaderPixels({ active = true, count = 12 }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!active) { setParticles([]); return }
    const ps = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(5, 95),
      y: randomBetween(10, 90),
      size: randomBetween(2, 4),
      color: randomColor(),
      dur: randomBetween(3, 8),
      delay: randomBetween(0, 5),
      anim: ['pp-float-1', 'pp-float-2', 'pp-float-3'][i % 3],
    }))
    setParticles(ps)
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
          boxShadow: `0 0 ${p.size + 2}px ${p.color}`,
          animation: `${p.anim} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          opacity: 0,
        }} />
      ))}
    </div>
  )
}

/**
 * MonitorPixels — larger pixel cluster for the LIVE SESSION MONITOR area
 * More dramatic, pulsing particles with trails
 */
export function MonitorPixels({ active = true, threatLevel = 'safe', count = 20 }) {
  const [particles, setParticles] = useState([])
  const frameRef = useRef(0)

  const threatColors = {
    safe: ['#00d4ff', '#30d158', '#4aeaff', '#7b61ff'],
    high: ['#ff9500', '#ffd60a', '#ff9500', '#00d4ff'],
    critical: ['#ff2d55', '#ff9500', '#ff2d55', '#ffd60a'],
  }
  const colors = threatColors[threatLevel] || threatColors.safe

  useEffect(() => {
    if (!active) { setParticles([]); return }
    const ps = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(2, 98),
      y: randomBetween(5, 95),
      size: randomBetween(2, 5),
      color: colors[i % colors.length],
      dur: randomBetween(2, 7),
      delay: randomBetween(0, 4),
      type: i % 4, // 0=float, 1=pulse, 2=sparkle, 3=drift
    }))
    setParticles(ps)
  }, [active, threatLevel, count])

  if (!active || particles.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      <style>{PARTICLE_CSS}</style>
      {particles.map(p => {
        const animName = p.type === 0 ? 'pp-float-1'
          : p.type === 1 ? 'pp-pulse'
          : p.type === 2 ? 'pp-sparkle'
          : 'pp-drift'
        return (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            color: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}`,
            animation: `${animName} ${p.dur}s ease-in-out ${p.delay}s infinite`,
            opacity: p.type === 1 ? 0.3 : 0,
          }} />
        )
      })}
    </div>
  )
}

export default { HeaderPixels, MonitorPixels }
