import { AppHeader } from '@/components/layout/app-header'
import { TeacherSubmissionDetailView } from '@/components/teacher/tasks/teacher-submission-detail-view'

type PageProps = {
  params: Promise<{
    id: string
    taskId: string
    alumnoId: string
  }>
}

export default async function TeacherSubmissionDetailPage({ params }: PageProps) {
  const { id, taskId, alumnoId } = await params

  return (
    <>
      <AppHeader title="Submission Detail" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <TeacherSubmissionDetailView
            courseId={Number(id)}
            taskId={Number(taskId)}
            alumnoId={Number(alumnoId)}
          />
        </div>
      </main>
    </>
  )
}
