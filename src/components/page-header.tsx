import { type ReactNode } from 'react'

export const PageHeader = ({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) => (
  <header className="mb-10 border-b pb-8 sm:mb-12 sm:pb-10">
    <h1 className="m-0 text-4xl font-medium leading-tight tracking-tight sm:text-5xl sm:leading-tight lg:text-6xl">
      {title}
    </h1>
    {children && (
      <div className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        {children}
      </div>
    )}
  </header>
)
