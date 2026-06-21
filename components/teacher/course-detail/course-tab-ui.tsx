import type { ComponentType, ReactNode } from 'react'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function CourseTabToolbar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border/60 bg-background/45 p-2',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function CourseTabSearchField({
  value,
  onChange,
  placeholder,
  className,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  ariaLabel?: string
}) {
  return (
    <div className={cn('relative min-w-0 w-full', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-10 rounded-xl border-border/60 bg-background/75 pl-10 text-sm shadow-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-background/35"
      />
    </div>
  )
}

export function CourseTabEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: ComponentType<{ className?: string }>
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-background/35 px-4 py-4',
        className,
      )}
    >
      {Icon ? (
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      ) : null}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function CourseTabErrorState({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CourseTabSkeletonList({
  children,
  className,
  label = 'Cargando contenido.',
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {label}
      </p>
      <div aria-hidden="true" className={cn('space-y-2.5', className)}>
        {children}
      </div>
    </>
  )
}

export function CourseTabPagination({
  label,
  page,
  totalPages,
  onPrevious,
  onNext,
  className,
}: {
  label: string
  page: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  className?: string
}) {
  return (
    <footer
      className={cn(
        'flex flex-col gap-2.5 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:items-center">
        <Button
          variant="outline"
          className="h-9 rounded-lg border-border/70 bg-background/70 px-3 shadow-none transition-[border-color,background-color,color,transform] duration-150 ease-out hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] disabled:opacity-40"
          disabled={page === 1}
          onClick={onPrevious}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          className="h-9 rounded-lg border-border/70 bg-background/70 px-3 shadow-none transition-[border-color,background-color,color,transform] duration-150 ease-out hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Siguiente
        </Button>
      </div>
    </footer>
  )
}
