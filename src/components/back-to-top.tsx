'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '~/components/ui/button'
import { m } from '~/paraglide/messages'

const scrollThreshold = 600

export const BackToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setVisible(window.scrollY > scrollThreshold)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  if (!visible) return null

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={m.backToTop()}
      title={m.backToTop()}
      onClick={() => {
        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
        document
          .querySelector<HTMLElement>('main')
          ?.focus({ preventScroll: true })
      }}
      className="fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 h-11 w-11"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </Button>
  )
}
