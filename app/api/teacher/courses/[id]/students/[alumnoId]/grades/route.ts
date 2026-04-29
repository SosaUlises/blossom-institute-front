import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, proxyJson, requireApiSession } from '@/lib/auth/api-guards'

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

    const auth = await requireApiSession('Profesor')
    if (auth.response) return auth.response
    const { session } = auth

    const { id, alumnoId } = await context.params
    const courseId = parsePositiveInt(id, 'courseId')
    const parsedAlumnoId = parsePositiveInt(alumnoId, 'parsedAlumnoId')
    if (courseId === null) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }
    if (parsedAlumnoId === null) {
      return NextResponse.json({ message: 'Alumno inválido.' }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = new URLSearchParams(searchParams)
    if (!query.get('pageNumber')) query.set('pageNumber', '1')
    if (!query.get('pageSize')) query.set('pageSize', '10')

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/alumnos/${parsedAlumnoId}/calificaciones?${query.toString()}`,
      {
        headers: authHeaders(session),
        cache: 'no-store',
      }
    )
    return proxyJson(response)
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

    const auth = await requireApiSession('Profesor')
    if (auth.response) return auth.response
    const { session } = auth

    const { id, alumnoId } = await context.params
    const courseId = parsePositiveInt(id, 'courseId')
    const parsedAlumnoId = parsePositiveInt(alumnoId, 'parsedAlumnoId')
    if (courseId === null) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }
    if (parsedAlumnoId === null) {
      return NextResponse.json({ message: 'Alumno inválido.' }, { status: 400 })
    }
    const body = await request.json()

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/alumnos/${parsedAlumnoId}/calificaciones`,
      {
        method: 'POST',
        headers: authHeaders(session, true),
        body: JSON.stringify(body),
      }
    )
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al crear la calificación.' },
      { status: 500 }
    )
  }
}
