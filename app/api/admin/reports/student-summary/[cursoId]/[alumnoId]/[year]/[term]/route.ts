import { NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, requireApiSession } from '@/lib/auth/api-guards'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{
    cursoId: string
    alumnoId: string
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

export async function GET(_: Request, context: RouteContext) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { cursoId, alumnoId, year, term } = await context.params
    const cursoIdNumber = parsePositiveInt(cursoId, 'cursoIdNumber')
    const alumnoIdNumber = parsePositiveInt(alumnoId, 'alumnoIdNumber')
    const yearNumber = parsePositiveInt(year, 'yearNumber')
    const termNumber = parsePositiveInt(term, 'termNumber')

    if (cursoIdNumber === null) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    if (alumnoIdNumber === null) {
      return NextResponse.json({ success: false, message: 'Alumno inválido.' }, { status: 400 })
    }
    if (yearNumber === null) {
      return NextResponse.json({ success: false, message: 'Año inválido.' }, { status: 400 })
    }
    if (termNumber === null) {
      return NextResponse.json({ success: false, message: 'Term inválido.' }, { status: 400 })
    }

    const url = `${BASE}/api/v1/reportes/cursos/${cursoIdNumber}/alumnos/${alumnoIdNumber}/years/${yearNumber}/terms/${termNumber}/summary`

    const response = await fetch(url, {
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
    console.error('Student summary route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error obteniendo student summary.' },
      { status: 500 }
    )
  }
}
