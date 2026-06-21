import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: TanStackPreviewPage,
})

function TanStackPreviewPage() {
  return (
    <main>
      <h1>poi TanStack preview</h1>
      <p>This isolated TanStack Start route proves the scaffold builds.</p>
    </main>
  )
}
