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
      <AppHeader title="Editar calificación" />

      <main className="flex-1 overflow-auto px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl">
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
