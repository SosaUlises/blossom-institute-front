import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { AUTH_COOKIE_NAME, verifyToken } from '@/lib/auth/session'

interface BackendLoginResponse {
  message: string
  success: boolean
  statusCode: number
  data?: {
    token: string
    usuario: {
      id: number
      email: string
      nombre: string
      apellido: string
      roles: string[]
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${process.env.BACKEND_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const result: BackendLoginResponse = await response.json()

    if (!response.ok || !result.success || !result.data?.token) {
      return NextResponse.json(
        {
          message: result?.message ?? 'No se pudo iniciar sesión.',
          success: false,
          statusCode: result?.statusCode ?? response.status,
        },
        { status: result?.statusCode ?? response.status }
      )
    }

    const session = await verifyToken(result.data.token)

    if (!session) {
      return NextResponse.json(
        {
          message: 'El token recibido no es válido.',
          success: false,
          statusCode: 500,
        },
        { status: 500 }
      )
    }

    if (!session.user.roles.includes('Administrador')) {
      return NextResponse.json(
        {
          message: 'No tenés permisos para acceder al panel administrativo.',
          success: false,
          statusCode: 403,
        },
        { status: 403 }
      )
    }

    const cookieStore = await cookies()

    cookieStore.set(AUTH_COOKIE_NAME, result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json({
      message: result.message,
      success: true,
      statusCode: 200,
      data: {
        usuario: result.data.usuario,
      },
    })
  } catch {
    return NextResponse.json(
      {
        message: 'Ocurrió un error al iniciar sesión.',
        success: false,
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}