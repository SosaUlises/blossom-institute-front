'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { AlertCircle, Inbox, Loader2 } from 'lucide-react'

import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ReportPageShell({
  title,
  description,
  eyebrow = 'Centro de reportes',
  meta,
  children,
}: {
  title: string
  description: string
  eyebrow?: string
  meta?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-border/60 bg-card/95 px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          {meta ? (
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:w-[460px]">
              {meta}
            </div>
          ) : null}
        </div>
      </section>

      {children}
    </div>
  )
}

export function ReportFilterPanel({
  title = 'Generar reporte',
  description,
  children,
  action,
  error,
}: {
  title?: string
  description: string
  children: ReactNode
  action: ReactNode
  error?: string | null
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          {children}
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            {action}
          </div>
        </div>

        {error ? <ReportErrorMessage message={error} /> : null}
      </div>
    </section>
  )
}

export function ReportSummarySection({
  title = 'Resumen ejecutivo',
  description,
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function ReportResultsSection({
  title = 'Resultados',
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-border/60 bg-card/95 shadow-sm', className)}>
      <div className="border-b border-border/60 px-5 py-4 sm:px-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}

export function ReportExportSection({
  children,
  description = 'Exportá los resultados generados con los filtros actuales.',
  details,
}: {
  children: ReactNode
  description?: string
  details?: {
    label: string
    value: string | number
  }[]
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Exportación
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        {details?.length ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {detail.label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Formatos
            </p>
            <p className="text-sm text-muted-foreground">
              Usá los filtros aplicados al reporte generado.
            </p>
          </div>
          <div className="w-full sm:w-auto">{children}</div>
        </div>
      </div>
    </section>
  )
}

export function ReportLoadingState({
  title = 'Generando reporte',
  description = 'Estamos preparando los resultados con los filtros aplicados.',
}: {
  title?: string
  description?: string
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="h-10 rounded-xl bg-muted/55" />
            <div className="h-10 rounded-xl bg-muted/45" />
            <div className="h-10 rounded-xl bg-muted/35" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function ReportEmptyState({
  title = 'Sin resultados',
  description = 'No encontramos registros para los filtros aplicados.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-5 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-background text-muted-foreground">
        <Inbox className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export function ReportEmptyTableRow({
  colSpan,
  title = 'Sin resultados',
  description = 'No encontramos registros para los filtros aplicados.',
}: {
  colSpan: number
  title?: string
  description?: string
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10">
        <ReportEmptyState title={title} description={description} />
      </td>
    </tr>
  )
}

export function ReportErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p className="leading-6">{message}</p>
    </div>
  )
}

export function ReportExportUnavailable({
  message = 'Exportación no disponible para este reporte.',
}: {
  message?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export function ReportExportButton({
  href,
  filename,
  label,
  icon,
  disabled = false,
}: {
  href?: string
  filename: string
  label: string
  icon: ReactNode
  disabled?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!href || disabled || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(href, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'No se pudo exportar el reporte.')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={!href || disabled || loading}
        aria-busy={loading}
        onClick={handleExport}
        className="h-11 w-full rounded-2xl border-border/70 bg-background/75 text-foreground shadow-sm transition duration-150 hover:border-primary/20 hover:bg-card hover:text-foreground active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {icon}
        {loading ? 'Exportando...' : label}
      </Button>
      {error ? <ReportErrorMessage message={error} /> : null}
    </div>
  )
}

export function getStudentProfileHref(id: number | string) {
  return `/admin/dashboard/students/${id}/profile`
}

export function getCourseProfileHref(id: number | string) {
  return `/admin/dashboard/courses/${id}/profile`
}

export function getTeacherProfileHref(id: number | string) {
  return `/admin/dashboard/teachers/${id}/profile`
}

export function ReportPersonLink({
  href,
  name,
  avatarUrl,
  subtitle,
  className,
}: {
  href: string
  name: string
  avatarUrl?: string | null
  subtitle?: string | null
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex max-w-full items-center gap-3 rounded-2xl px-1 py-1 text-left transition duration-150 hover:bg-muted/35 active:scale-[0.99]',
        className,
      )}
    >
      <UserAvatar
        name={name}
        avatarUrl={avatarUrl}
        size={34}
        className="shrink-0 rounded-xl"
        fallbackClassName="bg-primary/10 text-xs text-primary"
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
          {name}
        </span>
        {subtitle ? (
          <span className="block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  )
}

export function ReportEntityLink({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex max-w-full items-center rounded-xl text-foreground underline-offset-4 transition duration-150 hover:text-primary hover:underline active:scale-[0.99]',
        className,
      )}
    >
      <span className="truncate">{label}</span>
    </Link>
  )
}

export function buildReportFilename(
  parts: Array<string | number | null | undefined>,
  extension: string
) {
  const base = parts
    .filter((part) => part !== null && part !== undefined && String(part).trim() !== '')
    .map((part) =>
      String(part)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .filter(Boolean)
    .join('-')

  return `${base || 'reporte'}.${extension}`
}
