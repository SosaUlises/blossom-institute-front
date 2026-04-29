import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, parsePositiveInt, requireApiSession } from '@/lib/auth/api-guards'

const BASE = process.env.BACKEND_API_URL

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
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }

    const res = await fetch(`${BASE}/api/v1/cursos/${idNumber}/profesores`, {
      headers: authHeaders(session),
      cache: 'no-store',
    })

    const data = await safeJson(res)

    return NextResponse.json(
      data ?? {
        success: res.ok,
        message: res.ok
          ? 'Profesores del curso obtenidos correctamente.'
          : 'No se pudieron obtener los profesores del curso.',
        data: null,
      },
      { status: res.status }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error obteniendo profesores del curso.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { id } = await context.params
    const idNumber = parsePositiveInt(id, 'idNumber')
    if (idNumber === null) {
      return NextResponse.json({ success: false, message: 'Curso inválido.' }, { status: 400 })
    }
    const body = await req.json()

    const res = await fetch(`${BASE}/api/v1/cursos/${idNumber}/assign/profesores`, {
      method: 'POST',
      headers: authHeaders(session, true),
      body: JSON.stringify(body),
    })

    const data = await safeJson(res)

    return NextResponse.json(
      data ?? {
        success: res.ok,
        message: res.ok
          ? 'Profesores asignados correctamente.'
          : 'No se pudieron asignar los profesores.',
        data: null,
      },
      { status: res.status }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error asignando profesores al curso.' },
      { status: 500 }
    )
  }
}
