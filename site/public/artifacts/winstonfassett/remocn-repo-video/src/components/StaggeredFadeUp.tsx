import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { SANS, MONO } from '../fonts'


export function StaggeredFadeUp({ text, staggerDelay = 4, distance = 20, fontSize = 36, color = '#94a3b8', fontWeight = 500, speed = 1 }) {
  const frame = useCurrentFrame() * speed
  const words = text.split(' ')
  return (
    <span style={{ fontSize, fontWeight, color, letterSpacing: '-0.02em', fontFamily: SANS }}>
      {words.map((word, i) => {
        const local = frame - i * staggerDelay
        const opacity = interpolate(local, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const y = interpolate(local, [0, 12], [distance, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <span key={i} style={{ display: 'inline-block', marginRight: '0.28em', opacity, transform: `translateY(${y}px)` }}>
            {word}
          </span>
        )
      })}
    </span>
  )
}