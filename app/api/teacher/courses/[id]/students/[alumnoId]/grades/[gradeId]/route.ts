import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, proxyJson, requireApiSession } from '@/lib/auth/api-guards'

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

    const auth = await requireApiSession('Profesor')
    if (auth.response) return auth.response
    const { session } = auth

    const { id, alumnoId, gradeId } = await context.params
    const courseId = parsePositiveInt(id, 'courseId')
    const parsedAlumnoId = parsePositiveInt(alumnoId, 'parsedAlumnoId')
    const parsedGradeId = parsePositiveInt(gradeId, 'parsedGradeId')
    if (courseId === null) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }
    if (parsedAlumnoId === null) {
      return NextResponse.json({ message: 'Alumno inválido.' }, { status: 400 })
    }
    if (parsedGradeId === null) {
      return NextResponse.json({ message: 'Calificación inválida.' }, { status: 400 })
    }

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/alumnos/${parsedAlumnoId}/calificaciones/${parsedGradeId}`,
      {
        method: 'GET',
        headers: authHeaders(session),
        cache: 'no-store',
      }
    )
    return proxyJson(response)
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

    const auth = await requireApiSession('Profesor')
    if (auth.response) return auth.response
    const { session } = auth

    const { id, alumnoId, gradeId } = await context.params
    const courseId = parsePositiveInt(id, 'courseId')
    const parsedAlumnoId = parsePositiveInt(alumnoId, 'parsedAlumnoId')
    const parsedGradeId = parsePositiveInt(gradeId, 'parsedGradeId')
    if (courseId === null) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }
    if (parsedAlumnoId === null) {
      return NextResponse.json({ message: 'Alumno inválido.' }, { status: 400 })
    }
    if (parsedGradeId === null) {
      return NextResponse.json({ message: 'Calificación inválida.' }, { status: 400 })
    }
    const body = await request.json()

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/alumnos/${parsedAlumnoId}/calificaciones/${parsedGradeId}`,
      {
        method: 'PUT',
        headers: authHeaders(session, true),
        body: JSON.stringify(body),
      }
    )
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al actualizar la calificación.' },
      { status: 500 }
    )
  }
}
