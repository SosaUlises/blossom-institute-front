import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.NEXT_PUBLIC_API_URL

export async function GET() {
  const session = await getSession()

  const response = await fetch(`${BASE}/api/v1/me/profesor/dashboard`, {
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