import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

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

    const { id } = await context.params

    const response = await fetch(`${BACKEND_API_URL}/api/v1/alumnos/${id}`, {
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
      { success: false, message: 'No se pudo obtener el alumno.' },
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

    const { id } = await context.params
    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/api/v1/alumnos/${id}`, {
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
      { success: false, message: 'No se pudo actualizar el alumno.' },
      { status: 500 }
    )
  }
}