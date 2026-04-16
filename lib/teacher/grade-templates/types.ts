export enum TipoCalificacion {
  Homework = 1,
  Quiz = 2,
  Test = 3,
  Participation = 4,
  Behaviour = 5,
}

export enum SkillEvaluada {
  Reading = 1,
  UseOfEnglish = 2,
  Listening = 3,
  Writing = 4,
  Speaking = 5,
}

export interface GradeTemplateSkillItem {
  id?: number
  skill: number
  puntajeMaximo: number
}

export interface GradeTemplateDetailFormValue {
  id: string
  skill: string
  puntajeMaximo: string
}

export interface GradeTemplateFormPayload {
  tipo: number
  titulo: string
  descripcion?: string | null
  detalles: GradeTemplateSkillItem[]
}

export interface GradeTemplateFormValues {
  tipo: string
  titulo: string
  descripcion: string
  detalles: GradeTemplateDetailFormValue[]
}

export interface GradeTemplateListItem {
  id: number
  cursoId: number
  tipo: number
  titulo: string
  descripcion?: string | null
  tieneDetalleSkills: boolean
  cantidadSkills: number
  puntajeMaximoTotal: number | null
  createdAtUtc: string
}

export interface GradeTemplateListResponse {
  total: number
  pageNumber: number
  pageSize: number
  items: GradeTemplateListItem[]
}

export interface GradeTemplateDetail {
  id: number
  cursoId: number
  tipo: number
  titulo: string
  descripcion?: string | null
  tieneDetalleSkills: boolean
  puntajeMaximoTotal: number | null
  createdAtUtc: string
  updatedAtUtc?: string | null
  detalles: GradeTemplateSkillItem[]
}

export interface ApplyGradeTemplateAlumnoItem {
  alumnoId: number
  detalles: Array<{
    skill: number
    puntajeObtenido: number
  }>
}

export interface ApplyGradeTemplatePayload {
  fecha: string
  alumnos: ApplyGradeTemplateAlumnoItem[]
}