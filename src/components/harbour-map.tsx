import { animate, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useTheme } from './theme-runtime'
import mapUrl from '~/assets/maizuru.svg?url'

function MapArtwork() {
  const { resolvedTheme } = useTheme()
  const ref = useRef<HTMLObjectElement>(null)
  const reducedMotion = useReducedMotion()
  const animations = useRef<ReturnType<typeof animate>[]>([])
  const syncTheme = useCallback(() => {
    ref.current?.contentDocument?.documentElement.setAttribute(
      'data-theme',
      resolvedTheme,
    )
  }, [resolvedTheme])
  useLayoutEffect(syncTheme, [syncTheme])
  const reveal = useCallback(() => {
    animations.current.forEach((animation) => animation.stop())
    animations.current = []
    const document = ref.current?.contentDocument
    const svg = document?.documentElement
    if (svg?.localName !== 'svg') return
    const layers = svg.querySelectorAll<SVGElement>('#geography > *')
    layers.forEach((layer, index) => {
      const opacity = Number(layer.getAttribute('opacity') ?? 1)
      if (reducedMotion) {
        layer.style.opacity = String(opacity)
        return
      }
      layer.style.opacity = '0'
      animations.current.push(
        animate(0, opacity, {
          duration: 0.7,
          delay: index * 0.09,
          ease: 'easeInOut',
          // Embedded SVG elements belong to a different DOM realm.
          onUpdate: (value) => {
            layer.style.opacity = String(value)
          },
        }),
      )
    })
  }, [reducedMotion])

  useEffect(() => {
    reveal()
    return () => animations.current.forEach((animation) => animation.stop())
  }, [reveal])

  return (
    <object
      ref={ref}
      onLoad={() => {
        syncTheme()
        reveal()
      }}
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
