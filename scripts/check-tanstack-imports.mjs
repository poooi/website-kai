import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { globby } from 'globby'

const entries = await globby([
  'src/routes/**/*.{ts,tsx}',
  'src/router.tsx',
  'src/worker.ts',
])

const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx']
const srcRoot = path.resolve('src')

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
const seen = new Set()

const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g

const isSourceFile = (file) => {
  const absolute = path.resolve(file)
  return (
    absolute.startsWith(srcRoot) &&
    sourceExtensions.includes(path.extname(file))
  )
}

const resolveSourcePath = async (base) => {
  const candidates = [
    base,
    ...sourceExtensions.map((extension) => `${base}${extension}`),
    ...sourceExtensions.map((extension) =>
      path.join(base, `index${extension}`),
    ),
  ]

  for (const candidate of candidates) {
    if (isSourceFile(candidate)) {
      try {
        await readFile(candidate)
        return candidate
      } catch {
        // Try the next candidate.
      }
    }
  }

  return undefined
}

const resolveImport = async (specifier, importer) => {
  if (specifier.startsWith('~/')) {
    return resolveSourcePath(path.resolve('src', specifier.slice(2)))
  }

  if (specifier.startsWith('.')) {
    return resolveSourcePath(path.resolve(path.dirname(importer), specifier))
  }

  return undefined
}

const scanFile = async (file) => {
  const absolute = path.resolve(file)
  if (seen.has(absolute) || !isSourceFile(absolute)) {
    return
  }
  seen.add(absolute)

  const source = await readFile(absolute, 'utf8')
  forbidden.forEach(({ label, pattern }) => {
    if (pattern.test(source)) {
      failures.push(
        `${absolute}: ${label} are not allowed in TanStack runtime code`,
      )
    }
  })

  const imports = [...source.matchAll(importPattern)].map((match) => match[1])
  await Promise.all(
    imports.map(async (specifier) => {
      const resolved = await resolveImport(specifier, absolute)
      if (resolved) {
        await scanFile(resolved)
      }
    }),
  )
}

await Promise.all(entries.map(scanFile))

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}

console.log(
  `Checked ${seen.size} TanStack runtime files from ${path.resolve('.')}`,
)
