import type { CursoTareasResponse } from './types'

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
    throw new Error(
      result?.message || result?.raw || `Error en la solicitud. Status: ${response.status}`
    )
  }

  return result.data as T
}

export async function getTasksByCourse(params: {
  cursoId: number
  estado?: number
  pageNumber?: number
  pageSize?: number
}): Promise<CursoTareasResponse> {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params.pageNumber ?? 1))
  query.set('pageSize', String(params.pageSize ?? 100))

  if (typeof params.estado === 'number') {
    query.set('estado', String(params.estado))
  }

  const response = await fetch(
    `/api/admin/courses/${params.cursoId}/tasks?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )

  return parseResponse<CursoTareasResponse>(response)
}