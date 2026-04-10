import { isToday, isTomorrow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock3 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ProfesorDashboardProximaClaseItem } from '@/lib/teacher/dashboard/types'

function getDayMeta(dateStr: string): {
  label: string
  chipTop: string
  chipBottom: string
  isHoy: boolean
  shortLabel: string
} {
  const datePart = dateStr.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  const date = new Date(year, month - 1, day)

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

function getFutureClases(
  items: ProfesorDashboardProximaClaseItem[],
): ProfesorDashboardProximaClaseItem[] {
  const now = new Date()

  return items
    .filter((item) => {
      const endDateTime = buildDateTime(item.fecha, item.horaFin)
      return endDateTime.getTime() > now.getTime()
    })
    .sort((a, b) => {
      const startA = buildDateTime(a.fecha, a.horaInicio)
      const startB = buildDateTime(b.fecha, b.horaInicio)
      return startA.getTime() - startB.getTime()
    })
}

function FeaturedClass({ item }: { item: ProfesorDashboardProximaClaseItem }) {
  const { label, isHoy } = getDayMeta(item.fecha)
  const timeRange = `${item.horaInicio.slice(0, 5)}–${item.horaFin.slice(0, 5)}`

  return (
    <div
      className={cn(
        'rounded-3xl border px-5 py-5 shadow-sm transition-all duration-200 ease-out',
        'hover:shadow-md hover:-translate-y-[1px]',
        isHoy
          ? 'border-primary/20 bg-gradient-to-br from-primary/[0.10] via-primary/[0.04] to-transparent hover:from-primary/[0.14]'
          : 'border-border/60 bg-muted/[0.35] hover:bg-muted/[0.5]',
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

        <div className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
          <Clock3 className="size-3.5" />
          {timeRange}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[2.4rem] font-bold leading-none tracking-tight text-foreground">
          {item.horaInicio.slice(0, 5)}
        </p>

        <div className="mt-3">
          <p className="truncate text-lg font-semibold tracking-tight text-foreground">
            {item.cursoNombre}
          </p>
        </div>
      </div>
    </div>
  )
}

function CompactClass({ item }: { item: ProfesorDashboardProximaClaseItem }) {
  const { chipTop, chipBottom, shortLabel } = getDayMeta(item.fecha)

  return (
    <li>
      <div className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/60">
        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-muted/55">
          <span className="text-[8px] font-semibold uppercase leading-none tracking-[0.14em] text-muted-foreground">
            {chipTop}
          </span>
          <span className="mt-0.5 text-[13px] font-bold leading-none text-foreground">
            {chipBottom}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-foreground">
            {item.cursoNombre}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {shortLabel}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-medium tabular-nums text-foreground/80">
          {item.horaInicio.slice(0, 5)}
        </div>
      </div>
    </li>
  )
}

export function TeacherUpcomingClassesCard({
  proximasClases,
}: {
  proximasClases: ProfesorDashboardProximaClaseItem[]
}) {
  const futuras = getFutureClases(proximasClases)
  const [featured, ...rest] = futuras

  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Agenda
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {futuras.length === 0 ? (
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
                      key={`${item.cursoId}-${item.fecha}-${index}`}
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