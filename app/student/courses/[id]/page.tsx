import { notFound } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { StudentCourseDetail } from '@/components/student/courses/student-course-detail'
import { getStudentCourseDetailServer } from '@/lib/student/courses/server-api'
import type { StudentCourseDetail as StudentCourseDetailType } from '@/lib/student/courses/types'

type PageProps = {
  params: Promise<{
    id: string
  }>
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

  return (
    <>
      <AppHeader title="Course Detail" />

      <main className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <StudentCourseDetail course={course} courseId={courseId} />
        </div>
      </main>
    </>
  )
}
