import { type ComponentPropsWithoutRef } from 'react'
import { cn } from '~/lib/utils'

export const PageProse = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      'prose prose-base max-w-prose [--tw-prose-body:var(--harbour-copy)] [--tw-prose-headings:hsl(var(--foreground))] [--tw-prose-links:var(--harbour-teal)] [overflow-wrap:anywhere] dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:leading-8 prose-pre:max-w-full prose-pre:overflow-x-auto prose-li:leading-8 dark:[--tw-prose-invert-body:var(--harbour-copy)] dark:[--tw-prose-invert-headings:hsl(var(--foreground))] dark:[--tw-prose-invert-links:var(--harbour-teal)]',
      className,
    )}
    {...props}
  />
)
