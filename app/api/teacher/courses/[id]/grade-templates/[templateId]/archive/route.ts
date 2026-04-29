import { NextResponse } from 'next/server'
import { getSession, hasRole } from '@/lib/auth/session'

const BASE = process.env.BACKEND_API_URL

interface RouteContext {
  params: Promise<{ id: string; templateId: string }>
}

async function safeJson(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function PATCH(_: Request, context: RouteContext) {
  try {
    if (!BASE) {
      return NextResponse.json(
        { message: 'BACKEND_API_URL no está configurada.' },
        { status: 500 }
      )
    }

    const session = await getSession()

    if (!session?.token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (!hasRole(session, 'Profesor')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id, templateId } = await context.params
    const courseId = Number(id)
    const parsedTemplateId = Number(templateId)

    if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
      return NextResponse.json({ message: 'Curso inválido.' }, { status: 400 })
    }

    if (!parsedTemplateId || Number.isNaN(parsedTemplateId) || parsedTemplateId <= 0) {
      return NextResponse.json({ message: 'Plantilla inválida.' }, { status: 400 })
    }

    const response = await fetch(
      `${BASE}/api/v1/cursos/${courseId}/plantillas-calificaciones/${parsedTemplateId}/archive`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        cache: 'no-store',
      }
    )

    const result = await safeJson(response)
    return NextResponse.json(result, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Ocurrió un error al archivar la plantilla de calificación.' },
      { status: 500 }
    )
  }
}