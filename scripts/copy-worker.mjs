import { copyFileSync, cpSync, readdirSync } from 'node:fs'

const src = '.open-next'
const dest = '.open-next/assets'

// Copy all subdirectories (except assets/ itself) into assets/ so that _worker.js
// relative imports (./cloudflare/*, ./middleware/*, ./server-functions/*, etc.) resolve.
// dereference:true follows symlinks so CF Pages asset validation doesn't see external links.
for (const entry of readdirSync(src, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name !== 'assets') {
    cpSync(`${src}/${entry.name}`, `${dest}/${entry.name}`, {
      recursive: true,
      dereference: true,
    })
  }
}

copyFileSync(`${src}/worker.js`, `${dest}/_worker.js`)
