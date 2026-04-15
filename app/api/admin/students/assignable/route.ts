import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BACKEND_API_URL = process.env.BACKEND_API_URL

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.toString()

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/v1/alumnos/assignable?${query}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )

    const backendResult = await safeJson(backendResponse)

    if (!backendResponse.ok) {
      console.error('Get assignable students backend error:', {
        status: backendResponse.status,
        body: backendResult,
      })

      return NextResponse.json(
        {
          success: false,
          message:
            backendResult?.message ||
            backendResult?.raw ||
            `Error obteniendo alumnos asignables. Status: ${backendResponse.status}`,
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(backendResult, { status: backendResponse.status })
  } catch (error) {
    console.error('Get assignable students route error:', error)

    return NextResponse.json(
      { success: false, message: 'No se pudieron obtener los alumnos asignables.' },
      { status: 500 }
    )
  }
}