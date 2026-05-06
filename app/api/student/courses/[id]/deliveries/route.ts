import { NextResponse } from 'next/server'

import {
  authHeaders,
  parsePositiveInt,
  proxyJson,
  requireApiSession,
} from '@/lib/auth/api-guards'

const BASE = process.env.BACKEND_API_URL

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: Context) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL is not configured' },
        { status: 500 }
      )
    }

    const auth = await requireApiSession('Alumno')
    if (auth.response) return auth.response

    const { id } = await context.params
    const courseId = parsePositiveInt(id, 'id')

    if (!courseId) {
      return NextResponse.json({ message: 'Curso invalido.' }, { status: 400 })
    }

    const query = new URLSearchParams(new URL(req.url).searchParams)
    const response = await fetch(
      `${BASE}/api/v1/me/alumno/cursos/${courseId}/entregas?${query.toString()}`,
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
