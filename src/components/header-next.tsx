'use client'

import Link from 'next/link'
import { forwardRef } from 'react'

import { Header, type HeaderLinkProps } from '~/components/header'

const NextHeaderLink = forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ children, href, ...props }, ref) => {
    return (
      <Link href={href} ref={ref} {...props}>
        {children}
      </Link>
    )
  },
)
NextHeaderLink.displayName = 'NextHeaderLink'

export const HeaderNext = () => {
  return <Header LinkComponent={NextHeaderLink} />
}
