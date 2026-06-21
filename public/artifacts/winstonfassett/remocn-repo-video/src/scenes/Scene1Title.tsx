import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { Slide, FadeIn } from '../components/Layout'

import { Typewriter } from '../components/Typewriter'
import { StaggeredFadeUp } from '../components/StaggeredFadeUp'

export function SceneTitle() {
  const frame = useCurrentFrame()
  const taglineDelay = 55
  return (
    <Slide bg="#080812">
      {/* Subtle grid bg */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.07,
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative' }}>
        {/* Badge */}
        <FadeIn from={0}>
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 999, padding: '4px 16px', fontSize: 13, color: '#818cf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            HTML · ESM · No Build
          </div>
        </FadeIn>
        {/* Typewriter headline */}
        <div style={{ textAlign: 'center' }}>
          <Typewriter text="HTML Artifacts" fontSize={88} charsPerSecond={14} color="#f1f5f9" cursorColor="#6366f1" />
        </div>
        {/* Staggered tagline */}
        {frame >= taglineDelay && (
          <Sequence from={taglineDelay} layout="none">
            <div style={{ textAlign: 'center' }}>
              <StaggeredFadeUp
                text="Single files. Real superpowers. No build step."
                fontSize={26}
                color="#64748b"
                staggerDelay={5}
              />
            </div>
          </Sequence>
        )}
      </div>
    </Slide>
  )
}