import { NextResponse } from 'next/server'
import { getSession, hasRole, type SessionData } from '@/lib/auth/session'

type ApiSessionResult =
  | { session: SessionData; response?: never }
  | { session?: never; response: NextResponse }

export async function requireApiSession(role: string): Promise<ApiSessionResult> {
  const session = await getSession()

  if (!session?.token) {
    return {
      response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    }
  }

  if (!hasRole(session, role)) {
    return {
      response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }),
    }
  }

  return { session }
}

export function authHeaders(session: SessionData, json = false) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.token}`,
  }

  if (json) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

export function parsePositiveInt(value: unknown, _label: string) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export async function proxyJson(response: Response) {
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  return NextResponse.json(data, { status: response.status })
}

export async function proxyFile(
  response: Response,
  fallbackContentType: string,
  fallbackFilename: string
) {
  const body = await response.arrayBuffer()

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || fallbackContentType,
      'Content-Disposition':
        response.headers.get('Content-Disposition') ||
        `attachment; filename="${fallbackFilename}"`,
    },
  })
}
