import { NextRequest, NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params
    const courseId = Number(id)

    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    const response = await fetch(`${BASE}/api/v1/cursos/${courseId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    })

    const result = await response.json().catch(() => null)

    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al obtener el curso.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL no estÃ¡ configurada.' },
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

    const { id } = await context.params
    const courseId = Number(id)

    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso invÃ¡lido.' }, { status: 400 })
    }

    const body = await request.json()

    const response = await fetch(`${BASE}/api/v1/cursos/${courseId}/theme`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await response.json().catch(() => null)

    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'OcurriÃ³ un error al actualizar la portada del curso.' },
      { status: 500 }
    )
  }
}
