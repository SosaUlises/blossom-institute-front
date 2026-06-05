'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  UserRound,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { DashboardOpenFollowUp } from '@/lib/admin/dashboard/types'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'admin-dashboard-open-follow-ups-expanded'
const VISIBLE_LIMIT = 8

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return 'AL'

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function getEntityLabel(item: DashboardOpenFollowUp) {
  return item.entityType === 'student' ? 'Alumno' : 'Curso'
}

function getEntityName(item: DashboardOpenFollowUp) {
  return item.entityType === 'student'
    ? item.alumnoNombre || 'Alumno'
    : item.cursoNombre || 'Curso'
}

function getHref(item: DashboardOpenFollowUp) {
  if (item.href) return item.href

  if (item.entityType === 'student' && item.alumnoId) {
    return `/admin/dashboard/students/${item.alumnoId}/profile`
  }

  if (item.cursoId) {
    return `/admin/dashboard/courses/${item.cursoId}/profile`
  }

  return '/admin/dashboard/reports'
}

function getActionLabel(item: DashboardOpenFollowUp) {
  return item.entityType === 'student' ? 'Ver alumno' : 'Ver curso'
}

function cleanReason(item: DashboardOpenFollowUp) {
  const reason = item.reason?.trim()

  if (!reason) return 'Seguimiento pendiente'

  return reason
    .replace(new RegExp(`\\s+en\\s+${item.periodLabel}$`, 'i'), '')
    .trim()
}

function FollowUpAvatar({ item }: { item: DashboardOpenFollowUp }) {
  if (item.entityType === 'student') {
    const name = getEntityName(item)
    const cleanAvatarUrl = item.alumnoAvatarUrl?.trim()

    return (
      <Avatar className="size-7 shrink-0 rounded-lg border border-border/40 bg-muted">
        {cleanAvatarUrl ? (
          <AvatarImage src={cleanAvatarUrl} alt={name} className="object-cover" />
        ) : null}
        <AvatarFallback className="rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/35 bg-muted/20 text-muted-foreground">
      <BookOpen className="size-3.5" />
    </span>
  )
}

function FollowUpRow({ item }: { item: DashboardOpenFollowUp }) {
  const href = getHref(item)
  const entityName = getEntityName(item)
  const courseContext =
    item.entityType === 'student'
      ? [item.cursoNombre, item.cursoDescripcion].filter(Boolean).join(' · ')
      : item.cursoDescripcion

  return (
    <Link
      href={href}
      className="group grid min-w-0 gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <span className="flex min-w-0 gap-2.5">
        <FollowUpAvatar item={item} />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-muted/25 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {getEntityLabel(item)}
            </span>
            {item.level === 'critical' ? (
              <span className="rounded-md bg-muted/25 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                Monitoreo
              </span>
            ) : null}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold leading-5 text-foreground group-hover:text-primary">
            {entityName}
          </span>
          {courseContext ? (
            <span className="mt-0.5 block truncate text-xs leading-5 text-muted-foreground">
              {courseContext}
            </span>
          ) : null}
          <span className="mt-0.5 block truncate text-xs font-medium leading-5 text-foreground/80">
            {cleanReason(item)}
          </span>
        </span>
      </span>
      <span className="inline-flex h-7 items-center justify-self-start rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors group-hover:bg-muted/35 group-hover:text-foreground sm:justify-self-end">
        {getActionLabel(item)}
      </span>
    </Link>
  )
}

function groupItems(items: DashboardOpenFollowUp[]) {
  return items.reduce<Array<{ key: string; label: string; items: DashboardOpenFollowUp[] }>>(
    (groups, item) => {
      const key = `${item.year}-${item.quarterNumber}-${item.periodLabel}`
      const existing = groups.find((group) => group.key === key)

      if (existing) {
        existing.items.push(item)
      } else {
        groups.push({
          key,
          label: item.periodLabel || `${item.quarterNumber}º trimestre`,
          items: [item],
        })
      }

      return groups
    },
    [],
  )
}

export function OpenFollowUpsSection({
  items,
}: {
  items: DashboardOpenFollowUp[]
}) {
  const [expanded, setExpanded] = useState(items.length > 0)
  const visibleItems = items.slice(0, VISIBLE_LIMIT)
  const hiddenCount = Math.max(items.length - visibleItems.length, 0)
  const groups = useMemo(() => groupItems(visibleItems), [visibleItems])

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (stored === 'true' || stored === 'false') {
      setExpanded(stored === 'true')
    }
  }, [])

  function handleOpenChange(value: boolean) {
    setExpanded(value)
    window.localStorage.setItem(STORAGE_KEY, String(value))
  }

  if (items.length === 0) return null

  return (
    <Collapsible open={expanded} onOpenChange={handleOpenChange} asChild>
      <section className="rounded-2xl bg-card/65 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.025)] ring-1 ring-border/35 dark:bg-card/45 sm:p-3.5">
        <div className="flex items-start justify-between gap-3">
          <CollapsibleTrigger className="group flex min-w-0 flex-1 items-start gap-2 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted/25 text-muted-foreground transition-colors group-hover:bg-muted/35 group-hover:text-foreground">
              {expanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold tracking-tight text-foreground">
                Seguimientos abiertos
              </span>
              <span className="mt-1 block max-w-2xl text-sm leading-6 text-muted-foreground">
                Casos históricos que conviene monitorear sin mezclarlos con la cola de hoy.
              </span>
            </span>
          </CollapsibleTrigger>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-md bg-muted/25 px-1.5 py-0.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              {items.length}
            </span>
            <Link
              href="/admin/dashboard/reports"
              className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/35 hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              Ver reportes
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>
        </div>

        <CollapsibleContent>
          <div className="mt-2.5 space-y-3">
            {groups.map((group) => (
              <div key={group.key} className="grid gap-2 sm:grid-cols-[104px_minmax(0,1fr)]">
                <div className="pt-2 text-xs font-semibold text-muted-foreground">
                  {group.label}
                </div>
                <div className="relative min-w-0 border-l border-border/35 pl-2">
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div key={item.id} className="relative">
                        <span className="absolute -left-[13px] top-4 size-1.5 rounded-full bg-border" />
                        <FollowUpRow item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hiddenCount > 0 ? (
            <p className="mt-2.5 text-xs leading-5 text-muted-foreground">
              Hay {hiddenCount} seguimiento{hiddenCount === 1 ? '' : 's'} más para revisar en reportes.
            </p>
          ) : null}
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}
