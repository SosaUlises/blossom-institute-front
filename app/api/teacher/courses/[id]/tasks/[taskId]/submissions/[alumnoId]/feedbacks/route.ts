import { NextRequest, NextResponse } from 'next/server'
import { proxyJson } from '@/lib/auth/api-guards'
import { getSession, hasRole } from '@/lib/auth/session'

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
    if (!hasRole(session, 'Profesor')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id, taskId, alumnoId } = await context.params
    const courseId = Number(id)
    const parsedTaskId = Number(taskId)
    const parsedAlumnoId = Number(alumnoId)

    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso invalido.' }, { status: 400 })
    }

    if (!Number.isFinite(parsedTaskId) || parsedTaskId <= 0) {
      return NextResponse.json({ message: 'Tarea invalida.' }, { status: 400 })
    }

    if (!Number.isFinite(parsedAlumnoId) || parsedAlumnoId <= 0) {
      return NextResponse.json({ message: 'Alumno invalido.' }, { status: 400 })
    }

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/tareas/${parsedTaskId}/entregas/${parsedAlumnoId}/feedbacks`,
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
    if (!hasRole(session, 'Profesor')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id, taskId, alumnoId } = await context.params
    const courseId = Number(id)
    const parsedTaskId = Number(taskId)
    const parsedAlumnoId = Number(alumnoId)

    if (!Number.isFinite(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso invalido.' }, { status: 400 })
    }

    if (!Number.isFinite(parsedTaskId) || parsedTaskId <= 0) {
      return NextResponse.json({ message: 'Tarea invalida.' }, { status: 400 })
    }

    if (!Number.isFinite(parsedAlumnoId) || parsedAlumnoId <= 0) {
      return NextResponse.json({ message: 'Alumno invalido.' }, { status: 400 })
    }

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
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al crear el feedback.' },
      { status: 500 }
    )
  }
}
