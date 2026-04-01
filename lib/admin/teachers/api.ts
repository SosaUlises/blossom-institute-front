import type {
  Profesor,
  CreateProfesorDTO,
  UpdateProfesorDTO,
  TeachersListResponse,
} from './types'

function buildQuery(params?: {
  pageNumber?: number
  pageSize?: number
  search?: string
}) {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params?.pageNumber ?? 1))
  query.set('pageSize', String(params?.pageSize ?? 10))

  if (params?.search?.trim()) {
    query.set('search', params.search.trim())
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

export async function getTeachers(params?: {
  pageNumber?: number
  pageSize?: number
  search?: string
}): Promise<TeachersListResponse> {
  const query = buildQuery(params)

  const response = await fetch(`/api/admin/teachers?${query}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<TeachersListResponse>(response)
}

export async function getTeacherById(id: number): Promise<Profesor> {
  const response = await fetch(`/api/admin/teachers/${id}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<Profesor>(response)
}

export async function createTeacher(payload: CreateProfesorDTO): Promise<void> {
  const response = await fetch('/api/admin/teachers', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  await parseResponse<unknown>(response)
}

export async function updateTeacher(id: number, payload: UpdateProfesorDTO): Promise<void> {
  const response = await fetch(`/api/admin/teachers/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  await parseResponse<unknown>(response)
}

export async function activateTeacher(id: number): Promise<void> {
  const response = await fetch(`/api/admin/teachers/${id}/activate`, {
    method: 'PATCH',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}

export async function deactivateTeacher(id: number): Promise<void> {
  const response = await fetch(`/api/admin/teachers/${id}/deactivate`, {
    method: 'PATCH',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}