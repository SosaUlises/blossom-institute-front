'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RawClassItem = {
  id: number
  cursoId: number
  fecha: string
  estado: number | string
  descripcion?: string | null
  cantAsistencias: number
  cantPresentes: number
  cantAusentes: number
}

type ClassItem = {
  claseId: number
  fecha: string
  descripcion?: string | null
  estado: 'Programada' | 'Realizada' | 'Cancelada'
  presentes: number
  ausentes: number
  total: number
}

type Envelope<T> = {
  message?: string | null
  success?: boolean
  statusCode?: number
  data?: {
    total?: number
    pageNumber?: number
    pageSize?: number
    items?: T[]
  }
}

function normalizeEstado(value: number | string | undefined): ClassItem['estado'] {
  if (typeof value === 'string') {
    if (value === 'Programada' || value === 'Realizada' || value === 'Cancelada') {
      return value
    }
  }

  switch (value) {
    case 1:
      return 'Programada'
    case 2:
      return 'Realizada'
    case 3:
      return 'Cancelada'
    default:
      return 'Programada'
  }
}

function normalizeClassItem(item: RawClassItem): ClassItem {
  return {
    claseId: item.id,
    fecha: item.fecha,
    descripcion: item.descripcion,
    estado: normalizeEstado(item.estado),
    presentes: item.cantPresentes ?? 0,
    ausentes: item.cantAusentes ?? 0,
    total: item.cantAsistencias ?? 0,
  }
}

function getEstadoClass(estado: ClassItem['estado']) {
  switch (estado) {
    case 'Realizada':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    case 'Cancelada':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
    default:
      return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
  }
}

function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function StatPill({
  icon,
  value,
  label,
  tone = 'default',
}: {
  icon: React.ReactNode
  value: number
  label: string
  tone?: 'default' | 'success' | 'danger'
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-colors',
        tone === 'success' &&
          'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400',
        tone === 'danger' &&
          'border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:text-rose-400',
        tone === 'default' &&
          'border-border/60 bg-background/85 text-muted-foreground',
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-xl bg-background/90 shadow-sm">
        {icon}
      </div>

      <div className="leading-none">
        <p className="text-base font-semibold tabular-nums">{value}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] opacity-80">
          {label}
        </p>
      </div>
    </div>
  )
}

function ClassCard({
  item,
  courseId,
}: {
  item: ClassItem
  courseId: number
}) {
  return (
    <article className="group rounded-[30px] border border-border/60 bg-card/95 px-7 py-7 shadow-[0_18px_44px_-26px_rgba(15,23,42,0.16)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-border/80 hover:bg-card hover:shadow-[0_28px_60px_-28px_rgba(15,23,42,0.25)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Calendar className="size-3.5" />
              {formatDate(item.fecha)}
            </div>

            <span
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] shadow-sm',
                getEstadoClass(item.estado),
              )}
            >
              {item.estado}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-[1.3rem] font-semibold leading-tight tracking-tight text-foreground md:text-[1.4rem]">
              {item.descripcion?.trim() || 'Clase sin descripción'}
            </h3>

            <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
              Registro de asistencia y seguimiento académico de esta clase.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill
              icon={<Users className="size-4" />}
              value={item.total}
              label="Alumnos"
            />
            <StatPill
              icon={<CheckCircle2 className="size-4" />}
              value={item.presentes}
              label="Presentes"
              tone="success"
            />
            <StatPill
              icon={<XCircle className="size-4" />}
              value={item.ausentes}
              label="Ausentes"
              tone="danger"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center xl:pt-1">
          <Button
            asChild
            className="h-11 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/90 hover:shadow-lg"
          >
            <Link href={`/teacher/courses/${courseId}/classes/${encodeURIComponent(item.fecha)}`}>
              Ver detalle
              <ChevronRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

function ClassCardSkeleton() {
  return (
    <div className="rounded-[30px] border border-border/60 bg-card/95 px-7 py-7 shadow-[0_18px_44px_-26px_rgba(15,23,42,0.16)]">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-32 animate-pulse rounded-full bg-muted/40" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted/35" />
        </div>

        <div className="space-y-3">
          <div className="h-7 w-3/5 animate-pulse rounded-xl bg-muted/40" />
          <div className="h-4 w-2/3 animate-pulse rounded-lg bg-muted/30" />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="h-14 w-32 animate-pulse rounded-2xl bg-muted/35" />
          <div className="h-14 w-36 animate-pulse rounded-2xl bg-muted/35" />
          <div className="h-14 w-34 animate-pulse rounded-2xl bg-muted/35" />
        </div>

        <div className="h-11 w-36 animate-pulse rounded-2xl bg-muted/40" />
      </div>
    </div>
  )
}

export function TeacherCourseClasses({ courseId }: { courseId: number }) {
  const [data, setData] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/classes`, {
          cache: 'no-store',
        })

        const result = (await response.json()) as Envelope<RawClassItem>

        if (!response.ok) {
          throw new Error(result.message || 'Error al cargar clases')
        }

        const rawItems = result.data?.items ?? []
        const normalized = rawItems.map((item) => normalizeClassItem(item))

        setData(normalized)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  if (loading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <ClassCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-[26px] border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center text-sm text-muted-foreground">
        No hay clases registradas.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {data.map((item) => (
        <ClassCard
          key={`${item.claseId}-${item.fecha}`}
          item={item}
          courseId={courseId}
        />
      ))}
    </div>
  )
}