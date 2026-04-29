import { NextRequest, NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

const BACKEND_API_URL = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{ id: string }>
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
    if (!hasRole(session, 'Administrador')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await context.params
    const idNumber = Number(id)
    if (!Number.isFinite(idNumber) || idNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Id inválido.' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_API_URL}/api/v1/profesores/${idNumber}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    })

    const result = await response.json()

    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo obtener el profesor.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, context: RouteContext) {
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

    const { id } = await context.params
    const idNumber = Number(id)
    if (!Number.isFinite(idNumber) || idNumber <= 0) {
      return NextResponse.json({ success: false, message: 'Id inválido.' }, { status: 400 })
    }
    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/api/v1/profesores/${idNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo actualizar el profesor.' },
      { status: 500 }
    )
  }
}
