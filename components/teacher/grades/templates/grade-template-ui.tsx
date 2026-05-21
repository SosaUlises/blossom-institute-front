import type { LucideIcon } from 'lucide-react'
import {
  ClipboardList,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import type { GradeTemplateDetailSkillItem } from '@/lib/teacher/grade-templates/types'
import {
  getGradeTemplateSkillLabel,
  getTipoCalificacionLabel,
} from '@/lib/teacher/grade-templates/utils'

type TemplateTypeVisual = {
  icon: LucideIcon
  badgeClass: string
}

export function getTemplateTypeVisual(tipo: number): TemplateTypeVisual {
  switch (tipo) {
    case 2:
      return {
        icon: ClipboardList,
        badgeClass:
          'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
      }
    case 3:
      return {
        icon: FileCheck2,
        badgeClass:
          'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
      }
    case 4:
      return {
        icon: Users,
        badgeClass:
          'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      }
    case 5:
      return {
        icon: ShieldCheck,
        badgeClass:
          'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400',
      }
    default:
      return {
        icon: Sparkles,
        badgeClass: 'border-primary/15 bg-primary/5 text-primary',
      }
  }
}

export function TemplateTypeBadge({ tipo }: { tipo: number }) {
  const visual = getTemplateTypeVisual(tipo)
  const Icon = visual.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${visual.badgeClass}`}
    >
      <Icon className="size-3.5" />
      {getTipoCalificacionLabel(tipo)}
    </span>
  )
}

export function TemplateSkillRows({
  detalles,
  emptyLabel = 'Sin habilidades configuradas.',
}: {
  detalles: GradeTemplateDetailSkillItem[]
  emptyLabel?: string
}) {
  if (!detalles.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-5 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {detalles.map((detail) => (
        <div
          key={detail.id ?? `${detail.skill}-${detail.puntajeMaximo}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/55 px-3 py-2 text-sm transition-colors hover:border-primary/20 hover:bg-background/80 dark:bg-background/30"
        >
          <span className="truncate text-muted-foreground">
            {getGradeTemplateSkillLabel(detail.skill)}
          </span>
          <span className="font-medium text-foreground">
            Máx. {detail.puntajeMaximo}
          </span>
        </div>
      ))}
    </div>
  )
}
