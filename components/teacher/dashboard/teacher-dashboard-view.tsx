'use client'

import Link from 'next/link'
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Inbox,
  MessageSquareText,
} from 'lucide-react'

import {
  EstadoClase,
  EstadoEntrega,
  type ProfesorDashboardProximaClaseItem,
  type ProfesorDashboardResponse,
  type ProfesorDashboardResumenCursoItem,
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
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
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
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-5 text-sm text-muted-foreground dark:bg-muted/10">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 leading-6">{description}</p>
        </div>
      </div>
    </div>
  )
}

function DayHeader({
  hasNextClass,
  pendingCount,
}: {
  hasNextClass: boolean
  pendingCount: number
}) {
  const summary =
    hasNextClass && pendingCount > 0
      ? `Tenés una clase próxima y ${pendingCount} ${
          pendingCount === 1 ? 'entrega' : 'entregas'
        } para revisar.`
      : hasNextClass
        ? 'Tenés una clase próxima y ninguna entrega para revisar.'
        : pendingCount > 0
          ? `No tenés clases próximas. Hay ${pendingCount} ${
              pendingCount === 1 ? 'entrega' : 'entregas'
            } para revisar.`
          : 'No tenés clases próximas ni entregas para revisar.'

  return (
    <header className="border-b border-border/60 pb-5 pt-1">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Hoy en tus clases
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/80 sm:text-[15px]">
          {summary}
        </p>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {formatTodayLabel()}
        </p>
      </div>
    </header>
  )
}

function TodayClassCard({ item }: { item: ProfesorDashboardProximaClaseItem }) {
  const today = isToday(parseLocalDate(item.fecha))

  return (
    <article
      className={cn(
        'rounded-xl border px-4 py-4 transition-colors',
        today ? toneStyles.primary.card : toneStyles.default.card,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                today ? toneStyles.primary.badge : toneStyles.default.badge,
              )}
            >
              {formatClassDate(item.fecha)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground dark:bg-background/35">
              <Clock3 className="size-3.5" />
              {formatTimeRange(item)}
            </span>
          </div>

          <h3 className="mt-3 truncate text-base font-semibold tracking-tight text-foreground">
            {item.cursoNombre}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {today ? 'Clase de hoy' : 'Próxima clase programada'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {today ? (
            <>
              <Link
                href={`/teacher/courses/${item.cursoId}/classes/take`}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Tomar asistencia
              </Link>
              <Link
                href={`/teacher/courses/${item.cursoId}/classes/${encodeURIComponent(getDatePart(item.fecha))}`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
              >
                Ver clase
              </Link>
            </>
          ) : (
            <Link
              href={`/teacher/courses/${item.cursoId}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
            >
              Abrir curso
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

function NextClass({ item }: { item?: ProfesorDashboardProximaClaseItem }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90 sm:p-5">
      <SectionHeader
        title="Próxima clase"
        description="El siguiente espacio de tu jornada docente."
      />

      {item ? (
        <TodayClassCard item={item} />
      ) : (
        <EmptyState
          icon={CalendarCheck2}
          title="Sin clases próximas"
          description="No hay clases futuras registradas en este momento."
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
    <section id="entregas" className="space-y-4 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90 sm:p-5">
      <SectionHeader
        title="Para corregir"
        description="Entregas que todavía no tienen devolución."
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sin correcciones pendientes"
          description="No hay entregas esperando revisión en este momento."
        />
      ) : (
        <div className="space-y-3">
          {pending.slice(0, 5).map((item) => {
            const late = item.estadoEntrega === EstadoEntrega.FueraDeTermino
            const alumnoName = `${item.alumnoNombre} ${item.alumnoApellido}`.trim() || 'Alumno'

            return (
              <article
                key={item.entregaId}
                className={cn(
                  'rounded-xl border px-4 py-4 transition-colors hover:bg-card',
                  late ? toneStyles.rose.card : toneStyles.default.card,
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <UserAvatar
                      name={alumnoName}
                      avatarUrl={item.alumnoAvatarUrl}
                      size={40}
                      className="shrink-0"
                      fallbackClassName={late ? toneStyles.rose.icon : toneStyles.default.icon}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {item.alumnoApellido}, {item.alumnoNombre}
                        </h3>
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                            late ? toneStyles.rose.badge : toneStyles.default.badge,
                          )}
                        >
                          {late ? 'Fuera de término' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {item.tituloTarea}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {item.cursoNombre} - {formatRelative(item.fechaEntregaUtc)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/teacher/courses/${item.cursoId}/tasks/${item.tareaId}/submissions/${item.alumnoId}`}
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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

function ActiveCourses({
  items,
  classes,
}: {
  items: ProfesorDashboardResumenCursoItem[]
  classes: ProfesorDashboardProximaClaseItem[]
}) {
  const nextClasses = getFutureClasses(classes)

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-4 dark:bg-card/70 sm:p-5">
      <SectionHeader
        title="Cursos activos"
        description="Accesos rápidos a tus espacios de trabajo."
        action={
          <Link
            href="/teacher/courses"
            className="hidden h-9 items-center rounded-lg border border-border/70 bg-background/70 px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary sm:inline-flex"
          >
            Ver todos
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin cursos asignados"
          description="Cuando tengas cursos asignados, van a aparecer acá."
        />
      ) : (
        <div className="grid gap-2">
          {items.slice(0, 4).map((item) => {
            const nextClass = nextClasses.find((classItem) => classItem.cursoId === item.cursoId)
            return (
              <Link
                key={item.cursoId}
                href={`/teacher/courses/${item.cursoId}`}
                className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-background/55 px-3 py-3 transition-colors hover:border-primary/20 hover:bg-primary/[0.035] dark:bg-background/25"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {item.cursoNombre}
                  </h3>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.cantidadAlumnos} alumnos
                    {item.entregasPendientesCorreccion > 0
                      ? ` · ${item.entregasPendientesCorreccion} por corregir`
                      : ''}
                  </p>
                  {nextClass ? (
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {formatClassDate(nextClass.fecha)} {nextClass.horaInicio.slice(0, 5)}
                    </span>
                  ) : null}
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            )
          })}
        </div>
      )}
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
    .map((item) => ({
    key: `delivery-${item.entregaId}`,
    title: 'Entrega con devolución',
    description: `${item.alumnoApellido}, ${item.alumnoNombre} - ${item.tituloTarea}`,
    meta: `${item.cursoNombre} - ${formatRelative(item.fechaEntregaUtc)}`,
    href: `/teacher/courses/${item.cursoId}/tasks/${item.tareaId}/submissions/${item.alumnoId}`,
    sortTime: new Date(item.fechaEntregaUtc).getTime(),
    icon: FileCheck2,
    tone: 'emerald' as const,
    actorType: 'student' as const,
    actorName: `${item.alumnoNombre} ${item.alumnoApellido}`.trim() || 'Alumno',
    actorAvatarUrl: item.alumnoAvatarUrl,
    }))

  const classItems = classes.map((item) => ({
    key: `class-${item.claseId}`,
    title: item.estadoClase === EstadoClase.Cancelada ? 'Clase cancelada' : 'Clase registrada',
    description: item.descripcion?.trim() || item.cursoNombre,
    meta: `${item.cursoNombre} - ${format(parseLocalDate(item.fecha), 'd MMM', { locale: es })}`,
    href: `/teacher/courses/${item.cursoId}/classes/${encodeURIComponent(getDatePart(item.fecha))}`,
    sortTime: parseLocalDate(item.fecha).getTime(),
    icon: CalendarCheck2,
    tone: item.estadoClase === EstadoClase.Cancelada ? ('rose' as const) : ('sky' as const),
    actorType: 'system' as const,
  }))

  return [...deliveryItems, ...classItems]
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, 4)
}

function ActivityFeed({
  deliveries,
  classes,
}: {
  deliveries: ProfesorDashboardUltimaEntregaItem[]
  classes: ProfesorDashboardUltimaClaseItem[]
}) {
  const items = buildActivity({ deliveries, classes })

  return (
    <section className="space-y-3 border-t border-border/60 pt-5">
      <SectionHeader
        title="Contexto reciente"
        description="Clases registradas y devoluciones ya realizadas."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="Sin actividad reciente"
          description="Las clases registradas y devoluciones realizadas aparecerán acá."
        />
      ) : (
        <div className="divide-y divide-border/60 border-y border-border/70 bg-background/35 dark:bg-background/20">
          {items.map((item) => {
            const Icon = item.icon
            const isStudentActivity = item.actorType === 'student'

            return (
              <Link
                key={item.key}
                href={item.href}
                className="group flex gap-3 px-2 py-3 transition-colors hover:bg-muted/20 sm:px-3"
              >
                {isStudentActivity ? (
                  <UserAvatar
                    name={item.actorName}
                    avatarUrl={item.actorAvatarUrl}
                    size={32}
                    className="mt-1 shrink-0"
                    fallbackClassName={toneStyles[item.tone].icon}
                  />
                ) : (
                  <span
                    className={cn(
                      'mt-1 flex size-8 shrink-0 items-center justify-center rounded-full',
                      toneStyles[item.tone].icon,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {item.description}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground/80">
                    {item.meta}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function TeacherDashboardView({
  dashboard,
}: {
  dashboard: ProfesorDashboardResponse
}) {
  const pendingDeliveries = getPendingDeliveries(dashboard.ultimasEntregas)
  const nextClass = getFutureClasses(dashboard.proximasClases)[0]

  return (
    <div className="space-y-5">
      <DayHeader
        hasNextClass={Boolean(nextClass)}
        pendingCount={dashboard.entregasPendientesCorreccionCount}
      />

      <NextClass item={nextClass} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] xl:items-start">
        <PendingReviews items={dashboard.ultimasEntregas} />

        <div className="space-y-5">
          <ActiveCourses
            items={dashboard.resumenPorCurso}
            classes={dashboard.proximasClases}
          />

          {pendingDeliveries.length > 5 ? (
            <Link
              href="#entregas"
              className="inline-flex h-9 items-center rounded-lg border border-border/70 bg-background/70 px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
            >
              {pendingDeliveries.length - 5} pendientes más en la cola
            </Link>
          ) : null}
        </div>
      </div>

      <ActivityFeed
        deliveries={dashboard.ultimasEntregas}
        classes={dashboard.ultimasClases}
      />
    </div>
  )
}
