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
      <AppHeader title="Asistencia" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <TeacherClassAttendanceView courseId={courseId} fecha={fecha} />
        </div>
      </main>
    </>
  )
}
