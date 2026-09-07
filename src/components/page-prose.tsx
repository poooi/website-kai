import { type ComponentPropsWithoutRef } from 'react'
import { cn } from '~/lib/utils'

export const PageProse = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      'prose prose-base max-w-prose dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:leading-8 prose-li:leading-8',
      className,
    )}
    {...props}
  />
)
