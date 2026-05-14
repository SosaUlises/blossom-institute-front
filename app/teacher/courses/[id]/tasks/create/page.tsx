import { AppHeader } from '@/components/layout/app-header'
import { TeacherTaskCreateView } from '@/components/teacher/tasks/teacher-task-create-view'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function TeacherTaskCreatePage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <AppHeader title="Create Task" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <TeacherTaskCreateView courseId={Number(id)} />
        </div>
      </main>
    </>
  )
}
