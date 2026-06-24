import { AppHeader } from '@/components/layout/app-header'
import {
  TeacherTaskCreateView,
  type PublicationType,
} from '@/components/teacher/tasks/teacher-task-create-view'

type PageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    type?: string
  }>
}

export default async function TeacherTaskCreatePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { type } = await searchParams
  const initialType: PublicationType =
    type === 'task' ? 'task' : 'announcement'

  return (
    <>
      <AppHeader title="Crear publicación" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto w-full max-w-5xl">
          <TeacherTaskCreateView
            courseId={Number(id)}
            initialType={initialType}
          />
        </div>
      </main>
    </>
  )
}
