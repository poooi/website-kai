'use client'

import { useLayoutEffect } from 'react'
import {
  type HTMLMotionProps,
  motion,
  useAnimationControls,
  useReducedMotion,
} from 'framer-motion'

export const Transition = ({ children, ...props }: HTMLMotionProps<'main'>) => {
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
    <motion.main initial={false} animate={controls} {...props}>
      {children}
    </motion.main>
  )
}
