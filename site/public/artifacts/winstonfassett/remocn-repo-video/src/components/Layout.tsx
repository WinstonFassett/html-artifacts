import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { SANS } from '../fonts'


export function Slide({ bg = '#080812', children }: any) {
  return (
    <AbsoluteFill style={{ background: bg, fontFamily: SANS, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      {children}
    </AbsoluteFill>
  )
}

export function FadeIn({ from = 0, children }: any) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [from, from + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return <div style={{ opacity }}>{children}</div>
}