import { NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

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

    const { cursoId, alumnoId, year, term } = await context.params
    const cursoIdNumber = Number(cursoId)
    const alumnoIdNumber = Number(alumnoId)
    const yearNumber = Number(year)
    const termNumber = Number(term)

    if (!Number.isFinite(cursoIdNumber) || cursoIdNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(alumnoIdNumber) || alumnoIdNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Alumno inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(yearNumber) || yearNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Año inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(termNumber) || termNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Term inválido.' }, { status: 400 })
    }

    const url = `${BASE}/api/v1/reportes/cursos/${cursoIdNumber}/alumnos/${alumnoIdNumber}/years/${yearNumber}/terms/${termNumber}/summary`

    const response = await fetch(url, {
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
    console.error('Student summary route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error obteniendo student summary.' },
      { status: 500 }
    )
  }
}
