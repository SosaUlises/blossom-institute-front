import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string; templateId: string }> }
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

    const { id, templateId } = await context.params

    const courseId = Number(id)
    const plantillaId = Number(templateId)

    if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    if (!plantillaId || Number.isNaN(plantillaId) || plantillaId <= 0) {
      return NextResponse.json({ message: 'Plantilla inválida.' }, { status: 400 })
    }

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/plantillas-calificaciones/${plantillaId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )

    const result = await response.json().catch(() => null)

    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al obtener la plantilla.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; templateId: string }> }
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

    const { id, templateId } = await context.params

    const courseId = Number(id)
    const plantillaId = Number(templateId)

    if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    if (!plantillaId || Number.isNaN(plantillaId) || plantillaId <= 0) {
      return NextResponse.json({ message: 'Plantilla inválida.' }, { status: 400 })
    }

    const body = await request.json()

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/plantillas-calificaciones/${plantillaId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    )

    const result = await response.json().catch(() => null)

    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al actualizar la plantilla.' },
      { status: 500 }
    )
  }
}