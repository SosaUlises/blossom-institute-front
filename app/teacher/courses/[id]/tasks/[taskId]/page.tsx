import { AppHeader } from '@/components/layout/app-header'
import { TeacherTaskDetailView } from '@/components/teacher/tasks/teacher-task-detail-view'

type PageProps = {
  params: Promise<{
    id: string
    taskId: string
  }>
}

export default async function TeacherTaskDetailPage({ params }: PageProps) {
  const { id, taskId } = await params

  return (
    <>
      <AppHeader title="Publicación" />

      <main className="min-w-0 flex-1 overflow-auto overflow-x-hidden px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto min-w-0 max-w-6xl">
          <TeacherTaskDetailView
            courseId={Number(id)}
            taskId={Number(taskId)}
          />
        </div>
      </main>
    </>
  )
}
