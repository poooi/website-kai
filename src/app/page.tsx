import { ThemeChooser } from '~/components/theme-chooser'
import { LanguageProvider } from '@inlang/paraglide-next'

export default function HomePage() {
  return (
    <LanguageProvider>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <ThemeChooser />
      </main>
    </LanguageProvider>
  )
}
