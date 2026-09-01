import { AppHeader } from '@/components/layout/app-header'
import { TeacherGradeCreateView } from '@/components/teacher/grades/teacher-grade-create-view'

type PageProps = {
  params: Promise<{
    id: string
    alumnoId: string
  }>
}

export default async function TeacherGradeCreatePage({ params }: PageProps) {
  const { id, alumnoId } = await params

  return (
    <>
      <AppHeader title="Crear calificación" />

      <main className="flex-1 overflow-auto px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl">
          <TeacherGradeCreateView
            courseId={Number(id)}
            alumnoId={Number(alumnoId)}
          />
        </div>
      </main>
    </>
  )
}
