import type {
  Alumno,
  CreateAlumnoDTO,
  UpdateAlumnoDTO,
  StudentsListResponse,
  StudentAcademicSummary,
} from './types'

function buildQuery(params?: {
  pageNumber?: number
  pageSize?: number
  search?: string
  cursoId?: number
}) {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params?.pageNumber ?? 1))
  query.set('pageSize', String(params?.pageSize ?? 10))

  if (params?.cursoId) {
    query.set('cursoId', String(params.cursoId))
  }

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

export async function getStudentAcademicSummary(
  id: number,
): Promise<StudentAcademicSummary> {
  const response = await fetch(`/api/admin/students/${id}/academic-summary`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<StudentAcademicSummary>(response)
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
  const response = await fetch(`/api/admin/students/${id}/desactivate`, {
    method: 'PATCH',
    credentials: 'include',
  })

  await parseResponse<unknown>(response)
}

export async function getAssignableStudents(params: {
  cursoId: number
  pageNumber?: number
  pageSize?: number
  search?: string
}): Promise<StudentsListResponse> {
  const query = buildQuery({
    cursoId: params.cursoId,
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 100,
    search: params.search,
  })

  const response = await fetch(`/api/admin/students/assignable?${query}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<StudentsListResponse>(response)
}
