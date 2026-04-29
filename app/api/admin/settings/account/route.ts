import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, requireApiSession } from '@/lib/auth/api-guards'

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
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const response = await fetch(`${BASE}/api/v1/settings/account`, {
      method: 'GET',
      headers: authHeaders(session),
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
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const body = await request.json()

    const response = await fetch(`${BASE}/api/v1/settings/account`, {
      method: 'PUT',
      headers: authHeaders(session, true),
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
