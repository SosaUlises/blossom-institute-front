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

// ─── Pill ─────────────────────────────────────────────────────────────

function MetricPill({
  icon,
  value,
  label,
  tone = 'default',
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  tone?: 'default' | 'warning' | 'success' | 'primary'
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 transition-colors',
        tone === 'warning' &&
        'border-amber-500/25 bg-amber-500/[0.08]',
        tone === 'success' &&
        'border-emerald-500/25 bg-emerald-500/[0.08]',
        tone === 'primary' &&
        'border-primary/20 bg-primary/[0.06]',
        tone === 'default' &&
        'border-border/60 bg-muted/[0.28]',
      )}
    >
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-lg',
          tone === 'warning' &&
          'bg-amber-500/10 text-amber-600',
          tone === 'success' &&
          'bg-emerald-500/10 text-emerald-600',
          tone === 'primary' &&
          'bg-primary/10 text-primary',
          tone === 'default' &&
          'bg-background/80 text-muted-foreground',
        )}
      >
        {icon}
      </div>

      <div className="leading-none">
        <p
          className={cn(
            'text-[15px] font-semibold tabular-nums',
            tone === 'warning' && 'text-amber-700',
            tone === 'success' && 'text-emerald-700',
            tone === 'primary' && 'text-primary',
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

// ─── Row ─────────────────────────────────────────────────────────────

function CourseRow({ item }: { item: ProfesorDashboardResumenCursoItem }) {
  const tienePendientes = item.entregasPendientesCorreccion > 0

  return (
    <li>
      <div className="group flex flex-col gap-5 rounded-3xl border border-border/50 bg-muted/[0.18] px-5 py-5 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:bg-muted/[0.32] hover:shadow-md md:flex-row md:items-center md:justify-between">

        {/* LEFT */}
        <div className="min-w-0 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-background/90 text-primary shadow-sm">
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

        {/* RIGHT */}
        <div className="flex flex-wrap items-center gap-3 md:justify-end">

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

          {/* PROMEDIO CON IDENTIDAD */}
          <MetricPill
            icon={<BarChart3 className="size-4" />}
            value={item.promedioCurso?.toFixed(1) ?? '—'}
            label="Prom."
            tone="primary"
          />

          <div className="ml-1 hidden md:flex size-9 items-center justify-center rounded-full text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70">
            <ChevronRight className="size-4" />
          </div>
        </div>
      </div>
    </li>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────

export function TeacherCourseSummaryCard({
  items,
}: {
  items: ProfesorDashboardResumenCursoItem[]
}) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-card/95 text-card-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.16)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Mis cursos
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
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