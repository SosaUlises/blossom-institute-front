import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

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

    const { cursoId, alumnoId, year, term } = await context.params

    const url = `${BASE}/api/v1/reportes/cursos/${cursoId}/alumnos/${alumnoId}/years/${year}/terms/${term}/summary`

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