const MINIMUM_RELEVANT_PENDING_CORRECTIONS = 3

export function getTeacherPendingCorrectionsThreshold(
  studentsCount: number | null | undefined,
) {
  if (typeof studentsCount !== 'number' || studentsCount <= 0) {
    return MINIMUM_RELEVANT_PENDING_CORRECTIONS
  }

  return Math.max(
    MINIMUM_RELEVANT_PENDING_CORRECTIONS,
    Math.ceil(studentsCount * 0.5),
  )
}

export function hasRelevantTeacherPendingCorrections({
  pendingCorrectionsCount,
  studentsCount,
}: {
  pendingCorrectionsCount: number | null | undefined
  studentsCount: number | null | undefined
}) {
  return (
    (pendingCorrectionsCount ?? 0) >=
    getTeacherPendingCorrectionsThreshold(studentsCount)
  )
}

export function requiresTeacherOperationalFollowUp({
  pendingCorrectionsCount,
  studentsCount,
  coursesAtRiskCount,
  unloadedAttendanceCount,
}: {
  pendingCorrectionsCount: number | null | undefined
  studentsCount: number | null | undefined
  coursesAtRiskCount: number | null | undefined
  unloadedAttendanceCount: number | null | undefined
}) {
  return (
    (coursesAtRiskCount ?? 0) > 0 ||
    (unloadedAttendanceCount ?? 0) > 0 ||
    hasRelevantTeacherPendingCorrections({
      pendingCorrectionsCount,
      studentsCount,
    })
  )
}
