import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, requireApiSession } from '@/lib/auth/api-guards'

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
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { cursoId, tareaId } = await context.params
    const cursoIdNumber = parsePositiveInt(cursoId, 'cursoIdNumber')
    const tareaIdNumber = parsePositiveInt(tareaId, 'tareaIdNumber')

    const searchParams = request.nextUrl.searchParams
    const pageNumber = searchParams.get('pageNumber') ?? '1'
    const pageSize = searchParams.get('pageSize') ?? '20'
    const search = searchParams.get('search') ?? ''
    const estado = searchParams.get('estado') ?? ''
    const pendienteCorreccion = searchParams.get('pendienteCorreccion') ?? ''
    const pageNumberValue = parsePositiveInt(pageNumber, 'pageNumberValue')
    const pageSizeValue = parsePositiveInt(pageSize, 'pageSizeValue')
    const estadoValue = estado.trim() ? parsePositiveInt(estado, 'estadoValue') : null

    if (cursoIdNumber === null) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    if (tareaIdNumber === null) {
      return NextResponse.json({ success: false, message: 'Tarea inválida.' }, { status: 400 })
    }
    if (pageNumberValue === null) {
      return NextResponse.json({ success: false, message: 'Página inválida.' }, { status: 400 })
    }
    if (pageSizeValue === null) {
      return NextResponse.json({ success: false, message: 'Page size inválido.' }, { status: 400 })
    }
    if (estado.trim() && (estadoValue === null)) {
      return NextResponse.json({ success: false, message: 'Estado inválido.' }, { status: 400 })
    }

    const url = new URL(
      `${BASE}/api/v1/reportes/cursos/${cursoIdNumber}/tareas/${tareaIdNumber}/entregas`
    )

    url.searchParams.set('pageNumber', String(pageNumberValue))
    url.searchParams.set('pageSize', String(pageSizeValue))

    if (search.trim()) {
      url.searchParams.set('search', search.trim())
    }

    if (estado.trim()) {
      url.searchParams.set('estado', String(estadoValue))
    }

    if (pendienteCorreccion.trim()) {
      url.searchParams.set('pendienteCorreccion', pendienteCorreccion)
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
    console.error('Deliveries by task route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error obteniendo reporte de entregas por tarea.' },
      { status: 500 }
    )
  }
}
