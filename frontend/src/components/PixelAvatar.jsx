/**
 * PixelAvatar.jsx
 * ───────────────
 * 3D voxel-style human head/bust for caller visualization.
 * 
 * Features:
 * - Pixel-grid face with pseudo-3D depth via shadows + transforms
 * - Speaking animation (mouth moves, glow pulses)
 * - Threat-reactive: safe=cyan, high=orange, critical=red
 * - Idle breathing animation
 * - CRT phosphor glow on the face
 * - Pure CSS — no canvas, no Three.js, zero dependencies
 * 
 * Usage: <PixelAvatar speaking={bool} threatLevel="safe|high|critical" mode="phone|zoom" />
 */

import { useState, useEffect, useMemo } from 'react'

const AVATAR_CSS = `
@keyframes pxa-breathe {
  0%, 100% { transform: perspective(400px) rotateY(-2deg) rotateX(1deg) translateY(0px); }
  50%      { transform: perspective(400px) rotateY(2deg) rotateX(-1deg) translateY(-3px); }
}
@keyframes pxa-speak-jaw {
  0%, 100% { transform: scaleY(1); }
  25%      { transform: scaleY(1.6); }
  50%      { transform: scaleY(0.8); }
  75%      { transform: scaleY(1.4); }
}
@keyframes pxa-blink {
  0%, 42%, 46%, 100% { transform: scaleY(1); }
  44%                { transform: scaleY(0.1); }
}
@keyframes pxa-glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 8px var(--pxa-color)) drop-shadow(0 0 2px var(--pxa-color)); }
  50%      { filter: drop-shadow(0 0 16px var(--pxa-color)) drop-shadow(0 0 32px var(--pxa-color)) drop-shadow(0 0 4px #fff); }
}
@keyframes pxa-scanline {
  0%   { top: -2px; }
  100% { top: 100%; }
}
@keyframes pxa-idle-glow {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}
@keyframes pxa-data-scroll {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-20px); }
}
`

const PALETTES = {
  safe:     { skin: '#1a3a4a', skinLit: '#2a5a6a', edge: '#00d4ff', eye: '#00d4ff', mouth: '#00d4ff', glow: '#00d4ff', shadow: '#001822' },
  high:     { skin: '#3a2a1a', skinLit: '#5a4a2a', edge: '#ff9500', eye: '#ff9500', mouth: '#ffd60a', glow: '#ff9500', shadow: '#1a0e00' },
  critical: { skin: '#3a1a1a', skinLit: '#5a2a2a', edge: '#ff2d55', eye: '#ff2d55', mouth: '#ff2d55', glow: '#ff2d55', shadow: '#1a0008' },
}

/* ── Pixel grid definition for the face ──
   Each row is a string where characters map to pixel types:
   . = empty, S = skin, L = lit skin (highlight), E = eye, 
   P = pupil, N = nose, M = mouth, H = hair, D = dark/shadow
   B = beard/chin shadow, X = edge glow
*/
const FACE_GRID = [
  //  0123456789012
  '...HHHHHHH...',  // 0  hair top
  '..HHHHHHHHH..',  // 1  hair
  '.HHHHHHHHHHH.',  // 2  hair wide
  '.HSSSSSSSSSH.',  // 3  forehead
  '.SLLLLLLLLLSH.',  // 4  forehead lit
  'XSSSSSSSSSSSSX',  // 5  temple
  'XSSEESSSEEDSSX',  // 6  eyes row
  'XSSPPSSSPPDSSX',  // 7  pupils
  'XSSSSSSSSSDSSX',  // 8  under eyes
  '.SSSSSNSSSSS.',  // 9  nose
  '.SSSSSNSSSSS.',  // 10 nose
  '.SSSSMMMMSSS.',  // 11 mouth
  '.DSSSSSSSSSD.',  // 12 chin
  '..DBBBBBBBD..',  // 13 jaw
  '...DDDDDDD...',  // 14 neck
  '..XXXXXXXXXXX.',  // 15 collar
]

const PX = 4  // pixel size

function PixelFace({ palette, speaking, blinking }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 0, lineHeight: 0 }}>
      {FACE_GRID.map((row, y) => (
        <div key={y} style={{ display: 'flex', gap: 0, height: PX }}>
          {row.split('').map((ch, x) => {
            if (ch === '.') return <div key={x} style={{ width: PX, height: PX }} />
            
            let bg, shadow = 'none', extraStyle = {}
            
            switch (ch) {
              case 'H': bg = '#111820'; shadow = `inset 0 -1px 0 ${palette.shadow}`; break
              case 'S': bg = palette.skin; shadow = `inset 1px 1px 0 ${palette.skinLit}33`; break
              case 'L': bg = palette.skinLit; shadow = `inset 1px 1px 0 rgba(255,255,255,0.08)`; break
              case 'D': bg = palette.shadow; break
              case 'E':
                bg = palette.eye
                shadow = `0 0 ${PX}px ${palette.eye}88`
                if (blinking) extraStyle.animation = `pxa-blink 4s ease-in-out infinite`
                break
              case 'P':
                bg = '#fff'
                shadow = `0 0 ${PX + 2}px #fff, 0 0 ${PX * 2}px ${palette.eye}66`
                if (blinking) extraStyle.animation = `pxa-blink 4s ease-in-out infinite`
                break
              case 'N': bg = palette.skinLit; shadow = `inset -1px 0 0 ${palette.shadow}55`; break
              case 'M':
                bg = speaking ? palette.mouth : palette.skin
                shadow = speaking ? `0 0 ${PX}px ${palette.mouth}88` : 'none'
                if (speaking) {
                  extraStyle.animation = `pxa-speak-jaw 0.3s ease-in-out infinite`
                  extraStyle.animationDelay = `${x * 0.03}s`
                }
                break
              case 'B': bg = palette.shadow; shadow = `inset 0 1px 0 ${palette.skin}44`; break
              case 'X':
                bg = palette.edge + '44'
                shadow = `0 0 ${PX}px ${palette.edge}33`
                break
              default: bg = 'transparent'
            }
            
            return (
              <div key={x} style={{
                width: PX, height: PX,
                background: bg,
                boxShadow: shadow,
                imageRendering: 'pixelated',
                transition: 'background 0.4s ease, box-shadow 0.4s ease',
                ...extraStyle,
              }} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function PixelAvatar({ speaking = false, threatLevel = 'safe', mode = 'phone', size = 1 }) {
  const palette = PALETTES[threatLevel] || PALETTES.safe
  const [blink, setBlink] = useState(true)
  
  // Random blink cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(b => !b)
      setTimeout(() => setBlink(true), 200)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  const scale = size * (mode === 'zoom' ? 1.8 : 1.5)

  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      '--pxa-color': palette.glow,
    }}>
      <style>{AVATAR_CSS}</style>
      
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: scale * PX * 16 + 40,
        height: scale * PX * 18 + 40,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${palette.glow}11, transparent 70%)`,
        animation: speaking ? 'pxa-glow-pulse 0.8s ease-in-out infinite' : 'pxa-idle-glow 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* 3D face container */}
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        animation: speaking ? 'none' : 'pxa-breathe 5s ease-in-out infinite',
        filter: `drop-shadow(0 0 6px ${palette.glow}44) drop-shadow(0 4px 8px rgba(0,0,0,0.6))`,
        transition: 'filter 0.5s ease',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Shadow layer (offset for 3D depth) */}
        <div style={{
          position: 'absolute',
          top: 2, left: 2,
          opacity: 0.3,
          filter: 'blur(1px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          <PixelFace palette={{
            ...palette,
            skin: palette.shadow,
            skinLit: palette.shadow,
            eye: palette.shadow,
            mouth: palette.shadow,
            edge: palette.shadow,
          }} speaking={false} blinking={false} />
        </div>
        
        {/* Main face */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <PixelFace palette={palette} speaking={speaking} blinking={blink} />
        </div>

        {/* Highlight layer (top-left light) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 3,
        }} />

        {/* CRT scanline */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${palette.glow}15, transparent)`,
          animation: 'pxa-scanline 2s linear infinite',
          pointerEvents: 'none',
          zIndex: 4,
        }} />
      </div>

      {/* Status indicator */}
      <div style={{
        marginTop: 8 * scale,
        display: 'flex', alignItems: 'center', gap: 4,
        opacity: 0.5,
      }}>
        <div style={{
          width: 3, height: 3,
          background: speaking ? palette.glow : palette.edge + '88',
          boxShadow: speaking ? `0 0 6px ${palette.glow}` : 'none',
          animation: speaking ? 'pxa-glow-pulse 0.6s ease-in-out infinite' : 'none',
        }} />
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 6,
          color: palette.edge + 'aa',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {speaking ? 'SPEAKING' : 'CONNECTED'}
        </span>
      </div>
    </div>
  )
}

export default PixelAvatar
