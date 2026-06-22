import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '~/components/ui/button'

export const Route = createFileRoute('/')({
  component: TanStackPreviewPage,
})

function TanStackPreviewPage() {
  return (
    <main className="flex min-h-screen flex-col items-start gap-4 bg-background p-4 text-foreground">
      <h1 className="text-4xl">poi TanStack preview</h1>
      <p>This isolated TanStack Start route proves the scaffold builds.</p>
      <Button asChild>
        <Link to="/status">Status route</Link>
      </Button>
    </main>
  )
}
