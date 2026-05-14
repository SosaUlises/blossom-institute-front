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
    estado ? estadoLabels[estado] ?? 'Desconocido' : 'Desconocido',
  ]

  return parts.filter(Boolean).join(' · ')
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

  return (
    <>
      <AppHeader title={getCourseName(course)} subtitle={getHeaderSubtitle(course)} />

      <main className="flex-1 overflow-auto px-5 py-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-7xl">
          <StudentCourseDetail
            courseId={courseId}
            currentStudentId={Number.isFinite(currentStudentId) ? currentStudentId : undefined}
          />
        </div>
      </main>
    </>
  )
}
