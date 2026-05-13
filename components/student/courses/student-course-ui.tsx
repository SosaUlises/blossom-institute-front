import type { ComponentType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type StudentIcon = ComponentType<{ className?: string }>

export const studentUi = {
  card: {
    feed:
      'rounded-xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-all duration-200 ease-out hover:border-primary/20 hover:bg-card dark:bg-card/90 dark:hover:bg-card',
    panel:
      'rounded-2xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90',
    item:
      'rounded-lg border border-border/60 bg-background/70 transition-colors duration-200 ease-out hover:border-border hover:bg-muted/25 dark:bg-background/35 dark:hover:bg-muted/20',
    grade:
      'rounded-xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors duration-200 ease-out hover:border-primary/20 hover:bg-card dark:bg-card/90 sm:p-5',
    empty:
      'rounded-xl border border-dashed border-border/70 bg-muted/15 dark:bg-muted/10',
    document:
      'rounded-xl border border-border/70 bg-card/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90 sm:p-6',
    callout:
      'rounded-lg border border-border/60 bg-muted/15 px-4 py-3 text-sm leading-6 text-muted-foreground dark:bg-muted/10',
    learning:
      'rounded-lg border border-primary/15 bg-primary/[0.035] px-4 py-3 text-sm leading-6 text-foreground/85 dark:bg-primary/10',
  },
  badge: {
    status:
      'inline-flex max-w-full w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-left text-xs font-semibold leading-5 transition-colors duration-200 ease-out',
    secondary:
      'inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-left text-xs font-medium leading-5 text-muted-foreground transition-colors duration-200 ease-out dark:bg-background/35',
    compact:
      'inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold',
  },
  button: {
    secondaryCta:
      'inline-flex h-10 w-full items-center justify-center rounded-lg border border-border/70 bg-background/75 px-3 text-sm font-semibold text-foreground transition-colors duration-200 ease-out hover:border-primary/20 hover:bg-muted/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 active:scale-[0.99] dark:bg-background/35 sm:h-9 sm:w-fit',
    violetCta:
      'inline-flex h-10 w-full items-center justify-center rounded-lg border border-violet-200/70 bg-transparent px-3 text-sm font-semibold text-violet-700 transition-colors duration-200 ease-out hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/25 active:scale-[0.99] sm:h-9 sm:w-fit dark:border-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-200',
    ghost:
      'rounded-lg text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground focus-visible:ring-primary/25',
  },
  icon: {
    lg: 'flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-[0_1px_1px_rgba(15,23,42,0.03)] transition-colors duration-200 ease-out',
    md: 'flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200 ease-out',
    sm: 'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ease-out',
  },
  meta: {
    row: 'mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground',
    time: 'inline-flex items-center rounded-full px-1 text-xs',
  },
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
} as const

export function StudentStatusBadge({
  icon: Icon,
  className,
  children,
}: {
  icon?: StudentIcon
  className?: string
  children: ReactNode
}) {
  return (
    <span className={cn(studentUi.badge.status, className)}>
      {Icon ? <Icon className="size-4" /> : null}
      {children}
    </span>
  )
}

export function StudentSecondaryBadge({
  icon: Icon,
  className,
  children,
}: {
  icon?: StudentIcon
  className?: string
  children: ReactNode
}) {
  return (
    <span className={cn(studentUi.badge.secondary, className)}>
      {Icon ? <Icon className="size-4" /> : null}
      {children}
    </span>
  )
}

export function StudentIconContainer({
  icon: Icon,
  className,
  size = 'lg',
  children,
}: {
  icon?: StudentIcon
  className?: string
  size?: keyof typeof studentUi.icon
  children?: ReactNode
}) {
  return (
    <span className={cn(studentUi.icon[size], className)}>
      {Icon ? <Icon className={size === 'sm' ? 'size-4' : 'size-5'} /> : children}
    </span>
  )
}

export function StudentMetaRow({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn(studentUi.meta.row, className)}>{children}</div>
}
