import { SkillEvaluada, TipoCalificacion } from './types'

export const gradeTemplateTipoOptions = [
  { value: String(TipoCalificacion.Quiz), label: 'Quiz' },
  { value: String(TipoCalificacion.Test), label: 'Test' },
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
      return 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400'
    case TipoCalificacion.Test:
      return 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400'
    default:
      return 'border-border/60 bg-muted/40 text-muted-foreground'
  }
}

export function calculateGradeFromTemplateSkills(
  details: Array<{ puntajeObtenido: number; puntajeMaximo: number }>
) {
  const totalObtained = details.reduce(
    (acc, item) => acc + item.puntajeObtenido,
    0
  )
  const totalMax = details.reduce((acc, item) => acc + item.puntajeMaximo, 0)

  if (totalMax <= 0) return 0

  return Number(((totalObtained / totalMax) * 100).toFixed(2))
}

export function createEmptyTemplateDetail() {
  return {
    id: crypto.randomUUID(),
    skill: '',
    puntajeMaximo: '',
  }
}


type SelectOption = {
  value: string
  label: string
}

export const gradeTemplateSkillOptions: SelectOption[] = [
  { value: String(SkillEvaluada.Reading), label: 'Reading' },
  { value: String(SkillEvaluada.UseOfEnglish), label: 'Use of English' },
  { value: String(SkillEvaluada.Listening), label: 'Listening' },
  { value: String(SkillEvaluada.Writing), label: 'Writing' },
  { value: String(SkillEvaluada.Speaking), label: 'Speaking' },
]

export function supportsTemplateSkills(tipo: number) {
  return tipo === TipoCalificacion.Test || tipo === TipoCalificacion.Quiz
}

export function requiresTemplateDirectNote(tipo: number) {
  return (
    tipo === TipoCalificacion.Participation ||
    tipo === TipoCalificacion.Behaviour
  )
}

export function calculateTemplateGradeFromSkills(
  details: Array<{ puntajeObtenido: number; puntajeMaximo: number }>
) {
  const totalObtained = details.reduce((acc, item) => acc + item.puntajeObtenido, 0)
  const totalMax = details.reduce((acc, item) => acc + item.puntajeMaximo, 0)

  if (totalMax <= 0) return 0

  return Number(((totalObtained / totalMax) * 100).toFixed(2))
}

export function getGradeTemplateSkillLabel(skill: number) {
  switch (skill) {
    case SkillEvaluada.Reading:
      return 'Reading'
    case SkillEvaluada.UseOfEnglish:
      return 'Use of English'
    case SkillEvaluada.Listening:
      return 'Listening'
    case SkillEvaluada.Writing:
      return 'Writing'
    case SkillEvaluada.Speaking:
      return 'Speaking'
    default:
      return 'Unknown'
  }
}