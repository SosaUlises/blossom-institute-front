import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{ id: string }>
}

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get('estado') ?? ''
    const pageNumber = searchParams.get('pageNumber') ?? '1'
    const pageSize = searchParams.get('pageSize') ?? '100'

    const url = new URL(`${BASE}/api/v1/cursos/${id}/tareas`)
    url.searchParams.set('pageNumber', pageNumber)
    url.searchParams.set('pageSize', pageSize)

    if (estado.trim()) {
      url.searchParams.set('estado', estado)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    })

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok
          ? 'Tareas obtenidas correctamente.'
          : 'No se pudieron obtener las tareas.',
        data: null,
      },
      { status: response.status }
    )
  } catch (error) {
    console.error('Course tasks route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error obteniendo tareas del curso.' },
      { status: 500 }
    )
  }
}