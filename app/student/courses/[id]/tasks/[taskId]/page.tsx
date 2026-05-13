import { notFound } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { StudentTaskDetail } from '@/components/student/courses/student-task-detail'

type PageProps = {
  params: Promise<{
    id: string
    taskId: string
  }>
}

export default async function StudentTaskDetailPage({ params }: PageProps) {
  const { id, taskId } = await params
  const courseId = Number(id)
  const tareaId = Number(taskId)

  if (
    !Number.isFinite(courseId) ||
    courseId <= 0 ||
    !Number.isFinite(tareaId) ||
    tareaId <= 0
  ) {
    notFound()
  }

  return (
    <>
      <AppHeader title="Tarea" subtitle="Actividad del curso" />

      <main className="flex-1 overflow-auto px-5 py-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-6xl">
          <StudentTaskDetail courseId={courseId} taskId={tareaId} />
        </div>
      </main>
    </>
  )
}
