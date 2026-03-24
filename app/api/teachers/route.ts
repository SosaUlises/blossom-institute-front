import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BACKEND_API_URL = process.env.BACKEND_API_URL

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const pageNumber = searchParams.get('pageNumber') ?? '1'
    const pageSize = searchParams.get('pageSize') ?? '10'
    const search = searchParams.get('search') ?? ''

    const backendUrl = new URL(`${BACKEND_API_URL}/api/v1/profesores`)
    backendUrl.searchParams.set('pageNumber', pageNumber)
    backendUrl.searchParams.set('pageSize', pageSize)

    if (search.trim()) {
      backendUrl.searchParams.set('search', search.trim())
    }

    const response = await fetch(backendUrl.toString(), {
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
      { success: false, message: 'No se pudieron obtener los profesores.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/api/v1/profesores`, {
      method: 'POST',
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
      { success: false, message: 'No se pudo crear el profesor.' },
      { status: 500 }
    )
  }
}