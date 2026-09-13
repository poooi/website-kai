'use client'

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ComponentPropsWithoutRef,
} from 'react'
import { ChevronDown } from 'lucide-react'

import { LanguageChooser } from '~/components/language-chooser'
import { ThemeChooser } from '~/components/theme-chooser'
import { useI18nPathname } from '~/hooks/use-i18n-pathname'
import { localizeHref } from '~/paraglide/runtime'
import { m } from '~/paraglide/messages'

const navigationEntries = [
  { path: '/explore', label: m.explore },
  { path: '/plugins', label: m.plugins },
  { path: '/download', label: m.download },
  { path: '/changelog', label: m.changelog },
  { path: '/credits', label: m.credits },
] as const

export type HeaderPath = '/' | (typeof navigationEntries)[number]['path']

export interface HeaderLinkProps extends Omit<
  ComponentPropsWithoutRef<'a'>,
  'href'
> {
  href: HeaderPath
}

const AnchorLink = forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ children, href, ...props }, ref) => {
    return (
      <a ref={ref} href={localizeHref(href)} {...props}>
        {children}
      </a>
    )
  },
)
AnchorLink.displayName = 'AnchorLink'

interface HeaderProps {
  LinkComponent?: ComponentType<HeaderLinkProps>
}

export const Header = ({ LinkComponent = AnchorLink }: HeaderProps) => {
  const pathname = useI18nPathname()
  const headerRef = useRef<HTMLElement>(null)
  const mobileNavRef = useRef<HTMLDetailsElement>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const update = () => {
      const height = Math.ceil(header.getBoundingClientRect().height)
      document.documentElement.style.setProperty(
        '--sticky-header-offset',
        `${height}px`,
      )
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <header
      ref={headerRef}
      data-site-header
      className="sticky top-0 z-40 bg-background"
    >
      <div className="mx-[2.7%] grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-x-8 border-b px-[2.2%] font-semibold max-[1099px]:grid-cols-[auto_1fr] max-[1099px]:gap-y-1 max-[1099px]:pt-3 max-[700px]:mx-[6%] max-[700px]:px-0">
        <LinkComponent
          href="/"
          aria-label={m.returnToHomepage()}
          aria-current={pathname === '/' ? 'page' : undefined}
          className="inline-flex w-fit items-center py-2 transition-colors hover:text-navigation"
        >
          <span className="text-2xl font-bold tracking-tight">poi</span>
        </LinkComponent>
        <nav className="hidden items-stretch gap-6 self-stretch min-[1100px]:flex">
          {navigationEntries.map(({ path, label }) => (
            <LinkComponent
              key={path}
              href={path}
              aria-current={pathname === path ? 'page' : undefined}
              className="inline-flex items-center justify-center border-b-2 border-transparent px-1 py-4 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-navigation aria-[current=page]:text-navigation"
            >
              {label()}
            </LinkComponent>
          ))}
        </nav>
        <details
          ref={mobileNavRef}
          data-mobile-nav
          open={mobileNavOpen}
          onToggle={(event) => setMobileNavOpen(event.currentTarget.open)}
          onKeyDown={(event) => {
            if (event.key !== 'Escape' || !mobileNavOpen) return
            setMobileNavOpen(false)
            mobileNavRef.current?.querySelector<HTMLElement>('summary')?.focus()
          }}
          className="group max-[1099px]:order-3 max-[1099px]:col-span-2 max-[1099px]:border-b max-[1099px]:border-border min-[1100px]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 text-sm text-muted-foreground [&::-webkit-details-marker]:hidden">
            {m.menu()}
            <ChevronDown
              className="h-4 w-4 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <nav className="pb-3">
            <ul className="grid grid-cols-1">
              {navigationEntries.map(({ path, label }) => (
                <li
                  key={path}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <LinkComponent
                    href={path}
                    aria-current={pathname === path ? 'page' : undefined}
                    onClick={closeMobileNav}
                    className="flex items-center border-l-2 border-transparent py-3 pl-3 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-navigation aria-[current=page]:text-navigation"
                  >
                    {label()}
                  </LinkComponent>
                </li>
              ))}
            </ul>
          </nav>
        </details>
        <div className="ml-auto flex shrink-0 items-center gap-6 max-[700px]:gap-1">
          <a
            className="whitespace-nowrap hover:underline hover:underline-offset-[5px] max-[700px]:hidden"
            href="https://github.com/poooi/poi"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <LanguageChooser />
          <ThemeChooser />
        </div>
      </div>
    </header>
  )
}
