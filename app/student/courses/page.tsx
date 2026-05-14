import { AppHeader } from '@/components/layout/app-header'
import { StudentCoursesList } from '@/components/student/courses/student-courses-list'

export default function StudentCoursesPage() {
  return (
    <>
      <AppHeader title="Mis cursos" />

      <main className="flex-1 overflow-auto px-5 py-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-6xl">
          <StudentCoursesList />
        </div>
      </main>
    </>
  )
}
