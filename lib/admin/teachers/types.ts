export interface Profesor {
  id: number
  nombre: string
  apellido: string
  dni: number
  telefono?: string | null
  email: string
  avatarUrl?: string | null
  activo: boolean
  assignedCoursesCount?: number
  assignedCourses?: ProfesorAssignedCourse[]
  studentsCount?: number
  pendingCorrectionsCount?: number
  classesThisWeek?: number
  unloadedAttendanceCount?: number
  coursesAtRiskCount?: number
  requiresFollowUp?: boolean
  mainSignal?: string | null
}

export interface ProfesorAssignedCourse {
  id: number
  name: string
  description?: string | null
}

export interface TeacherAcademicIdentity {
  id: number
  avatarUrl?: string | null
  firstName: string
  lastName: string
  email?: string | null
  active: boolean
}

export interface TeacherAcademicCourse {
  id: number
  name: string
  description?: string | null
  studentsCount: number
  attendanceAverage?: number | null
  averageGrade?: number | null
  requiresAttention: boolean
}

export interface TeacherOperationalStatus {
  level: 'normal' | 'follow-up' | 'critical' | string
  label: string
  reasons: string[]
}

export interface TeacherRecentActivity {
  type: string
  title: string
  description: string
  severity?: 'neutral' | 'attention' | 'critical' | string
  courseId?: number | null
  courseName?: string | null
  occurredAtUtc?: string | null
}

export interface TeacherAcademicSummary {
  teacher: TeacherAcademicIdentity
  assignedCoursesCount: number
  assignedCourses: TeacherAcademicCourse[]
  studentsCount: number
  pendingCorrectionsCount: number
  unloadedAttendanceCount: number
  classesThisWeek: number
  operationalStatus: TeacherOperationalStatus
  recentActivity: TeacherRecentActivity[]
}

export interface CreateProfesorDTO {
  nombre: string
  apellido: string
  dni: number
  telefono: string
  email: string
  password: string
}

export interface UpdateProfesorDTO {
  nombre: string
  apellido: string
  dni: number
  telefono: string
  email: string
  password?: string
}

export interface TeachersListResponse {
  items: Profesor[]
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
