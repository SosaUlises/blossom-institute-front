export interface ApiResponse<T> {
  message: string
  success: boolean
  statusCode: number
  data: T
}

export interface DashboardOverview {
  studentsCount: number
  teachersCount: number
  activeCoursesCount: number
  pendingAssignmentsCount: number
}

export interface DashboardPeriod {
  type?: string
  strategy: string
  label?: string
  monthRangeLabel?: string
  from: string
  to: string
  year: number
  month: number
  quarter?: number
}

export interface DashboardTrendComparison {
  type: string
  label: string
}

export interface DashboardRollingWindow {
  type: string
  days: number
  label: string
}

export interface DashboardAverageGradeByCourse {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  profesoresNombres?: string[]
  averageGrade: number
}

export interface DashboardStudentAverageRisk {
  alumnoId: number
  alumnoNombre: string
  alumnoAvatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  averageGrade: number
  calificacionesCount: number
}

export interface DashboardStudentAttendanceRisk {
  alumnoId: number
  alumnoNombre: string
  alumnoAvatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  ausentes: number
  clasesTotales: number
  attendancePercentage: number
  averageGrade?: number | null
}

export interface DashboardStudentConsecutiveAbsenceRisk {
  alumnoId: number
  alumnoNombre: string
  alumnoAvatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  consecutiveAbsences: number
  lastAbsenceDate: string
  attendancePercentage: number
  averageGrade?: number | null
}

export interface DashboardStudentCombinedRisk {
  alumnoId: number
  alumnoNombre: string
  alumnoAvatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  averageGrade: number
  attendancePercentage: number
  absences: number
}

export interface DashboardCourseAttendanceRisk {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  profesoresNombres?: string[]
  attendancePercentage: number
  ausentes: number
  expectedAttendanceRecords: number
}

export interface DashboardCourseTrendRisk {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  profesoresNombres?: string[]
  currentValue: number
  previousValue: number
  delta: number
}

export interface DashboardCriticalCourse {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  profesoresNombres?: string[]
  averageGrade: number | null
  attendancePercentage: number | null
  pendingCorrectionCount: number
  signalsCount: number
  health?: {
    level: 'normal' | 'follow-up' | 'critical' | string
    label: string
    reasons: string[]
    color: 'emerald' | 'amber' | 'rose' | string
  }
  academicStatusCurrent?: {
    level: 'normal' | 'follow-up' | 'critical' | string
    label: string
    reasons?: string[]
    color?: 'emerald' | 'amber' | 'rose' | string
  } | null
  studentsAtRiskCurrentCount?: number
  pendingFollowUpCount?: number
  pendingFollowUp?: DashboardPendingFollowUp[]
}

export interface DashboardAcademicTrend {
  key: string
  label: string
  currentValue: number | null
  previousValue: number | null
  delta: number | null
}

export interface DashboardLowManualGradeAlert {
  alumnoId: number
  alumnoNombre: string
  alumnoAvatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  calificacionId: number
  titulo: string
  tipo: number
  nota: number
  fecha: string
  averageGrade?: number | null
}

export interface DashboardPendingFollowUp {
  alumnoId?: number
  alumnoNombre?: string
  alumnoApellido?: string
  alumnoAvatarUrl?: string | null
  avatarUrl?: string | null
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  periodLabel: string
  quarterNumber?: number
  year?: number
  level: 'normal' | 'follow-up' | 'critical' | string
  reason: string
  averageValue?: number | null
  attendanceValue?: number | null
  description?: string | null
}

export interface DashboardOpenFollowUp {
  id: string
  entityType: 'student' | 'course' | string
  entityId: number
  alumnoId?: number | null
  alumnoNombre?: string | null
  alumnoAvatarUrl?: string | null
  cursoId?: number | null
  cursoNombre?: string | null
  cursoDescripcion?: string | null
  periodLabel: string
  quarterNumber: number
  year: number
  reason: string
  source: string
  level: 'normal' | 'follow-up' | 'critical' | string
  averageGrade?: number | null
  attendancePercentage?: number | null
  href: string
}

export interface DashboardUpcomingAssignment {
  tareaId: number
  titulo: string
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  fechaEntregaUtc: string
}

export interface DashboardUpcomingClass {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  profesorNombre: string
  diaSemana: string
  horaInicio: string
  proximaClase: string
}

export interface AdminDashboardResponse {
  period: DashboardPeriod
  trendComparison?: DashboardTrendComparison
  consecutiveAbsencesWindow?: DashboardRollingWindow
  overview: DashboardOverview
  generalAverage: number | null
  currentPeriodAverage: number | null
  institutionalAttendanceAverage: number | null
  institutionalHomeworkPendingCorrectionCount: number

  averageGradesByCourse: DashboardAverageGradeByCourse[]
  manualAverageGradesByCourse: DashboardAverageGradeByCourse[]

  studentsAtRiskThisMonthCount: number
  studentsManualLowGradesThisMonthCount: number
  studentsManualLowPerformance: DashboardLowManualGradeAlert[]
  studentsAtRiskByAverage: DashboardStudentAverageRisk[]
  studentsWithMultipleAbsences: DashboardStudentAttendanceRisk[]
  studentsWithConsecutiveAbsences: DashboardStudentConsecutiveAbsenceRisk[]
  studentsWithCombinedAcademicRisk: DashboardStudentCombinedRisk[]

  coursesAtRiskByOverallAverage: DashboardAverageGradeByCourse[]
  coursesAtRiskByManualAverage: DashboardAverageGradeByCourse[]
  coursesAtRiskByAttendance: DashboardCourseAttendanceRisk[]
  coursesWithAttendanceDecline: DashboardCourseTrendRisk[]
  coursesWithPerformanceDecline: DashboardCourseTrendRisk[]
  criticalCourses: DashboardCriticalCourse[]
  pendingFollowUp?: DashboardPendingFollowUp[]
  coursesPendingFollowUp?: DashboardPendingFollowUp[]
  coursesWithPendingFollowUp?: DashboardPendingFollowUp[]
  openFollowUps?: DashboardOpenFollowUp[]
  pendingFollowUpCount?: number
  coursesPendingFollowUpCount?: number
  academicTrends: DashboardAcademicTrend[]

  upcomingAssignments: DashboardUpcomingAssignment[]
  upcomingClasses: DashboardUpcomingClass[]
}
