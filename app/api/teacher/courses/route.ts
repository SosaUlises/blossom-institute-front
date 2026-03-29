import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

export async function GET(req: Request) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)

    const query = new URLSearchParams(searchParams)

    const res = await fetch(
      `${BASE}/api/v1/me/profesor/cursos?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}