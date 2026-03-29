import { BookOpen } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProfesorDashboardResumenCursoItem } from '@/lib/teacher/dashboard/types'

export function TeacherCourseSummaryCard({
  items,
}: {
  items: ProfesorDashboardResumenCursoItem[]
}) {
  return (
    <Card className="rounded-[28px] border border-border/70 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(30,42,68,0.16)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Resumen por curso
        </CardTitle>
        <CardDescription>
          Vista general del estado académico y operativo de cada curso asignado.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
            No hay cursos para mostrar.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.cursoId}
              className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-all hover:border-primary/20 hover:bg-card hover:shadow-[0_14px_28px_-20px_rgba(30,42,68,0.20)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <p className="text-sm font-semibold text-foreground">{item.cursoNombre}</p>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Alumnos:{' '}
                      <span className="font-medium text-foreground">{item.cantidadAlumnos}</span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Tareas:{' '}
                      <span className="font-medium text-foreground">{item.tareasPublicadas}</span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Pendientes:{' '}
                      <span className="font-medium text-foreground">
                        {item.entregasPendientesCorreccion}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Promedio:{' '}
                      <span className="font-medium text-foreground">
                        {item.promedioCurso?.toFixed(2) ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}