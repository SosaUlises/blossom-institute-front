import type {
  Alumno,
  CreateAlumnoDTO,
  UpdateAlumnoDTO,
  StudentsListResponse,
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

export async function getStudents(params?: {
  pageNumber?: number
  pageSize?: number
  search?: string
}): Promise<StudentsListResponse> {
  const query = buildQuery(params)

  const response = await fetch(`/api/admin/students?${query}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<StudentsListResponse>(response)
}

export async function getStudentById(id: number): Promise<Alumno> {
  const response = await fetch(`/api/admin/students/${id}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<Alumno>(response)
}

export async function createStudent(payload: CreateAlumnoDTO): Promise<void> {
  const response = await fetch('/api/admin/students', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  await parseResponse<unknown>(response)
}

export async function updateStudent(id: number, payload: UpdateAlumnoDTO): Promise<void> {
  const response = await fetch(`/api/admin/students/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  await parseResponse<unknown>(response)
}

export async function activateStudent(id: number): Promise<void> {
  const response = await fetch(`/api/admin/students/${id}/activate`, {
    method: 'PATCH',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}

export async function deactivateStudent(id: number): Promise<void> {
  const response = await fetch(`/api/admin/students/${id}/deactivate`, {
    method: 'PATCH',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}