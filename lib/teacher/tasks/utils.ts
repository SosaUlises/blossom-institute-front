import { EstadoTarea, EstadoCorreccion, EstadoEntrega } from './types'

export function getEstadoTareaConfig(estado: number) {
  switch (estado) {
    case EstadoTarea.Borrador:
      return {
        label: 'Borrador',
        className:
          'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
      }
    case EstadoTarea.Publicada:
      return {
        label: 'Publicada',
        className:
          'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400',
      }
    case EstadoTarea.Archivada:
      return {
        label: 'Archivada',
        className:
          'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      }
    default:
      return {
        label: 'Desconocido',
        className:
          'border-border/60 bg-muted/40 text-muted-foreground',
      }
  }
}

export function getEstadoEntregaConfig(estado: number) {
  switch (estado) {
    case EstadoEntrega.EntregadaEnTermino:
      return {
        label: 'En término',
        className:
          'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400',
      }
    case EstadoEntrega.FueraDeTermino:
      return {
        label: 'Fuera de término',
        className:
          'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      }
    default:
      return {
        label: 'Desconocido',
        className:
          'border-border/60 bg-muted/40 text-muted-foreground',
      }
  }
}

export function getEstadoCorreccionConfig(estado?: number | null) {
  switch (estado) {
    case EstadoCorreccion.Aprobado:
      return {
        label: 'Aprobado',
        className:
          'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400',
      }
    case EstadoCorreccion.Rehacer:
      return {
        label: 'Rehacer',
        className:
          'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
      }
    default:
      return {
        label: 'Sin feedback',
        className:
          'border-border/60 bg-muted/40 text-muted-foreground',
      }
  }
}