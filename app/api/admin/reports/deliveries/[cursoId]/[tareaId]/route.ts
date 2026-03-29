import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{
    cursoId: string
    tareaId: string
  }>
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

    const { cursoId, tareaId } = await context.params

    const searchParams = request.nextUrl.searchParams
    const pageNumber = searchParams.get('pageNumber') ?? '1'
    const pageSize = searchParams.get('pageSize') ?? '20'
    const search = searchParams.get('search') ?? ''
    const estado = searchParams.get('estado') ?? ''
    const pendienteCorreccion = searchParams.get('pendienteCorreccion') ?? ''

    const url = new URL(
      `${BASE}/api/v1/reportes/cursos/${cursoId}/tareas/${tareaId}/entregas`
    )

    url.searchParams.set('pageNumber', pageNumber)
    url.searchParams.set('pageSize', pageSize)

    if (search.trim()) {
      url.searchParams.set('search', search.trim())
    }

    if (estado.trim()) {
      url.searchParams.set('estado', estado)
    }

    if (pendienteCorreccion.trim()) {
      url.searchParams.set('pendienteCorreccion', pendienteCorreccion)
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
          ? 'Reporte obtenido correctamente.'
          : 'No se pudo obtener el reporte.',
        data: null,
      },
      { status: response.status }
    )
  } catch (error) {
    console.error('Deliveries by task route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error obteniendo reporte de entregas por tarea.' },
      { status: 500 }
    )
  }
}