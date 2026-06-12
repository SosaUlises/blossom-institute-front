export type StudentQuarterSummary = {
  quarter: number
  label: string
  from: string
  to: string
  promedio?: number | null
  asistencia?: number | null
}

export type TeacherCourseStudent = {
  alumnoId: number
  nombre: string
  apellido: string
  dni: number
  email?: string | null
  avatarUrl?: string | null
  promediosTrimestrales: StudentQuarterSummary[]
}

type StudentsEnvelope = {
  message?: string
  data?: {
    items?: TeacherCourseStudent[]
  }
}

export type AcademicMetricTone = 'neutral' | 'healthy' | 'attention' | 'critical'

export function getAverageTone(value?: number | null): AcademicMetricTone {
  if (value == null) return 'neutral'
  if (value < 60) return 'critical'
  if (value < 75) return 'attention'
  return 'healthy'
}

export function getAttendanceTone(value?: number | null): AcademicMetricTone {
  if (value == null) return 'neutral'
  if (value < 70) return 'critical'
  if (value < 85) return 'attention'
  return 'healthy'
}

export function getAcademicStatus(summary?: StudentQuarterSummary | null) {
  const averageTone = getAverageTone(summary?.promedio)
  const attendanceTone = getAttendanceTone(summary?.asistencia)

  if (averageTone === 'neutral' && attendanceTone === 'neutral') {
    return { label: 'Sin datos actuales', tone: 'neutral' as const, priority: 3 }
  }

  if (averageTone === 'critical' && attendanceTone === 'critical') {
    return { label: 'Riesgo combinado', tone: 'critical' as const, priority: 0 }
  }

  if (averageTone === 'critical' || attendanceTone === 'critical') {
    return { label: 'Necesita refuerzo', tone: 'critical' as const, priority: 1 }
  }

  if (averageTone === 'attention' || attendanceTone === 'attention') {
    return { label: 'En seguimiento', tone: 'attention' as const, priority: 2 }
  }

  return { label: 'Sin señales actuales', tone: 'healthy' as const, priority: 3 }
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getCurrentQuarterSummary(
  summaries?: StudentQuarterSummary[],
  today = new Date(),
) {
  const todayKey = getLocalDateKey(today)

  return summaries?.find(
    (summary) => summary.from <= todayKey && summary.to >= todayKey,
  )
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatQuarterMonthRange(summary?: StudentQuarterSummary | null) {
  if (!summary?.from || !summary.to) return null

  const formatter = new Intl.DateTimeFormat('es-AR', { month: 'long' })
  const fromLabel = formatter.format(parseDateOnly(summary.from))
  const toLabel = formatter.format(parseDateOnly(summary.to))

  return `${fromLabel.charAt(0).toUpperCase()}${fromLabel.slice(1)} a ${toLabel}`
}

export async function getTeacherCourseStudents(courseId: number) {
  const response = await fetch(`/api/teacher/courses/${courseId}/students`, {
    cache: 'no-store',
  })
  const result = (await response.json()) as StudentsEnvelope

  if (!response.ok) {
    throw new Error(result.message || 'No se pudieron obtener los alumnos.')
  }

  return result.data?.items ?? []
}
