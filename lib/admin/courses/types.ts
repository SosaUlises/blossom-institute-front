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
  pendingCorrectionsCount?: number
  studentsAtRiskCount?: number
  requiresAttention?: boolean
  healthStatus?: CursoHealthStatus | null
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
  studentsAtRiskCount: number
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
  teachers: CourseAcademicProfileTeacher[]
  students: CourseAcademicProfileStudents
  academicMetrics: CourseAcademicProfileMetrics
  health: CourseAcademicProfileHealth
  studentsRequiringFollowUp: CourseAcademicProfileAffectedStudent[]
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
}

export interface ApiResponse<T> {
  message: string
  success: boolean
  statusCode: number
  data: T
}
