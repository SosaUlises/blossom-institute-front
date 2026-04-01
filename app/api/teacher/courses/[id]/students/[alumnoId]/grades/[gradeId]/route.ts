import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{
    id: string
    alumnoId: string
    gradeId: string
  }>
}

export async function GET(_request: NextRequest, context: Context) {
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

    const { id, alumnoId, gradeId } = await context.params
    const courseId = Number(id)
    const parsedAlumnoId = Number(alumnoId)
    const parsedGradeId = Number(gradeId)

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/alumnos/${parsedAlumnoId}/calificaciones/${parsedGradeId}`,
      {
        method: 'GET',
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
      { message: 'Ocurrió un error al obtener la calificación.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: Context) {
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

    const { id, alumnoId, gradeId } = await context.params
    const courseId = Number(id)
    const parsedAlumnoId = Number(alumnoId)
    const parsedGradeId = Number(gradeId)
    const body = await request.json()

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/alumnos/${parsedAlumnoId}/calificaciones/${parsedGradeId}`,
      {
        method: 'PUT',
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
      { message: 'Ocurrió un error al actualizar la calificación.' },
      { status: 500 }
    )
  }
}