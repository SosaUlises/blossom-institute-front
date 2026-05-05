import { NextResponse } from 'next/server'

import {
  authHeaders,
  proxyJson,
  requireApiSession,
} from '@/lib/auth/api-guards'

const BASE = process.env.BACKEND_API_URL

export async function GET(req: Request) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL is not configured' },
        { status: 500 }
      )
    }

    const auth = await requireApiSession('Alumno')
    if (auth.response) return auth.response

    const { searchParams } = new URL(req.url)
    const query = new URLSearchParams(searchParams)

    const response = await fetch(
      `${BASE}/api/v1/me/alumno/cursos?${query.toString()}`,
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
