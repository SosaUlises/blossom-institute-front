import { getSession } from '@/lib/auth/session'
import type { ProfesorDashboardResponse } from '@/lib/teacher/dashboard/types'

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || 'Ocurrió un error en la solicitud.')
  }

  return (result?.data ?? result) as T
}

export async function getTeacherDashboard(): Promise<ProfesorDashboardResponse> {
  const session = await getSession()

  if (!session?.token) {
    throw new Error('No hay sesión activa.')
  }

  const response = await fetch(
    `${process.env.BACKEND_API_URL}/api/v1/me/profesor/dashboard`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    }
  )

  return parseResponse<ProfesorDashboardResponse>(response)
}