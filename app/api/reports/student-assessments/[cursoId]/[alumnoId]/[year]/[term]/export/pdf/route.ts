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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return new NextResponse('No autenticado.', { status: 401 })
    }

    const { cursoId, alumnoId, year, term } = await context.params
    const tipo = request.nextUrl.searchParams.get('tipo') ?? ''

    const url = new URL(
      `${BASE}/api/v1/reportes/cursos/${cursoId}/alumnos/${alumnoId}/years/${year}/terms/${term}/marks-detail/export/pdf`
    )

    if (tipo.trim()) {
      url.searchParams.set('tipo', tipo)
    }

    const response = await fetch(url.toString(), {
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
          'attachment; filename="student-assessments-detail.pdf"',
      },
    })
  } catch (error) {
    console.error('Student assessments detail export pdf route error:', error)
    return new NextResponse('Error exportando PDF.', { status: 500 })
  }
}