export type StudentDashboardTask = Record<string, unknown> & {
  tareaId?: number
  cursoId?: number
  cursoNombre?: string
  titulo?: string
  fechaEntregaUtc?: string
  vencida?: boolean
}

export type StudentDashboardGrade = Record<string, unknown> & {
  calificacionId?: number
  cursoId?: number
  cursoNombre?: string
  tipo?: string
  titulo?: string
  nota?: number
  fecha?: string
}

export type StudentDashboardFeedback = Record<string, unknown> & {
  cursoId?: number
  cursoNombre?: string
  tareaId?: number
  tituloTarea?: string
  entregaId?: number
  feedbackId?: number
  estado?: number | string | null
  comentario?: string | null
  nota?: number | string | null
  fechaCorreccionUtc?: string | null
  CursoId?: number
  CursoNombre?: string
  TareaId?: number
  TituloTarea?: string
  EntregaId?: number
  FeedbackId?: number
  Estado?: number | string | null
  Comentario?: string | null
  Nota?: number | string | null
  FechaCorreccionUtc?: string | null
}

export type StudentCourseSummary = Record<string, unknown> & {
  cursoId?: number
  cursoNombre?: string
  promedio?: number | null
  porcentajeAsistencia?: number | null
  tareasPendientes?: number
}

export type StudentDashboardResponse = Record<string, unknown> & {
  alumnoId?: number
  nombre?: string
  apellido?: string
  dni?: string | number
  email?: string
  cantidadCursos?: number
  tareasPendientesCount?: number
  entregasRealizadasCount?: number
  feedbacksRehacerCount?: number
  feedbacksPendientesAccionCount?: number
  FeedbacksRehacerCount?: number
  FeedbacksPendientesAccionCount?: number
  promedioGeneral?: number | null
  porcentajeAsistenciaGeneral?: number | null
  cursos?: unknown[] | null
  proximasClases?: unknown[] | null
  ultimasClases?: unknown[] | null
  tareasPendientes?: StudentDashboardTask[] | null
  ultimasEntregas?: unknown[] | null
  ultimasCalificaciones?: StudentDashboardGrade[] | null
  feedbacksRecientes?: StudentDashboardFeedback[] | null
  FeedbacksRecientes?: StudentDashboardFeedback[] | null
  resumenPorCurso?: StudentCourseSummary[] | null
}
