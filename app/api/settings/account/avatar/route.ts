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

async function requireSession() {
  const session = await getSession()

  if (!session?.token) {
    return {
      response: NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 },
      ),
    }
  }

  return { session }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireSession()
    if (auth.response) return auth.response

    const formData = await request.formData()
    const response = await fetch(`${BASE}/api/v1/settings/account/avatar`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${auth.session.token}`,
      },
      body: formData,
    })

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok
          ? 'Foto de perfil actualizada.'
          : 'No se pudo actualizar la foto de perfil.',
        data: null,
      },
      { status: response.status },
    )
  } catch (error) {
    console.error('Settings avatar PUT route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error actualizando foto de perfil.' },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    const auth = await requireSession()
    if (auth.response) return auth.response

    const response = await fetch(`${BASE}/api/v1/settings/account/avatar`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.session.token}`,
      },
    })

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok
          ? 'Foto de perfil eliminada.'
          : 'No se pudo eliminar la foto de perfil.',
        data: null,
      },
      { status: response.status },
    )
  } catch (error) {
    console.error('Settings avatar DELETE route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error eliminando foto de perfil.' },
      { status: 500 },
    )
  }
}
