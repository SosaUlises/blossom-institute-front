import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, proxyJson, requireApiSession } from '@/lib/auth/api-guards'

const BACKEND_API_URL = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{ id: string }>
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

    const response = await fetch(`${BACKEND_API_URL}/api/v1/profesores/${idNumber}`, {
      method: 'GET',
      headers: authHeaders(session),
      cache: 'no-store',
    })
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo obtener el profesor.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, context: RouteContext) {
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

    const response = await fetch(`${BACKEND_API_URL}/api/v1/profesores/${idNumber}`, {
      method: 'PUT',
      headers: authHeaders(session, true),
      body: JSON.stringify(body),
    })
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo actualizar el profesor.' },
      { status: 500 }
    )
  }
}
