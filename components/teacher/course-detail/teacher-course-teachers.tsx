'use client'

import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'

type Teacher = {
  profesorId: number
  nombre: string
  apellido: string
  dni: number
  email?: string | null
}

type Envelope<T> = {
  message?: string
  data?: {
    items?: T[]
  }
}

export function TeacherCourseTeachers({ courseId }: { courseId: number }) {
  const [data, setData] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/teachers`, {
          cache: 'no-store',
        })

        const result = (await response.json()) as Envelope<Teacher>

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener los profesores.')
        }

        setData(result.data?.items ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  if (loading) return <p className="text-sm text-muted-foreground">Cargando profesores...</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>

  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        <GraduationCap className="mx-auto mb-2 size-5" />
        Sin profesores asignados.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((p) => (
        <div
          key={p.profesorId}
          className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4"
        >
          <div>
            <p className="font-medium text-foreground">
              {p.nombre} {p.apellido}
            </p>
            <p className="text-xs text-muted-foreground">{p.email ?? '-'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}