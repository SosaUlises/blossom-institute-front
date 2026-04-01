import { SkillEvaluada, TipoCalificacion } from './types'

export const tipoCalificacionOptions = [
  { value: String(TipoCalificacion.Quiz), label: 'Quiz' },
  { value: String(TipoCalificacion.Test), label: 'Test' },
  { value: String(TipoCalificacion.Participation), label: 'Participation' },
  { value: String(TipoCalificacion.Behaviour), label: 'Behaviour' },
]

export const skillOptions = [
  { value: String(SkillEvaluada.Reading), label: 'Reading' },
  { value: String(SkillEvaluada.UseOfEnglish), label: 'Use of English' },
  { value: String(SkillEvaluada.Listening), label: 'Listening' },
  { value: String(SkillEvaluada.Writing), label: 'Writing' },
  { value: String(SkillEvaluada.Speaking), label: 'Speaking' },
]

export function supportsSkills(tipo: number) {
  return tipo === TipoCalificacion.Test || tipo === TipoCalificacion.Quiz
}

export function requiresDirectNote(tipo: number) {
  return (
    tipo === TipoCalificacion.Participation ||
    tipo === TipoCalificacion.Behaviour
  )
}

export function blocksHomeworkLinks() {
  return true
}

export function calculateGradeFromSkills(
  details: Array<{ puntajeObtenido: number; puntajeMaximo: number }>
) {
  const totalObtained = details.reduce((acc, item) => acc + item.puntajeObtenido, 0)
  const totalMax = details.reduce((acc, item) => acc + item.puntajeMaximo, 0)

  if (totalMax <= 0) return 0

  return Number(((totalObtained / totalMax) * 100).toFixed(2))
}

export function getTipoCalificacionLabel(tipo: number) {
  switch (tipo) {
    case TipoCalificacion.Quiz:
      return 'Quiz'
    case TipoCalificacion.Test:
      return 'Test'
    case TipoCalificacion.Participation:
      return 'Participation'
    case TipoCalificacion.Behaviour:
      return 'Behaviour'
    case TipoCalificacion.Homework:
      return 'Homework'
    default:
      return 'Unknown'
  }
}

export function getTipoCalificacionBadgeClass(tipo: number) {
  switch (tipo) {
    case TipoCalificacion.Quiz:
      return 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400'
    case TipoCalificacion.Test:
      return 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400'
    case TipoCalificacion.Participation:
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    case TipoCalificacion.Behaviour:
      return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
    default:
      return 'border-border/60 bg-muted/40 text-muted-foreground'
  }
}