import { AppHeader } from '@/components/layout/app-header'
import { TeacherTakeAttendanceView } from '@/components/teacher/course-detail/teacher-take-attendance-view'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function TeacherTakeAttendancePage({ params }: PageProps) {
  const { id } = await params
  const courseId = Number(id)

  return (
    <>
      <AppHeader title="Asistencia" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <TeacherTakeAttendanceView courseId={courseId} />
        </div>
      </main>
    </>
  )
}
