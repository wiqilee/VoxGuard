/**
 * PixelParticles.jsx
 * ──────────────────
 * PS1-era retro game pixel art animations.
 * Not dots — actual pixel art sprites rendered via CSS box-shadow pixel technique.
 * Sprites include: shields, skulls, swords, lock icons, warning signs, scan lines.
 * Uses pure CSS animations with pixel-perfect rendering.
 */

import { useState, useEffect, useMemo } from 'react'

// ═══ PIXEL ART SPRITE DEFINITIONS ═══
// Each sprite is a grid of [row][col] = color or null
// Rendered via CSS box-shadow for crisp pixel art

const SPRITES = {
  shield: {
    width: 7, height: 8,
    pixels: [
      [0,0,1,1,1,0,0],
      [0,1,1,1,1,1,0],
      [1,1,1,2,1,1,1],
      [1,1,2,2,2,1,1],
      [1,1,1,2,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0],
      [0,0,0,1,0,0,0],
    ],
    palette: { 1: '#00d4ff', 2: '#fff' },
  },
  skull: {
    width: 7, height: 7,
    pixels: [
      [0,0,1,1,1,0,0],
      [0,1,1,1,1,1,0],
      [1,1,2,1,2,1,1],
      [1,1,1,1,1,1,1],
      [0,1,0,1,0,1,0],
      [0,0,1,1,1,0,0],
      [0,0,1,0,1,0,0],
    ],
    palette: { 1: '#ff2d55', 2: '#000' },
  },
  sword: {
    width: 5, height: 9,
    pixels: [
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,2,1,2,0],
      [0,0,2,0,0],
      [0,0,2,0,0],
      [0,0,1,0,0],
    ],
    palette: { 1: '#7b61ff', 2: '#ff9500' },
  },
  lock: {
    width: 7, height: 8,
    pixels: [
      [0,0,1,1,1,0,0],
      [0,1,0,0,0,1,0],
      [0,1,0,0,0,1,0],
      [1,1,1,1,1,1,1],
      [1,1,1,2,1,1,1],
      [1,1,2,2,2,1,1],
      [1,1,1,2,1,1,1],
      [1,1,1,1,1,1,1],
    ],
    palette: { 1: '#30d158', 2: '#ffd60a' },
  },
  warning: {
    width: 7, height: 7,
    pixels: [
      [0,0,0,1,0,0,0],
      [0,0,1,1,1,0,0],
      [0,1,1,2,1,1,0],
      [0,1,1,2,1,1,0],
      [1,1,1,1,1,1,1],
      [1,1,1,2,1,1,1],
      [1,1,1,1,1,1,1],
    ],
    palette: { 1: '#ffd60a', 2: '#000' },
  },
  heart: {
    width: 7, height: 6,
    pixels: [
      [0,1,0,0,0,1,0],
      [1,1,1,0,1,1,1],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0],
      [0,0,0,1,0,0,0],
    ],
    palette: { 1: '#ff2d55' },
  },
  star: {
    width: 7, height: 7,
    pixels: [
      [0,0,0,1,0,0,0],
      [0,0,0,1,0,0,0],
      [0,1,1,1,1,1,0],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,0,1,0,0],
      [0,1,0,0,0,1,0],
    ],
    palette: { 1: '#ffd60a' },
  },
  eye: {
    width: 9, height: 5,
    pixels: [
      [0,0,1,1,1,1,1,0,0],
      [0,1,1,2,2,2,1,1,0],
      [1,1,2,2,3,2,2,1,1],
      [0,1,1,2,2,2,1,1,0],
      [0,0,1,1,1,1,1,0,0],
    ],
    palette: { 1: '#00d4ff', 2: '#7b61ff', 3: '#fff' },
  },
  arrow: {
    width: 5, height: 7,
    pixels: [
      [0,0,1,0,0],
      [0,1,1,0,0],
      [1,1,1,1,1],
      [1,1,1,1,1],
      [0,1,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
    ],
    palette: { 1: '#30d158' },
  },
}

// Convert sprite to CSS box-shadow string
function spriteToShadow(sprite, pixelSize = 2, baseColor = null) {
  const shadows = []
  for (let y = 0; y < sprite.pixels.length; y++) {
    for (let x = 0; x < sprite.pixels[y].length; x++) {
      const val = sprite.pixels[y][x]
      if (val > 0) {
        const color = baseColor || sprite.palette[val] || '#fff'
        shadows.push(`${x * pixelSize}px ${y * pixelSize}px 0 ${color}`)
      }
    }
  }
  return shadows.join(',')
}

const PARTICLE_CSS = `
/* ═══ PS1 Retro Pixel Art Animations ═══ */
@keyframes px-float-up {
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  8%   { opacity: 0.9; }
  50%  { transform: translateY(-40px) scale(1.1); }
  92%  { opacity: 0.7; }
  100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
}
@keyframes px-float-diagonal {
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.8; }
  50%  { transform: translate(30px, -50px) rotate(15deg); }
  90%  { opacity: 0.5; }
  100% { transform: translate(60px, -100px) rotate(30deg); opacity: 0; }
}
@keyframes px-drift-lr {
  0%   { transform: translateX(0) scaleX(1); opacity: 0; }
  10%  { opacity: 0.7; }
  25%  { transform: translateX(20px) scaleX(1.05); }
  50%  { transform: translateX(-10px) scaleX(0.95); }
  75%  { transform: translateX(15px) scaleX(1); }
  90%  { opacity: 0.4; }
  100% { transform: translateX(0) scaleX(1); opacity: 0; }
}
@keyframes px-pulse-glow {
  0%, 100% { filter: brightness(0.6) drop-shadow(0 0 0px transparent); opacity: 0.4; }
  50%      { filter: brightness(1.4) drop-shadow(0 0 4px currentColor); opacity: 1; }
}
@keyframes px-spawn {
  0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
  30%  { transform: scale(1.3) rotate(0deg); opacity: 1; }
  50%  { transform: scale(0.9); }
  70%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 0.8; }
}
@keyframes px-glitch {
  0%, 100% { transform: translate(0); filter: none; }
  20%      { transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
  40%      { transform: translate(1px, -1px); filter: hue-rotate(180deg); }
  60%      { transform: translate(-1px, 2px); filter: hue-rotate(270deg); }
  80%      { transform: translate(2px, -2px); filter: hue-rotate(0deg); }
}
@keyframes px-bounce {
  0%, 100% { transform: translateY(0); }
  30%      { transform: translateY(-8px); }
  50%      { transform: translateY(0); }
  70%      { transform: translateY(-4px); }
}
@keyframes px-scanline {
  0%   { top: -2px; opacity: 0.15; }
  100% { top: 100%; opacity: 0.05; }
}
/* Retro CRT scanline overlay */
.px-scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.04) 1px,
    rgba(0, 0, 0, 0.04) 2px
  );
  pointer-events: none;
}
`

const SPRITE_KEYS = Object.keys(SPRITES)
const HEADER_SPRITES = ['shield', 'star', 'eye', 'lock', 'arrow']
const THREAT_SPRITES = {
  safe: ['shield', 'lock', 'star', 'eye', 'arrow', 'heart'],
  high: ['warning', 'skull', 'sword', 'eye', 'shield', 'star'],
  critical: ['skull', 'warning', 'sword', 'skull', 'eye', 'warning'],
}

const ANIMS = ['px-float-up', 'px-float-diagonal', 'px-drift-lr', 'px-pulse-glow', 'px-bounce', 'px-glitch']

function rand(a, b) { return a + Math.random() * (b - a) }

/**
 * PixelSprite — renders a single pixel art sprite via box-shadow
 */
function PixelSprite({ sprite, x, y, scale = 1, animation, duration, delay, opacity = 0.8, colorOverride = null }) {
  const px = Math.round(2 * scale)
  const shadow = useMemo(() => spriteToShadow(sprite, px, colorOverride), [sprite, px, colorOverride])

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: px,
      height: px,
      background: 'transparent',
      boxShadow: shadow,
      animation: `${animation} ${duration}s ease-in-out ${delay}s infinite`,
      opacity: 0,
      imageRendering: 'pixelated',
      willChange: 'transform, opacity',
    }} />
  )
}

/**
 * HeaderPixels — PS1-style pixel sprites for the marquee/header area
 * Small sprites floating subtly alongside scrolling text
 */
export function HeaderPixels({ active = true, count = 8 }) {
  const particles = useMemo(() => {
    if (!active) return []
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      sprite: SPRITES[HEADER_SPRITES[i % HEADER_SPRITES.length]],
      x: rand(3, 97),
      y: rand(10, 85),
      scale: rand(0.6, 1.0),
      anim: ANIMS[i % ANIMS.length],
      dur: rand(4, 10),
      delay: rand(0, 6),
    }))
  }, [active, count])

  if (!active || particles.length === 0) return null

  return (
    <div className="px-scanlines" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      <style>{PARTICLE_CSS}</style>
      {particles.map(p => (
        <PixelSprite
          key={p.id}
          sprite={p.sprite}
          x={p.x} y={p.y}
          scale={p.scale}
          animation={p.anim}
          duration={p.dur}
          delay={p.delay}
        />
      ))}
    </div>
  )
}

/**
 * MonitorPixels — PS1-style pixel sprites for the LIVE SESSION MONITOR
 * More dramatic sprites, changes based on threat level
 * Includes CRT scanline overlay for retro feel
 */
export function MonitorPixels({ active = true, threatLevel = 'safe', count = 14 }) {
  const sprites = THREAT_SPRITES[threatLevel] || THREAT_SPRITES.safe

  const threatColorOverrides = {
    safe: null,
    high: null,
    critical: '#ff2d55',
  }

  const particles = useMemo(() => {
    if (!active) return []
    return Array.from({ length: count }, (_, i) => {
      const spriteKey = sprites[i % sprites.length]
      return {
        id: i,
        sprite: SPRITES[spriteKey],
        x: rand(2, 96),
        y: rand(3, 95),
        scale: rand(0.7, 1.4),
        anim: ANIMS[i % ANIMS.length],
        dur: rand(3, 9),
        delay: rand(0, 5),
        colorOverride: threatLevel === 'critical' && i % 3 === 0 ? '#ff2d55' : null,
      }
    })
  }, [active, threatLevel, count])

  if (!active || particles.length === 0) return null

  return (
    <div className="px-scanlines" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      <style>{PARTICLE_CSS}</style>

      {/* Moving scanline bar (PS1 CRT effect) */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: 2,
        background: threatLevel === 'critical'
          ? 'linear-gradient(90deg, transparent, rgba(255,45,85,0.12), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(0,212,255,0.08), transparent)',
        animation: 'px-scanline 4s linear infinite',
        pointerEvents: 'none',
      }} />

      {particles.map(p => (
        <PixelSprite
          key={p.id}
          sprite={p.sprite}
          x={p.x} y={p.y}
          scale={p.scale}
          animation={p.anim}
          duration={p.dur}
          delay={p.delay}
          colorOverride={p.colorOverride}
        />
      ))}
    </div>
  )
}

export default { HeaderPixels, MonitorPixels }
