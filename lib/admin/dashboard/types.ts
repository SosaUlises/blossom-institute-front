
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

export interface DashboardAverageGradeByCourse {
  cursoId: number
  cursoNombre: string
  averageGrade: number
}

export interface DashboardUpcomingAssignment {
  tareaId: number
  titulo: string
  cursoId: number
  cursoNombre: string
  fechaEntregaUtc: string
}

export interface DashboardUpcomingClass {
  cursoId: number
  cursoNombre: string
  profesorNombre: string
  diaSemana: string
  horaInicio: string
  proximaClase: string
}

export interface AdminDashboardResponse {
  overview: DashboardOverview
  generalAverage: number | null

  averageGradesByCourse: DashboardAverageGradeByCourse[]
  manualAverageGradesByCourse: DashboardAverageGradeByCourse[]

  studentsAtRiskThisMonthCount: number
  studentsManualLowGradesThisMonthCount: number

  coursesAtRiskByOverallAverage: DashboardAverageGradeByCourse[]
  coursesAtRiskByManualAverage: DashboardAverageGradeByCourse[]

  upcomingAssignments: DashboardUpcomingAssignment[]
  upcomingClasses: DashboardUpcomingClass[]
}