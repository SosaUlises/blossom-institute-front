import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  rootHref?: string
  rootLabel?: string
}

export function Breadcrumbs({
  items,
  className,
  rootHref = '/admin/dashboard',
  rootLabel = 'Dashboard',
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-1 text-sm text-muted-foreground',
        className,
      )}
    >
      <Link
        href={rootHref}
        className="flex items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Home className="size-4" />
        <span className="sr-only">{rootLabel}</span>
      </Link>

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
          <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" />
          {item.href ? (
            <Link
              href={item.href}
              className="truncate rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

export function AdminBreadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  return (
    <Breadcrumbs
      items={items}
      className={className}
      rootHref="/admin/dashboard"
      rootLabel="Dashboard"
    />
  )
}
