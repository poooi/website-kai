'use client'

import { useTranslation } from 'react-i18next'

import { Footer } from '~/components/footer'

export const FooterClient = () => {
  const { i18n, t } = useTranslation()
  return <Footer i18n={i18n} t={t} />
}
