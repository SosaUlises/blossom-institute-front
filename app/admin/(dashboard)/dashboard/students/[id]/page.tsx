'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Eye, PencilLine, Inbox } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { StudentForm } from '@/components/admin/students/student-form'
import { getStudentById, updateStudent } from '@/lib/admin/students/api'
import type {
  Alumno,
  CreateAlumnoDTO,
  UpdateAlumnoDTO,
} from '@/lib/admin/students/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function EditStudentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const studentId = useMemo(() => Number(params.id), [params.id])

  const [student, setStudent] = useState<Alumno | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError(null)

      try {
        const data = await getStudentById(studentId)
        setStudent(data)
      } catch (err: any) {
        setLoadError(err?.message || 'No se pudo cargar el alumno.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [studentId])

  const handleSubmit = async (payload: CreateAlumnoDTO | UpdateAlumnoDTO) => {
    await updateStudent(studentId, payload as UpdateAlumnoDTO)
    router.push(`/admin/dashboard/students/${studentId}/profile`)
    router.refresh()
  }

  return (
    <>
      <AppHeader title="Editar datos del alumno" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <WorkspaceHeader
            title="Editar datos del alumno"
            description="Actualizá los datos administrativos. El seguimiento académico vive en el perfil del alumno."
            metadata={
              <div className="flex items-center gap-2">
                <PencilLine className="size-4 text-primary" />
                <span className="font-medium text-foreground">Edición de datos</span>
              </div>
            }
            action={
              <Button asChild variant="outline" className="h-10 rounded-xl shadow-none active:scale-[0.98]">
                <Link href={`/admin/dashboard/students/${studentId}/profile`}>
                  <Eye className="mr-2 size-4" />
                  Ver seguimiento
                </Link>
              </Button>
            }
          />
          {loading ? (
            <div className="space-y-4">
              <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-sm">
                <div className="space-y-5">
                  <div className="h-6 w-48 animate-pulse rounded-xl bg-muted/40" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-10 animate-pulse rounded-xl bg-muted/35" />
                    <div className="h-10 animate-pulse rounded-xl bg-muted/35" />
                  </div>
                  <div className="h-10 w-80 max-w-full animate-pulse rounded-xl bg-muted/35" />
                </div>
              </section>

              <section className="rounded-2xl border border-border/60 bg-card/95 p-6 shadow-sm">
                <div className="space-y-5">
                  <div className="h-6 w-48 animate-pulse rounded-xl bg-muted/40" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-10 animate-pulse rounded-xl bg-muted/35" />
                    <div className="h-10 animate-pulse rounded-xl bg-muted/35" />
                  </div>
                </div>
              </section>
            </div>
          ) : loadError ? (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>

                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    No se pudo cargar el alumno
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {loadError}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : student ? (
            <StudentForm
              mode="edit"
              initialData={student}
              onSubmit={handleSubmit}
              cancelHref={`/admin/dashboard/students/${studentId}/profile`}
            />
          ) : (
            <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
              <CardContent className="px-6 py-14">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Inbox className="size-6" />
                  </div>

                  <h4 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    Alumno no disponible
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    No se pudo cargar la información del alumno seleccionado.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
