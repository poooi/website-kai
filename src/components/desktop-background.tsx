'use client'

import { useEffect, useState } from 'react'

import { Background } from '~/components/background'

interface DesktopBackgroundProps {
  initialEnabled?: boolean
}

export const DesktopBackground = ({
  initialEnabled = false,
}: DesktopBackgroundProps) => {
  const [enabled, setEnabled] = useState(initialEnabled)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const handleChange = () => setEnabled(media.matches)
    handleChange()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return enabled ? <Background /> : null
}
