import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{ id: string; alumnoId: string }>
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

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const { id, alumnoId } = await context.params

    const res = await fetch(`${BASE}/api/v1/cursos/${id}/remove/alumnos/${alumnoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    })

    const data = await safeJson(res)

    return NextResponse.json(
      data ?? {
        success: res.ok,
        message: res.ok
          ? 'Alumno removido correctamente.'
          : 'No se pudo remover el alumno.',
        data: null,
      },
      { status: res.status }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error removiendo alumno del curso.' },
      { status: 500 }
    )
  }
}