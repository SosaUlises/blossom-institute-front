export enum EstadoCurso {
  Activo = 1,
  Inactivo = 2,
  Archivado = 3,
}

export interface CursoHorario {
  dia: number
  horaInicio: string
  horaFin: string
}

export interface CursoListItem {
  id: number
  nombre: string
  descripcion?: string | null
  anio: number
  estado: EstadoCurso
  cantidadHorarios: number
  cantidadProfesores: number
  cantidadAlumnos: number
  avatarUrls?: string[]
  teachers?: CursoTeacher[]
  teacherNames?: string[]
  studentsCount?: number
  attendanceAverage?: number | null
  academicAverage?: number | null
  asistenciaActual?: number | null
  promedioActual?: number | null
  period?: CourseAcademicPeriod | null
  metricsCurrent?: CourseMetricsCurrent | null
  pendingCorrectionsCount?: number
  studentsAtRiskCount?: number
  studentsAtRiskCurrentCount?: number
  alumnosCriticosActualesCount?: number
  alumnosConBajaAsistenciaActualCount?: number
  pendingFollowUpCount?: number
  pendingFollowUp?: CoursePendingFollowUp[]
  requiresAttention?: boolean
  healthStatus?: CursoHealthStatus | null
  academicStatusCurrent?: CursoHealthStatus | null
  mainSignal?: string | null
}

export interface CursoTeacher {
  id: number
  firstName: string
  lastName: string
  avatarUrl?: string | null
}

export interface CursoHealthStatus {
  level: 'normal' | 'follow-up' | 'critical' | string
  label: string
  reasons?: string[]
  color?: 'emerald' | 'amber' | 'rose' | string
}

export interface CourseAcademicPeriod {
  label: string
  from: string
  to: string
  year: number
  quarterNumber?: number
  quarter?: number
  monthRangeLabel?: string
}

export interface CourseMetricsCurrent {
  attendanceAverage?: number | null
  academicAverage?: number | null
  asistenciaActual?: number | null
  promedioActual?: number | null
  studentsAtRiskCurrentCount?: number
  alumnosCriticosActualesCount?: number
  alumnosConBajaAsistenciaActualCount?: number
  pendingFollowUpCount?: number
  pendingCorrectionsCount?: number
}

export interface CoursePendingFollowUp {
  alumnoId?: number
  alumnoNombre?: string
  alumnoApellido?: string
  avatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  periodLabel: string
  quarterNumber: number
  year: number
  level: 'normal' | 'follow-up' | 'critical' | string
  reason: string
  averageValue?: number | null
  attendanceValue?: number | null
  description: string
}

export interface CourseAcademicProfileCourse {
  id: number
  name: string
  description?: string | null
  status: string
}

export interface CourseAcademicProfileTeacher {
  id: number
  fullName: string
  avatarUrl?: string | null
}

export interface CourseAcademicProfileStudents {
  studentsCount: number
}

export interface CourseAcademicProfileMetrics {
  attendanceAverage?: number | null
  academicAverage?: number | null
  asistenciaActual?: number | null
  promedioActual?: number | null
  studentsAtRiskCount: number
  studentsAtRiskCurrentCount?: number
  alumnosCriticosActualesCount?: number
  alumnosConBajaAsistenciaActualCount?: number
  pendingFollowUpCount?: number
  pendingCorrectionsCount: number
}

export interface CourseAcademicProfileHealth {
  level: 'normal' | 'follow-up' | 'critical' | string
  label: string
  reasons: string[]
  color?: 'emerald' | 'amber' | 'rose' | string
}

export interface CourseAcademicProfileAffectedStudent {
  id: number
  fullName: string
  avatarUrl?: string | null
  attendancePercentage?: number | null
  averageGrade?: number | null
  reason: string
}

export interface CourseAcademicProfileSignal {
  type: string
  title: string
  description: string
  severity: 'neutral' | 'attention' | 'critical' | string
}

export interface CourseRecentActivity {
  type: string
  title: string
  description: string
  severity: 'neutral' | 'attention' | 'critical' | string
  occurredAtUtc?: string | null
}

export interface CourseAcademicProfile {
  course: CourseAcademicProfileCourse
  period?: CourseAcademicPeriod | null
  teachers: CourseAcademicProfileTeacher[]
  students: CourseAcademicProfileStudents
  academicMetrics: CourseAcademicProfileMetrics
  metricsCurrent?: CourseMetricsCurrent | null
  health: CourseAcademicProfileHealth
  academicStatusCurrent?: CourseAcademicProfileHealth | null
  studentsAtRiskCurrentCount?: number
  pendingFollowUpCount?: number
  affectedStudentsCurrent?: CourseAcademicProfileAffectedStudent[]
  studentsRequiringFollowUp: CourseAcademicProfileAffectedStudent[]
  pendingFollowUp?: CoursePendingFollowUp[]
  academicSignals: CourseAcademicProfileSignal[]
  recentActivity?: CourseRecentActivity[]
}

export interface CursoById {
  id: number
  nombre: string
  anio: number
  descripcion?: string | null
  estado: EstadoCurso
  horarios: CursoHorario[]
  cantidadProfesores: number
  cantidadAlumnos: number
}

export interface CreateCursoDTO {
  nombre: string
  anio: number
  descripcion?: string
  estado: number
  horarios: CursoHorario[]
}

export interface UpdateCursoDTO {
  nombre: string
  anio: number
  descripcion?: string
  estado: number
  horarios: CursoHorario[]
}

export interface CoursesListResponse {
  items: CursoListItem[]
  total: number
  pageNumber: number
  pageSize: number
  period?: CourseAcademicPeriod | null
}

export interface ApiResponse<T> {
  message: string
  success: boolean
  statusCode: number
  data: T
}
