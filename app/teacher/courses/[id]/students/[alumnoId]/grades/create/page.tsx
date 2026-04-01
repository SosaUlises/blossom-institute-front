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
      <AppHeader title="Create Grade" />

      <main className="px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <TeacherGradeCreateView
            courseId={Number(id)}
            alumnoId={Number(alumnoId)}
          />
        </div>
      </main>
    </>
  )
}