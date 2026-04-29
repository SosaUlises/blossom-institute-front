import { NextResponse } from 'next/server'
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

export async function PATCH(_: Request, context: RouteContext) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { id } = await context.params
    const idNumber = parsePositiveInt(id, 'idNumber')
    if (idNumber === null) {
      return NextResponse.json({ success: false, message: 'Id inválido.' }, { status: 400 })
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1/alumnos/${idNumber}/activar`, {
      method: 'PATCH',
      headers: authHeaders(session),
      cache: 'no-store',
    })

    const backendResult = await safeJson(backendResponse)

    if (!backendResponse.ok) {
      console.error('Activate student backend error:', {
        status: backendResponse.status,
        body: backendResult,
      })

      return NextResponse.json(
        {
          success: false,
          message:
            backendResult?.message ||
            backendResult?.raw ||
            `Error activando alumno. Status: ${backendResponse.status}`,
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(
      backendResult ?? {
        success: true,
        message: 'Alumno activado correctamente.',
        data: null,
      },
      { status: backendResponse.status }
    )
  } catch (error) {
    console.error('Activate student route error:', error)

    return NextResponse.json(
      { success: false, message: 'No se pudo activar el alumno.' },
      { status: 500 }
    )
  }
}
