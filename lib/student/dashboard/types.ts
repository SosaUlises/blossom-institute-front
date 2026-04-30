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
  promedioGeneral?: number | null
  porcentajeAsistenciaGeneral?: number | null
  cursos?: unknown[] | null
  proximasClases?: unknown[] | null
  ultimasClases?: unknown[] | null
  tareasPendientes?: StudentDashboardTask[] | null
  ultimasEntregas?: unknown[] | null
  ultimasCalificaciones?: StudentDashboardGrade[] | null
  resumenPorCurso?: StudentCourseSummary[] | null
}
