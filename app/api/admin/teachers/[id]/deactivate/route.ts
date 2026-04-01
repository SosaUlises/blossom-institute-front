import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

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
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1/profesores/${id}/desactivar`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    })

    const backendResult = await safeJson(backendResponse)

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            backendResult?.message ||
            backendResult?.raw ||
            `Error desactivando profesor. Status: ${backendResponse.status}`,
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(
      backendResult ?? {
        success: true,
        message: 'Profesor desactivado correctamente.',
        data: null,
      },
      { status: backendResponse.status }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo desactivar el profesor.' },
      { status: 500 }
    )
  }
}