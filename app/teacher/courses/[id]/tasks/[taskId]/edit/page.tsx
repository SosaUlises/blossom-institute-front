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

      <main className="px-6 py-8">
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