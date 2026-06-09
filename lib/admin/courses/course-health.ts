export type CourseHealthLevel = 'normal' | 'follow-up' | 'critical'
export type CourseHealthColor = 'emerald' | 'amber' | 'rose'

export interface CourseHealth {
  level: CourseHealthLevel
  label: string
  reasons: string[]
  color: CourseHealthColor
}

export interface CourseHealthInput {
  attendanceAverage?: number | null
  academicAverage?: number | null
  studentsAtRiskCount?: number | null
  teacherAssigned: boolean
}

const CRITICAL_ATTENDANCE_THRESHOLD = 70
const FOLLOW_UP_ATTENDANCE_THRESHOLD = 85
const CRITICAL_GRADE_THRESHOLD = 60
const FOLLOW_UP_GRADE_THRESHOLD = 75

function hasNumber(value?: number | null): value is number {
  return value !== null && value !== undefined && Number.isFinite(value)
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 1,
  }).format(value)
}

export function calculateCourseHealth({
  attendanceAverage,
  academicAverage,
  studentsAtRiskCount = 0,
  teacherAssigned,
}: CourseHealthInput): CourseHealth {
  const reasons: string[] = []
  const riskCount = studentsAtRiskCount ?? 0
  let hasCritical = false
  let hasFollowUp = false

  if (!teacherAssigned) {
    reasons.push('Sin docentes asignados')
    hasCritical = true
  }

  if (hasNumber(attendanceAverage) && attendanceAverage < CRITICAL_ATTENDANCE_THRESHOLD) {
    reasons.push(`Asistencia baja (${formatDecimal(attendanceAverage)}%)`)
    hasCritical = true
  } else if (hasNumber(attendanceAverage) && attendanceAverage < FOLLOW_UP_ATTENDANCE_THRESHOLD) {
    reasons.push(`Asistencia en seguimiento (${formatDecimal(attendanceAverage)}%)`)
    hasFollowUp = true
  }

  if (hasNumber(academicAverage) && academicAverage < CRITICAL_GRADE_THRESHOLD) {
    reasons.push(`Promedio bajo (${formatDecimal(academicAverage)})`)
    hasCritical = true
  } else if (hasNumber(academicAverage) && academicAverage < FOLLOW_UP_GRADE_THRESHOLD) {
    reasons.push(`Promedio en seguimiento (${formatDecimal(academicAverage)})`)
    hasFollowUp = true
  }

  if (riskCount > 0) {
    reasons.push(
      riskCount === 1
        ? '1 alumno en riesgo'
        : `${riskCount} alumnos en riesgo`,
    )
    hasCritical = true
  }

  if (hasCritical) {
    return {
      level: 'critical',
      label: 'Crítico',
      reasons,
      color: 'rose',
    }
  }

  if (hasFollowUp) {
    return {
      level: 'follow-up',
      label: 'Seguimiento',
      reasons,
      color: 'amber',
    }
  }

  return {
    level: 'normal',
    label: 'Normal',
    reasons: reasons.length > 0 ? reasons : ['Sin alertas académicas'],
    color: 'emerald',
  }
}
