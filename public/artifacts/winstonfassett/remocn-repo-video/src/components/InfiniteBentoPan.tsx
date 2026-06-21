import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence, staticFile } from 'remotion'

function noise(i: number, frame: number) { return Math.sin(frame / 30 + i) * 0.5 + 0.5 }


// Preview images from /previews/ — real screenshots of artifacts in this repo
const PREVIEW_IMGS = [
  'winstonfassett-react-three-fiber-esm-html.png',
  'winstonfassett-d3-force-esm-html.png',
  'winstonfassett-chartjs-html.png',
  'winstonfassett-canvas-life-html.png',
  'winstonfassett-three-esm-html.png',
  'winstonfassett-plotly-html.png',
  'winstonfassett-leaflet-map-html.png',
  'winstonfassett-vega-lite-html.png',
  'examples-simonw-tools-animated-word-cloud-html.png',
  'winstonfassett-gsap-motion-html.png',
  'winstonfassett-mermaid-esm-html.png',
  'winstonfassett-remotion-player-esm-html.png',
  'examples-simonw-tools-audio-spectrum-html.png',
  'winstonfassett-motion-esm-html.png',
  'winstonfassett-anime-html.png',
  'examples-simonw-tools-gradient-card-html.png',
  'winstonfassett-reveal-deck-html.png',
  'winstonfassett-impress-deck-html.png',
  'examples-simonw-tools-minesweeper-html.png',
  'winstonfassett-solid-html-esm-html.png',
  'examples-simonw-tools-sqlite-wasm-html.png',
  'winstonfassett-pglite-esm-html.png',
  'examples-html-anything-dashboard-html.png',
  'examples-html-anything-deck-graphify-dark-html.png',
]

// Layout: rows of cards with varying widths, all height 220
const GAP = 16
const ROW_H = 220
const CARD_LAYOUT = [
  // row 0 y=60
  [{ w: 380 }, { w: 280 }, { w: 340 }, { w: 380 }, { w: 280 }, { w: 340 }],
  // row 1 y=296
  [{ w: 280 }, { w: 380 }, { w: 340 }, { w: 280 }, { w: 380 }, { w: 340 }],
  // row 2 y=532
  [{ w: 340 }, { w: 280 }, { w: 380 }, { w: 340 }, { w: 280 }, { w: 380 }],
  // row 3 y=768
  [{ w: 380 }, { w: 340 }, { w: 280 }, { w: 380 }, { w: 340 }, { w: 280 }],
]

const BENTO_CARDS = (() => {
  const cards: any[] = []
  let imgIdx = 0
  CARD_LAYOUT.forEach((row, rowIdx) => {
    const y = 60 + rowIdx * (ROW_H + GAP)
    let x = 60
    row.forEach((col) => {
      cards.push({ x, y, w: col.w, h: ROW_H, img: PREVIEW_IMGS[imgIdx % PREVIEW_IMGS.length] })
      imgIdx++
      x += col.w + GAP
    })
  })
  return cards
})()

function BentoCard({ card }: any) {
  return (
    <div style={{
      position: 'absolute', left: card.x, top: card.y, width: card.w, height: card.h,
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      background: '#0a0a0a',
    }}>
      <img
        src={staticFile(`previews/${card.img}`)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }}
      />
    </div>
  )
}

export function SceneBento() {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const SUPER_W = 2200, SUPER_H = 1060
  const maxPanX = SUPER_W - width, maxPanY = SUPER_H - height
  const panX = interpolate(frame, [0, 160], [0, maxPanX], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const panY = interpolate(frame, [0, 160], [0, maxPanY], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: '#080812', overflow: 'hidden', opacity: fadeIn }}>
      <div style={{ position: 'absolute', width: SUPER_W, height: SUPER_H, transform: `translate(${-panX}px, ${-panY}px)` }}>
        {BENTO_CARDS.map((card, i) => <BentoCard key={i} card={card} />)}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, #080812 92%)', pointerEvents: 'none' }} />
    </AbsoluteFill>
  )
}