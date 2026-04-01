import { AppHeader } from '@/components/layout/app-header'
import { TeacherClassAttendanceView } from '@/components/teacher/course-detail/teacher-class-attendance-view'

type PageProps = {
  params: Promise<{
    id: string
    fecha: string
  }>
}

export default async function TeacherClassAttendancePage({ params }: PageProps) {
  const { id, fecha } = await params
  const courseId = Number(id)

  return (
    <>
      <AppHeader title="Attendance" />

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <TeacherClassAttendanceView courseId={courseId} fecha={fecha} />
        </div>
      </main>
    </>
  )
}