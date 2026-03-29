'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { StudentForm } from '@/components/admin/students/student-form'
import { getStudentById, updateStudent } from '@/lib/admin/students/api'
import type { Alumno, CreateAlumnoDTO, UpdateAlumnoDTO } from '@/lib/admin/students/types'

export default function EditStudentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [student, setStudent] = useState<Alumno | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStudentById(Number(params.id))
        setStudent(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params.id])

  const handleSubmit = async (payload: CreateAlumnoDTO | UpdateAlumnoDTO) => {
    await updateStudent(Number(params.id), payload as UpdateAlumnoDTO)
    router.push('admin/dashboard/students')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="Edit student" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Editar alumno
            </h2>
            <p className="text-sm text-muted-foreground">
              Actualizá la información del alumno seleccionado.
            </p>
          </section>

          {loading ? (
            <div className="rounded-2xl border border-border/70 bg-card/95 p-8 shadow-sm">
              <div className="space-y-4">
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
              </div>
            </div>
          ) : student ? (
            <StudentForm mode="edit" initialData={student} onSubmit={handleSubmit} />
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/95 p-8 text-sm text-muted-foreground">
              No se pudo cargar el alumno.
            </div>
          )}
        </div>
      </div>
    </>
  )
}