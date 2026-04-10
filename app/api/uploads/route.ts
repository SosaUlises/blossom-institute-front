import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json({ message: 'No autenticado.' }, { status: 401 })
    }

    const formData = await request.formData()

    const response = await fetch(`${BASE}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      body: formData,
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Error subiendo archivo.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json({ message: 'No autenticado.' }, { status: 401 })
    }

    const body = await request.json()
    const { storageKey } = body ?? {}

    if (!storageKey || typeof storageKey !== 'string') {
      return NextResponse.json(
        { message: 'storageKey es requerido.' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BASE}/api/v1/uploads`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storageKey }),
    })

    const text = await response.text()

    if (!text) {
      return NextResponse.json(
        { success: response.ok, message: response.ok ? 'Archivo eliminado correctamente.' : 'No se pudo eliminar el archivo.' },
        { status: response.status }
      )
    }

    try {
      const result = JSON.parse(text)
      return NextResponse.json(result, { status: response.status })
    } catch {
      return NextResponse.json(
        {
          success: response.ok,
          message: response.ok
            ? 'Archivo eliminado correctamente.'
            : 'No se pudo eliminar el archivo.',
        },
        { status: response.status }
      )
    }
  } catch {
    return NextResponse.json(
      { message: 'Error eliminando archivo.' },
      { status: 500 }
    )
  }
}