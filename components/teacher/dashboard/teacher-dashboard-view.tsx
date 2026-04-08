'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  BookOpen,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { TeacherUpcomingClassesCard } from '@/components/teacher/dashboard/teacher-upcoming-classes-card'
import { TeacherLastDeliveriesCard } from '@/components/teacher/dashboard/teacher-last-deliveries-card'
import { TeacherCourseSummaryCard } from '@/components/teacher/dashboard/teacher-course-summary-card'
import type { ProfesorDashboardResponse } from '@/lib/teacher/dashboard/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTodayLabel() {
  return format(new Date(), "EEEE d 'de' MMMM", { locale: es })
}

// ─── Banner de urgencia (full-width, condicional) ─────────────────────────────

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
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/25 dark:text-amber-400 hover:-translate-y-[1px] hover:shadow-sm"
      >
        Ver entregas
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function TeacherDashboardView({
  dashboard,
}: {
  dashboard: ProfesorDashboardResponse
}) {
  const pendientes = dashboard.entregasPendientesCorreccionCount
  const chipBase =
    'flex items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-1.5 transition-all duration-200 ease-out hover:bg-background hover:border-border hover:shadow-sm hover:-translate-y-[1px]'

  return (
    <div className="space-y-6">

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/90 px-7 py-6 shadow-[0_12px_36px_-18px_rgba(15,23,42,0.14)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,59,123,0.07),transparent_40%)]" />

        <div className="relative">
          {/* Label */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
            Panel docente
          </p>

          {/* Title */}
          <h2 className="mt-1.5 text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground">
            Hola, {dashboard.nombre} 👋
          </h2>

          {/* Contexto dinámico */}
          <p className="mt-1 text-sm text-muted-foreground">
            {pendientes > 0
              ? `Tenés ${pendientes} ${pendientes === 1 ? 'entrega pendiente' : 'entregas pendientes'
              } para corregir`
              : 'Todo al día. Podés enfocarte en tus próximas clases'}
          </p>

          {/* Fecha */}
          <p className="mt-0.5 text-[12px] capitalize text-muted-foreground/70">
            {formatTodayLabel()}
          </p>

          {/* KPIs + acción */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <div className={chipBase}>
              <BookOpen className="size-3.5 text-muted-foreground/60" />
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {dashboard.cantidadCursos}
              </span>
              <span className="text-xs text-muted-foreground">cursos</span>
            </div>

            <div className={chipBase}>
              <Users className="size-3.5 text-muted-foreground/60" />
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {dashboard.cantidadAlumnos}
              </span>
              <span className="text-xs text-muted-foreground">alumnos</span>
            </div>

            {pendientes > 0 ? (
              <a
                href="/teacher/courses"
                className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors hover:-translate-y-[1px] hover:shadow-sm"
              >
                Ver cursos
                <ChevronRight className="size-3.5" />
              </a>

            ) : (
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 transition-all duration-200 ease-out cursor-pointer hover:bg-emerald-500/12 hover:-translate-y-[1px] hover:shadow-sm">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Correcciones al día
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Banner urgente (solo si hay pendientes) ───────────────────────── */}
      <UrgentCorrectionsBanner count={pendientes} />

      {/* ── 3. Agenda / Entregas recientes ───────────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[2fr_3fr]">
        <TeacherUpcomingClassesCard
          proximasClases={dashboard.proximasClases}
        />

        <div id="entregas">
          <TeacherLastDeliveriesCard items={dashboard.ultimasEntregas} />
        </div>
      </div>

      {/* ── 4. Mis cursos (full-width) ───────────────────────────────────────── */}
      <TeacherCourseSummaryCard items={dashboard.resumenPorCurso} />

    </div>
  )
}