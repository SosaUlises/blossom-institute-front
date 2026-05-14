import { AppHeader } from '@/components/layout/app-header'
import { TeacherCoursesTable } from '@/components/teacher/courses/teacher-courses-table'

export default function TeacherCoursesPage() {
  return (
    <>
      <AppHeader title="Mis cursos" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <TeacherCoursesTable />
        </div>
      </main>
    </>
  )
}
