import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { globby } from 'globby'

const targets = await globby([
  'src/routes/**/*.{ts,tsx}',
  'src/router.tsx',
  'src/worker.ts',
])

const forbidden = [
  {
    label: 'Next.js runtime imports',
    pattern: /from\s+['"]next(?:\/|['"])/,
  },
  {
    label: 'Node.js runtime imports',
    pattern: /from\s+['"]node:/,
  },
]

const failures = []

await Promise.all(
  targets.map(async (file) => {
    const source = await readFile(file, 'utf8')
    forbidden.forEach(({ label, pattern }) => {
      if (pattern.test(source)) {
        failures.push(
          `${file}: ${label} are not allowed in TanStack runtime code`,
        )
      }
    })
  }),
)

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}

console.log(
  `Checked ${targets.length} TanStack runtime files from ${path.resolve('.')}`,
)
