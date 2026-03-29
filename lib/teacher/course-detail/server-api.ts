import 'server-only'

import type { TeacherCourseDetail } from './types'
import { getSession } from '@/lib/auth/session'

type ApiEnvelope<T> = {
  statusCode?: number
  message?: string
  data?: T
}

const BASE = process.env.BACKEND_API_URL

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json()) as ApiEnvelope<T> | T

  if (!response.ok) {
    throw new Error(
      (result as ApiEnvelope<T>)?.message || 'Ocurrió un error en la solicitud.'
    )
  }

  return ((result as ApiEnvelope<T>)?.data ?? result) as T
}

export async function getTeacherCourseDetailServer(courseId: number) {
  if (!BASE) {
    throw new Error('BACKEND_API_URL no está configurada.')
  }

  if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
    throw new Error('Curso inválido.')
  }

  const session = await getSession()

  if (!session?.token) {
    throw new Error('No autorizado.')
  }

  const response = await fetch(`${BASE}/api/v1/cursos/${courseId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
    cache: 'no-store',
  })

  return parseResponse<TeacherCourseDetail>(response)
}