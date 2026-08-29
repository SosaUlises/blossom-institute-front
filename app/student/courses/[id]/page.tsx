import { notFound } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
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
  return getCourseMeta(course, ['themeIcon', 'theme', 'tema', 'themeName'])
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
      <AppHeader title={courseName} subtitle={headerSubtitle ?? undefined} />

      <main className="min-w-0 flex-1 overflow-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-7xl space-y-4">
          <header className="relative flex min-h-32 w-full items-center overflow-hidden rounded-2xl border border-border/40 bg-card px-5 py-5 shadow-sm sm:min-h-36 sm:px-6 md:px-8">
            <CourseThemeBackground theme={courseTheme} />

            <div className="relative z-10 flex max-w-[72%] flex-col sm:max-w-[62%]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                Aula de aprendizaje
              </p>
              <h1 className="mt-2 break-words text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {courseName}
              </h1>
              {headerSubtitle ? (
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-muted-foreground sm:text-base md:text-lg">
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
