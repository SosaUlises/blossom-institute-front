import { notFound } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { StudentForm } from '@/components/students/student-form'
import { students } from '@/lib/placeholder-data'

interface EditStudentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params
  const student = students.find((s) => s.id === id)

  if (!student) {
    notFound()
  }

  return (
    <>
      <AppHeader
        title={`Edit ${student.firstName} ${student.lastName}`}
        breadcrumbs={[
          { label: 'Students', href: '/dashboard/students' },
          { label: `${student.firstName} ${student.lastName}`, href: `/dashboard/students/${student.id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <StudentForm student={student} mode="edit" />
        </div>
      </div>
    </>
  )
}
