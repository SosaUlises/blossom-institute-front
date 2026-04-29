import { NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

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

export async function PUT(_: Request, context: RouteContext) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 })
    }
    if (!hasRole(session, 'Administrador')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await context.params
    const idNumber = Number(id)
    if (!Number.isFinite(idNumber) || idNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Id inválido.' }, { status: 400 })
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/api/v1/cursos/${idNumber}/archivar`, {
      method: 'PUT',
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
            `Error archivando curso. Status: ${backendResponse.status}`,
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(
      backendResult ?? { success: true, message: 'Curso archivado correctamente.', data: null },
      { status: backendResponse.status }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo archivar el curso.' },
      { status: 500 }
    )
  }
}
