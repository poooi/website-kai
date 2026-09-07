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
  'mx-auto w-full max-w-[960px] flex-1 px-8 pt-12 pb-[72px] max-[700px]:px-[6%] max-[700px]:pt-8 max-[700px]:pb-12'

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
