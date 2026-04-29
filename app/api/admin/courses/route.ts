import { NextRequest, NextResponse } from 'next/server'
import { authHeaders, proxyJson, requireApiSession } from '@/lib/auth/api-guards'

const BACKEND_API_URL = process.env.BACKEND_API_URL

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const searchParams = request.nextUrl.searchParams
    const pageNumber = searchParams.get('pageNumber') ?? '1'
    const pageSize = searchParams.get('pageSize') ?? '10'
    const search = searchParams.get('search') ?? ''
    const anio = searchParams.get('anio') ?? ''
    const estado = searchParams.get('estado') ?? ''

    const backendUrl = new URL(`${BACKEND_API_URL}/api/v1/cursos`)
    backendUrl.searchParams.set('pageNumber', pageNumber)
    backendUrl.searchParams.set('pageSize', pageSize)

    if (search.trim()) backendUrl.searchParams.set('search', search.trim())
    if (anio.trim()) backendUrl.searchParams.set('anio', anio)
    if (estado.trim()) backendUrl.searchParams.set('estado', estado)

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: authHeaders(session),
      cache: 'no-store',
    })
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudieron obtener los cursos.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiSession('Administrador')
    if (auth.response) return auth.response
    const { session } = auth

    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/api/v1/cursos`, {
      method: 'POST',
      headers: authHeaders(session, true),
      body: JSON.stringify(body),
    })
    return proxyJson(response)
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo crear el curso.' },
      { status: 500 }
    )
  }
}
