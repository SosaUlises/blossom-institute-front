import type {
  CreateCursoDTO,
  CursoById,
  CoursesListResponse,
  UpdateCursoDTO,
} from './types'

function buildQuery(params?: {
  pageNumber?: number
  pageSize?: number
  search?: string
  anio?: number
  estado?: number
}) {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params?.pageNumber ?? 1))
  query.set('pageSize', String(params?.pageSize ?? 10))

  if (params?.search?.trim()) {
    query.set('search', params.search.trim())
  }

  if (typeof params?.anio === 'number') {
    query.set('anio', String(params.anio))
  }

  if (typeof params?.estado === 'number') {
    query.set('estado', String(params.estado))
  }

  return query.toString()
}

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await safeJson(response)

  if (!response.ok) {
    const message =
      result?.message ||
      result?.raw ||
      `Ocurrió un error en la solicitud. Status: ${response.status}`

    throw new Error(message)
  }

  return (result?.data ?? null) as T
}

export async function getCourses(params?: {
  pageNumber?: number
  pageSize?: number
  search?: string
  anio?: number
  estado?: number
}): Promise<CoursesListResponse> {
  const query = buildQuery(params)

  const response = await fetch(`/api/courses?${query}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<CoursesListResponse>(response)
}

export async function getCourseById(id: number): Promise<CursoById> {
  const response = await fetch(`/api/courses/${id}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<CursoById>(response)
}

export async function createCourse(payload: CreateCursoDTO): Promise<void> {
  const response = await fetch('/api/courses', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  await parseResponse<unknown>(response)
}

export async function updateCourse(id: number, payload: UpdateCursoDTO): Promise<void> {
  const response = await fetch(`/api/courses/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  await parseResponse<unknown>(response)
}

export async function activateCourse(id: number): Promise<void> {
  const response = await fetch(`/api/courses/${id}/activate`, {
    method: 'PUT',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}

export async function deactivateCourse(id: number): Promise<void> {
  const response = await fetch(`/api/courses/${id}/deactivate`, {
    method: 'PUT',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}

export async function archiveCourse(id: number): Promise<void> {
  const response = await fetch(`/api/courses/${id}/archive`, {
    method: 'PUT',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}