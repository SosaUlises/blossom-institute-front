import { AppHeader } from '@/components/layout/app-header'
import { TeacherGradeEditView } from '@/components/teacher/grades/teacher-grade-edit-view'

type PageProps = {
  params: Promise<{
    id: string
    alumnoId: string
    gradeId: string
  }>
}

export default async function TeacherGradeEditPage({ params }: PageProps) {
  const { id, alumnoId, gradeId } = await params

  return (
    <>
      <AppHeader title="Edit Grade" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl">
          <TeacherGradeEditView
            courseId={Number(id)}
            alumnoId={Number(alumnoId)}
            gradeId={Number(gradeId)}
          />
        </div>
      </main>
    </>
  )
}
