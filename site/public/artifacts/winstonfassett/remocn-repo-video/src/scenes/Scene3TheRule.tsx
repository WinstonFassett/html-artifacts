import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { Slide, FadeIn } from '../components/Layout'

import { MatrixDecode } from '../components/MatrixDecode'
import { SANS, MONO } from '../fonts'

export function SceneRule() {
  const frame = useCurrentFrame()
  return (
    <Slide bg="#04080f">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, alignItems: 'center', textAlign: 'center', maxWidth: 820 }}>
        <FadeIn from={0}>
          <div style={{ color: '#22c55e', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: MONO }}>
            The rule that cuts across everything
          </div>
        </FadeIn>
        <div>
          <MatrixDecode
            text="Any runtime React library works via esm.sh"
            fontSize={30}
            color="#22c55e"
            revealDuration={60}
          />
        </div>
        {frame >= 65 && (
          <Sequence from={65} layout="none">
            <FadeIn from={0}>
              <div style={{ display: 'flex', gap: 32 }}>
                {[
                  { label: '✗  Svelte', note: 'Compiler-required', color: '#ef4444' },
                  { label: '✗  Solid TSX', note: 'babel-preset-solid needed', color: '#ef4444' },
                  { label: '✓  Everything else', note: 'esm.sh + tsx', color: '#22c55e' },
                ].map(({ label, note, color }, i) => (
                  <Sequence key={i} from={i * 10} layout="none">
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}33`, borderRadius: 10, padding: '14px 20px', minWidth: 200 }}>
                      <div style={{ color, fontSize: 15, fontWeight: 600 }}>{label}</div>
                      <div style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>{note}</div>
                    </div>
                  </Sequence>
                ))}
              </div>
            </FadeIn>
          </Sequence>
        )}
      </div>
    </Slide>
  )
}