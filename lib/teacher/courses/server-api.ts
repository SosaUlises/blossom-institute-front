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

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | T
    | null

  if (!response.ok) {
    throw new Error(
      (result as ApiEnvelope<T> | null)?.message ||
        'Ocurrió un error en la solicitud.'
    )
  }

  return (((result as ApiEnvelope<T> | null)?.data ?? result) as T)
}

export async function getTeacherCourseByIdServer(
  courseId: number
): Promise<TeacherCourseDetail> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const response = await fetch(`${baseUrl}/api/teacher/courses/${courseId}`, {
    method: 'GET',
    headers: {
      cookie: cookieHeader,
    },
    cache: 'no-store',
  })

  return parseResponse<TeacherCourseDetail>(response)
}