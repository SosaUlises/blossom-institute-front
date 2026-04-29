import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, requireApiSession } from '@/lib/auth/api-guards'

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
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const { searchParams } = new URL(request.url)
    const query = searchParams.toString()

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/v1/alumnos/assignable?${query}`,
      {
        method: 'GET',
        headers: authHeaders(session),
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
