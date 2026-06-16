import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'
import { Slide, FadeIn } from '../components/Layout'

import { AnimatedBarChart } from '../components/AnimatedBarChart'

export function SceneChart() {
  return (
    <Slide bg="#080812">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', alignItems: 'center' }}>
        <FadeIn from={0}>
          <div style={{ color: '#64748b', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Starters in this repo by ecosystem
          </div>
        </FadeIn>
        <FadeIn from={6}>
          <AnimatedBarChart
            data={[8, 5, 4, 3, 3, 2, 2, 2]}
            labels={['React', 'Charts', 'Motion', 'Diagrams', 'Decks', 'Vue/Preact', '3D', 'Other']}
            width={860}
            height={330}
            barColor="#6366f1"
            staggerFrames={6}
          />
        </FadeIn>
        <FadeIn from={40}>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { val: '31', label: 'Starters' },
              { val: '216', label: 'Simon Willison tools' },
              { val: '87', label: 'html-anything templates' },
            ].map(({ val, label }, i) => (
              <Sequence key={i} from={i * 12} layout="none">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#6366f1', letterSpacing: '-0.04em' }}>{val}</div>
                  <div style={{ color: '#475569', fontSize: 13 }}>{label}</div>
                </div>
              </Sequence>
            ))}
          </div>
        </FadeIn>
      </div>
    </Slide>
  )
}