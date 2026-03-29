import { EstadoCorreccion } from './feedback-types'

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