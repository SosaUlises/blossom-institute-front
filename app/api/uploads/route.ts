import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json({ message: 'No autenticado.' }, { status: 401 })
    }

    const formData = await request.formData()

    const response = await fetch(`${BASE}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      body: formData,
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Error subiendo archivo.' },
      { status: 500 }
    )
  }
}