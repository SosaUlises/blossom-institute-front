import 'server-only'

import { getSession } from '@/lib/auth/session'
import type { AdminDashboardData, ApiResponse } from './types'

export async function getAdminDashboard(): Promise<AdminDashboardData> {
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

  const result: ApiResponse<AdminDashboardData> = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result?.message || 'No se pudo obtener el dashboard.')
  }

  return result.data
}