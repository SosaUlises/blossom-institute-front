import { NextRequest, NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function GET(
  request: NextRequest,
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

    const searchParams = request.nextUrl.searchParams
    const pageNumber = searchParams.get('pageNumber') ?? '1'
    const pageSize = searchParams.get('pageSize') ?? '10'
    const search = searchParams.get('search')?.trim()

    const query = new URLSearchParams()
    query.set('pageNumber', pageNumber)
    query.set('pageSize', pageSize)

    if (search) {
      query.set('search', search)
    }

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/plantillas-calificaciones?${query.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )

    const result = await safeJson(response)

    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error('Teacher grade templates GET route error:', error)

    return NextResponse.json(
      { message: 'Ocurrió un error al obtener las plantillas.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
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

    const body = await request.json()

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/plantillas-calificaciones`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    )

    const result = await safeJson(response)
    console.error('Teacher grade templates POST backend response:', {
  status: response.status,
  result,
})

    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error('Teacher grade templates POST route error:', error)

    return NextResponse.json(
      { message: 'Ocurrió un error al crear la plantilla.' },
      { status: 500 }
    )
  }
}