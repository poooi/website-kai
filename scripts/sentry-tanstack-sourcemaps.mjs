import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

import { execa } from 'execa'

const distDir = path.resolve('dist')
const artifactDirs = ['dist/client', 'dist/server']
const org = process.env.SENTRY_ORG ?? 'poi'
const project = process.env.SENTRY_PROJECT ?? 'poi-web-kai'

const getCommitHash = async () => {
  try {
    const commitHash = await execa('git', ['rev-parse', 'HEAD'])
    return commitHash.stdout
  } catch {
    return 'development'
  }
}

const release =
  process.env.SENTRY_RELEASE ?? process.env.COMMIT_HASH ?? (await getCommitHash())

const collectMaps = async (dir) => {
  if (!existsSync(dir)) {
    return []
  }

  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return collectMaps(fullPath)
      }
      return entry.isFile() && entry.name.endsWith('.map') ? [fullPath] : []
    }),
  )
  return nested.flat()
}

const mapsHaveDebugIds = async (maps) => {
  const contents = await Promise.all(maps.map((map) => readFile(map, 'utf8')))
  return contents.some((content) => content.includes('"debug_id"'))
}

const maps = await collectMaps(distDir)
if (maps.length === 0) {
  throw new Error('No TanStack sourcemaps found under dist/. Run build first.')
}

await execa(
  'sentry-cli',
  [
    'sourcemaps',
    'inject',
    '--org',
    org,
    '--project',
    project,
    '--release',
    release,
    ...artifactDirs,
  ],
  { stdio: 'inherit' },
)

const injectedMaps = await collectMaps(distDir)
if (!(await mapsHaveDebugIds(injectedMaps))) {
  throw new Error('Sentry debug IDs were not injected into TanStack sourcemaps.')
}

if (
  !process.env.SENTRY_AUTH_TOKEN ||
  process.env.SENTRY_UPLOAD_DRY_RUN === '1'
) {
  console.log(
    `Injected debug IDs into ${injectedMaps.length} TanStack sourcemaps for release ${release}; upload skipped.`,
  )
  process.exit(0)
}

await execa(
  'sentry-cli',
  [
    'sourcemaps',
    'upload',
    '--org',
    org,
    '--project',
    project,
    '--release',
    release,
    ...artifactDirs,
  ],
  { stdio: 'inherit' },
)
