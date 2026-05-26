import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type WorkspaceHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
  metadata?: ReactNode
  className?: string
}

export function WorkspaceHeader({
  title,
  description,
  action,
  metadata,
  className,
}: WorkspaceHeaderProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm dark:bg-card/70 sm:p-5',
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {(metadata || action) ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            {metadata ? (
              <div className="rounded-xl border border-border/60 bg-background/65 px-3 py-2 text-sm text-muted-foreground shadow-none dark:bg-background/30">
                {metadata}
              </div>
            ) : null}
            {action}
          </div>
        ) : null}
      </div>
    </section>
  )
}
