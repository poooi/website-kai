import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const distRoot = path.resolve('dist')
const clientDir = path.join(distRoot, 'client')
const serverDir = path.join(distRoot, 'server')
const wranglerConfigPath = path.join(serverDir, 'wrangler.json')

const KiB = 1024
const budgets = {
  maxClientEntryKiB: 820,
  maxClientChunkKiB: 320,
  maxClientJsTotalKiB: 1_500,
  maxServerEntryKiB: 725,
  maxServerChunkKiB: 980,
}

const forbiddenWorkerPatterns = [
  { label: 'OpenNext runtime marker', pattern: /open-next|opennext/i },
  { label: 'Next.js runtime import marker', pattern: /next\/(?:server|navigation|headers|og)/ },
]

const forbiddenClientPatterns = [
  ...forbiddenWorkerPatterns,
  { label: 'Node.js client import marker', pattern: /from\s*["']node:|require\(["']node:/ },
]

const failures = []

const fail = (message) => failures.push(message)

const collectFiles = async (dir) => {
  if (!existsSync(dir)) {
    return []
  }

  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return collectFiles(fullPath)
      }
      return [fullPath]
    }),
  )
  return files.flat()
}

const formatKiB = (bytes) => `${(bytes / KiB).toFixed(1)} KiB`

const assertBudget = (label, bytes, maxKiB) => {
  const maxBytes = maxKiB * KiB
  if (bytes > maxBytes) {
    fail(`${label} is ${formatKiB(bytes)}, above budget ${maxKiB} KiB`)
  }
}

if (!existsSync(wranglerConfigPath)) {
  fail('Missing dist/server/wrangler.json. Run `pnpm run build` first.')
} else {
  const wranglerConfig = JSON.parse(await readFile(wranglerConfigPath, 'utf8'))
  if (wranglerConfig.name !== 'poi-web-kai') {
    fail(`Expected Worker name poi-web-kai, got ${wranglerConfig.name}`)
  }
  if (wranglerConfig.main !== 'index.js') {
    fail(`Expected Worker main index.js, got ${wranglerConfig.main}`)
  }
  if (wranglerConfig.assets?.directory !== '../client') {
    fail(`Expected assets.directory ../client, got ${wranglerConfig.assets?.directory}`)
  }
  const routePatterns = new Set(
    (wranglerConfig.routes ?? []).map((route) => route.pattern),
  )
  for (const pattern of ['poi.moe', 'update.poi.moe']) {
    if (!routePatterns.has(pattern)) {
      fail(`Missing production route ${pattern} in generated Wrangler config`)
    }
  }
}

const clientFiles = await collectFiles(clientDir)
const serverFiles = await collectFiles(serverDir)
const allDistFiles = [...clientFiles, ...serverFiles]
const sourceMaps = allDistFiles.filter((file) => file.endsWith('.map'))
if (sourceMaps.length > 0) {
  fail(`Production build emitted ${sourceMaps.length} sourcemaps without Sentry upload`)
}

const clientJs = clientFiles.filter((file) => file.endsWith('.js'))
const serverJs = serverFiles.filter((file) => file.endsWith('.js'))
const clientEntry = clientJs.find((file) => /[\\/]assets[\\/]index-[^\\/]+\.js$/.test(file))
const serverEntry = path.join(serverDir, 'index.js')

if (!clientEntry) {
  fail('Missing client entry asset dist/client/assets/index-*.js')
} else {
  assertBudget('Client entry chunk', (await readFile(clientEntry)).byteLength, budgets.maxClientEntryKiB)
}

if (!existsSync(serverEntry)) {
  fail('Missing server entry dist/server/index.js')
} else {
  assertBudget('Server entry chunk', (await readFile(serverEntry)).byteLength, budgets.maxServerEntryKiB)
}

const clientJsTotal = (
  await Promise.all(clientJs.map(async (file) => (await readFile(file)).byteLength))
).reduce((sum, size) => sum + size, 0)
assertBudget('Total client JavaScript', clientJsTotal, budgets.maxClientJsTotalKiB)

for (const file of clientJs) {
  if (file !== clientEntry) {
    assertBudget(
      `Client lazy chunk ${path.relative(clientDir, file)}`,
      (await readFile(file)).byteLength,
      budgets.maxClientChunkKiB,
    )
  }
}

for (const file of serverJs) {
  if (file !== serverEntry) {
    assertBudget(
      `Server module ${path.relative(serverDir, file)}`,
      (await readFile(file)).byteLength,
      budgets.maxServerChunkKiB,
    )
  }
}

for (const file of serverJs) {
  const source = await readFile(file, 'utf8')
  for (const { label, pattern } of forbiddenWorkerPatterns) {
    if (pattern.test(source)) {
      fail(`${label} found in ${path.relative(serverDir, file)}`)
    }
  }
}

for (const file of clientJs) {
  const source = await readFile(file, 'utf8')
  for (const { label, pattern } of forbiddenClientPatterns) {
    if (pattern.test(source)) {
      fail(`${label} found in client asset ${path.relative(clientDir, file)}`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    [
      `Checked TanStack output in ${distRoot}`,
      `clientEntry=${formatKiB(clientEntry ? (await readFile(clientEntry)).byteLength : 0)}`,
      `clientJsTotal=${formatKiB(clientJsTotal)}`,
      `serverEntry=${formatKiB(existsSync(serverEntry) ? (await readFile(serverEntry)).byteLength : 0)}`,
    ].join('\n'),
  )
}
