import 'server-only'

import { getSession } from '@/lib/auth/session'
import type { StudentDashboardResponse } from './types'

type ApiEnvelope<T> = {
  statusCode?: number
  message?: string
  data?: T
}

const BASE = process.env.BACKEND_API_URL

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | T
    | null

  if (!response.ok) {
    throw new Error(
      (result as ApiEnvelope<T> | null)?.message ||
        'Ocurrio un error en la solicitud.'
    )
  }

  return ((result as ApiEnvelope<T> | null)?.data ?? result) as T
}

export async function getStudentDashboard(): Promise<StudentDashboardResponse> {
  if (!BASE) {
    throw new Error('BACKEND_API_URL no esta configurada.')
  }

  const session = await getSession()

  if (!session?.token) {
    throw new Error('No hay sesion activa.')
  }

  const response = await fetch(`${BASE}/api/v1/me/alumno/dashboard`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
    cache: 'no-store',
  })

  return parseResponse<StudentDashboardResponse>(response)
}
