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

      <main className="px-6 py-8">
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