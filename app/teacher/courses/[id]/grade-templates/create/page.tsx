import { notFound } from 'next/navigation'
import { getTeacherCourseByIdServer } from '@/lib/teacher/courses/server-api'
import { TeacherGradeTemplateCreateView } from '@/components/teacher/grades/templates/teacher-grade-template-create-view'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function TeacherCourseGradeTemplateCreatePage({
  params,
}: PageProps) {
  const { id } = await params
  const courseId = Number(id)

  if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
    notFound()
  }

  let course: Awaited<ReturnType<typeof getTeacherCourseByIdServer>>

  try {
    course = await getTeacherCourseByIdServer(courseId)
  } catch {
    notFound()
  }

  return (
    <TeacherGradeTemplateCreateView
      courseId={courseId}
      courseName={course.nombre}
      courseYear={course.anio}
    />
  )
}