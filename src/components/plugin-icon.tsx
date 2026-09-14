import { config, type IconDefinition } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// The core stylesheet is bundled instead of injected at runtime, so icons are
// correctly sized during SSR and no style tag is added after hydration.
config.autoAddCss = false

export function PluginIcon({ icon }: { icon?: IconDefinition }) {
  if (!icon) {
    return <span aria-hidden="true" className="mt-1 block h-6 w-6 shrink-0" />
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      aria-hidden="true"
      className="mt-1 shrink-0 text-2xl leading-none text-navigation [--fa-width:1.5rem]"
    />
  )
}
