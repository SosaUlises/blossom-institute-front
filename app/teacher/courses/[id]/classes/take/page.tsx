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
      <AppHeader title="Take Attendance" />

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <TeacherTakeAttendanceView courseId={courseId} />
        </div>
      </main>
    </>
  )
}