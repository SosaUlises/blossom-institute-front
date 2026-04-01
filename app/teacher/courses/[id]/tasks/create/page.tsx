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

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <TeacherTaskCreateView courseId={Number(id)} />
        </div>
      </main>
    </>
  )
}