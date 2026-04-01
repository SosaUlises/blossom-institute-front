import 'server-only'

import { cookies } from 'next/headers'
import { jwtVerify, type JWTPayload } from 'jose'

export const AUTH_COOKIE_NAME = 'blossom_auth'

export interface SessionUser {
  id: string
  email: string
  nombre: string
  apellido: string
  roles: string[]
}

export interface SessionData {
  token: string
  user: SessionUser
  payload: JWTPayload
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en el frontend.')
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

export function hasRole(session: SessionData | null, role: string) {
  if (!session) return false
  return session.user.roles.includes(role)
}

export function hasAnyRole(session: SessionData | null, roles: string[]) {
  if (!session) return false
  return roles.some((role) => session.user.roles.includes(role))
}

export async function verifyToken(token: string): Promise<SessionData | null> {
  try {
    const secret = getJwtSecret()

    const { payload } = await jwtVerify(token, secret, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      clockTolerance: 10,
    })

    const user: SessionUser = {
      id: String(payload.sub ?? payload.nameid ?? ''),
      email: String(payload.email ?? ''),
      nombre: String(payload.given_name ?? ''),
      apellido: String(payload.family_name ?? ''),
      roles: normalizeRoles(payload.role),
    }

    return {
      token,
      user,
      payload,
    }
  } catch (error) {
    console.error('JWT verify error:', error)
    return null
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) return null

  return verifyToken(token)
}

export async function isAdminSession() {
  const session = await getSession()
  return hasRole(session, 'Administrador')
}

export async function isTeacherSession() {
  const session = await getSession()
  return hasRole(session, 'Profesor')
}

export async function isStudentSession() {
  const session = await getSession()
  return hasRole(session, 'Alumno')
}

export async function getDefaultRouteBySession() {
  const session = await getSession()

  if (!session) return '/login'

  if (session.user.roles.includes('Administrador')) return '/admin/dashboard'
  if (session.user.roles.includes('Profesor')) return '/teacher/dashboard'
  if (session.user.roles.includes('Alumno')) return '/student/dashboard'

  return '/login'
}