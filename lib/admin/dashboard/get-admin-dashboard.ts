import 'server-only'

import { getSession } from '@/lib/auth/session'
import type { AdminDashboardResponse, ApiResponse } from './types'
import type { Profesor, TeachersListResponse } from '@/lib/admin/teachers/types'

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const session = await getSession()

  if (!session?.token) {
    throw new Error('No hay sesión activa.')
  }

  const response = await fetch(`${process.env.BACKEND_API_URL}/api/v1/dashboard/admin`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
    },
    cache: 'no-store',
  })

  const result: ApiResponse<AdminDashboardResponse> = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result?.message || 'No se pudo obtener el dashboard.')
  }

  return result.data
}

async function getTeachersPage(token: string, pageNumber: number): Promise<TeachersListResponse> {
  const backendUrl = new URL(`${process.env.BACKEND_API_URL}/api/v1/profesores`)
  backendUrl.searchParams.set('pageNumber', String(pageNumber))
  backendUrl.searchParams.set('pageSize', '100')

  const response = await fetch(backendUrl.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  const result: ApiResponse<TeachersListResponse> = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result?.message || 'No se pudieron obtener las señales docentes.')
  }

  return result.data
}

export async function getAdminDashboardTeacherSignals(): Promise<Profesor[]> {
  const session = await getSession()

  if (!session?.token) {
    throw new Error('No hay sesión activa.')
  }

  const firstPage = await getTeachersPage(session.token, 1)
  const totalPages = Math.max(1, Math.ceil(firstPage.total / firstPage.pageSize))

  if (totalPages === 1) {
    return firstPage.items
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getTeachersPage(session.token!, index + 2),
    ),
  )

  return [firstPage, ...rest].flatMap((page) => page.items)
}
