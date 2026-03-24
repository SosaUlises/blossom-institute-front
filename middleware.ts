import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const AUTH_COOKIE_NAME = 'blossom_auth'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET no está configurado.')
  }

  return new TextEncoder().encode(secret)
}

function normalizeRoles(roleClaim: unknown): string[] {
  if (Array.isArray(roleClaim)) {
    return roleClaim.filter((r): r is string => typeof r === 'string')
  }

  if (typeof roleClaim === 'string') {
    return [roleClaim]
  }

  return []
}

async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      clockTolerance: 10,
    })

    return {
      token,
      roles: normalizeRoles(payload.role),
    }
  } catch {
    return null
  }
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  const session = await getSessionFromRequest(request)

  if (isDashboardRoute) {
    if (!session) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      clearAuthCookie(response)
      return response
    }

    if (!session.roles.includes('Administrador')) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      clearAuthCookie(response)
      return response
    }

    return NextResponse.next()
  }

  if (isAuthPage && session?.roles.includes('Administrador')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/forgot-password', '/reset-password'],
}