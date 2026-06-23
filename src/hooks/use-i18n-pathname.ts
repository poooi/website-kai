import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'

const locationChangeEvent = 'locationchange'
let hydrated = false
let subscribers = 0
let originalPushState: History['pushState'] | undefined
let originalReplaceState: History['replaceState'] | undefined

const patchHistory = () => {
  if (originalPushState || originalReplaceState) {
    return
  }

  const dispatchLocationChange = () => {
    window.dispatchEvent(new Event(locationChangeEvent))
  }
  originalPushState = window.history.pushState.bind(window.history)
  originalReplaceState = window.history.replaceState.bind(window.history)
  window.history.pushState = function pushStateWithLocationChange(...args) {
    const result = originalPushState!(...args)
    dispatchLocationChange()
    return result
  }
  window.history.replaceState = function replaceStateWithLocationChange(
    ...args
  ) {
    const result = originalReplaceState!(...args)
    dispatchLocationChange()
    return result
  }
}

const restoreHistory = () => {
  if (subscribers > 0 || !originalPushState || !originalReplaceState) {
    return
  }

  window.history.pushState = originalPushState
  window.history.replaceState = originalReplaceState
  originalPushState = undefined
  originalReplaceState = undefined
}

const subscribe = (onStoreChange: () => void) => {
  patchHistory()
  subscribers += 1
  let active = true
  queueMicrotask(() => {
    if (!active) {
      return
    }
    hydrated = true
    onStoreChange()
  })
  window.addEventListener('popstate', onStoreChange)
  window.addEventListener(locationChangeEvent, onStoreChange)
  return () => {
    window.removeEventListener('popstate', onStoreChange)
    window.removeEventListener(locationChangeEvent, onStoreChange)
    active = false
    subscribers -= 1
    restoreHistory()
  }
}

const getPathname = () => (hydrated ? window.location.pathname : undefined)

const getServerSnapshot = () => undefined

export const useI18nPathname = () => {
  const pathname = useSyncExternalStore(
    subscribe,
    getPathname,
    getServerSnapshot,
  )
  const { i18n } = useTranslation()

  if (!pathname) {
    return undefined
  }

  if (pathname === `/${i18n.language}`) {
    return '/'
  }

  if (pathname.startsWith(`/${i18n.language}/`)) {
    return pathname.replace(new RegExp(`^/${i18n.language}`), '')
  }

  return pathname
}
