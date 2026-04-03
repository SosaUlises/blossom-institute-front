import { NextRequest, NextResponse } from 'next/server'
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

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok ? null : `Error del backend. Status: ${response.status}`,
      },
      { status: response.status }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo obtener el alumno.',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

    const result = await safeJson(response)

    return NextResponse.json(
      result ?? {
        success: response.ok,
        message: response.ok ? null : `Error del backend. Status: ${response.status}`,
      },
      { status: response.status }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo actualizar el alumno.',
      },
      { status: 500 }
    )
  }
}