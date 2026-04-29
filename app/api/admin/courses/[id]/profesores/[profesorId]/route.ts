import { NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, requireApiSession } from '@/lib/auth/api-guards'

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
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { id, profesorId } = await context.params
    const idNumber = parsePositiveInt(id, 'idNumber')
    const profesorIdNumber = parsePositiveInt(profesorId, 'profesorIdNumber')
    if (idNumber === null) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    if (profesorIdNumber === null) {
      return NextResponse.json({ success: false, message: 'Profesor inválido.' }, { status: 400 })
    }

    const res = await fetch(`${BASE}/api/v1/cursos/${idNumber}/remove/profesores/${profesorIdNumber}`, {
      method: 'DELETE',
      headers: authHeaders(session),
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
