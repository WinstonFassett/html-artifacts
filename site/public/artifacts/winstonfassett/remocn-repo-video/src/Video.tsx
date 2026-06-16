import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { SceneTitle } from './scenes/Scene1Title'
import { SceneConstellation } from './components/EcosystemConstellation'
import { SceneRule } from './scenes/Scene3TheRule'
import { SceneChart } from './scenes/Scene4StackPopularityChart'
import { SceneBento } from './components/InfiniteBentoPan'
import { SceneOutro } from './scenes/Scene5Outro'

export const FPS = 30
export const TOTAL_FRAMES = 760
export const WIDTH = 960
export const HEIGHT = 540

export function Video() {

  return (
    <AbsoluteFill>
      <Sequence from={0}   durationInFrames={120}><SceneTitle /></Sequence>
      <Sequence from={120} durationInFrames={120}><SceneConstellation /></Sequence>
      <Sequence from={240} durationInFrames={110}><SceneRule /></Sequence>
      <Sequence from={350} durationInFrames={150}><SceneChart /></Sequence>
      <Sequence from={500} durationInFrames={160}><SceneBento /></Sequence>
      <Sequence from={660} durationInFrames={100}><SceneOutro /></Sequence>
    </AbsoluteFill>
  )
}
