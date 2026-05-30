import { NextRequest, NextResponse } from 'next/server'
import {
  authHeaders,
  parsePositiveInt,
  proxyJson,
  requireApiSession,
} from '@/lib/auth/api-guards'

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

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/admin/students/${idNumber}/academic-summary`,
      {
        method: 'GET',
        headers: authHeaders(session),
        cache: 'no-store',
      },
    )

    return proxyJson(response)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo obtener el perfil académico del alumno.',
      },
      { status: 500 },
    )
  }
}
