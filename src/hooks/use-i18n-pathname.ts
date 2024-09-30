import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export const useI18nPathname = () => {
  const pathname = usePathname()
  const { i18n } = useTranslation()

  if (pathname === `/${i18n.language}`) {
    return '/'
  }

  if (pathname.startsWith(`/${i18n.language}/`)) {
    return pathname.replace(new RegExp(`^/${i18n.language}`), '')
  }

  return pathname
}
