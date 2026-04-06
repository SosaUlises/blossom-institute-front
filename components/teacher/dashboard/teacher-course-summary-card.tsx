import { BookOpen, ClipboardCheck, Users, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProfesorDashboardResumenCursoItem } from '@/lib/teacher/dashboard/types'

function MiniStat({
  label,
  value,
  icon: Icon,
  accent = 'blue',
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'emerald' | 'amber' | 'violet'
}) {
  const accentClasses =
    accent === 'emerald'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : accent === 'amber'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
        : accent === 'violet'
          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
          : 'bg-primary/10 text-primary'

  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.10)]">
      <div className="flex items-start gap-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${accentClasses}`}>
          <Icon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TeacherCourseSummaryCard({
  items,
}: {
  items: ProfesorDashboardResumenCursoItem[]
}) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Detalle por curso
        </CardTitle>
        <CardDescription className="text-sm leading-6">
          Vista rápida del estado académico y operativo de los cursos asignados.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay cursos para mostrar.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.cursoId}
                className="group rounded-[26px] border border-border/60 bg-background/70 p-5 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/20 hover:bg-card hover:shadow-[0_18px_34px_-22px_rgba(15,23,42,0.18)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Curso
                        </p>
                        <h4 className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
                          {item.cursoNombre}
                        </h4>
                      </div>

                      <div className="rounded-2xl border border-primary/15 bg-primary/8 px-4 py-3 sm:min-w-[120px]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                          Promedio
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                          {item.promedioCurso?.toFixed(2) ?? '-'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <MiniStat
                        label="Alumnos"
                        value={item.cantidadAlumnos}
                        icon={Users}
                        accent="blue"
                      />

                      <MiniStat
                        label="Tareas publicadas"
                        value={item.tareasPublicadas}
                        icon={ClipboardCheck}
                        accent="violet"
                      />

                      <MiniStat
                        label="Pendientes"
                        value={item.entregasPendientesCorreccion}
                        icon={ClipboardCheck}
                        accent="amber"
                      />

                      <MiniStat
                        label="Rendimiento"
                        value={item.promedioCurso?.toFixed(2) ?? '-'}
                        icon={TrendingUp}
                        accent="emerald"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}