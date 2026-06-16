import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { SANS, MONO } from '../fonts'


function ReactMark() {
  return <svg viewBox="0 0 24 24" width={28} height={28}><circle cx="12" cy="12" r="2.5" fill="#61dafb"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" strokeWidth="1.2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" strokeWidth="1.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" strokeWidth="1.2" transform="rotate(120 12 12)"/></svg>
}
function VueMark() {
  return <svg viewBox="0 0 24 24" width={28} height={28}><path fill="#42b883" d="M12 21L1 3h4.5L12 14.5 18.5 3H23z"/><path fill="#35495e" d="M12 21l-4.5-8h3L12 16l1.5-3h3z"/></svg>
}
function SolidMark() {
  return <svg viewBox="0 0 24 24" width={28} height={28}><path fill="#446b9e" d="M2 6l10-4 10 4-10 4z"/><path fill="#53a3db" d="M2 6l10 4v8L2 14z"/><path fill="#2c5f8a" d="M22 6L12 10v8l10-4z"/></svg>
}
function PreactMark() {
  return <svg viewBox="0 0 24 24" width={26} height={26}><polygon points="12,2 22,19 2,19" fill="none" stroke="#673ab8" strokeWidth="2"/><polygon points="12,7 18,17 6,17" fill="#673ab8"/></svg>
}
function ThreeMark() {
  return <svg viewBox="0 0 24 24" width={26} height={26}><path fill="#fff" d="M3 20L12 4l9 16H3zm3-2h12l-6-10.5L6 18z"/></svg>
}
function D3Mark() {
  return <svg viewBox="0 0 24 24" width={26} height={26}><path fill="#f9a03c" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" opacity="0.8"/><path fill="#f9a03c" d="M10 7h4M7 10v4M17 10v4M10 17h4" stroke="#f9a03c" strokeWidth="2"/></svg>
}
function AlpineMark() {
  return <svg viewBox="0 0 24 24" width={26} height={26}><path fill="#77c1d2" d="M2 18L8 6l4 8 4-8 6 12H2z"/></svg>
}
function RemotionMark() {
  return <svg viewBox="0 0 24 24" width={26} height={26}><circle cx="12" cy="12" r="10" fill="#fff" opacity="0.1"/><polygon points="9,7 19,12 9,17" fill="#fff"/></svg>
}

const FRAMEWORK_SATELLITES = [
  { Logo: ReactMark,   bg: '#0e1a2b', label: 'React' },
  { Logo: VueMark,     bg: '#0d1f17', label: 'Vue' },
  { Logo: SolidMark,   bg: '#0d1829', label: 'Solid' },
  { Logo: PreactMark,  bg: '#1a0f2e', label: 'Preact' },
  { Logo: ThreeMark,   bg: '#111', label: 'Three.js' },
  { Logo: D3Mark,      bg: '#1a1200', label: 'D3' },
  { Logo: AlpineMark,  bg: '#0d1e22', label: 'Alpine' },
  { Logo: RemotionMark,bg: '#1a0a1a', label: 'Remotion' },
]

export function SceneConstellation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const count = 8
  const cx = 480, cy = 270
  const pulse = (Math.sin(frame / 12) + 1) / 2
  const centerScale = 1 + pulse * 0.06
  const accentColor = '#6366f1'

  const satellites = FRAMEWORK_SATELLITES.map((brand, i) => {
    const sp = spring({ frame: frame - i * 4, fps, config: { mass: 1.1, damping: 16, stiffness: 70 }, durationInFrames: 50 })
    const radiusFactor = interpolate(sp, [0, 1], [8, 1])
    const rX = 200 + i * 8, rY = 155 + i * 6
    const angularSpeed = 0.010 - i * 0.0007
    const angle = (i / count) * Math.PI * 2 + frame * angularSpeed
    const x = cx + Math.cos(angle) * rX * radiusFactor
    const y = cy + Math.sin(angle) * rY * radiusFactor
    const activeIdx = Math.floor(frame / 25) % count
    const isActive = activeIdx === i
    const localFrame = frame - Math.floor(frame / 25) * 25
    const lineOpacity = isActive
      ? interpolate(localFrame, [0, 6, 19, 25], [0.1, 0.8, 0.8, 0.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 0.1
    const satScale = isActive
      ? interpolate(localFrame, [0, 6, 19, 25], [1, 1.15, 1.15, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 1
    return { ...brand, x, y, lineOpacity, satScale, visible: sp > 0.02 }
  })

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, #14101e 0%, #05030a 75%)', overflow: 'hidden', fontFamily: SANS }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 36, left: 0, right: 0, textAlign: 'center', opacity: titleOpacity }}>
        <div style={{ color: '#475569', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: SANS }}>View · Power · Ecosystem</div>
      </div>
      <svg width="100%" height="100%" viewBox="0 0 960 540" style={{ position: 'absolute', inset: 0 }}>
        {satellites.map((s, i) => s.visible && (
          <line key={i} x1={cx} y1={cy} x2={s.x} y2={s.y} stroke={accentColor} strokeWidth={1.5} strokeLinecap="round" opacity={s.lineOpacity} />
        ))}
        <circle cx={cx} cy={cy} r={68 + pulse * 8} fill={accentColor} opacity={0.1} />
        <circle cx={cx} cy={cy} r={48 + pulse * 4} fill={accentColor} opacity={0.18} />
      </svg>
      {/* Center node */}
      <div style={{
        position: 'absolute', left: cx, top: cy, width: 90, height: 90,
        marginLeft: -45, marginTop: -45, borderRadius: 22,
        background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em',
        transform: `scale(${centerScale})`,
        boxShadow: `0 0 60px ${accentColor}66, inset 0 1px 0 rgba(255,255,255,0.3)`,
        border: '1px solid rgba(255,255,255,0.15)', fontFamily: SANS,
        textAlign: 'center', lineHeight: 1.2,
      }}>
        esm<br/>.sh
      </div>
      {/* Satellites */}
      {satellites.map((s, i) => {
        if (!s.visible) return null
        const Logo = s.Logo
        return (
          <div key={i} style={{
            position: 'absolute', left: s.x, top: s.y,
            width: 56, height: 56, marginLeft: -28, marginTop: -28,
            borderRadius: 14, background: s.bg,
            border: `1px solid rgba(255,255,255,0.1)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${s.satScale})`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            flexDirection: 'column', gap: 2,
          }}>
            <Logo />
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8, fontFamily: SANS, letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}