import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{
    id: string
    taskId: string
  }>
}

export async function PATCH(_request: NextRequest, context: Context) {
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

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/tareas/${parsedTaskId}/archivar`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      }
    )

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al archivar la tarea.' },
      { status: 500 }
    )
  }
}