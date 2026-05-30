export interface Alumno {
  id: number
  nombre: string
  apellido: string
  dni: number
  telefono?: string | null
  email: string
  avatarUrl?: string | null
  activo: boolean
  isActive?: boolean
  currentCourseId?: number | null
  currentCourseName?: string | null
  currentCourseDescription?: string | null
  hasActiveEnrollment?: boolean
  isWithoutCourse?: boolean
  attendancePercentage?: number | null
  averageGrade?: number | null
  latestLowGrade?: AlumnoLatestLowGrade | null
  consecutiveAbsences?: number | null
  academicStatusLevel?: 'normal' | 'follow-up' | 'critical' | string
  academicStatusLabel?: string | null
  academicReasons?: string[]
}

export interface AlumnoLatestLowGrade {
  id: number
  courseId: number
  courseName: string
  title: string
  grade: number
  date: string
}

export interface StudentAcademicSummary {
  student: StudentAcademicIdentity
  period: StudentAcademicPeriod
  currentCourse?: StudentAcademicEnrollment | null
  currentEnrollments: StudentAcademicEnrollment[]
  attendanceSummary: StudentAttendanceSummary
  gradesSummary: StudentGradesSummary
  homeworkSummary: StudentHomeworkSummary
  academicStatus: StudentAcademicStatus
  recentSignals: StudentAcademicSignal[]
}

export interface StudentAcademicIdentity {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email?: string | null
  phone?: string | null
  telefono?: string | null
  dni: number
  active: boolean
  avatarUrl?: string | null
}

export interface StudentAcademicPeriod {
  type: string
  label: string
  monthRangeLabel?: string | null
  from: string
  to: string
  year: number
  quarter: number
}

export interface StudentAcademicEnrollment {
  courseId: number
  courseName: string
  courseDescription?: string | null
  courseStatus: string
  teacherName?: string | null
  teacherAvatarUrl?: string | null
  isMain: boolean
}

export interface StudentAttendanceSummary {
  attendancePercentage?: number | null
  presentCount?: number | null
  absentCount?: number | null
  totalClasses?: number | null
  consecutiveAbsences?: number | null
  isLowAttendance?: boolean | null
}

export interface StudentGradesSummary {
  averageGrade?: number | null
  manualAverageGrade?: number | null
  lowGradesCount?: number | null
  latestLowGrade?: StudentGradeSignal | null
  latestGrade?: StudentGradeSignal | null
}

export interface StudentGradeSignal {
  id: number
  courseId: number
  courseName: string
  title: string
  type: string
  grade: number
  date: string
}

export interface StudentHomeworkSummary {
  pendingSubmissions?: number | null
  pendingCorrections?: number | null
  approvedCount?: number | null
  needsRevisionCount?: number | null
}

export interface StudentAcademicStatus {
  level: 'normal' | 'follow-up' | 'critical' | string
  label: string
  reasons: string[]
}

export interface StudentAcademicSignal {
  type: 'low-grade' | 'low-attendance' | 'consecutive-absences' | 'missing-homework' | 'other' | string
  title: string
  description: string
  severity: 'neutral' | 'attention' | 'critical' | string
  date?: string | null
}

export interface CreateAlumnoDTO {
  nombre: string
  apellido: string
  dni: number
  telefono: string
  email: string
  password: string
}

export interface UpdateAlumnoDTO {
  nombre: string
  apellido: string
  dni: number
  telefono: string
  email: string
  password?: string
}

export interface StudentsListResponse {
  items: Alumno[]
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
