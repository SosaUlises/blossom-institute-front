import { NextRequest, NextResponse } from 'next/server'
import { proxyJson } from '@/lib/auth/api-guards'
import { getSession, hasRole } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{
    id: string
    fecha: string
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

    const { id, fecha } = await context.params
    const courseId = Number(id)

    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/clase/${fecha}/asistencias`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al obtener la asistencia.' },
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

    const { id, fecha } = await context.params
    const courseId = Number(id)

    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    const body = await request.json()

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/clase/${fecha}/asistencias`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al guardar la asistencia.' },
      { status: 500 }
    )
  }
}