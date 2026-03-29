export function getEstadoClaseConfig(estado: number) {
  switch (estado) {
    case 1: // Programada
      return {
        label: 'Programada',
        className:
          'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
      }

    case 2: // Cancelada
      return {
        label: 'Cancelada',
        className:
          'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
      }

    default:
      return {
        label: 'Desconocido',
        className:
          'border-border/60 bg-muted/40 text-muted-foreground',
      }
  }
}

export function getEstadoTareaConfig(estado: number) {
  switch (estado) {
    case 1: // Borrador
      return {
        label: 'Borrador',
        className:
          'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
      }

    case 2: // Publicada
      return {
        label: 'Publicada',
        className:
          'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400',
      }

    case 3: // Archivada
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