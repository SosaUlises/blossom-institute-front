'use client'

import { isToday, isTomorrow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  UserRound,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { DashboardUpcomingClass } from '@/lib/admin/dashboard/types'

interface UpcomingClassesCardProps {
  items: DashboardUpcomingClass[]
}

function getLocalDate(dateStr: string) {
  const datePart = dateStr.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getDayMeta(dateStr: string): {
  label: string
  chipTop: string
  chipBottom: string
  isHoy: boolean
  shortLabel: string
} {
  const date = getLocalDate(dateStr)

  if (isToday(date)) {
    return {
      label: 'Hoy',
      chipTop: 'hoy',
      chipBottom: format(date, 'd'),
      isHoy: true,
      shortLabel: 'Hoy',
    }
  }

  if (isTomorrow(date)) {
    return {
      label: 'Mañana',
      chipTop: 'mañ',
      chipBottom: format(date, 'd'),
      isHoy: false,
      shortLabel: 'Mañana',
    }
  }

  return {
    label: format(date, "EEE d 'de' MMM", { locale: es }),
    chipTop: format(date, 'EEE', { locale: es }),
    chipBottom: format(date, 'd'),
    isHoy: false,
    shortLabel: format(date, "EEE d MMM", { locale: es }),
  }
}

function buildDateTime(dateStr: string, timeStr: string): Date {
  const datePart = dateStr.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timeStr.slice(0, 5).split(':').map(Number)

  return new Date(year, month - 1, day, hours, minutes, 0, 0)
}

function getFutureClasses(items: DashboardUpcomingClass[]): DashboardUpcomingClass[] {
  const now = new Date()

  return [...items]
    .filter((item) => {
      const startDateTime = buildDateTime(item.proximaClase, item.horaInicio)
      return startDateTime.getTime() >= now.getTime()
    })
    .sort((a, b) => {
      const startA = buildDateTime(a.proximaClase, a.horaInicio)
      const startB = buildDateTime(b.proximaClase, b.horaInicio)
      return startA.getTime() - startB.getTime()
    })
}

function AgendaMetaPill({
  icon: Icon,
  label,
  value,
  accent = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent?: 'default' | 'primary' | 'violet'
}) {
  const tone =
    accent === 'primary'
      ? 'bg-primary/10 text-primary'
      : accent === 'violet'
        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
        : 'bg-background/80 text-muted-foreground'

  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
      <div className="flex items-start gap-3">
        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tone)}>
          <Icon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function FeaturedClass({ item }: { item: DashboardUpcomingClass }) {
  const { label, isHoy } = getDayMeta(item.proximaClase)
  const date = getLocalDate(item.proximaClase)

  return (
    <div
      className={cn(
        'rounded-3xl border px-5 py-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-md',
        isHoy
          ? 'border-primary/20 bg-gradient-to-br from-primary/[0.10] via-primary/[0.04] to-transparent hover:from-primary/[0.14]'
          : 'border-border/60 bg-muted/[0.30] hover:bg-muted/[0.42]',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
            isHoy
              ? 'bg-primary/15 text-primary'
              : 'bg-background/80 text-muted-foreground',
          )}
        >
          {label}
        </span>

        <div className="min-w-0 text-right">
          <p className="truncate text-base font-semibold tracking-tight text-foreground">
            {item.cursoNombre}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-background/80 text-muted-foreground shadow-sm">
            <Clock3 className="size-4.5" />
          </div>

          <p className="text-[2.4rem] font-bold leading-none tracking-tight text-foreground">
            {item.horaInicio.slice(0, 5)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AgendaMetaPill
          label="Día"
          value={item.diaSemana || format(date, 'EEEE', { locale: es })}
          icon={CalendarDays}
          accent="primary"
        />

        <AgendaMetaPill
          label="Docente"
          value={item.profesorNombre}
          icon={UserRound}
          accent="violet"
        />
      </div>
    </div>
  )
}

function CompactClass({ item }: { item: DashboardUpcomingClass }) {
  const { chipTop, chipBottom, shortLabel, isHoy } = getDayMeta(item.proximaClase)

  return (
    <li>
      <div className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:border-border/60 hover:bg-muted/55 hover:shadow-sm">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl shadow-sm transition-all duration-200',
            isHoy
              ? 'bg-primary/10 text-primary'
              : 'bg-background/80 text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'text-[8px] font-semibold uppercase leading-none tracking-[0.14em]',
              isHoy ? 'text-primary/80' : 'text-muted-foreground',
            )}
          >
            {chipTop}
          </span>
          <span className="mt-0.5 text-[13px] font-bold leading-none text-foreground">
            {chipBottom}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {item.cursoNombre}
          </p>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.profesorNombre}
            <span className="mx-1.5 opacity-40">·</span>
            {shortLabel}
          </p>
        </div>

        <div className="shrink-0 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-foreground shadow-sm transition-all duration-200 group-hover:border-primary/15 group-hover:bg-primary/5">
          {item.horaInicio.slice(0, 5)}
        </div>
      </div>
    </li>
  )
}

export function UpcomingClassesCard({ items }: UpcomingClassesCardProps) {
  const futureClasses = getFutureClasses(items)
  const [featured, ...rest] = futureClasses

  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Próximas clases
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">
          Agenda inmediata del instituto con cursos programados y docentes asignados.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {futureClasses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            No hay clases próximas registradas.
          </div>
        ) : (
          <div className="space-y-4">
            <FeaturedClass item={featured} />

            {rest.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                  Próximas
                </p>

                <ul className="space-y-1">
                  {rest.map((item, index) => (
                    <CompactClass
                      key={`${item.cursoId}-${item.proximaClase}-${index}`}
                      item={item}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}