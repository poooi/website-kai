import { copyFileSync, cpSync, readdirSync } from 'node:fs'

const src = '.open-next'
const dest = '.open-next/assets'

// Copy all directories (and non-asset files) from .open-next/ into .open-next/assets/
// so that _worker.js relative imports (./cloudflare/*, ./middleware/*, etc.) resolve correctly
for (const entry of readdirSync(src, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name !== 'assets') {
    cpSync(`${src}/${entry.name}`, `${dest}/${entry.name}`, { recursive: true })
  }
}

copyFileSync(`${src}/worker.js`, `${dest}/_worker.js`)
