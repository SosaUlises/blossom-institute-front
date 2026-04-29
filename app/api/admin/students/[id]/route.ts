import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, requireApiSession } from '@/lib/auth/api-guards'

const BACKEND_API_URL = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{ id: string }>
}

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { id } = await context.params
    const idNumber = parsePositiveInt(id, 'idNumber')
    if (idNumber === null) {
      return NextResponse.json({ success: false, message: 'Id inválido.' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_API_URL}/api/v1/alumnos/${idNumber}`, {
      method: 'GET',
      headers: authHeaders(session),
      cache: 'no-store',
    })

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok ? null : `Error del backend. Status: ${response.status}`,
      },
      { status: response.status }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo obtener el alumno.',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { id } = await context.params
    const idNumber = parsePositiveInt(id, 'idNumber')
    if (idNumber === null) {
      return NextResponse.json({ success: false, message: 'Id inválido.' }, { status: 400 })
    }
    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/api/v1/alumnos/${idNumber}`, {
      method: 'PUT',
      headers: authHeaders(session, true),
      body: JSON.stringify(body),
    })

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok ? null : `Error del backend. Status: ${response.status}`,
      },
      { status: response.status }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo actualizar el alumno.',
      },
      { status: 500 }
    )
  }
}
