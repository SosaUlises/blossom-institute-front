import type {
  GradeDetail,
  GradeFormPayload,
  GradeListResponse,
} from './types'

type ApiEnvelope<T> = {
  statusCode?: number
  message?: string
  data?: T
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json()) as ApiEnvelope<T> | T

  if (!response.ok) {
    throw new Error(
      (result as ApiEnvelope<T>)?.message || 'Ocurrió un error en la solicitud.'
    )
  }

  return ((result as ApiEnvelope<T>)?.data ?? result) as T
}

export async function getTeacherGrades(
  courseId: number,
  alumnoId: number,
  pageNumber = 1,
  pageSize = 10
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/students/${alumnoId}/grades?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  return parseResponse<GradeListResponse>(response)
}

export async function getTeacherGradeDetail(
  courseId: number,
  alumnoId: number,
  gradeId: number
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/students/${alumnoId}/grades/${gradeId}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  return parseResponse<GradeDetail>(response)
}

export async function createTeacherGrade(
  courseId: number,
  alumnoId: number,
  payload: GradeFormPayload
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/students/${alumnoId}/grades`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  return parseResponse<{ id: number }>(response)
}

export async function updateTeacherGrade(
  courseId: number,
  alumnoId: number,
  gradeId: number,
  payload: GradeFormPayload
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/students/${alumnoId}/grades/${gradeId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  return parseResponse<unknown>(response)
}

export async function archiveTeacherGrade(
  courseId: number,
  alumnoId: number,
  gradeId: number
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/students/${alumnoId}/grades/${gradeId}/archive`,
    {
      method: 'PATCH',
    }
  )

  return parseResponse<unknown>(response)
}