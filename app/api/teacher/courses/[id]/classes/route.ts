import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

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

    const { id } = await context.params
    const courseId = Number(id)

    if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = new URLSearchParams(searchParams)

    if (!query.get('pageNumber')) query.set('pageNumber', '1')
    if (!query.get('pageSize')) query.set('pageSize', '50')

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/clases?${query.toString()}`,
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
      { message: 'Ocurrió un error al obtener las clases.' },
      { status: 500 }
    )
  }
}