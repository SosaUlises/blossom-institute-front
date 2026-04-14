'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowUpRight, Clock3, MessageSquareDashed } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  EstadoEntrega,
  type ProfesorDashboardUltimaEntregaItem,
} from '@/lib/teacher/dashboard/types'

function formatRelative(value: string): string {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: es,
  })
}

function getInitial(item: ProfesorDashboardUltimaEntregaItem): string {
  const apellido = item.alumnoApellido?.trim()
  const nombre = item.alumnoNombre?.trim()

  if (apellido?.length) return apellido.charAt(0).toUpperCase()
  if (nombre?.length) return nombre.charAt(0).toUpperCase()

  return '?'
}

function getPendingItems(items: ProfesorDashboardUltimaEntregaItem[]) {
  return [...items]
    .filter((item) => !item.tieneFeedbackVigente)
    .sort((a, b) => {
      const aFuera = a.estadoEntrega === EstadoEntrega.FueraDeTermino ? 0 : 1
      const bFuera = b.estadoEntrega === EstadoEntrega.FueraDeTermino ? 0 : 1

      if (aFuera !== bFuera) return aFuera - bFuera

      return (
        new Date(a.fechaEntregaUtc).getTime() -
        new Date(b.fechaEntregaUtc).getTime()
      )
    })
}

function PendingDeliveryRow({
  item,
}: {
  item: ProfesorDashboardUltimaEntregaItem
}) {
  const esFuera = item.estadoEntrega === EstadoEntrega.FueraDeTermino

  return (
    <li>
      <div
        className={cn(
          'group flex flex-col gap-4 rounded-[24px] border px-4 py-4 transition-all duration-200 ease-out sm:flex-row sm:items-center sm:justify-between',
          'border-amber-500/25 bg-amber-500/[0.05] hover:bg-amber-500/[0.08] hover:shadow-sm',
        )}
      >
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/12 text-sm font-semibold text-amber-700 dark:text-amber-400">
            {getInitial(item)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.alumnoApellido}, {item.alumnoNombre}
            </p>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.tituloTarea}
              <span className="mx-1.5 opacity-40">·</span>
              {item.cursoNombre}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="text-xs text-muted-foreground">
              {formatRelative(item.fechaEntregaUtc)}
            </span>

            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                esFuera
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
              )}
            >
              {esFuera ? 'Fuera de término' : 'Sin corregir'}
            </span>
          </div>

          <Button
            asChild
            size="sm"
            className="h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/92 hover:shadow-md active:translate-y-0"
          >
            <Link
              href={`/teacher/courses/${item.cursoId}/tasks/${item.tareaId}/submissions/${item.alumnoId}`}
            >
              Corregir ahora
              <ArrowUpRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
            </Link>
          </Button>
        </div>
      </div>
    </li>
  )
}

export function TeacherLastDeliveriesCard({
  items,
}: {
  items: ProfesorDashboardUltimaEntregaItem[]
}) {
const MAX_PENDING_ITEMS = 3
const pendingItems = getPendingItems(items).slice(0, MAX_PENDING_ITEMS)

return (
  <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
    <CardHeader className="pb-3">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <MessageSquareDashed className="size-4.5" />
        </div>

        <div className="min-w-0">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Pendientes de corrección
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Las más antiguas primero para ponerse al día.
          </p>
        </div>
      </div>
    </CardHeader>

    <CardContent className="pt-0">
      {pendingItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
          No hay entregas pendientes de corrección.
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {pendingItems.map((item) => (
              <PendingDeliveryRow key={item.entregaId} item={item} />
            ))}
          </ul>

          {items.filter((item) => !item.tieneFeedbackVigente).length > 3 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Mostrando las 3 entregas pendientes más urgentes.
            </p>
          )}
        </>
      )}
    </CardContent>
  </Card>
)}