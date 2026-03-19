import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border/60 bg-white/95 shadow-[0_10px_30px_-10px_rgba(30,42,68,0.15)] backdrop-blur-sm transition hover:shadow-[0_20px_50px_-20px_rgba(30,42,68,0.25)]',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">

          {/* TEXT */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>

            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>

            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}% vs last month
              </p>
            )}
          </div>

          {/* ICON */}
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}