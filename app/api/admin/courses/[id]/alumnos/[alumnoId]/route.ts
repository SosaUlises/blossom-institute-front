import { NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, requireApiSession } from '@/lib/auth/api-guards'

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
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { id, alumnoId } = await context.params
    const idNumber = parsePositiveInt(id, 'idNumber')
    const alumnoIdNumber = parsePositiveInt(alumnoId, 'alumnoIdNumber')
    if (idNumber === null) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    if (alumnoIdNumber === null) {
      return NextResponse.json({ success: false, message: 'Alumno inválido.' }, { status: 400 })
    }

    const res = await fetch(`${BASE}/api/v1/cursos/${idNumber}/remove/alumnos/${alumnoIdNumber}`, {
      method: 'DELETE',
      headers: authHeaders(session),
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
