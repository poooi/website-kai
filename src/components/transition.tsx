'use client'

import { type ComponentProps } from 'react'

import { cn } from '~/lib/utils'

type TransitionProps = ComponentProps<'main'> & {
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
  return (
    <main
      className={cn('page-enter', variant === 'page' && pageLayout, className)}
      {...props}
    >
      {children}
    </main>
  )
}
