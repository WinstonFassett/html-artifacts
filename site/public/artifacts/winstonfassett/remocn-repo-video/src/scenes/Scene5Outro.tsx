import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { Slide, FadeIn } from '../components/Layout'

import { StaggeredFadeUp } from '../components/StaggeredFadeUp'
import { SANS, MONO } from '../fonts'

export function SceneOutro() {
  const frame = useCurrentFrame()
  return (
    <Slide bg="#080812">
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 70%)'
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, position: 'relative' }}>
        <FadeIn from={0}>
          <div style={{ fontSize: 14, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Ship it in a single file
          </div>
        </FadeIn>
        {frame >= 10 && (
          <Sequence from={10} layout="none">
            <StaggeredFadeUp
              text="One HTML file. All the power."
              fontSize={48}
              color="#f1f5f9"
              fontWeight={800}
              staggerDelay={6}
            />
          </Sequence>
        )}
        {frame >= 50 && (
          <Sequence from={50} layout="none">
            <FadeIn from={0}>
              <div style={{ color: '#6366f1', fontFamily: MONO, fontSize: 18 }}>
                html-artifacts.localhost:1355
              </div>
            </FadeIn>
          </Sequence>
        )}
      </div>
    </Slide>
  )
}