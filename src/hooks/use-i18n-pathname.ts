import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'

const locationChangeEvent = 'locationchange'

const patchHistory = () => {
  const historyWithPatchState = window.history as History & {
    __poiLocationPatched?: boolean
  }
  if (historyWithPatchState.__poiLocationPatched) {
    return
  }

  const dispatchLocationChange = () => {
    window.dispatchEvent(new Event(locationChangeEvent))
  }
  const pushState = window.history.pushState.bind(window.history)
  const replaceState = window.history.replaceState.bind(window.history)
  window.history.pushState = function pushStateWithLocationChange(...args) {
    const result = pushState.apply(this, args)
    dispatchLocationChange()
    return result
  }
  window.history.replaceState = function replaceStateWithLocationChange(
    ...args
  ) {
    const result = replaceState.apply(this, args)
    dispatchLocationChange()
    return result
  }
  historyWithPatchState.__poiLocationPatched = true
}

const subscribe = (onStoreChange: () => void) => {
  patchHistory()
  window.addEventListener('popstate', onStoreChange)
  window.addEventListener(locationChangeEvent, onStoreChange)
  return () => {
    window.removeEventListener('popstate', onStoreChange)
    window.removeEventListener(locationChangeEvent, onStoreChange)
  }
}

const getPathname = () => window.location.pathname

const getServerSnapshot = () => '/'

export const useI18nPathname = () => {
  const pathname = useSyncExternalStore(
    subscribe,
    getPathname,
    getServerSnapshot,
  )
  const { i18n } = useTranslation()

  if (pathname === `/${i18n.language}`) {
    return '/'
  }

  if (pathname.startsWith(`/${i18n.language}/`)) {
    return pathname.replace(new RegExp(`^/${i18n.language}`), '')
  }

  return pathname
}
