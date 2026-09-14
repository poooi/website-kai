// The official v4 shims file is a UMD bundle without shipped types.
declare module '@fortawesome/fontawesome-free/js/v4-shims.js' {
  import type { IconPrefix } from '@fortawesome/fontawesome-svg-core'

  export type FontAwesomeShim = [
    string | number,
    IconPrefix | null,
    string | null,
  ]
  const shims: FontAwesomeShim[]
  export default shims
}
