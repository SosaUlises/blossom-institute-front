import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

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
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const res = await fetch(`${BASE}/api/v1/cursos/${id}/alumnos`, {
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
          ? 'Alumnos del curso obtenidos correctamente.'
          : 'No se pudieron obtener los alumnos del curso.',
        data: null,
      },
      { status: res.status }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error obteniendo alumnos del curso.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const body = await req.json()

    const res = await fetch(`${BASE}/api/v1/cursos/${id}/assign/alumnos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await safeJson(res)

    return NextResponse.json(
      data ?? {
        success: res.ok,
        message: res.ok
          ? 'Alumnos asignados correctamente.'
          : 'No se pudieron asignar los alumnos.',
        data: null,
      },
      { status: res.status }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error asignando alumnos al curso.' },
      { status: 500 }
    )
  }
}