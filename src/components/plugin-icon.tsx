import '@fortawesome/fontawesome-free/css/all.min.css'
import '@fortawesome/fontawesome-free/css/v4-shims.min.css'

export function PluginIcon({ name }: { name: string }) {
  return (
    <i
      className={`fa fa-${name.replace(/^fa\//, '')} mt-1 text-2xl leading-none text-navigation [--fa-width:1.5rem]`}
      aria-hidden="true"
    />
  )
}
