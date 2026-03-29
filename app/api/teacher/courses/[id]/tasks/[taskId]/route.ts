import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{
    id: string
    taskId: string
  }>
}

export async function GET(_request: NextRequest, context: Context) {
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

    const { id, taskId } = await context.params
    const courseId = Number(id)
    const parsedTaskId = Number(taskId)

    if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    if (!parsedTaskId || Number.isNaN(parsedTaskId) || parsedTaskId <= 0) {
      return NextResponse.json({ message: 'Tarea inválida.' }, { status: 400 })
    }

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/tareas/${parsedTaskId}`,
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al obtener la tarea.' },
      { status: 500 }
    )
  }
}