import type { ReactNode } from 'react'
import { Mail } from 'lucide-react'

import { UserAvatar } from '@/components/shared/user-avatar'
import { cn } from '@/lib/utils'

type EntityRosterRowProps = {
  name: string
  email: string
  avatarUrl?: string | null
  avatarFallbackClassName?: string
  status: ReactNode
  metadata?: ReactNode
  actions: ReactNode
  className?: string
}

export function EntityRosterRow({
  name,
  email,
  avatarUrl,
  avatarFallbackClassName,
  status,
  metadata,
  actions,
  className,
}: EntityRosterRowProps) {
  return (
    <article
      className={cn(
        'rounded-xl border border-border/70 bg-card/90 px-3 py-3 shadow-sm transition-colors hover:border-primary/20 hover:bg-card sm:px-4',
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <UserAvatar
            name={name}
            avatarUrl={avatarUrl}
            size={40}
            className="shrink-0"
            fallbackClassName={avatarFallbackClassName}
          />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
                {name}
              </h3>
              {status}
            </div>

            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate" title={email}>
                {email}
              </span>
            </div>

            {metadata ? (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {metadata}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          {actions}
        </div>
      </div>
    </article>
  )
}
