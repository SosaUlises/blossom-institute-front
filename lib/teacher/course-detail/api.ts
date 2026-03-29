import type { TeacherCourseDetail } from './types'

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

export async function getTeacherCourseDetail(courseId: number) {
  const response = await fetch(`/api/teacher/courses/${courseId}`, {
    method: 'GET',
    cache: 'no-store',
  })

  return parseResponse<TeacherCourseDetail>(response)
}