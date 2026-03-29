import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  const session = await getSession()
  const { searchParams } = new URL(request.url)

  const query = new URLSearchParams(searchParams)

  const response = await fetch(`${BASE}/api/v1/me/profesor/cursos?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session?.token}`,
    },
    cache: 'no-store',
  })

  const text = await response.text()
  const json = text ? JSON.parse(text) : null

  return NextResponse.json(json, { status: response.status })
}