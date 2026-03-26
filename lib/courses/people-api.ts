import type {
  CursoAlumno,
  CursoProfesor,
  CursoPeopleResponse,
  AssignAlumnosDTO,
  AssignProfesoresDTO,
} from './people-types'

async function safeJson(res: Response) {
  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await safeJson(res)

  if (!res.ok) {
    throw new Error(
      json?.message || json?.raw || `Error en la solicitud. Status: ${res.status}`
    )
  }

  return json?.data as T
}

// ---------------- ALUMNOS ----------------

export async function getCursoAlumnos(cursoId: number) {
  const res = await fetch(`/api/courses/${cursoId}/alumnos`, {
    credentials: 'include',
    cache: 'no-store',
  })

  const text = await res.text()
  const json = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(json?.message || 'No se pudieron obtener los alumnos del curso.')
  }

  return json.data
}

export async function assignAlumnos(cursoId: number, payload: AssignAlumnosDTO) {
  const res = await fetch(`/api/courses/${cursoId}/alumnos`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  await parseResponse<unknown>(res)
}

export async function removeAlumno(cursoId: number, alumnoId: number) {
  const res = await fetch(`/api/courses/${cursoId}/alumnos/${alumnoId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  await parseResponse<unknown>(res)
}

// ---------------- PROFESORES ----------------

export async function getCursoProfesores(cursoId: number) {
  const res = await fetch(`/api/courses/${cursoId}/profesores`, {
    credentials: 'include',
    cache: 'no-store',
  })

  return parseResponse<CursoPeopleResponse<CursoProfesor>>(res)
}

export async function assignProfesores(cursoId: number, payload: AssignProfesoresDTO) {
  const res = await fetch(`/api/courses/${cursoId}/profesores`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  await parseResponse<unknown>(res)
}

export async function removeProfesor(cursoId: number, profesorId: number) {
  const res = await fetch(`/api/courses/${cursoId}/profesores/${profesorId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  await parseResponse<unknown>(res)
}

