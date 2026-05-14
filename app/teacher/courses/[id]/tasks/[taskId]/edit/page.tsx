import { AppHeader } from '@/components/layout/app-header'
import { TeacherTaskEditView } from '@/components/teacher/tasks/teacher-task-edit-view'

type PageProps = {
  params: Promise<{
    id: string
    taskId: string
  }>
}

export default async function TeacherTaskEditPage({ params }: PageProps) {
  const { id, taskId } = await params

  return (
    <>
      <AppHeader title="Edit Task" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <TeacherTaskEditView
            courseId={Number(id)}
            taskId={Number(taskId)}
          />
        </div>
      </main>
    </>
  )
}
