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

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const body = await request.json()

    const response = await fetch(`${BASE}/api/v1/settings/account/change-password`, {
      method: 'PATCH',
      headers: authHeaders(session, true),
      body: JSON.stringify(body),
    })

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok
          ? 'Contraseña actualizada correctamente.'
          : 'No se pudo actualizar la contraseña.',
        data: null,
      },
      { status: response.status }
    )
  } catch (error) {
    console.error('Settings change-password PATCH route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error actualizando contraseña.' },
      { status: 500 }
    )
  }
}
