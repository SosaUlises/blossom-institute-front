import { AppHeader } from '@/components/layout/app-header'
import { TeacherStudentGrades } from '@/components/teacher/grades/teacher-student-grades'

type PageProps = {
  params: Promise<{
    id: string
    alumnoId: string
  }>
}

export default async function TeacherStudentGradesPage({ params }: PageProps) {
  const { id, alumnoId } = await params

  return (
    <>
      <AppHeader title="Student Grades" />

      <main className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <TeacherStudentGrades
            courseId={Number(id)}
            alumnoId={Number(alumnoId)}
          />
        </div>
      </main>
    </>
  )
}
