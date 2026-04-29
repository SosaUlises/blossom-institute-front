import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return new NextResponse('No autenticado.', { status: 401 })
    }
    if (!hasRole(session, 'Administrador')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { cursoId, alumnoId, year, term } = await context.params
    const cursoIdNumber = Number(cursoId)
    const alumnoIdNumber = Number(alumnoId)
    const yearNumber = Number(year)
    const termNumber = Number(term)
    if (!Number.isFinite(cursoIdNumber) || cursoIdNumber <= 0) {
      return new NextResponse('Curso inválido.', { status: 400 })
    }
    if (!Number.isFinite(alumnoIdNumber) || alumnoIdNumber <= 0) {
      return new NextResponse('Alumno inválido.', { status: 400 })
    }
    if (!Number.isFinite(yearNumber) || yearNumber <= 0) {
      return new NextResponse('Año inválido.', { status: 400 })
    }
    if (!Number.isFinite(termNumber) || termNumber <= 0) {
      return new NextResponse('Term inválido.', { status: 400 })
    }
    const tipo = request.nextUrl.searchParams.get('tipo') ?? ''
    const tipoValue = tipo.trim() ? Number(tipo) : null
    if (tipo.trim() && (!Number.isFinite(tipoValue) || tipoValue <= 0)) {
      return new NextResponse('Tipo inválido.', { status: 400 })
    }

    const url = new URL(
      `${BASE}/api/v1/reportes/cursos/${cursoIdNumber}/alumnos/${alumnoIdNumber}/years/${yearNumber}/terms/${termNumber}/marks-detail/export/pdf`
    )

    if (tipo.trim()) {
      url.searchParams.set('tipo', String(tipoValue))
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
