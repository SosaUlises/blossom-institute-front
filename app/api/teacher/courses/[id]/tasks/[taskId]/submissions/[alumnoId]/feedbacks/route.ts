import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{
    id: string
    taskId: string
    alumnoId: string
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

    const { id, taskId, alumnoId } = await context.params
    const courseId = Number(id)
    const parsedTaskId = Number(taskId)
    const parsedAlumnoId = Number(alumnoId)

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/tareas/${parsedTaskId}/entregas/${parsedAlumnoId}/feedbacks`,
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
      { message: 'Ocurrió un error al obtener los feedbacks.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: Context) {
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

    const { id, taskId, alumnoId } = await context.params
    const courseId = Number(id)
    const parsedTaskId = Number(taskId)
    const parsedAlumnoId = Number(alumnoId)

    const body = await request.json()

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/tareas/${parsedTaskId}/entregas/${parsedAlumnoId}/feedbacks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al crear el feedback.' },
      { status: 500 }
    )
  }
}