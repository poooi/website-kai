import fs from 'node:fs/promises'
import path from 'node:path'

import { globby } from 'globby'

const fontNamePattern = /@ibm[/\\](.+?)[/\\]/
const dest = path.resolve('public/fonts')

const copyFontFile = async (source) => {
  const fontName = fontNamePattern.exec(source)?.[1]
  if (!fontName) {
    throw new Error(`Could not infer IBM font name from ${source}`)
  }

  await fs.mkdir(path.join(dest, fontName), { recursive: true })
  await fs.copyFile(source, path.join(dest, fontName, path.basename(source)))
}

await fs.rm(dest, { force: true, recursive: true })
await fs.mkdir(dest, { recursive: true })

const files = await globby(
  [
    'node_modules/@ibm/**/woff2/**/*.css',
    'node_modules/@ibm/**/woff2/**/*.woff2',
  ],
  { absolute: true },
)

await Promise.all(files.map(copyFontFile))

console.log(`Copied ${files.length} IBM Plex font files to ${dest}`)
