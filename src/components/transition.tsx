'use client'

import { useLayoutEffect } from 'react'
import {
  type HTMLMotionProps,
  motion,
  useAnimationControls,
  useReducedMotion,
} from 'framer-motion'

import { cn } from '~/lib/utils'

type TransitionProps = Omit<HTMLMotionProps<'main'>, 'variant'> & {
  variant?: 'page' | 'home'
}

const pageLayout =
  'mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-10 sm:px-10 sm:pt-14 lg:px-16'

export const Transition = ({
  children,
  className,
  variant = 'page',
  ...props
}: TransitionProps) => {
  const controls = useAnimationControls()
  const reducedMotion = useReducedMotion()
  useLayoutEffect(() => {
    if (reducedMotion) {
      controls.set({ opacity: 1, y: 0 })
      return
    }
    controls.set({ opacity: 0, y: 20 })
    void controls.start({
      opacity: 1,
      y: 0,
      transition: { ease: 'easeInOut', duration: 0.5 },
    })
    return () => controls.stop()
  }, [controls, reducedMotion])
  return (
    <motion.main
      initial={false}
      animate={controls}
      className={cn(variant === 'page' && pageLayout, className)}
      {...props}
    >
      {children}
    </motion.main>
  )
}
