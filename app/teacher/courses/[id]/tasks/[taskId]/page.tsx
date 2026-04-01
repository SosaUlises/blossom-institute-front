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
      <AppHeader title="Task Detail" />

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <TeacherTaskDetailView
            courseId={Number(id)}
            taskId={Number(taskId)}
          />
        </div>
      </main>
    </>
  )
}