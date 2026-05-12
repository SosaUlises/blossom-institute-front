import type { ComponentType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type StudentIcon = ComponentType<{ className?: string }>

export const studentUi = {
  card: {
    feed:
      'rounded-[24px] border border-border/70 bg-card shadow-[0_14px_34px_-28px_rgba(15,23,42,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/20 hover:shadow-[0_20px_44px_-30px_rgba(15,23,42,0.32)]',
    panel:
      'rounded-[30px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]',
    item:
      'rounded-2xl border border-border/60 bg-background/75 transition-colors hover:bg-muted/30',
    grade:
      'rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.16)] transition-colors hover:border-primary/20 hover:bg-card sm:p-5',
    empty:
      'rounded-2xl border border-dashed border-border/70 bg-muted/15',
  },
  badge: {
    status:
      'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold',
    secondary:
      'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/75 px-2.5 py-1 text-sm font-medium text-muted-foreground',
    compact:
      'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
  },
  button: {
    secondaryCta:
      'inline-flex h-9 w-full items-center justify-center rounded-xl border border-border/70 bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/20 hover:bg-muted/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:w-fit',
    violetCta:
      'inline-flex h-9 w-full items-center justify-center rounded-xl border border-violet-200/70 bg-transparent px-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/25 sm:w-fit dark:border-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-200',
    ghost:
      'rounded-xl text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-primary/30',
  },
  icon: {
    lg: 'flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm',
    md: 'flex size-11 shrink-0 items-center justify-center rounded-2xl border',
    sm: 'flex size-8 shrink-0 items-center justify-center rounded-xl',
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
