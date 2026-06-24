'use client'

import { type Resource, createInstance } from 'i18next'
import { type FC, type PropsWithChildren, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'

import { initTranslations } from '~/i18n'

interface I18nProviderProps extends PropsWithChildren {
  locale: string
  namespaces: string[]
  resources: Resource
}

export const I18nProvider: FC<I18nProviderProps> = ({
  children,
  locale,
  namespaces,
  resources,
}) => {
  const i18n = useMemo(() => {
    const instance = createInstance()
    void initTranslations(locale, namespaces, instance, resources)
    return instance
  }, [locale, namespaces, resources])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
