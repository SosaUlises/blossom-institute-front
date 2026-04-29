import { NextRequest, NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{
    cursoId: string
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
    if (!hasRole(session, 'Administrador')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { cursoId } = await context.params
    const cursoIdNumber = Number(cursoId)

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from') ?? ''
    const to = searchParams.get('to') ?? ''
    const pageNumber = searchParams.get('pageNumber') ?? '1'
    const pageSize = searchParams.get('pageSize') ?? '10'
    const search = searchParams.get('search') ?? ''
    const pageNumberValue = Number(pageNumber)
    const pageSizeValue = Number(pageSize)

    if (!Number.isFinite(cursoIdNumber) || cursoIdNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(pageNumberValue) || pageNumberValue <= 0) {
      return NextResponse.json({ success: false, message: 'Página inválida.' }, { status: 400 })
    }
    if (!Number.isFinite(pageSizeValue) || pageSizeValue <= 0) {
      return NextResponse.json({ success: false, message: 'Page size inválido.' }, { status: 400 })
    }

    const url = new URL(`${BASE}/api/v1/reportes/cursos/${cursoIdNumber}/asistencias`)

    url.searchParams.set('from', from)
    url.searchParams.set('to', to)
    url.searchParams.set('pageNumber', String(pageNumberValue))
    url.searchParams.set('pageSize', String(pageSizeValue))

    if (search.trim()) {
      url.searchParams.set('search', search.trim())
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
    console.error('Attendance range route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error obteniendo reporte de asistencia por rango.' },
      { status: 500 }
    )
  }
}
