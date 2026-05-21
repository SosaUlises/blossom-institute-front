import { cn } from '@/lib/utils'
import {
  ChevronRight,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ProfesorDashboardResumenCursoItem } from '@/lib/teacher/dashboard/types'

function MetricPill({
  icon,
  value,
  label,
  tone = 'default',
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  tone?: 'default' | 'warning' | 'success' | 'primary' | 'danger'
}) {
  return (
    <div
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-center transition-colors md:w-auto',
        tone === 'warning' && 'border-amber-500/25 bg-amber-500/[0.08]',
        tone === 'success' && 'border-emerald-500/25 bg-emerald-500/[0.08]',
        tone === 'primary' && 'border-primary/20 bg-primary/[0.06]',
        tone === 'danger' && 'border-rose-500/25 bg-rose-500/[0.08]',
        tone === 'default' && 'border-border/60 bg-muted/[0.28]',
      )}
    >
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-lg',
          tone === 'warning' && 'bg-amber-500/10 text-amber-600',
          tone === 'success' && 'bg-emerald-500/10 text-emerald-600',
          tone === 'primary' && 'bg-primary/10 text-primary',
          tone === 'danger' && 'bg-rose-500/10 text-rose-600',
          tone === 'default' && 'bg-background/80 text-muted-foreground',
        )}
      >
        {icon}
      </div>

      <div className="leading-none">
        <p
          className={cn(
            'text-[15px] font-semibold tabular-nums',
            tone === 'warning' && 'text-amber-700 dark:text-amber-400',
            tone === 'success' && 'text-emerald-700 dark:text-emerald-400',
            tone === 'primary' && 'text-primary',
            tone === 'danger' && 'text-rose-700 dark:text-rose-400',
            tone === 'default' && 'text-foreground',
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

function getAverageTone(
  promedioCurso: number | null | undefined,
): 'default' | 'success' | 'danger' {
  if (promedioCurso == null) return 'default'
  return promedioCurso < 60 ? 'danger' : 'success'
}

function CourseRow({ item }: { item: ProfesorDashboardResumenCursoItem }) {
  const tienePendientes = item.entregasPendientesCorreccion > 0
  const promedioTone = getAverageTone(item.promedioCurso)

  return (
    <li>
      <div className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-muted/[0.18] px-4 py-4 text-center transition-colors duration-200 ease-out hover:bg-muted/[0.32] md:flex-row md:items-center md:justify-between md:text-left">
        <div className="min-w-0 flex flex-col items-center gap-4 md:flex-row md:items-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/90 text-primary shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
            <BookOpen className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold tracking-tight text-foreground">
              {item.cursoNombre}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Resumen rápido del curso
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 md:flex md:w-auto md:flex-wrap md:justify-end">
          <MetricPill
            icon={<Users className="size-4" />}
            value={item.cantidadAlumnos}
            label="Alumnos"
          />

          <MetricPill
            icon={<ClipboardList className="size-4" />}
            value={item.tareasPublicadas}
            label="Tareas"
          />

          <MetricPill
            icon={<ClipboardList className="size-4" />}
            value={item.entregasPendientesCorreccion}
            label="Pend."
            tone={tienePendientes ? 'warning' : 'success'}
          />

          <MetricPill
            icon={<BarChart3 className="size-4" />}
            value={item.promedioCurso?.toFixed(1) ?? '—'}
            label="Prom."
            tone={promedioTone}
          />

          <div className="hidden md:flex size-9 items-center justify-center rounded-full text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70">
            <ChevronRight className="size-4" />
          </div>
        </div>
      </div>
    </li>
  )
}

export function TeacherCourseSummaryCard({
  items,
}: {
  items: ProfesorDashboardResumenCursoItem[]
}) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card/95 text-card-foreground shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
      <CardHeader className="pb-3 text-center md:text-left">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Mis cursos
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No hay cursos para mostrar.
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <CourseRow key={item.cursoId} item={item} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
