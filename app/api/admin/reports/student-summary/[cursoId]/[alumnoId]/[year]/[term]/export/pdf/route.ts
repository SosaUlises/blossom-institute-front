import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return new NextResponse('No autenticado.', { status: 401 })
    }

    const { cursoId, alumnoId, year, term } = await context.params

    const url = `${BASE}/api/v1/reportes/cursos/${cursoId}/alumnos/${alumnoId}/years/${year}/terms/${term}/summary/export/pdf`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    })

    const blob = await response.arrayBuffer()

    return new NextResponse(blob, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/pdf',
        'Content-Disposition':
          response.headers.get('Content-Disposition') ||
          'attachment; filename="student-summary.pdf"',
      },
    })
  } catch (error) {
    console.error('Student summary export pdf route error:', error)
    return new NextResponse('Error exportando PDF.', { status: 500 })
  }
}