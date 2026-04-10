import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type StatCardAccent =
  | 'blue'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'sky'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  accent?: StatCardAccent
  /** compact: menor tamaño de valor y sin borde coloreado. Usar dentro de secciones densas. */
  compact?: boolean
  className?: string
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

const ACCENT_CONFIG: Record<
  StatCardAccent,
  { border: string; icon: string }
> = {
  blue: {
    border: 'border-blue-200/60 dark:border-blue-900/40',
    icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  violet: {
    border: 'border-violet-200/60 dark:border-violet-900/40',
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  emerald: {
    border: 'border-emerald-200/60 dark:border-emerald-900/40',
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    border: 'border-amber-200/60 dark:border-amber-900/40',
    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  rose: {
    border: 'border-rose-200/60 dark:border-rose-900/40',
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  sky: {
    border: 'border-sky-200/60 dark:border-sky-900/40',
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
}

// ─── Componente ───────────────────────────────────────────────────────────────



type Accent = 'blue' | 'emerald' | 'violet' | 'amber'

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'blue',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: Accent
}) {
  const accentStyles =
    accent === 'emerald'
      ? {
          card: 'border-emerald-500/15 bg-emerald-500/[0.05] hover:bg-emerald-500/[0.07]',
          iconWrap: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
          label: 'text-emerald-700/80 dark:text-emerald-400/90',
        }
      : accent === 'violet'
        ? {
            card: 'border-violet-500/15 bg-violet-500/[0.05] hover:bg-violet-500/[0.07]',
            iconWrap: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
            label: 'text-violet-700/80 dark:text-violet-400/90',
          }
        : accent === 'amber'
          ? {
              card: 'border-amber-500/15 bg-amber-500/[0.05] hover:bg-amber-500/[0.07]',
              iconWrap: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
              label: 'text-amber-700/80 dark:text-amber-400/90',
            }
          : {
              card: 'border-primary/15 bg-primary/[0.05] hover:bg-primary/[0.07]',
              iconWrap: 'bg-primary/10 text-primary',
              label: 'text-primary/80',
            }

  return (
    <div
      className={cn(
        'group rounded-[26px] border p-5 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_22px_40px_-24px_rgba(15,23,42,0.20)]',
        accentStyles.card,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.16em]',
              accentStyles.label,
            )}
          >
            {title}
          </p>

          <p className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>

          {subtitle ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-200 group-hover:scale-[1.03]',
            accentStyles.iconWrap,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}