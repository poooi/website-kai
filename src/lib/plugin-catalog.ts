import { z } from 'zod'

export const pluginCatalogUrl =
  'https://raw.githubusercontent.com/poooi/poi/master/assets/data/plugin.json'

const localizedText = z
  .object({ 'en-US': z.string().min(1) })
  .catchall(z.string().min(1))

export const catalogSchema = z.record(
  z.string().regex(/^poi-plugin-[a-z0-9-]+$/),
  z.object({
    name: localizedText,
    description: localizedText,
    icon: z.string(),
    author: z.string(),
    link: z.url({ protocol: /^https?$/ }),
  }),
)
