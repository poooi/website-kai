'use client'

import { type HTMLMotionProps, motion } from 'framer-motion'

export const Transition = ({ children, ...props }: HTMLMotionProps<'div'>) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: 'easeInOut', duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
