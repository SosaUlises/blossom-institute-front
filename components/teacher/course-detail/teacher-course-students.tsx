'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

type Student = {
  alumnoId: number
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

export function TeacherCourseStudents({ courseId }: { courseId: number }) {
  const [data, setData] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/teacher/courses/${courseId}/students`, {
          cache: 'no-store',
        })

        const result = (await response.json()) as Envelope<Student>

        if (!response.ok) {
          throw new Error(result.message || 'No se pudieron obtener los alumnos.')
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

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando alumnos...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <Users className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No hay alumnos en este curso.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Alumno</th>
            <th className="px-4 py-3">DNI</th>
            <th className="px-4 py-3">Email</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr key={s.alumnoId} className="border-t border-border/60">
              <td className="px-4 py-3 font-medium">
                {s.nombre} {s.apellido}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{s.dni}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.email ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}