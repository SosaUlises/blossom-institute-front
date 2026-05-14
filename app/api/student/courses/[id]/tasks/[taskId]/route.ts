import { NextResponse } from 'next/server'

import {
  authHeaders,
  parsePositiveInt,
  proxyJson,
  requireApiSession,
} from '@/lib/auth/api-guards'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{ id: string; taskId: string }>
}

export async function GET(_req: Request, context: Context) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL is not configured' },
        { status: 500 }
      )
    }

    const auth = await requireApiSession('Alumno')
    if (auth.response) return auth.response

    const { id, taskId } = await context.params
    const courseId = parsePositiveInt(id, 'id')
    const tareaId = parsePositiveInt(taskId, 'taskId')

    if (!courseId || !tareaId) {
      return NextResponse.json({ message: 'Parametros invalidos.' }, { status: 400 })
    }

    const response = await fetch(
      `${BASE}/api/v1/me/alumno/cursos/${courseId}/tareas/${tareaId}`,
      {
        method: 'GET',
        headers: authHeaders(auth.session),
        cache: 'no-store',
      }
    )

    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, context: Context) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL is not configured' },
        { status: 500 }
      )
    }

    const auth = await requireApiSession('Alumno')
    if (auth.response) return auth.response

    const { id, taskId } = await context.params
    const courseId = parsePositiveInt(id, 'id')
    const tareaId = parsePositiveInt(taskId, 'taskId')

    if (!courseId || !tareaId) {
      return NextResponse.json({ message: 'Parametros invalidos.' }, { status: 400 })
    }

    const body = await req.json()
    const response = await fetch(`${BASE}/api/v1/tareas/${tareaId}/entrega`, {
      method: 'PUT',
      headers: authHeaders(auth.session, true),
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
