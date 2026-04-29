import { NextRequest, NextResponse } from 'next/server'
import { proxyJson } from '@/lib/auth/api-guards'
import { getSession, hasRole } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{
    id: string
    taskId: string
  }>
}

export async function GET(request: NextRequest, context: Context) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL no está configurada.' },
        { status: 500 }
      )
    }

    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (!hasRole(session, 'Profesor')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id, taskId } = await context.params
    const courseId = Number(id)
    const parsedTaskId = Number(taskId)

    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    if (!Number.isFinite(parsedTaskId) || parsedTaskId <= 0) {
      return NextResponse.json({ message: 'Tarea inválida.' }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = new URLSearchParams(searchParams)

    if (!query.get('pageNumber')) query.set('pageNumber', '1')
    if (!query.get('pageSize')) query.set('pageSize', '10')

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/tareas/${parsedTaskId}/entregas?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al obtener las entregas.' },
      { status: 500 }
    )
  }
}