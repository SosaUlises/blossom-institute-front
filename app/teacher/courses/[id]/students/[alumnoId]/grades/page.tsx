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

      <main className="px-6 py-8">
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