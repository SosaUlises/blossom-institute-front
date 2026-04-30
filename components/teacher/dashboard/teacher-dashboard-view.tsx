'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

import { TeacherUpcomingClassesCard } from '@/components/teacher/dashboard/teacher-upcoming-classes-card'
import { TeacherLastDeliveriesCard } from '@/components/teacher/dashboard/teacher-last-deliveries-card'
import { TeacherCourseSummaryCard } from '@/components/teacher/dashboard/teacher-course-summary-card'
import type { ProfesorDashboardResponse } from '@/lib/teacher/dashboard/types'
import { cn } from '@/lib/utils'

function formatTodayLabel() {
  return format(new Date(), "EEEE d 'de' MMMM", { locale: es })
}

function UrgentCorrectionsBanner({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-amber-500/25 bg-amber-500/8 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-3.5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            Tenés{' '}
            <span className="text-amber-700 dark:text-amber-400">
              {count} {count === 1 ? 'entrega pendiente' : 'entregas pendientes'} de corrección
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Revisalas antes de que pasen más días sin respuesta.
          </p>
        </div>
      </div>

      <Link
        href="#entregas"
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-700 transition-colors hover:-translate-y-[1px] hover:bg-amber-500/25 hover:shadow-sm dark:text-amber-400"
      >
        Ver entregas
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  )
}

export function TeacherDashboardView({
  dashboard,
}: {
  dashboard: ProfesorDashboardResponse
}) {
  const pendientes = dashboard.entregasPendientesCorreccionCount
  const hasHeroPending = pendientes > 0

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-6 py-7 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:px-7 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.05),transparent_26%)]" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 h-[3px] w-12 rounded-full bg-primary" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              Panel docente
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.35rem]">
              Hola, {dashboard.nombre}
            </h2>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
              {hasHeroPending
                ? 'Tenés pendientes por revisar. Revisá correcciones y actividad reciente.'
                : 'Todo al día. Podés enfocarte en tus próximas clases.'}
            </p>

            <p className="mt-1 text-[12px] capitalize text-muted-foreground/70">
              {formatTodayLabel()}
            </p>
          </div>

          <div
            className={cn(
              'group inline-flex items-center gap-3 rounded-2xl border px-4 py-4 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-22px_rgba(15,23,42,0.22)]',
              hasHeroPending
                ? 'border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/15'
                : 'border-border/60 bg-background/80 hover:border-primary/20',
            )}
          >
            <div
              className={cn(
                'flex size-11 items-center justify-center rounded-2xl',
                hasHeroPending
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  : 'bg-primary/10 text-primary',
              )}
            >
              <BookOpen className="size-5" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Hoy
              </p>
              <p className="text-sm font-semibold text-foreground">
                {hasHeroPending ? 'Tenés pendientes' : 'Todo al día'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <UrgentCorrectionsBanner count={pendientes} />

      <div className="grid gap-5 xl:grid-cols-[2fr_3fr]">
        <TeacherUpcomingClassesCard
          proximasClases={dashboard.proximasClases}
        />

        <div id="entregas">
          <TeacherLastDeliveriesCard items={dashboard.ultimasEntregas} />
        </div>
      </div>

      <TeacherCourseSummaryCard items={dashboard.resumenPorCurso} />
    </div>
  )
}
