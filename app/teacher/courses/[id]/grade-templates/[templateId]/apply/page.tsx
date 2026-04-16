import { notFound } from 'next/navigation'
import { TeacherGradeTemplateApplyView } from '@/components/teacher/grades/templates/teacher-grade-template-apply-view'
import { getTeacherCourseByIdServer } from '@/lib/teacher/courses/server-api'

type PageProps = {
  params: Promise<{
    id: string
    templateId: string
  }>
}

export default async function TeacherCourseGradeTemplateApplyPage({
  params,
}: PageProps) {
  const { id, templateId } = await params

  const courseId = Number(id)
  const plantillaId = Number(templateId)

  if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
    notFound()
  }

  if (!plantillaId || Number.isNaN(plantillaId) || plantillaId <= 0) {
    notFound()
  }

  let course: Awaited<ReturnType<typeof getTeacherCourseByIdServer>>

  try {
    course = await getTeacherCourseByIdServer(courseId)
  } catch {
    notFound()
  }

  return (
    <TeacherGradeTemplateApplyView
      courseId={courseId}
      templateId={plantillaId}
      courseName={course.nombre}
      courseYear={course.anio}
    />
  )
}