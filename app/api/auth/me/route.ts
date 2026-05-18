import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: 'No autenticado.',
      },
      { status: 401 }
    )
  }

  try {
    const response = await fetch(`${BASE}/api/v1/settings/account`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      cache: 'no-store',
    })

    const result = await safeJson(response)
    const profile = result?.data

    return NextResponse.json({
      success: true,
      data: {
        ...session.user,
        ...(profile && typeof profile === 'object'
          ? {
              nombre:
                typeof profile.nombre === 'string'
                  ? profile.nombre
                  : session.user.nombre,
              apellido:
                typeof profile.apellido === 'string'
                  ? profile.apellido
                  : session.user.apellido,
              email:
                typeof profile.email === 'string'
                  ? profile.email
                  : session.user.email,
              avatarUrl:
                typeof profile.avatarUrl === 'string' && profile.avatarUrl.trim()
                  ? profile.avatarUrl
                  : null,
            }
          : {}),
      },
    })
  } catch {
    return NextResponse.json({
      success: true,
      data: session.user,
    })
  }
}
