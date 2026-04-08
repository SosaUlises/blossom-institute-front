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

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  accent = 'blue',
  compact = false,
  className,
}: StatCardProps) {
  const { border, icon: iconClass } = ACCENT_CONFIG[accent]

  return (
    <Card
      className={cn(
        'group overflow-hidden rounded-[26px] border bg-card/95 text-card-foreground shadow-[0_16px_34px_-24px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.22)]',
        border,
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {title}
              </p>

              <p
                className={cn(
                  'font-semibold leading-none tracking-tight text-foreground',
                  compact ? 'text-3xl' : 'text-[2rem]',
                )}
              >
                {value}
              </p>
            </div>

            {subtitle && (
              <p className="max-w-[18ch] text-sm leading-6 text-muted-foreground">
                {subtitle}
              </p>
            )}

            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}% vs último período
              </p>
            )}
          </div>

          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-[1.02]',
              iconClass,
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}