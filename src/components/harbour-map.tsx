import { animate, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useTheme } from './theme-runtime'

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
      data="/maps/maizuru.svg"
      type="image/svg+xml"
      className="h-full w-full"
      tabIndex={-1}
      aria-hidden="true"
    />
  )
}

export function HarbourMap() {
  return (
    <div className="harbour-chart" aria-hidden="true">
      <MapArtwork />
    </div>
  )
}
