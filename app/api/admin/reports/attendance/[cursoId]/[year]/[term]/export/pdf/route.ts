import { NextRequest, NextResponse } from 'next/server'
import { proxyFile } from '@/lib/auth/api-guards'
import { getSession, hasRole } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{
    cursoId: string
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

    const { cursoId, year, term } = await context.params
    const cursoIdNumber = Number(cursoId)
    const yearNumber = Number(year)
    const termNumber = Number(term)
    if (!Number.isFinite(cursoIdNumber) || cursoIdNumber <= 0) {
      return new NextResponse('Curso invÃ¡lido.', { status: 400 })
    }
    if (!Number.isFinite(yearNumber) || yearNumber <= 0) {
      return new NextResponse('AÃ±o invÃ¡lido.', { status: 400 })
    }
    if (!Number.isFinite(termNumber) || termNumber <= 0) {
      return new NextResponse('Term invÃ¡lido.', { status: 400 })
    }
    const search = request.nextUrl.searchParams.get('search') ?? ''

    const url = new URL(
      `${BASE}/api/v1/reportes/cursos/${cursoIdNumber}/years/${yearNumber}/terms/${termNumber}/attendance/export/pdf`
    )

    if (search.trim()) {
      url.searchParams.set('search', search.trim())
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
      `attendance-curso-${cursoIdNumber}-${yearNumber}-t${termNumber}.pdf`
    )
  } catch (error) {
    console.error('Attendance export pdf route error:', error)
    return new NextResponse('Error exportando PDF.', { status: 500 })
  }
}
