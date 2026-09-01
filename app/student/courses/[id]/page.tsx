import { notFound } from 'next/navigation'

import {
  CourseThemeBackground,
} from '@/components/teacher/course-detail/course-theme-background'
import { StudentCourseDetail } from '@/components/student/courses/student-course-detail'
import { getSession } from '@/lib/auth/session'
import { getStudentCourseDetailServer } from '@/lib/student/courses/server-api'
import {
  type StudentCourseDetail as StudentCourseDetailType,
} from '@/lib/student/courses/types'

type PageProps = {
  params: Promise<{
    id: string
  }>
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
  const parts = [
    course.descripcion?.trim() ||
      getCourseMeta(course, ['turno', 'modalidad', 'shift', 'mode']),
  ]

  return parts.filter(Boolean).join(' · ') || null
}

function getCourseTheme(course: StudentCourseDetailType) {
  return getCourseMeta(course, [
    'themeIcon',
    'theme',
    'tema',
    'themeName',
    'ThemeIcon',
    'Theme',
    'Tema',
    'ThemeName',
  ])
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
  const courseTheme = getCourseTheme(course)

  return (
    <>
      <main className="min-w-0 flex-1 overflow-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-7xl space-y-4">
          <header className="relative mb-2 flex h-32 w-full items-center overflow-hidden rounded-2xl border border-border/40 bg-card px-6 shadow-sm md:h-36 md:px-8">
            <CourseThemeBackground theme={courseTheme} />

            <div className="relative z-10 flex max-w-[68%] flex-col md:max-w-[56%]">
              <h1 className="break-words text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                {courseName}
              </h1>
              {headerSubtitle ? (
                <p className="mt-3 line-clamp-2 text-lg font-medium tracking-wide text-muted-foreground/90 md:text-xl">
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
