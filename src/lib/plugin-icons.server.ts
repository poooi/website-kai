import shims from '@fortawesome/fontawesome-free/js/v4-shims.js'
import {
  findIconDefinition,
  library,
  parse,
  type IconDefinition,
  type IconPrefix,
} from '@fortawesome/fontawesome-svg-core'

// The catalog is dynamic, so the free packs load as separate server chunks and
// register once; only the selected definition reaches the client.
const registered = Promise.all([
  import('@fortawesome/free-solid-svg-icons'),
  import('@fortawesome/free-regular-svg-icons'),
  import('@fortawesome/free-brands-svg-icons'),
]).then(([solid, regular, brands]) => {
  library.add(solid.fas, regular.far, brands.fab)
})

export const resolvePluginIcon = async (
  name: string,
): Promise<IconDefinition | undefined> => {
  await registered

  const key = name.replace(/^fa\//, '')
  const shim = shims.find(([old]) => old === key)
  const candidates: IconPrefix[] = shim?.[1] ? [shim[1]] : ['fas', 'far', 'fab']

  for (const prefix of candidates) {
    const definition = findIconDefinition(
      parse.icon([prefix, shim?.[2] ?? key]),
    )
    if (definition) return definition
  }
  return undefined
}
