import { notFound } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { StudentCourseDetail } from '@/components/student/courses/student-course-detail'
import { getSession } from '@/lib/auth/session'
import { getStudentCourseDetailServer } from '@/lib/student/courses/server-api'
import {
  EstadoCurso,
  type StudentCourseDetail as StudentCourseDetailType,
} from '@/lib/student/courses/types'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

const estadoLabels: Record<number, string> = {
  [EstadoCurso.Activo]: 'Activo',
  [EstadoCurso.Inactivo]: 'Inactivo',
  [EstadoCurso.Archivado]: 'Archivado',
}

function getCourseName(course: StudentCourseDetailType) {
  return course.nombre ?? course.cursoNombre ?? 'Curso'
}

function getCourseMeta(course: StudentCourseDetailType, keys: string[]) {
  for (const key of keys) {
    const value = course[key]

    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }

  return null
}

function getHeaderSubtitle(course: StudentCourseDetailType) {
  const estado = typeof course.estado === 'number' ? course.estado : undefined
  const parts = [
    course.descripcion?.trim() ||
      getCourseMeta(course, ['turno', 'modalidad', 'shift', 'mode']),
    typeof course.anio === 'number' ? `Año ${course.anio}` : null,
    estado ? estadoLabels[estado] ?? null : null,
  ]

  return parts.filter(Boolean).join(' · ') || null
}

export default async function StudentCourseDetailPage({ params }: PageProps) {
  const { id } = await params
  const courseId = Number(id)

  if (!Number.isFinite(courseId) || courseId <= 0) {
    notFound()
  }

  let course: StudentCourseDetailType

  try {
    course = await getStudentCourseDetailServer(courseId)
  } catch {
    notFound()
  }

  const session = await getSession()
  const currentStudentId = Number(session?.user.id)
  const courseName = getCourseName(course)
  const headerSubtitle = getHeaderSubtitle(course)

  return (
    <>
      <AppHeader title={courseName} subtitle={headerSubtitle ?? undefined} />

      <main className="flex-1 overflow-auto px-5 pb-6 pt-8 sm:pt-9 lg:px-8 lg:pb-7 lg:pt-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <header className="border-b border-border/60 pb-5">
            <div className="max-w-3xl">
              <p className="text-xs font-medium text-muted-foreground">
                Aula del curso
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {courseName}
              </h1>
              {headerSubtitle ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  {headerSubtitle}
                </p>
              ) : null}
            </div>
          </header>

          <StudentCourseDetail
            courseId={courseId}
            currentStudentId={Number.isFinite(currentStudentId) ? currentStudentId : undefined}
          />
        </div>
      </main>
    </>
  )
}
