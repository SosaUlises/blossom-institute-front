import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, requireApiSession } from '@/lib/auth/api-guards'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{
    cursoId: string
    year: string
    term: string
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
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { cursoId, year, term } = await context.params
    const cursoIdNumber = parsePositiveInt(cursoId, 'cursoIdNumber')
    const yearNumber = parsePositiveInt(year, 'yearNumber')
    const termNumber = parsePositiveInt(term, 'termNumber')

    const searchParams = request.nextUrl.searchParams
    const pageNumber = searchParams.get('pageNumber') ?? '1'
    const pageSize = searchParams.get('pageSize') ?? '10'
    const search = searchParams.get('search') ?? ''
    const pageNumberValue = parsePositiveInt(pageNumber, 'pageNumberValue')
    const pageSizeValue = parsePositiveInt(pageSize, 'pageSizeValue')

    if (cursoIdNumber === null) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    if (yearNumber === null) {
      return NextResponse.json({ success: false, message: 'Año inválido.' }, { status: 400 })
    }
    if (termNumber === null) {
      return NextResponse.json({ success: false, message: 'Term inválido.' }, { status: 400 })
    }
    if (pageNumberValue === null) {
      return NextResponse.json({ success: false, message: 'Página inválida.' }, { status: 400 })
    }
    if (pageSizeValue === null) {
      return NextResponse.json({ success: false, message: 'Page size inválido.' }, { status: 400 })
    }

    const url = new URL(
      `${BASE}/api/v1/reportes/cursos/${cursoIdNumber}/years/${yearNumber}/terms/${termNumber}/attendance`
    )

    url.searchParams.set('pageNumber', String(pageNumberValue))
    url.searchParams.set('pageSize', String(pageSizeValue))

    if (search.trim()) {
      url.searchParams.set('search', search.trim())
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: authHeaders(session),
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
    console.error('Attendance report route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error obteniendo reporte de attendance.' },
      { status: 500 }
    )
  }
}
