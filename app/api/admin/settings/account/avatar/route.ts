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

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const formData = await request.formData()

    const response = await fetch(`${BASE}/api/v1/settings/account/avatar`, {
      method: 'PUT',
      headers: authHeaders(session),
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
    console.error('Admin settings avatar PUT route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error actualizando foto de perfil.' },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const response = await fetch(`${BASE}/api/v1/settings/account/avatar`, {
      method: 'DELETE',
      headers: authHeaders(session),
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
    console.error('Admin settings avatar DELETE route error:', error)

    return NextResponse.json(
      { success: false, message: 'Error eliminando foto de perfil.' },
      { status: 500 },
    )
  }
}
