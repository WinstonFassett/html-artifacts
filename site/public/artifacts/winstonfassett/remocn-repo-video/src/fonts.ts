// Deterministic webfonts for rendering — Remotion's recommended approach.
// system-ui doesn't resolve to SF/Geist in the headless render Chromium, so
// load real fonts that get bundled into every frame.
import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import { loadFont as loadJetBrains } from '@remotion/google-fonts/JetBrainsMono'

const inter = loadInter()
const jetbrains = loadJetBrains()

// Drop-in replacements for the `system-ui, ...` and `ui-monospace, ...` stacks
export const SANS = `${inter.fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`
export const MONO = `${jetbrains.fontFamily}, ui-monospace, SFMono-Regular, Menlo, monospace`
