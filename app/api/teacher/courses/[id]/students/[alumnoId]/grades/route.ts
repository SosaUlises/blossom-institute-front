import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{
    id: string
    alumnoId: string
  }>
}

export async function GET(request: NextRequest, context: Context) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL no está configurada.' },
        { status: 500 }
      )
    }

    const session = await getSession()
    if (!session?.token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id, alumnoId } = await context.params
    const courseId = Number(id)
    const parsedAlumnoId = Number(alumnoId)

    const searchParams = request.nextUrl.searchParams
    const query = new URLSearchParams(searchParams)
    if (!query.get('pageNumber')) query.set('pageNumber', '1')
    if (!query.get('pageSize')) query.set('pageSize', '10')

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/alumnos/${parsedAlumnoId}/calificaciones?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al obtener las calificaciones.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL no está configurada.' },
        { status: 500 }
      )
    }

    const session = await getSession()
    if (!session?.token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id, alumnoId } = await context.params
    const courseId = Number(id)
    const parsedAlumnoId = Number(alumnoId)
    const body = await request.json()

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/alumnos/${parsedAlumnoId}/calificaciones`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al crear la calificación.' },
      { status: 500 }
    )
  }
}