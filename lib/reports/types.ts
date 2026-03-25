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