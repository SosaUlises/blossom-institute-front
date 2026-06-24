import type { TeacherCourseDetail } from './types'

type ApiEnvelope<T> = {
  statusCode?: number
  message?: string
  data?: T
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const result = (text ? JSON.parse(text) : null) as ApiEnvelope<T> | T | null

  if (!response.ok) {
    throw new Error(
      (result as ApiEnvelope<T> | null)?.message ||
        'Ocurrio un error en la solicitud.',
    )
  }

  return ((result as ApiEnvelope<T> | null)?.data ?? result) as T
}

export async function getTeacherCourseDetail(courseId: number) {
  const response = await fetch(`/api/teacher/courses/${courseId}`, {
    method: 'GET',
    cache: 'no-store',
  })

  return parseResponse<TeacherCourseDetail>(response)
}

export async function updateTeacherCourseTheme(
  courseId: number,
  themeIcon: string,
) {
  const response = await fetch(`/api/teacher/courses/${courseId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ themeIcon }),
  })

  return parseResponse<TeacherCourseDetail>(response)
}
