import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="size-4" />
        <span className="sr-only">Dashboard</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="size-4 text-muted-foreground" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
