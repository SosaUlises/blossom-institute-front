import type { ReporteMarksResponse } from './types'
import type { ReporteAttendanceResponse } from './types'
import type { ReporteHomeworkResponse } from './types'
import type { ReporteStudentSummaryResponse } from './types'
import type { AsistenciaRangeResponse } from './types'
import type { DeliveriesByTaskResponse } from './types'

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


export async function getHomeworkReport(params: {
  cursoId: number
  year: number
  term: number
  pageNumber?: number
  pageSize?: number
  search?: string
}): Promise<ReporteHomeworkResponse> {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params.pageNumber ?? 1))
  query.set('pageSize', String(params.pageSize ?? 10))

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  const response = await fetch(
    `/api/reports/homework/${params.cursoId}/${params.year}/${params.term}?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )

  return parseResponse<ReporteHomeworkResponse>(response)
}

export function getHomeworkExportExcelUrl(params: {
  cursoId: number
  year: number
  term: number
  search?: string
}) {
  const query = new URLSearchParams()

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  return `/api/reports/homework/${params.cursoId}/${params.year}/${params.term}/export/excel?${query.toString()}`
}

export function getHomeworkExportPdfUrl(params: {
  cursoId: number
  year: number
  term: number
  search?: string
}) {
  const query = new URLSearchParams()

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  return `/api/reports/homework/${params.cursoId}/${params.year}/${params.term}/export/pdf?${query.toString()}`
}



export async function getStudentSummaryReport(params: {
  cursoId: number
  alumnoId: number
  year: number
  term: number
}): Promise<ReporteStudentSummaryResponse> {
  const response = await fetch(
    `/api/reports/student-summary/${params.cursoId}/${params.alumnoId}/${params.year}/${params.term}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )

  return parseResponse<ReporteStudentSummaryResponse>(response)
}

export function getStudentSummaryExportPdfUrl(params: {
  cursoId: number
  alumnoId: number
  year: number
  term: number
}) {
  return `/api/reports/student-summary/${params.cursoId}/${params.alumnoId}/${params.year}/${params.term}/export/pdf`
}



export async function getAttendanceRangeReport(params: {
  cursoId: number
  from: string
  to: string
  pageNumber?: number
  pageSize?: number
  search?: string
}): Promise<AsistenciaRangeResponse> {
  const query = new URLSearchParams()

  query.set('from', params.from)
  query.set('to', params.to)
  query.set('pageNumber', String(params.pageNumber ?? 1))
  query.set('pageSize', String(params.pageSize ?? 10))

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  const response = await fetch(
    `/api/reports/attendance-range/${params.cursoId}?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )

  return parseResponse<AsistenciaRangeResponse>(response)
}



export async function getDeliveriesByTaskReport(params: {
  cursoId: number
  tareaId: number
  pageNumber?: number
  pageSize?: number
  search?: string
  estado?: number
  pendienteCorreccion?: boolean
}): Promise<DeliveriesByTaskResponse> {
  const query = new URLSearchParams()

  query.set('pageNumber', String(params.pageNumber ?? 1))
  query.set('pageSize', String(params.pageSize ?? 20))

  if (params.search?.trim()) {
    query.set('search', params.search.trim())
  }

  if (typeof params.estado === 'number') {
    query.set('estado', String(params.estado))
  }

  if (typeof params.pendienteCorreccion === 'boolean') {
    query.set('pendienteCorreccion', String(params.pendienteCorreccion))
  }

  const response = await fetch(
    `/api/reports/deliveries/${params.cursoId}/${params.tareaId}?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )

  return parseResponse<DeliveriesByTaskResponse>(response)
}