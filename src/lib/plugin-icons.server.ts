import shims from '@fortawesome/fontawesome-free/js/v4-shims.js'
import {
  findIconDefinition,
  library,
  parse,
  type IconDefinition,
  type IconPrefix,
} from '@fortawesome/fontawesome-svg-core'

// Official v4 compatibility tuples: [oldNameOrUnicode, prefix|null, newName|null].
const shimMap = new Map<string, [IconPrefix | null, string | null]>()
for (const [name, prefix, target] of shims) {
  if (typeof name === 'string') shimMap.set(name, [prefix, target])
}

const prefixes: IconPrefix[] = ['fas', 'far', 'fab']

// Load the official free packs as separate server chunks, then register them
// once. The catalog is dynamic, so resolution happens here on the server and
// only the selected definition reaches the client.
const ready = Promise.all([
  import('@fortawesome/free-solid-svg-icons'),
  import('@fortawesome/free-regular-svg-icons'),
  import('@fortawesome/free-brands-svg-icons'),
]).then(([solid, regular, brands]) => {
  library.add(solid.fas, regular.far, brands.fab)
})

const lookup = (
  prefix: IconPrefix,
  iconName: string,
): IconDefinition | undefined =>
  findIconDefinition(parse.icon([prefix, iconName]))

export const resolvePluginIcon = async (
  name?: string,
): Promise<IconDefinition | undefined> => {
  if (!name) return undefined
  await ready

  const key = name.replace(/^fa\//, '')
  const shim = shimMap.get(key)
  if (shim) {
    const [prefix, target] = shim
    return lookup(prefix ?? 'fas', target ?? key)
  }

  for (const prefix of prefixes) {
    const definition = lookup(prefix, key)
    if (definition) return definition
  }
  return undefined
}
