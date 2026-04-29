import { NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{ id: string; profesorId: string }>
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
    if (!hasRole(session, 'Administrador')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { id, profesorId } = await context.params
    const idNumber = Number(id)
    const profesorIdNumber = Number(profesorId)
    if (!Number.isFinite(idNumber) || idNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    if (!Number.isFinite(profesorIdNumber) || profesorIdNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Profesor inválido.' }, { status: 400 })
    }

    const res = await fetch(`${BASE}/api/v1/cursos/${idNumber}/remove/profesores/${profesorIdNumber}`, {
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
          ? 'Profesor removido correctamente.'
          : 'No se pudo remover el profesor.',
        data: null,
      },
      { status: res.status }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error removiendo profesor del curso.' },
      { status: 500 }
    )
  }
}
