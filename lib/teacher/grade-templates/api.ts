import type {
  ApplyGradeTemplatePayload,
  GradeTemplateDetail,
  GradeTemplateFormPayload,
  GradeTemplateListResponse,
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

export async function getTeacherGradeTemplates(
  courseId: number,
  pageNumber = 1,
  pageSize = 10,
  search?: string
) {
  const query = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })

  if (search?.trim()) {
    query.set('search', search.trim())
  }

  const response = await fetch(
    `/api/teacher/courses/${courseId}/grade-templates?${query.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  return parseResponse<GradeTemplateListResponse>(response)
}

export async function getTeacherGradeTemplateDetail(
  courseId: number,
  templateId: number
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/grade-templates/${templateId}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  return parseResponse<GradeTemplateDetail>(response)
}

export async function createTeacherGradeTemplate(
  courseId: number,
  payload: GradeTemplateFormPayload
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/grade-templates`,
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

export async function updateTeacherGradeTemplate(
  courseId: number,
  templateId: number,
  payload: GradeTemplateFormPayload
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/grade-templates/${templateId}`,
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

export async function archiveTeacherGradeTemplate(
  courseId: number,
  templateId: number
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/grade-templates/${templateId}/archive`,
    {
      method: 'PATCH',
    }
  )

  return parseResponse<unknown>(response)
}

export async function applyTeacherGradeTemplate(
  courseId: number,
  templateId: number,
  payload: ApplyGradeTemplatePayload
) {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/grade-templates/${templateId}/apply`,
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