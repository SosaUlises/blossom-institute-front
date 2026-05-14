import { NextRequest, NextResponse } from 'next/server'

import { authHeaders, proxyJson, requireApiSession } from '@/lib/auth/api-guards'

const BASE = process.env.BACKEND_API_URL

export async function POST(request: NextRequest) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL is not configured' },
        { status: 500 }
      )
    }

    const auth = await requireApiSession('Alumno')
    if (auth.response) return auth.response

    const formData = await request.formData()
    const response = await fetch(`${BASE}/api/v1/uploads`, {
      method: 'POST',
      headers: authHeaders(auth.session),
      body: formData,
      cache: 'no-store',
    })

    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Error subiendo archivo.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL is not configured' },
        { status: 500 }
      )
    }

    const auth = await requireApiSession('Alumno')
    if (auth.response) return auth.response

    const body = await request.json()
    const storageKey = body?.storageKey

    if (!storageKey || typeof storageKey !== 'string') {
      return NextResponse.json(
        { message: 'storageKey es requerido.' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BASE}/api/v1/uploads`, {
      method: 'DELETE',
      headers: authHeaders(auth.session, true),
      body: JSON.stringify({ storageKey }),
      cache: 'no-store',
    })

    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { message: 'Error eliminando archivo.' },
      { status: 500 }
    )
  }
}
