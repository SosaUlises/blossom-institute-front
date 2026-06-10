'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileCheck2,
  Inbox,
} from 'lucide-react'

import {
  EstadoClase,
  EstadoEntrega,
  type ProfesorDashboardAlumnoAtencionItem,
  type ProfesorDashboardProximaClaseItem,
  type ProfesorDashboardResponse,
  type ProfesorDashboardUltimaClaseItem,
  type ProfesorDashboardUltimaEntregaItem,
} from '@/lib/teacher/dashboard/types'
import { UserAvatar } from '@/components/shared/user-avatar'
import { cn } from '@/lib/utils'

type Tone = 'default' | 'primary' | 'emerald' | 'rose' | 'sky'

const toneStyles: Record<Tone, { badge: string; icon: string; card: string }> = {
  default: {
    badge: 'border-border/60 bg-muted/30 text-muted-foreground',
    icon: 'bg-muted/45 text-muted-foreground',
    card: 'border-border/60 bg-background/60 dark:bg-background/30',
  },
  primary: {
    badge: 'border-primary/15 bg-primary/10 text-primary',
    icon: 'bg-primary/10 text-primary',
    card: 'border-primary/15 bg-primary/[0.045] dark:bg-primary/10',
  },
  emerald: {
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    card: 'border-emerald-500/20 bg-emerald-500/[0.055]',
  },
  rose: {
    badge: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    card: 'border-rose-500/20 bg-rose-500/[0.055]',
  },
  sky: {
    badge: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
    icon: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    card: 'border-sky-500/20 bg-sky-500/[0.055]',
  },
}

function formatTodayLabel() {
  const value = format(new Date(), "EEEE d 'de' MMMM", { locale: es })
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getDatePart(value: string) {
  return value.split('T')[0]
}

function parseLocalDate(value: string) {
  const [year, month, day] = getDatePart(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

function buildDateTime(dateStr: string, timeStr: string) {
  const date = parseLocalDate(dateStr)
  const [hours, minutes] = timeStr.slice(0, 5).split(':').map(Number)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function formatClassDate(value: string) {
  const date = parseLocalDate(value)
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, 'EEE d MMM', { locale: es })
}

function formatTimeRange(item: ProfesorDashboardProximaClaseItem) {
  return `${item.horaInicio.slice(0, 5)} - ${item.horaFin.slice(0, 5)}`
}

function formatRelative(value: string) {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: es,
  })
}

function getFutureClasses(items: ProfesorDashboardProximaClaseItem[]) {
  const now = new Date()

  return [...items]
    .filter((item) => buildDateTime(item.fecha, item.horaFin).getTime() > now.getTime())
    .sort(
      (a, b) =>
        buildDateTime(a.fecha, a.horaInicio).getTime() -
        buildDateTime(b.fecha, b.horaInicio).getTime(),
    )
}

function getPendingDeliveries(items: ProfesorDashboardUltimaEntregaItem[]) {
  return [...items]
    .filter((item) => !item.tieneFeedbackVigente)
    .sort((a, b) => {
      const aLate = a.estadoEntrega === EstadoEntrega.FueraDeTermino ? 0 : 1
      const bLate = b.estadoEntrega === EstadoEntrega.FueraDeTermino ? 0 : 1
      if (aLate !== bLate) return aLate - bLate
      return new Date(a.fechaEntregaUtc).getTime() - new Date(b.fechaEntregaUtc).getTime()
    })
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-3.5 py-3.5 text-sm text-muted-foreground dark:bg-muted/5">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 leading-5">{description}</p>
        </div>
      </div>
    </div>
  )
}

function DayHeader({
  nextClass,
  pendingCount,
}: {
  nextClass?: ProfesorDashboardProximaClaseItem
  pendingCount: number
}) {
  const nextClassIsToday = nextClass
    ? isToday(parseLocalDate(nextClass.fecha))
    : false
  const pendingCopy =
    pendingCount === 1
      ? '1 entrega esperando devolución'
      : `${pendingCount} entregas esperando devolución`
  const classCopy = nextClass
    ? `Tu próxima clase es ${nextClass.cursoNombre} ${
        nextClassIsToday ? 'hoy' : formatClassDate(nextClass.fecha).toLowerCase()
      } a las ${nextClass.horaInicio.slice(0, 5)}.`
    : null
  const summary =
    classCopy && pendingCount > 0
      ? `${classCopy} También tenés ${pendingCopy}.`
      : classCopy
        ? classCopy
        : pendingCount > 0
          ? `Tenés ${pendingCopy}.`
          : 'No tenés clases próximas ni entregas esperando devolución.'

  return (
    <header className="border-b border-border/60 pb-4">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Hoy en tus clases
        </h1>
        <p className="mt-2.5 text-sm leading-6 text-foreground/85 sm:text-[15px]">
          {summary}
        </p>
        <p className="mt-1.5 text-sm capitalize text-muted-foreground">
          {formatTodayLabel()}
        </p>
      </div>
    </header>
  )
}

function TodayClassCard({
  item,
  description,
}: {
  item: ProfesorDashboardProximaClaseItem
  description?: string | null
}) {
  const today = isToday(parseLocalDate(item.fecha))

  return (
    <article className="border-t border-border/60 pt-5">
      <div className="max-w-3xl">
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {item.cursoNombre}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          <span
            className={cn(
              'font-semibold',
              today ? 'text-primary' : 'text-foreground/80',
            )}
          >
            {formatClassDate(item.fecha)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-foreground/80">
            <Clock3 className="size-4 text-muted-foreground" />
            {formatTimeRange(item)}
          </span>
        </div>

        {description?.trim() ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {today ? (
            <>
              <Link
                href={`/teacher/courses/${item.cursoId}/classes/take`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Tomar asistencia
              </Link>
              <Link
                href={`/teacher/courses/${item.cursoId}/classes/${encodeURIComponent(getDatePart(item.fecha))}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border/70 bg-background/60 px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
              >
                Ver clase
              </Link>
            </>
          ) : (
            <Link
              href={`/teacher/courses/${item.cursoId}`}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-fit"
            >
              Abrir curso
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

function NextClass({
  item,
  description,
}: {
  item?: ProfesorDashboardProximaClaseItem
  description?: string | null
}) {
  return (
    <section className="space-y-3 rounded-xl border border-primary/20 bg-card/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] dark:border-primary/25 dark:bg-card/90 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarCheck2 className="size-4" />
        </span>
        <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Próxima clase
        </h2>
      </div>

      {item ? (
        <TodayClassCard item={item} description={description} />
      ) : (
        <EmptyState
          icon={CalendarCheck2}
          title="Sin clases próximas"
          description="No tenés clases próximas en la agenda."
        />
      )}
    </section>
  )
}

function PendingReviews({
  items,
}: {
  items: ProfesorDashboardUltimaEntregaItem[]
}) {
  const pending = getPendingDeliveries(items)

  return (
    <section id="entregas" className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-3.5 dark:bg-card/80 sm:p-4">
      <SectionHeader
        title="Para corregir"
        description="Entregas listas para revisar."
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sin correcciones pendientes"
          description="La cola de entregas está al día."
        />
      ) : (
        <div className="divide-y divide-border/50 border-y border-border/60">
          {pending.slice(0, 5).map((item) => {
            const late = item.estadoEntrega === EstadoEntrega.FueraDeTermino
            const alumnoName = `${item.alumnoNombre} ${item.alumnoApellido}`.trim() || 'Alumno'

            return (
              <article
                key={item.entregaId}
                className={cn(
                  'px-1 py-2.5 transition-colors hover:bg-muted/10 sm:px-2',
                  late && 'bg-rose-500/[0.035]',
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <UserAvatar
                      name={alumnoName}
                      avatarUrl={item.alumnoAvatarUrl}
                      size={36}
                      className="shrink-0"
                      fallbackClassName={late ? toneStyles.rose.icon : toneStyles.default.icon}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {item.alumnoApellido}, {item.alumnoNombre}
                        </h3>
                        {late ? (
                          <span className="inline-flex rounded-full border border-rose-500/20 bg-rose-500/[0.07] px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
                            Fuera de término
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {item.tituloTarea}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {item.cursoNombre} · {formatRelative(item.fechaEntregaUtc)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/teacher/courses/${item.cursoId}/tasks/${item.tareaId}/submissions/${item.alumnoId}`}
                    className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:text-sm"
                  >
                    Revisar entrega
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function getStudentAttentionReasons(item: ProfesorDashboardAlumnoAtencionItem) {
  const reasons: { label: string; tone: 'amber' | 'rose' }[] = []

  if (item.asistencia != null) {
    reasons.push({
      label:
        item.asistencia < 60
          ? `Asistencia crítica ${item.asistencia.toFixed(1)}%`
          : `Asistencia ${item.asistencia.toFixed(1)}%`,
      tone: item.asistencia < 60 ? 'rose' : 'amber',
    })
  }

  if (item.promedio != null) {
    reasons.push({
      label: `Promedio ${item.promedio.toFixed(1)}`,
      tone: item.promedio < 50 ? 'rose' : 'amber',
    })
  }

  if (item.calificacionBajaNota != null && item.calificacionBajaTitulo) {
    reasons.push({
      label: `${item.calificacionBajaTitulo}: nota ${item.calificacionBajaNota.toFixed(1)}`,
      tone: item.calificacionBajaNota < 50 ? 'rose' : 'amber',
    })
  }

  return reasons.slice(0, 3)
}

function StudentsRequiringAttention({
  items,
}: {
  items: ProfesorDashboardAlumnoAtencionItem[]
}) {
  if (items.length === 0) return null

  return (
    <section className="space-y-3 border-t border-border/60 pt-4">
      <SectionHeader
        title="Alumnos que requieren atención"
        description={`Señales del ${items[0].periodoLabel} que conviene revisar.`}
      />

      <div className="grid gap-2.5">
        {items.slice(0, 3).map((item) => {
          const reasons = getStudentAttentionReasons(item)
          const critical = item.severidad === 'critical'

          return (
            <article
              key={`${item.cursoId}-${item.alumnoId}`}
              className={cn(
                'grid gap-3 rounded-xl border bg-card/70 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/55 sm:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.4fr)_auto] sm:items-center sm:p-4',
                critical
                  ? 'border-rose-500/20'
                  : 'border-amber-500/20',
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <UserAvatar
                  name={item.alumnoNombre}
                  avatarUrl={item.alumnoAvatarUrl}
                  size={44}
                  className="shrink-0"
                  fallbackClassName={
                    critical
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  }
                />

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground sm:text-[15px]">
                    {item.alumnoNombre}
                  </h3>
                  <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                    {item.cursoNombre}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-wrap gap-1.5">
                {reasons.map((reason) => (
                  <span
                    key={reason.label}
                    className={cn(
                      'inline-flex max-w-full items-center rounded-md border px-2 py-1 text-xs font-medium',
                      reason.tone === 'rose'
                        ? 'border-rose-500/20 bg-rose-500/[0.07] text-rose-700 dark:text-rose-400'
                        : 'border-amber-500/20 bg-amber-500/[0.07] text-amber-800 dark:text-amber-300',
                    )}
                  >
                    <span className="truncate">{reason.label}</span>
                  </span>
                ))}
              </div>

              <Link
                href={`/teacher/courses/${item.cursoId}/students/${item.alumnoId}/grades`}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.06] px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 sm:justify-self-end"
              >
                Ver calificaciones
                <ArrowRight className="ml-2 size-3.5" />
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function buildActivity({
  deliveries,
  classes,
}: {
  deliveries: ProfesorDashboardUltimaEntregaItem[]
  classes: ProfesorDashboardUltimaClaseItem[]
}) {
  const deliveryItems = deliveries
    .filter((item) => item.tieneFeedbackVigente)
    .sort(
      (a, b) =>
        new Date(b.fechaEntregaUtc).getTime() -
        new Date(a.fechaEntregaUtc).getTime(),
    )
    .filter(
      (item, index, items) =>
        items.findIndex(
          (candidate) =>
            candidate.alumnoId === item.alumnoId &&
            candidate.cursoId === item.cursoId,
        ) === index,
    )
    .slice(0, 3)
    .map((item) => ({
      key: `delivery-${item.entregaId}`,
      title: 'Devolución enviada',
      description: `${item.alumnoApellido}, ${item.alumnoNombre} · ${item.tituloTarea}`,
      meta: `${item.cursoNombre} · ${formatRelative(item.fechaEntregaUtc)}`,
      href: `/teacher/courses/${item.cursoId}/tasks/${item.tareaId}/submissions/${item.alumnoId}`,
      sortTime: new Date(item.fechaEntregaUtc).getTime(),
      icon: FileCheck2,
      tone: 'emerald' as const,
      actorType: 'student' as const,
      actorName: `${item.alumnoNombre} ${item.alumnoApellido}`.trim() || 'Alumno',
      actorAvatarUrl: item.alumnoAvatarUrl,
    }))

  const classItems = [...classes]
    .sort(
      (a, b) =>
        parseLocalDate(b.fecha).getTime() - parseLocalDate(a.fecha).getTime(),
    )
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.cursoId === item.cursoId) ===
        index,
    )
    .slice(0, 2)
    .map((item) => ({
      key: `class-${item.claseId}`,
      title:
        item.estadoClase === EstadoClase.Cancelada
          ? 'Clase cancelada'
          : 'Clase registrada',
      description: item.descripcion?.trim() || item.cursoNombre,
      meta: `${item.cursoNombre} · ${format(parseLocalDate(item.fecha), 'd MMM', { locale: es })}`,
      href: `/teacher/courses/${item.cursoId}/classes/${encodeURIComponent(getDatePart(item.fecha))}`,
      sortTime: parseLocalDate(item.fecha).getTime(),
      icon: CalendarCheck2,
      tone:
        item.estadoClase === EstadoClase.Cancelada
          ? ('rose' as const)
          : ('default' as const),
      actorType: 'system' as const,
    }))

  return [...deliveryItems, ...classItems].sort(
    (a, b) => b.sortTime - a.sortTime,
  )
}

function ActivityFeed({
  deliveries,
  classes,
}: {
  deliveries: ProfesorDashboardUltimaEntregaItem[]
  classes: ProfesorDashboardUltimaClaseItem[]
}) {
  const items = buildActivity({ deliveries, classes })
  const [showAll, setShowAll] = useState(false)
  const visibleItems = showAll ? items : items.slice(0, 4)

  if (items.length === 0) return null

  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-card/70 p-3.5 dark:bg-card/50 sm:p-4">
      <SectionHeader
        title="Últimos movimientos"
        description="Clases registradas y devoluciones recientes."
      />

      <div className="divide-y divide-border/50 border-y border-border/55">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isStudentActivity = item.actorType === 'student'

          return (
            <Link
              key={item.key}
              href={item.href}
              className="group flex gap-3 px-1 py-2.5 transition-colors hover:bg-muted/15 sm:px-2"
            >
              {isStudentActivity ? (
                <UserAvatar
                  name={item.actorName}
                  avatarUrl={item.actorAvatarUrl}
                  size={28}
                  className="mt-0.5 shrink-0"
                  fallbackClassName={toneStyles[item.tone].icon}
                />
              ) : (
                <span
                  className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md',
                    toneStyles[item.tone].icon,
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {item.title}
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                  {item.description}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                  {item.meta}
                </span>
              </span>
            </Link>
          )
        })}
      </div>

      {items.length > 4 ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
        >
          {showAll ? (
            <>
              Ver menos
              <ChevronUp className="size-3.5" />
            </>
          ) : (
            <>
              Ver más
              <ChevronDown className="size-3.5" />
            </>
          )}
        </button>
      ) : null}
    </section>
  )
}

export function TeacherDashboardView({
  dashboard,
}: {
  dashboard: ProfesorDashboardResponse
}) {
  const nextClass = getFutureClasses(dashboard.proximasClases)[0]
  const nextClassDescription = nextClass
    ? dashboard.cursos.find((course) => course.cursoId === nextClass.cursoId)
        ?.descripcion
    : null

  return (
    <div className="space-y-4 sm:space-y-5">
      <DayHeader
        nextClass={nextClass}
        pendingCount={dashboard.entregasPendientesCorreccionCount}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-start">
        <NextClass item={nextClass} description={nextClassDescription} />

        <PendingReviews items={dashboard.ultimasEntregas} />
      </div>

      <StudentsRequiringAttention
        items={dashboard.alumnosQueRequierenAtencion ?? []}
      />

      <ActivityFeed
        deliveries={dashboard.ultimasEntregas}
        classes={dashboard.ultimasClases}
      />
    </div>
  )
}
