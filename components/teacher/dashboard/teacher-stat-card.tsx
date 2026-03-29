import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Accent = 'blue' | 'violet' | 'emerald' | 'amber'

export function TeacherStatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  accent = 'blue',
}: {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  accent?: Accent
}) {
  const accentClasses =
    accent === 'violet'
      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
      : accent === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : accent === 'amber'
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
      : 'bg-primary/10 text-primary'

  return (
    <Card className="rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_40px_-22px_rgba(30,42,68,0.16)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </p>

            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>

            {subtitle && (
              <p className="text-sm leading-6 text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-2xl shadow-inner',
              accentClasses
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}