import { cn } from '@/lib/utils'
import type { StatCardAccent } from '@/components/shared/stat-card'

// ─── Configuración de accent ──────────────────────────────────────────────────

const ACCENT_ICON: Record<StatCardAccent, string> = {
  blue: 'bg-primary/10 text-primary',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

interface MiniStatCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  accent?: StatCardAccent
  className?: string
}

/**
 * MiniStatCard — variante compacta de stat.
 * Layout: ícono + label en columna (no en fila) para evitar wrapping
 * con labels largos ("Tareas publicadas", "Pend. corrección", etc.)
 */
export function MiniStatCard({
  label,
  value,
  icon: Icon,
  accent = 'blue',
  className,
}: MiniStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-[20px] border border-border/60 bg-background/85 p-4 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.10)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
        className,
      )}
    >
      {/* Ícono */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-xl',
          ACCENT_ICON[accent],
        )}
      >
        <Icon className="size-4" />
      </div>

      {/* Label + valor en columna — evita wrapping con labels largos */}
      <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  )
}
