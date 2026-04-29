import { NextRequest, NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

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
    if (!hasRole(session, 'Profesor')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id, alumnoId, gradeId } = await context.params
    const courseId = Number(id)
    const parsedAlumnoId = Number(alumnoId)
    const parsedGradeId = Number(gradeId)
    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(parsedAlumnoId) || parsedAlumnoId <= 0) {
      return NextResponse.json({ message: 'Alumno inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(parsedGradeId) || parsedGradeId <= 0) {
      return NextResponse.json({ message: 'Calificación inválida.' }, { status: 400 })
    }

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
    if (!hasRole(session, 'Profesor')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id, alumnoId, gradeId } = await context.params
    const courseId = Number(id)
    const parsedAlumnoId = Number(alumnoId)
    const parsedGradeId = Number(gradeId)
    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(parsedAlumnoId) || parsedAlumnoId <= 0) {
      return NextResponse.json({ message: 'Alumno inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(parsedGradeId) || parsedGradeId <= 0) {
      return NextResponse.json({ message: 'Calificación inválida.' }, { status: 400 })
    }
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
