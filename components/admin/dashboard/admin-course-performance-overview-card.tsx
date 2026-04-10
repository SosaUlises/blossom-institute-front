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

function getScoreTone(score: number, mode: 'positive' | 'warning') {
  if (mode === 'positive') {
    if (score >= 85) {
      return {
        row: 'border-emerald-500/20 bg-emerald-500/[0.08]',
        pill: 'border-emerald-400/25 bg-emerald-500/15 text-emerald-300',
      }
    }

    return {
      row: 'border-emerald-500/18 bg-emerald-500/[0.06]',
      pill: 'border-emerald-400/20 bg-emerald-500/12 text-emerald-300',
    }
  }

  if (score < 50) {
    return {
      row: 'border-rose-500/20 bg-rose-500/[0.08]',
      pill: 'border-rose-400/25 bg-rose-500/15 text-rose-300',
    }
  }

  return {
    row: 'border-amber-500/20 bg-amber-500/[0.08]',
    pill: 'border-amber-400/25 bg-amber-500/15 text-amber-300',
  }
}

function RankRow({
  cursoNombre,
  averageGrade,
  tone = 'default',
}: {
  cursoNombre: string
  averageGrade: number
  tone?: 'default' | 'warning' | 'success'
}) {
  const scoreTone =
    tone === 'success'
      ? getScoreTone(averageGrade, 'positive')
      : tone === 'warning'
        ? getScoreTone(averageGrade, 'warning')
        : {
            row: 'border-border/60 bg-background/75',
            pill: 'border-border/60 bg-background/70 text-foreground',
          }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3.5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm',
        scoreTone.row,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
          {cursoNombre}
        </p>
      </div>

      <div
        className={cn(
          'inline-flex min-w-[88px] items-center justify-center rounded-full border px-3.5 py-1.5 text-sm font-semibold tabular-nums shadow-sm',
          scoreTone.pill,
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