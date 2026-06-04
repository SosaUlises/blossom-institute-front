import { NextRequest, NextResponse } from 'next/server'
import { proxyFile } from '@/lib/auth/api-guards'
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
      return new NextResponse('Curso invÃ¡lido.', { status: 400 })
    }
    if (!Number.isFinite(alumnoIdNumber) || alumnoIdNumber <= 0) {
      return new NextResponse('Alumno invÃ¡lido.', { status: 400 })
    }
    if (!Number.isFinite(yearNumber) || yearNumber <= 0) {
      return new NextResponse('AÃ±o invÃ¡lido.', { status: 400 })
    }
    if (!Number.isFinite(termNumber) || termNumber <= 0) {
      return new NextResponse('Term invÃ¡lido.', { status: 400 })
    }
    const tipo = request.nextUrl.searchParams.get('tipo')?.trim() ?? ''
    const tipoValue = tipo ? Number(tipo) : null
    if (tipo && (tipoValue === null || !Number.isFinite(tipoValue) || tipoValue <= 0)) {
      return new NextResponse('Tipo invÃ¡lido.', { status: 400 })
    }

    const url = new URL(
      `${BASE}/api/v1/reportes/cursos/${cursoIdNumber}/alumnos/${alumnoIdNumber}/years/${yearNumber}/terms/${termNumber}/marks-detail/export/pdf`
    )

    if (tipo && tipoValue !== null) {
      url.searchParams.set('tipo', String(tipoValue))
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    })

    return proxyFile(
      response,
      'application/pdf',
      `student-assessments-curso-${cursoIdNumber}-alumno-${alumnoIdNumber}-${yearNumber}-t${termNumber}.pdf`
    )
  } catch (error) {
    console.error('Student assessments detail export pdf route error:', error)
    return new NextResponse('Error exportando PDF.', { status: 500 })
  }
}
