'use client'

import { useMemo, useState } from 'react'

import {
  AlertTriangle,
  Users,
  ChevronRight,
  FileWarning,
  UserRoundX,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type {
  DashboardAverageGradeByCourse,
  DashboardLowManualGradeAlert,
} from '@/lib/admin/dashboard/types'
import { cn } from '@/lib/utils'

type Props = {
  studentsAtRiskThisMonthCount: number
  studentsManualLowGradesThisMonthCount: number
  studentsManualLowPerformance?: DashboardLowManualGradeAlert[]
  coursesAtRiskByManualAverage?: DashboardAverageGradeByCourse[]
}

function RiskStatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'default',
  highlight = false,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'warning'
  highlight?: boolean
}) {
  const cardTone =
    tone === 'warning'
      ? highlight
        ? 'border-amber-500/25 bg-amber-500/[0.10] shadow-[0_16px_28px_-22px_rgba(245,158,11,0.28)]'
        : 'border-amber-500/20 bg-amber-500/[0.07] shadow-[0_12px_24px_-20px_rgba(245,158,11,0.16)]'
      : 'border-border/60 bg-background/75 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.12)]'

  const iconTone =
    tone === 'warning'
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
      : 'bg-background text-muted-foreground'

  const labelTone =
    tone === 'warning'
      ? 'text-amber-700/80 dark:text-amber-400/90'
      : 'text-muted-foreground'

  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
        cardTone,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-2xl',
            iconTone,
          )}
        >
          <Icon className="size-4.5" />
        </div>

        <div className="min-w-0">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.16em]',
              labelTone,
            )}
          >
            {title}
          </p>

          <p className="mt-2 text-3xl font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}


function StudentRiskList({
  title,
  items = [],
}: {
  title: string
  items?: DashboardLowManualGradeAlert[]
}) {
  const PAGE_SIZE = 1
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount)
  }, [items, visibleCount])

  const hasMore = items.length > visibleCount
  const canCollapse = visibleCount > PAGE_SIZE

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  const handleShowLess = () => {
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400">
          <UserRoundX className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          No hay alumnos con alertas este mes.
        </div>
      ) : (
        <>
          <ul className="space-y-2.5">
            {visibleItems.map((item) => (
              <li
                key={`${item.calificacionId}-${item.alumnoId}`}
                className="rounded-2xl border border-border/50 bg-card/80 px-4 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.alumnoNombre}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.cursoNombre} · {item.titulo}
                    </p>
                  </div>

                  <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                    {item.nota.toFixed(2)}
                    <ChevronRight className="size-3.5" />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {(hasMore || canCollapse) && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Mostrando {visibleItems.length} de {items.length} alertas
              </p>

              <div className="flex items-center gap-2">
                {canCollapse && (
                  <button
                    type="button"
                    onClick={handleShowLess}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                  >
                    <ChevronUp className="size-3.5" />
                    Ver menos
                  </button>
                )}

                {hasMore && (
                  <button
                    type="button"
                    onClick={handleShowMore}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-700 transition-all duration-200 hover:bg-rose-500/15 dark:text-rose-400"
                  >
                    <ChevronDown className="size-3.5" />
                    Ver más
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CourseRiskList({
  title,
  items = [],
}: {
  title: string
  items?: DashboardAverageGradeByCourse[]
}) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-background/75 p-4 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <FileWarning className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          No hay cursos para destacar.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((course) => (
            <li
              key={course.cursoId}
              className="rounded-2xl border border-border/50 bg-card/80 px-4 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {course.cursoNombre}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Promedio manual del curso por debajo de 60.
                  </p>
                </div>

                <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {course.averageGrade.toFixed(2)}
                  <ChevronRight className="size-3.5" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminAttentionRequiredCard({
  studentsAtRiskThisMonthCount,
  studentsManualLowGradesThisMonthCount,
  studentsManualLowPerformance = [],
  coursesAtRiskByManualAverage = [],
}: Props) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Atención requerida
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3 md:grid-cols-2">
          <RiskStatCard
            title="Alumnos en riesgo"
            value={studentsAtRiskThisMonthCount}
            description="Promedio mensual general menor a 60."
            icon={Users}
            tone={studentsAtRiskThisMonthCount > 0 ? 'warning' : 'default'}
          />

          <RiskStatCard
            title="Desempeño manual bajo"
            value={studentsManualLowGradesThisMonthCount}
            description="Alumnos con al menos una calificación menor a 60 este mes."
            icon={AlertTriangle}
            tone={studentsManualLowGradesThisMonthCount > 0 ? 'warning' : 'default'}
            highlight
          />
        </div>

        <div className="grid gap-4 2xl:grid-cols-2">
          <StudentRiskList
            title="Alumnos con bajo desempeño"
            items={studentsManualLowPerformance}
          />

          <CourseRiskList
            title="Cursos con evaluaciones bajas"
            items={coursesAtRiskByManualAverage}
          />
        </div>
      </CardContent>
    </Card>
  )
}