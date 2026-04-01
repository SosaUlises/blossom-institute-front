import type { CreateFeedbackPayload } from './feedback-types'
import type {
  TeacherSubmissionDetail,
  TeacherSubmissionFeedbacksResponse,
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

export async function getTeacherSubmissionDetail(
  courseId: number,
  taskId: number,
  alumnoId: number
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/tasks/${taskId}/submissions/${alumnoId}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  return parseResponse<TeacherSubmissionDetail>(response)
}

export async function getTeacherSubmissionFeedbacks(
  courseId: number,
  taskId: number,
  alumnoId: number
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/tasks/${taskId}/submissions/${alumnoId}/feedbacks`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  return parseResponse<TeacherSubmissionFeedbacksResponse>(response)
}

export async function createTeacherSubmissionFeedback(
  courseId: number,
  taskId: number,
  alumnoId: number,
  payload: CreateFeedbackPayload
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/tasks/${taskId}/submissions/${alumnoId}/feedbacks`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  return parseResponse<unknown>(response)
}