import { useCallback, useLayoutEffect, useRef } from 'react'
import { useTheme } from './theme-runtime'
import mapUrl from '~/assets/maizuru.svg?url'

function MapArtwork() {
  const { resolvedTheme } = useTheme()
  const ref = useRef<HTMLObjectElement>(null)
  // The SVG reads the parent theme before its first paint; keep later changes in sync.
  const syncTheme = useCallback(() => {
    ref.current?.contentDocument?.documentElement.setAttribute(
      'data-theme',
      resolvedTheme,
    )
  }, [resolvedTheme])
  useLayoutEffect(syncTheme, [syncTheme])

  return (
    <object
      ref={ref}
      onLoad={syncTheme}
      data={mapUrl}
      type="image/svg+xml"
      className="h-full w-full"
      tabIndex={-1}
      aria-hidden="true"
    />
  )
}

export function HarbourMap() {
  return (
    <div
      className="harbour-chart pointer-events-none absolute top-0 left-[27.1%] h-full w-[72.9%] [mask-image:linear-gradient(90deg,transparent,#000_10%)] max-[700px]:top-auto max-[700px]:bottom-0 max-[700px]:left-0 max-[700px]:h-[430px] max-[700px]:w-[135%] max-[700px]:[mask-image:linear-gradient(180deg,transparent,#000_23%)] min-[701px]:max-[1100px]:[mask-image:linear-gradient(90deg,transparent,#00000010_28%,#000_64%)]"
      aria-hidden="true"
    >
      <MapArtwork />
    </div>
  )
}
