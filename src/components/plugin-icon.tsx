import type { PluginIcon as PluginIconGeometry } from '~/lib/plugin-icons'

export function PluginIcon({ icon }: { icon?: PluginIconGeometry }) {
  if (!icon) {
    return <span className="mt-1 h-6 w-6 shrink-0" aria-hidden="true" />
  }

  return (
    <svg
      viewBox={icon.viewBox}
      className="mt-1 h-6 w-6 shrink-0 fill-current text-navigation"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} />
    </svg>
  )
}
