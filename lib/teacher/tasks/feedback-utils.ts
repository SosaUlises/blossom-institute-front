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
        label: 'Pedir cambios',
        className:
          'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      }
    default:
      return {
        label: 'Sin corregir',
        className:
          'border-border/60 bg-background/70 text-foreground dark:bg-background/35',
      }
  }
}
