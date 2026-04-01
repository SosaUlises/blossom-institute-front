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

export interface GradeSkillInput {
  skill: number
  puntajeObtenido: number
  puntajeMaximo: number
}

export interface GradeFormPayload {
  tipo: number
  titulo: string
  descripcion?: string | null
  fecha: string
  tareaId?: number | null
  entregaId?: number | null
  nota?: number | null
  detalles: GradeSkillInput[]
}

export interface GradeFormValues {
  tipo: string
  titulo: string
  descripcion: string
  fecha: string
  tareaId: string
  entregaId: string
  nota: string
  detalles: Array<{
    id: string
    skill: string
    puntajeObtenido: string
    puntajeMaximo: string
  }>
}

export interface GradeListItem {
  id: number
  cursoId: number
  alumnoId: number
  cursoNombre: string
  alumnoNombre: string
  alumnoApellido: string
  alumnoDni: number
  tipo: number
  titulo: string
  descripcion?: string | null
  nota: number
  fecha: string
  tareaId?: number | null
  entregaId?: number | null
}

export interface GradeListResponse {
  total: number
  pageNumber: number
  pageSize: number
  items: GradeListItem[]
}

export interface GradeDetail {
  id: number
  cursoId: number
  alumnoId: number
  tipo: number
  titulo: string
  descripcion?: string | null
  nota: number
  fecha: string
  tareaId?: number | null
  entregaId?: number | null
  tieneDetalleSkills: boolean
  detalles: GradeSkillInput[]
}