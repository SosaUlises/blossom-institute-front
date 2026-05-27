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
  strategy: string
  from: string
  to: string
  year: number
  month: number
}

export interface DashboardAverageGradeByCourse {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
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
}

export interface DashboardCourseAttendanceRisk {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  attendancePercentage: number
  ausentes: number
  expectedAttendanceRecords: number
}

export interface DashboardCriticalCourse {
  cursoId: number
  cursoNombre: string
  cursoDescripcion?: string | null
  averageGrade: number | null
  attendancePercentage: number | null
  pendingCorrectionCount: number
  signalsCount: number
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

  coursesAtRiskByOverallAverage: DashboardAverageGradeByCourse[]
  coursesAtRiskByManualAverage: DashboardAverageGradeByCourse[]
  coursesAtRiskByAttendance: DashboardCourseAttendanceRisk[]
  criticalCourses: DashboardCriticalCourse[]
  academicTrends: DashboardAcademicTrend[]

  upcomingAssignments: DashboardUpcomingAssignment[]
  upcomingClasses: DashboardUpcomingClass[]
}
