import { notFound } from 'next/navigation'
import { getTeacherCourseByIdServer, ApiError } from '@/lib/teacher/courses/server-api'
import { TeacherGradeTemplateView } from '@/components/teacher/grades/templates/teacher-grade-template-view'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function TeacherCourseGradeTemplatesPage({
  params,
}: PageProps) {
  const { id } = await params
  const courseId = Number(id)

  if (!Number.isInteger(courseId) || courseId <= 0) {
    notFound()
  }

  try {
    const course = await getTeacherCourseByIdServer(courseId)

    return (
      <TeacherGradeTemplateView
        courseId={courseId}
        courseName={course.nombre}
        courseYear={course.anio}
      />
    )
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound()
    }

    console.error('Error loading teacher course grade templates page:', error)
    throw error
  }
}