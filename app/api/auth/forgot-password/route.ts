import { NextResponse } from 'next/server'

interface BackendAuthResponse {
  message?: string
  success?: boolean
  statusCode?: number
  data?: unknown
}

export async function POST(request: Request) {
  if (!process.env.BACKEND_API_URL) {
    return NextResponse.json(
      {
        message: 'BACKEND_API_URL no está configurada.',
        success: false,
        statusCode: 500,
      },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/v1/auth/forgot-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    )

    const result: BackendAuthResponse = await response.json()

    return NextResponse.json(result, {
      status: result.statusCode ?? response.status,
    })
  } catch {
    return NextResponse.json(
      {
        message: 'No se pudo procesar la solicitud.',
        success: false,
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
