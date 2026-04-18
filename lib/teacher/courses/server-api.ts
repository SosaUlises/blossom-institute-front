import { cookies } from 'next/headers'

export interface TeacherCourseDetail {
  id: number
  nombre: string
  anio: number
  descripcion?: string | null
  estado: number
}

type ApiEnvelope<T> = {
  statusCode?: number
  message?: string
  data?: T
}

class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

function getAppUrl(): string {
  const appUrl = process.env.APP_URL

  if (!appUrl) {
    throw new Error(
      'La variable de entorno APP_URL no está configurada.'
    )
  }

  return appUrl
}

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | T
    | null

  if (!response.ok) {
    const message =
      (result as ApiEnvelope<T> | null)?.message ||
      `Ocurrió un error en la solicitud. Status: ${response.status}`

    throw new ApiError(message, response.status)
  }

  return ((result as ApiEnvelope<T> | null)?.data ?? result) as T
}

export async function getTeacherCourseByIdServer(
  courseId: number
): Promise<TeacherCourseDetail> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const baseUrl = getAppUrl()

  const response = await fetch(`${baseUrl}/api/teacher/courses/${courseId}`, {
    method: 'GET',
    headers: {
      cookie: cookieHeader,
    },
    cache: 'no-store',
  })

  return parseResponse<TeacherCourseDetail>(response)
}

export { ApiError }