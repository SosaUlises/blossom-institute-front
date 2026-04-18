import { Trophy, TrendingDown, BarChart3 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

import type { DashboardAverageGradeByCourse } from '@/lib/admin/dashboard/types'
import { cn } from '@/lib/utils'

type Props = {
  data: DashboardAverageGradeByCourse[]
  generalAverage: number | null
}

type RankTone = 'default' | 'warning' | 'success'

function getRowTone(score: number, mode: 'positive' | 'warning') {
  if (mode === 'positive') {
    return {
      row: `
        border-emerald-500/18 bg-emerald-500/[0.04]
        dark:border-emerald-400/14 dark:bg-emerald-400/[0.045]
      `,
      hover: `
        hover:border-emerald-500/28 hover:bg-emerald-500/[0.055]
        dark:hover:border-emerald-400/22 dark:hover:bg-emerald-400/[0.06]
      `,
    }
  }

  if (score < 50) {
    return {
      row: `
        border-rose-500/16 bg-rose-500/[0.035]
        dark:border-rose-400/14 dark:bg-rose-400/[0.04]
      `,
      hover: `
        hover:border-rose-500/24 hover:bg-rose-500/[0.045]
        dark:hover:border-rose-400/20 dark:hover:bg-rose-400/[0.05]
      `,
    }
  }

  return {
    row: `
      border-amber-500/16 bg-amber-500/[0.035]
      dark:border-amber-400/14 dark:bg-amber-400/[0.04]
    `,
    hover: `
      hover:border-amber-500/24 hover:bg-amber-500/[0.045]
      dark:hover:border-amber-400/20 dark:hover:bg-amber-400/[0.05]
    `,
  }
}

function getPillTone(tone: RankTone) {
  switch (tone) {
    case 'success':
  return `
    border-emerald-300/70 bg-emerald-100/85
    dark:border-emerald-400/22 dark:bg-emerald-400/[0.16]
    group-hover:border-emerald-400/80 group-hover:bg-emerald-100/95
    dark:group-hover:border-emerald-300/28 dark:group-hover:bg-emerald-400/[0.2]
  `

case 'warning':
  return `
    border-amber-300/70 bg-amber-100/85
    dark:border-amber-400/22 dark:bg-amber-400/[0.16]
    group-hover:border-amber-400/80 group-hover:bg-amber-100/95
    dark:group-hover:border-amber-300/28 dark:group-hover:bg-amber-400/[0.2]
  `

    default:
      return `
        border-border/60 bg-background/85
        dark:border-white/10 dark:bg-white/[0.06]
        group-hover:bg-background
        dark:group-hover:bg-white/[0.08]
      `
  }
}

function RankRow({
  cursoNombre,
  averageGrade,
  tone = 'default',
}: {
  cursoNombre: string
  averageGrade: number
  tone?: RankTone
}) {
  const rowTone =
    tone === 'success'
      ? getRowTone(averageGrade, 'positive')
      : tone === 'warning'
        ? getRowTone(averageGrade, 'warning')
        : {
            row: `
              border-border/60 bg-background/70
              dark:border-white/10 dark:bg-white/[0.03]
            `,
            hover: `
              hover:border-border hover:bg-background/85
              dark:hover:border-white/15 dark:hover:bg-white/[0.05]
            `,
          }

  const pillTone = getPillTone(tone)

  return (
    <div
      className={cn(
        'group flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3.5',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-[1px] hover:shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)]',
        'dark:hover:shadow-[0_14px_34px_-24px_rgba(0,0,0,0.55)]',
        rowTone.row,
        rowTone.hover,
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            'truncate text-[15px] font-semibold tracking-tight text-foreground transition-colors duration-200',
            tone === 'success' &&
              'group-hover:text-emerald-800 dark:group-hover:text-emerald-200',
            tone === 'warning' &&
              'group-hover:text-amber-800 dark:group-hover:text-amber-200',
          )}
        >
          {cursoNombre}
        </p>
      </div>

    <div
  className={cn(
    'inline-flex min-w-[96px] items-center justify-center rounded-full border px-3.5 py-1.5',
    'text-sm font-bold tabular-nums tracking-tight',
    'backdrop-blur-[2px] transition-all duration-200 ease-out',
    'group-hover:scale-[1.02]',
    tone === 'success' &&
      'text-emerald-00 dark:text-emerald-500',
    tone === 'warning' &&
      'text-amber-100 dark:text-amber-500',
    tone === 'default' &&
      'text-foreground',
    pillTone,
  )}
>
  {averageGrade.toFixed(2)}
</div>
    </div>
  )
}

function EmptyRankState({
  text,
}: {
  text: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
      {text}
    </div>
  )
}

function GeneralAverageCard({ value }: { value: number | null }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-[22px] border border-primary/15 bg-primary/5 px-4 py-3.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <BarChart3 className="size-5" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
          Promedio general
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-primary">
          {value !== null ? `${value.toFixed(2)}%` : '-'}
        </p>
      </div>
    </div>
  )
}

export function AdminCoursePerformanceOverviewCard({
  data,
  generalAverage,
}: Props) {
  const topFive = [...data]
    .filter((item) => item.averageGrade >= 60)
    .sort((a, b) => b.averageGrade - a.averageGrade)
    .slice(0, 5)

  const bottomFive = [...data]
    .filter((item) => item.averageGrade < 60)
    .sort((a, b) => a.averageGrade - b.averageGrade)
    .slice(0, 5)

  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              Comparativa por curso
            </CardTitle>
            <CardDescription className="mt-1 text-sm leading-6 text-muted-foreground">
              Ranking resumido para detectar cursos con mejor desempeño y cursos que necesitan seguimiento.
            </CardDescription>
          </div>

          <GeneralAverageCard value={generalAverage} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 text-sm text-muted-foreground">
            No hay datos de calificaciones para mostrar.
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-[24px] border border-emerald-500/15 bg-emerald-500/[0.04] p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Trophy className="size-4.5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-400/90">
                    Mejor desempeño
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Cursos destacados
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {topFive.length === 0 ? (
                  <EmptyRankState text="No hay cursos con promedio igual o mayor a 60 para destacar." />
                ) : (
                  topFive.map((item) => (
                    <RankRow
                      key={`top-${item.cursoId}`}
                      cursoNombre={item.cursoNombre}
                      averageGrade={item.averageGrade}
                      tone="success"
                    />
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-500/15 bg-amber-500/[0.04] p-5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <TrendingDown className="size-4.5" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700/80 dark:text-amber-400/90">
                    Necesitan seguimiento
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Cursos con promedio bajo
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {bottomFive.length === 0 ? (
                  <EmptyRankState text="No hay cursos con promedio menor a 60 para mostrar." />
                ) : (
                  bottomFive.map((item) => (
                    <RankRow
                      key={`bottom-${item.cursoId}`}
                      cursoNombre={item.cursoNombre}
                      averageGrade={item.averageGrade}
                      tone="warning"
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}