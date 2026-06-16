import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { SANS, MONO } from '../fonts'


export function Typewriter({ text, cursor = true, charsPerSecond = 20, speed = 1, fontSize = 48, color = '#f1f5f9', cursorColor = '#6366f1', fontWeight = 700 }) {
  const frame = useCurrentFrame() * speed
  const { fps } = useVideoConfig()
  const charsToRevealOver = (text.length / charsPerSecond) * fps
  const revealed = Math.floor(
    interpolate(frame, [0, charsToRevealOver], [0, text.length], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
    })
  )
  const visibleText = text.substring(0, revealed)
  const isCursorVisible = Math.floor((frame / fps) * 2) % 2 === 0
  return (
    <span style={{ fontSize, fontWeight, color, letterSpacing: '-0.03em', fontFamily: SANS, whiteSpace: 'pre' }}>
      {visibleText}
      {cursor && (
        <span style={{
          display: 'inline-block', width: '0.08em', height: '1em',
          marginLeft: '0.04em', verticalAlign: 'text-bottom',
          background: cursorColor, opacity: isCursorVisible ? 1 : 0
        }} />
      )}
    </span>
  )
}