import type {
  ClassAttendanceDetail,
  SaveAttendancePayload,
} from './attendance-types'

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

export async function getTeacherClassAttendance(courseId: number, fecha: string) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/classes/${fecha}/attendance`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  return parseResponse<ClassAttendanceDetail>(response)
}

export async function saveTeacherClassAttendance(
  courseId: number,
  fecha: string,
  payload: SaveAttendancePayload
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/classes/${fecha}/attendance`,
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