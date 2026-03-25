export interface ReporteMarksResumen {
  cursoId: number
  cursoNombre: string
  year: number
  term: number
  from: string
  to: string
  totalAlumnos: number
  alumnosConNotas: number
  totalQuizzes: number
  promedioQuizzesCurso?: number | null
  totalTests: number
  promedioTestsCurso?: number | null
  totalMarks: number
  promedioGeneralCurso?: number | null
}

export interface ReporteMarksItem {
  alumnoId: number
  alumnoNombre: string
  alumnoApellido: string
  alumnoDni: number
  alumnoEmail?: string | null
  quizCount: number
  quizPromedio?: number | null
  testCount: number
  testPromedio?: number | null
  marksCount: number
  promedioGeneral?: number | null
}

export interface ReporteMarksResponse {
  pageNumber: number
  pageSize: number
  total: number
  resumen: ReporteMarksResumen
  items: ReporteMarksItem[]
}

export interface ApiEnvelope<T> {
  message: string
  success: boolean
  statusCode: number
  data: T
}

export interface ReporteAttendanceResumen {
  cursoId: number
  cursoNombre: string
  year: number
  term: number
  from: string
  to: string
  totalAlumnos: number
  totalClases: number
  totalPresentes: number
  totalAusentes: number
  porcentajeAsistenciaCurso?: number | null
}

export interface ReporteAttendanceItem {
  alumnoId: number
  alumnoNombre: string
  alumnoApellido: string
  alumnoDni: number
  alumnoEmail?: string | null
  clasesTotales: number
  presentes: number
  ausentes: number
  porcentajeAsistencia: number
}

export interface ReporteAttendanceResponse {
  pageNumber: number
  pageSize: number
  total: number
  resumen: ReporteAttendanceResumen
  items: ReporteAttendanceItem[]
}

export interface ReporteHomeworkResumen {
  cursoId: number
  cursoNombre: string
  year: number
  term: number
  from: string
  to: string
  totalAlumnos: number
  totalHomework: number
  totalEntregas: number
  totalSinEntregar: number
  totalPendientesCorreccion: number
  totalRehacer: number
  totalAprobadas: number
  promedioHomeworkCurso?: number | null
}

export interface ReporteHomeworkItem {
  alumnoId: number
  alumnoNombre: string
  alumnoApellido: string
  alumnoDni: number
  alumnoEmail?: string | null
  homeworkTotal: number
  homeworkEntregadas: number
  homeworkSinEntregar: number
  homeworkPendientesCorreccion: number
  homeworkRehacer: number
  homeworkAprobadas: number
  homeworkPromedio?: number | null
}

export interface ReporteHomeworkResponse {
  pageNumber: number
  pageSize: number
  total: number
  resumen: ReporteHomeworkResumen
  items: ReporteHomeworkItem[]
}

export interface ReporteStudentSummaryAttendance {
  clasesTotales: number
  presentes: number
  ausentes: number
  porcentajeAsistencia: number
}

export interface ReporteStudentSummaryHomework {
  homeworkTotal: number
  homeworkEntregadas: number
  homeworkSinEntregar: number
  homeworkPendientesCorreccion: number
  homeworkRehacer: number
  homeworkAprobadas: number
  homeworkPromedio?: number | null
}

export interface ReporteStudentSummaryMarks {
  quizCount: number
  quizPromedio?: number | null
  testCount: number
  testPromedio?: number | null
  marksCount: number
  promedioGeneral?: number | null
}

export interface ReporteStudentSummarySkillItem {
  skill: number
  evaluacionesCount: number
  totalObtenido: number
  totalMaximo: number
  porcentaje?: number | null
}

export interface ReporteStudentSummaryResponse {
  cursoId: number
  cursoNombre: string
  alumnoId: number
  alumnoNombre: string
  alumnoApellido: string
  alumnoDni: number
  alumnoEmail?: string | null
  year: number
  term: number
  from: string
  to: string
  attendance: ReporteStudentSummaryAttendance
  homework: ReporteStudentSummaryHomework
  marks: ReporteStudentSummaryMarks
  skills: ReporteStudentSummarySkillItem[]
}