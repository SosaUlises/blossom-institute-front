import type { ReporteMarksResponse } from './types'
import type { ReporteAttendanceResponse } from './types'

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

export async function getMarksReport(params: {
  cursoId: number
  year: number
  term: number
  pageNumber?: number
  pageSize?: number
  search?: string
}): Promise<ReporteMarksResponse> {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params.pageNumber ?? 1))
  query.set('pageSize', String(params.pageSize ?? 10))

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  const response = await fetch(
    `/api/reports/marks/${params.cursoId}/${params.year}/${params.term}?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )

  return parseResponse<ReporteMarksResponse>(response)
}

export function getMarksExportExcelUrl(params: {
  cursoId: number
  year: number
  term: number
  search?: string
}) {
  const query = new URLSearchParams()

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  return `/api/reports/marks/${params.cursoId}/${params.year}/${params.term}/export/excel?${query.toString()}`
}

export function getMarksExportPdfUrl(params: {
  cursoId: number
  year: number
  term: number
  search?: string
}) {
  const query = new URLSearchParams()

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  return `/api/reports/marks/${params.cursoId}/${params.year}/${params.term}/export/pdf?${query.toString()}`
}


export async function getAttendanceReport(params: {
  cursoId: number
  year: number
  term: number
  pageNumber?: number
  pageSize?: number
  search?: string
}): Promise<ReporteAttendanceResponse> {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params.pageNumber ?? 1))
  query.set('pageSize', String(params.pageSize ?? 10))

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  const response = await fetch(
    `/api/reports/attendance/${params.cursoId}/${params.year}/${params.term}?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )

  return parseResponse<ReporteAttendanceResponse>(response)
}

export function getAttendanceExportExcelUrl(params: {
  cursoId: number
  year: number
  term: number
  search?: string
}) {
  const query = new URLSearchParams()

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  return `/api/reports/attendance/${params.cursoId}/${params.year}/${params.term}/export/excel?${query.toString()}`
}

export function getAttendanceExportPdfUrl(params: {
  cursoId: number
  year: number
  term: number
  search?: string
}) {
  const query = new URLSearchParams()

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  return `/api/reports/attendance/${params.cursoId}/${params.year}/${params.term}/export/pdf?${query.toString()}`
}