import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { SANS, MONO } from '../fonts'


export function AnimatedBarChart({ data, labels, width = 860, height = 340, barColor = '#6366f1', background = 'transparent', gap = 18, staggerFrames = 5, speed = 1 }) {
  const frame = useCurrentFrame() * speed
  const { fps } = useVideoConfig()
  const padding = 40
  const labelSpace = labels ? 36 : 0
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2 - labelSpace
  const max = Math.max(...data)
  const barWidth = (innerWidth - gap * (data.length - 1)) / data.length
  const baseY = padding + innerHeight

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ background }}>
      <line x1={padding} x2={padding + innerWidth} y1={baseY} y2={baseY} stroke="#1e293b" strokeWidth={2} />
      {data.map((value, index) => {
        const targetHeight = (value / max) * innerHeight
        const x = padding + index * (barWidth + gap)
        const scaleY = spring({
          frame: frame - index * staggerFrames,
          fps, config: { damping: 12, stiffness: 100, mass: 0.8 }, from: 0, to: 1
        })
        const barH = targetHeight * scaleY
        const by = baseY - barH
        return (
          <g key={index}>
            <rect x={x} y={by} width={barWidth} height={barH} rx={5} fill={barColor} style={{ filter: `drop-shadow(0 4px 12px ${barColor}66)` }} />
            {labels && labels[index] && (
              <text x={x + barWidth / 2} y={baseY + 26} fill="#64748b" fontSize={13} textAnchor="middle" opacity={scaleY} style={{ fontFamily: SANS }}>
                {labels[index]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}