import type { TeacherCoursesResponse } from '@/lib/teacher/courses/types'

export interface GetTeacherCoursesParams {
  pageNumber?: number
  pageSize?: number
  search?: string
  anio?: number
  estado?: number
}

type ApiEnvelope<T> = {
  statusCode?: number
  message?: string
  data?: T
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | T
    | null

  if (!response.ok) {
    throw new Error(
      (result as ApiEnvelope<T> | null)?.message ||
        'Ocurrió un error en la solicitud.'
    )
  }

  return (((result as ApiEnvelope<T> | null)?.data ?? result) as T)
}

export async function getTeacherCourses(
  params?: GetTeacherCoursesParams
): Promise<TeacherCoursesResponse> {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params?.pageNumber ?? 1))
  query.set('pageSize', String(params?.pageSize ?? 10))

  if (params?.search?.trim()) {
    query.set('search', params.search.trim())
  }

  if (params?.anio != null) {
    query.set('anio', String(params.anio))
  }

  if (params?.estado != null) {
    query.set('estado', String(params.estado))
  }

  const response = await fetch(`/api/teacher/courses?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<TeacherCoursesResponse>(response)
}