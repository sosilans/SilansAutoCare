import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const root = path.resolve(process.cwd())
const srcDir = path.join(root, 'assets')
const outDir = path.join(root, 'public', 'images')

const candidates = [
  'silans-logo-source.png',
  'silans-logo.png',
  'silans.png',
  'silans-logo.jpg',
  'silans.jpg',
  'silans-logo.webp',
  'silans.webp',
]

const ensureOutDir = () => {
  fs.mkdirSync(outDir, { recursive: true })
}

const main = async () => {
  ensureOutDir()

  const existing = candidates
    .map((name) => path.join(srcDir, name))
    .filter((p) => fs.existsSync(p))

  if (existing.length === 0) {
    console.log('\n[logo] No source image found.')
    console.log('[logo] Please place your logo image in the "assets" folder with one of these names:')
    console.log('       - silans-logo-source.png (recommended)')
    console.log('       - silans-logo.png / silans.png / silans-logo.jpg / silans.jpg / silans-logo.webp / silans.webp')
    console.log('[logo] Then run:  npm run optimize:logo\n')
    process.exit(0)
  }

  const targetHeight = 256
  let success = false
  let lastError = null

  for (const sourcePath of existing) {
    const baseName = path.basename(sourcePath)
    console.log(`[logo] Trying source: ${baseName}`)
    try {
      const img = sharp(sourcePath, { failOn: 'none' }).resize({ height: targetHeight, fit: 'inside', withoutEnlargement: true })

      const pngOut = path.join(outDir, 'silans-logo.png')
      await img.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(pngOut)
      console.log(`[logo] Wrote ${path.relative(root, pngOut)}`)

      const webpOut = path.join(outDir, 'silans-logo.webp')
      await img.webp({ quality: 90, nearLossless: true }).toFile(webpOut)
      console.log(`[logo] Wrote ${path.relative(root, webpOut)}`)

      console.log('[logo] Done. The navbar will prefer WebP and fallback to PNG.')
      success = true
      break
    } catch (err) {
      lastError = err
      console.warn(`[logo] Failed with ${baseName}: ${err?.message || err}`)
      continue
    }
  }

  if (!success) {
    console.error('\n[logo] Could not process any candidate files. Please ensure the image is a valid PNG/JPG/WebP.')
    if (lastError) console.error('[logo] Last error:', lastError)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('[logo] Error optimizing logo:', err)
  process.exit(1)
})
