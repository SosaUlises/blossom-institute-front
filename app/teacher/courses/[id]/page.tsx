import { notFound } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { TeacherCourseHero } from '@/components/teacher/course-detail/teacher-course-hero'
import { TeacherCourseTabs } from '@/components/teacher/course-detail/teacher-course-tabs'
import { getTeacherCourseDetailServer } from '@/lib/teacher/course-detail/server-api'
import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function TeacherCourseDetailPage({ params }: PageProps) {
  const { id } = await params
  const courseId = Number(id)

  if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
    notFound()
  }

  let course: TeacherCourseDetail

  try {
    course = await getTeacherCourseDetailServer(courseId)
  } catch {
    notFound()
  }

  return (
    <>
      <AppHeader title="Course Detail" />

      <main className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <TeacherCourseHero course={course} />
          <TeacherCourseTabs course={course} />
        </div>
      </main>
    </>
  )
}