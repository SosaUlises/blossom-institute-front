import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  accent?: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose'
  className?: string
}

function getAccentClasses(accent: StatCardProps['accent']) {
  switch (accent) {
    case 'blue':
      return {
        card: 'from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background border-blue-200/50 dark:border-blue-900/40',
        icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      }
    case 'violet':
      return {
        card: 'from-violet-50/80 to-background dark:from-violet-950/20 dark:to-background border-violet-200/50 dark:border-violet-900/40',
        icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      }
    case 'emerald':
      return {
        card: 'from-emerald-50/80 to-background dark:from-emerald-950/20 dark:to-background border-emerald-200/50 dark:border-emerald-900/40',
        icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      }
    case 'amber':
      return {
        card: 'from-amber-50/80 to-background dark:from-amber-950/20 dark:to-background border-amber-200/50 dark:border-amber-900/40',
        icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      }
    case 'rose':
      return {
        card: 'from-rose-50/80 to-background dark:from-rose-950/20 dark:to-background border-rose-200/50 dark:border-rose-900/40',
        icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      }
    default:
      return {
        card: 'from-card to-card border-border/70',
        icon: 'bg-primary/10 text-primary',
      }
  }
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  accent = 'blue',
  className,
}: StatCardProps) {
  const styles = getAccentClasses(accent)

  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-[26px] border bg-linear-to-br text-card-foreground shadow-[0_16px_34px_-20px_rgba(30,42,68,0.20)] transition-all hover:-translate-y-[2px] hover:shadow-[0_22px_50px_-22px_rgba(30,42,68,0.26)]',
        styles.card,
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {title}
              </p>

              <p className="text-[2rem] font-bold leading-none tracking-tight text-foreground">
                {value}
              </p>
            </div>

            {subtitle && (
              <p className="max-w-[18ch] text-sm leading-5 text-muted-foreground">
                {subtitle}
              </p>
            )}

            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}% vs último período
              </p>
            )}
          </div>

          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-[1.03]',
              styles.icon
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}