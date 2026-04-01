import { EstadoCurso } from './types'

const dayLabels: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

export function getDayLabel(dia: number) {
  return dayLabels[dia] ?? `Día ${dia}`
}

export function getEstadoCursoLabel(estado: EstadoCurso) {
  switch (estado) {
    case EstadoCurso.Activo:
      return 'Activo'
    case EstadoCurso.Inactivo:
      return 'Inactivo'
    case EstadoCurso.Archivado:
      return 'Archivado'
    default:
      return 'Desconocido'
  }
}

export function getEstadoCursoBadgeClass(estado: EstadoCurso) {
  switch (estado) {
    case EstadoCurso.Activo:
      return 'inline-flex rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400'
    case EstadoCurso.Inactivo:
      return 'inline-flex rounded-full border border-amber-500/15 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400'
    case EstadoCurso.Archivado:
      return 'inline-flex rounded-full border border-slate-500/15 bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400'
    default:
      return 'inline-flex rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground'
  }
}