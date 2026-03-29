import type {
  TeacherTaskDetail,
  TeacherTaskUpdatePayload,
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

export async function getTeacherTaskDetail(courseId: number, taskId: number) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/tasks/${taskId}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  return parseResponse<TeacherTaskDetail>(response)
}

export async function updateTeacherTask(
  courseId: number,
  taskId: number,
  payload: TeacherTaskUpdatePayload
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/tasks/${taskId}`,
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

export async function archiveTeacherTask(courseId: number, taskId: number) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/tasks/${taskId}/archive`,
    {
      method: 'PATCH',
    }
  )

  return parseResponse<unknown>(response)
}