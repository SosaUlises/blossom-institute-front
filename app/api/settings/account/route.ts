import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const response = await fetch(`${BASE}/api/v1/settings/account`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    })

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok
          ? 'Cuenta obtenida correctamente.'
          : 'No se pudo obtener la cuenta.',
        data: null,
      },
      { status: response.status }
    )
  } catch (error) {
    console.error('Settings account GET route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error obteniendo datos de cuenta.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await fetch(`${BASE}/api/v1/settings/account`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok
          ? 'Cuenta actualizada correctamente.'
          : 'No se pudo actualizar la cuenta.',
        data: null,
      },
      { status: response.status }
    )
  } catch (error) {
    console.error('Settings account PUT route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error actualizando datos de cuenta.' },
      { status: 500 }
    )
  }
}