import { EstadoAsistencia, EstadoClase } from './attendance-types'

export function getEstadoAsistenciaLabel(value?: EstadoAsistencia | null) {
  switch (value) {
    case EstadoAsistencia.Presente:
      return 'Presente'
    case EstadoAsistencia.Ausente:
      return 'Ausente'
    default:
      return 'Sin registro'
  }
}

export function getEstadoClaseLabel(value: EstadoClase) {
  switch (value) {
    case EstadoClase.Programada:
      return 'Programada'
    case EstadoClase.Cancelada:
      return 'Cancelada'
    default:
      return 'Desconocido'
  }
}

export function getEstadoClaseBadgeClass(value: EstadoClase) {
  switch (value) {
    case EstadoClase.Programada:
      return 'inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400'
    case EstadoClase.Cancelada:
      return 'inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400'
    default:
      return 'inline-flex rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground'
  }
}