import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { SANS, MONO } from '../fonts'


export function MatrixDecode({ text, charset = '!@#$%^&*()_+-=<>?/|{}[]', fontSize = 40, color = '#22c55e', fontWeight = 600, revealDuration = 50, speed = 1 }) {
  const frame = useCurrentFrame() * speed
  let output = ''
  for (let i = 0; i < text.length; i++) {
    const revealFrame = (i / Math.max(text.length, 1)) * revealDuration
    if (text[i] === ' ') { output += ' '; continue }
    if (frame >= revealFrame) { output += text[i] }
    else {
      const r = random(`${i}-${Math.floor(frame / 2)}`)
      output += charset[Math.floor(r * charset.length)]
    }
  }
  return (
    <span style={{ fontSize, fontWeight, color, letterSpacing: '0.04em', whiteSpace: 'pre', fontFamily: MONO }}>
      {output}
    </span>
  )
}