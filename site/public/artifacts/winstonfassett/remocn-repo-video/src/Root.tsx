import React from 'react'
import { Composition } from 'remotion'
import { Video, FPS, TOTAL_FRAMES, WIDTH, HEIGHT } from './Video'

export function Root() {
  return (
    <Composition
      id="HtmlArtifacts"
      component={Video}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  )
}
