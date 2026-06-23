'use client'

import Link from 'next/link'

import { Header, type HeaderLinkProps } from '~/components/header'

const NextHeaderLink = ({ children, href, ...props }: HeaderLinkProps) => {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

export const HeaderNext = () => {
  return <Header LinkComponent={NextHeaderLink} />
}
