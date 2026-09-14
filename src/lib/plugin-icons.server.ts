import type { PluginIcon } from './plugin-icons'
import names from './plugin-icons-generated/names.json'

// Compact generated official metadata: the name map is small and stays in the
// server chunk; each style's geometry is a separate lazy chunk so no single
// server module grows past the build budget.
const nameMap: Record<string, string[]> = names

const geometryLoaders: Array<
  () => Promise<{ default: Record<string, string[]> }>
> = [
  () => import('./plugin-icons-generated/geometry-solid.json'),
  () => import('./plugin-icons-generated/geometry-regular.json'),
  () => import('./plugin-icons-generated/geometry-brands.json'),
]

export const resolvePluginIcon = async (
  name?: string,
): Promise<PluginIcon | undefined> => {
  if (!name) return undefined
  const entry = nameMap[name.replace(/^fa\//, '')]
  if (!entry) return undefined
  const canonical = entry[0]
  const loader = geometryLoaders[Number(entry[1])]
  if (!canonical || !loader) return undefined
  const geometry = (await loader()).default[canonical]
  if (!geometry?.[0] || !geometry[1]) return undefined
  return { viewBox: geometry[0], path: geometry[1] }
}
