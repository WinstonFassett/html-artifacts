#!/usr/bin/env node
/**
 * html-to-remotion.mjs
 *
 * Converts a single-file HTML artifact (esm.sh/tsx style) containing a
 * Remotion Player composition into a proper Remotion npm project ready to
 * render to mp4.
 *
 * Usage:
 *   node tools/html-to-remotion.mjs <input.html> [output-dir]
 *
 * If output-dir is omitted, it defaults to a folder next to the HTML file
 * with the same name (no extension).
 *
 * Output structure:
 *   <output-dir>/
 *     package.json
 *     remotion.config.ts
 *     tsconfig.json
 *     src/
 *       index.ts          ← Remotion entry point (registerRoot)
 *       Root.tsx          ← <Composition> wired to Video component
 *       components/       ← one file per // ─── section banner
 *         Typewriter.tsx
 *         StaggeredFadeUp.tsx
 *         ...
 *       scenes/           ← scene components
 *         SceneTitle.tsx
 *         ...
 *       Video.tsx         ← the root Video composition
 */

import fs from 'fs'
import path from 'path'

// ─── Args ────────────────────────────────────────────────────────────────────
const [,, inputHtml, outputDirArg] = process.argv
if (!inputHtml) {
  console.error('Usage: node html-to-remotion.mjs <input.html> [output-dir]')
  process.exit(1)
}

const inputPath = path.resolve(inputHtml)
if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`)
  process.exit(1)
}

const baseName = path.basename(inputPath, path.extname(inputPath))
const inputDir = path.dirname(inputPath)
const outputDir = outputDirArg
  ? path.resolve(outputDirArg)
  : path.join(inputDir, baseName)

// ─── Extract TSX block ───────────────────────────────────────────────────────
const html = fs.readFileSync(inputPath, 'utf8')
const tsxMatch = html.match(/<script type="text\/tsx">([\s\S]*?)<\/script>/)
if (!tsxMatch) {
  console.error('No <script type="text/tsx"> block found in HTML.')
  process.exit(1)
}
const tsx = tsxMatch[1].trim()

// ─── Split into sections by banner comments ──────────────────────────────────
// Banners look like: // ─── remocn: Typewriter ──── or // ─── Scene 1: Title ────
const BANNER_RE = /^\/\/ [─]+\s+(.+?)\s+[─]*$/m

const rawSections = tsx.split(/(?=^\/\/ [─]+.+[─]*$)/m).filter(s => s.trim())

const sections = rawSections.map(block => {
  const firstLine = block.split('\n')[0]
  const match = firstLine.match(/\/\/ [─]+\s+(.+?)\s+[─]*$/)
  const title = match ? match[1].replace(/^remocn:\s*/i, '').trim() : 'Unknown'
  const code = block.replace(/^.*\n/, '') // strip the banner line itself
  return { title, code }
})

// ─── Categorize sections ─────────────────────────────────────────────────────
// Sections whose title starts with "Scene" → scenes/
// "Root composition" → Video.tsx (special)
// Everything else → components/

const imports = [] // lines before first banner
const componentSections = []
const sceneSections = []
let rootSection = null
let appSection = null

// Collect preamble (imports before first banner)
const firstBannerIdx = tsx.search(/^\/\/ [─]+/m)
const preamble = firstBannerIdx > 0 ? tsx.slice(0, firstBannerIdx).trim() : ''

for (const sec of sections) {
  const t = sec.title.toLowerCase()
  if (t.includes('root composition')) { rootSection = sec; continue }
  if (t.includes('scene')) { sceneSections.push(sec); continue }
  if (t.includes('shared layout')) { componentSections.push({ ...sec, title: 'Layout' }); continue }
  componentSections.push(sec)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function titleToFilename(title) {
  // "remocn: Typewriter" → "Typewriter"
  // "Scene 1: Title (frames 0–119)" → "SceneTitle"
  // "Shared layout" → "Layout"
  return title
    .replace(/\(.*\)/, '')           // drop parenthetical
    .replace(/frames?.*/, '')        // drop frame ranges
    .replace(/[^a-zA-Z0-9 ]/g, ' ') // non-alnum → space
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join('')
}

function componentName(title) {
  return titleToFilename(title)
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function write(filePath, content) {
  mkdirp(path.dirname(filePath))
  fs.writeFileSync(filePath, content)
  console.log(`  wrote ${path.relative(outputDir, filePath)}`)
}

// ─── Rewrite imports in a code block ─────────────────────────────────────────
// The HTML uses bare 'remotion', 'react' etc which are fine for the project.
// We just need to strip the React/Player imports from preamble since we'll
// re-add them properly per-file.
function cleanPreamble(code) {
  return code
    .split('\n')
    .filter(line => {
      // Remove player import — not needed in composition files
      if (line.includes('@remotion/player')) return false
      // Remove createRoot — not needed
      if (line.includes('createRoot')) return false
      return true
    })
    .join('\n')
    .trim()
}

// ─── Build output ─────────────────────────────────────────────────────────────
console.log(`\nConverting: ${inputPath}`)
console.log(`Output dir: ${outputDir}\n`)

mkdirp(outputDir)
mkdirp(path.join(outputDir, 'src', 'components'))
mkdirp(path.join(outputDir, 'src', 'scenes'))

// Extract FPS and TOTAL from root section
const fpsMatch = rootSection?.code.match(/const FPS\s*=\s*(\d+)/)
const totalMatch = rootSection?.code.match(/const TOTAL\s*=\s*(\d+)/)
const widthMatch = tsx.match(/compositionWidth=\{(\d+)\}/)
const heightMatch = tsx.match(/compositionHeight=\{(\d+)\}/)

const FPS = fpsMatch ? fpsMatch[1] : '30'
const TOTAL = totalMatch ? totalMatch[1] : '300'
const WIDTH = widthMatch ? widthMatch[1] : '1280'
const HEIGHT = heightMatch ? heightMatch[1] : '720'

// Collect all component/scene names for import generation
const componentFiles = componentSections.map(sec => ({
  name: componentName(sec.title),
  file: componentName(sec.title),
  code: sec.code,
  dir: 'components',
}))

const sceneFiles = sceneSections.map(sec => ({
  name: componentName(sec.title),
  file: componentName(sec.title),
  code: sec.code,
  dir: 'scenes',
}))

const allFiles = [...componentFiles, ...sceneFiles]

// ─── Write component files ────────────────────────────────────────────────────
const cleanedPreamble = cleanPreamble(preamble)

for (const f of allFiles) {
  const content = [
    `import React from 'react'`,
    `import { useCurrentFrame, useVideoConfig, interpolate, spring, random, AbsoluteFill, Sequence } from 'remotion'`,
    '',
    cleanedPreamble,
    '',
    f.code.trim(),
  ].join('\n')

  write(path.join(outputDir, 'src', f.dir, `${f.file}.tsx`), content)
}

// ─── Extract Video function and constants from root section ──────────────────
const rootCode = rootSection?.code ?? ''

// Pull out the Video function body
const videoFnMatch = rootCode.match(/function Video\(\)[^{]*\{([\s\S]*?)\n\}/)
const videoFnBody = videoFnMatch ? videoFnMatch[1] : '  return null'

// Pull sequence lines to figure out which scenes are used
const sequenceLines = rootCode.match(/<Sequence[^>]*>.*?<\/Sequence>/g) ?? []

// ─── Write Video.tsx ──────────────────────────────────────────────────────────
const sceneImports = sceneFiles.map(f => `import { ${f.name} } from './scenes/${f.file}'`).join('\n')
const componentImports = componentFiles.map(f => `import { ${f.name} } from './components/${f.file}'`).join('\n')

const videoTsx = `import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
${sceneImports}

export const FPS = ${FPS}
export const TOTAL_FRAMES = ${TOTAL}
export const WIDTH = ${WIDTH}
export const HEIGHT = ${HEIGHT}

export function Video() {
${videoFnBody}
}
`
write(path.join(outputDir, 'src', 'Video.tsx'), videoTsx)

// ─── Write Root.tsx ───────────────────────────────────────────────────────────
const rootTsx = `import React from 'react'
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
`
write(path.join(outputDir, 'src', 'Root.tsx'), rootTsx)

// ─── Write index.ts ───────────────────────────────────────────────────────────
const indexTs = `import { registerRoot } from 'remotion'
import { Root } from './Root'

registerRoot(Root)
`
write(path.join(outputDir, 'src', 'index.ts'), indexTs)

// ─── Write package.json ───────────────────────────────────────────────────────
const packageJson = {
  name: baseName,
  version: '0.1.0',
  private: true,
  scripts: {
    start: 'npx remotion studio',
    render: `npx remotion render HtmlArtifacts out/${baseName}.mp4`,
    build: 'npx remotion render HtmlArtifacts out/${baseName}.mp4',
  },
  dependencies: {
    react: '^19.0.0',
    'react-dom': '^19.0.0',
    remotion: '^4.0.0',
  },
  devDependencies: {
    typescript: '^5.0.0',
    '@types/react': '^19.0.0',
    '@remotion/cli': '^4.0.0',
  },
}
write(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2))

// ─── Write tsconfig.json ──────────────────────────────────────────────────────
const tsconfig = {
  compilerOptions: {
    target: 'ES2020',
    lib: ['ES2020', 'DOM'],
    jsx: 'react-jsx',
    module: 'ESNext',
    moduleResolution: 'bundler',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
  },
  include: ['src'],
}
write(path.join(outputDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2))

// ─── Write remotion.config.ts ─────────────────────────────────────────────────
const remotionConfig = `import { Config } from '@remotion/cli/config'

Config.setVideoImageFormat('jpeg')
Config.setOverwriteOutput(true)
`
write(path.join(outputDir, 'remotion.config.ts'), remotionConfig)

// ─── Write README ─────────────────────────────────────────────────────────────
const readme = `# ${baseName}

Generated from \`${path.basename(inputPath)}\` by \`html-to-remotion.mjs\`.

## Setup

\`\`\`bash
npm install
\`\`\`

## Preview in Remotion Studio

\`\`\`bash
npm run start
\`\`\`

## Render to mp4

\`\`\`bash
npm run render
\`\`\`

Output: \`out/${baseName}.mp4\`

## Notes

- Component files may need manual cleanup — imports are generated conservatively.
- Any assets referenced via absolute paths (e.g. \`/previews/\`) need to be
  copied into \`public/\` or paths updated to \`staticFile('...')\`.
`
write(path.join(outputDir, 'README.md'), readme)

// ─── Done ─────────────────────────────────────────────────────────────────────
console.log(`
Done! Next steps:
  cd ${outputDir}
  npm install
  npm run start     # Remotion Studio (preview)
  npm run render    # render to mp4

Note: check src/ for any imports that need fixing, and copy
/previews/ assets into ${outputDir}/public/ if used.
`)
