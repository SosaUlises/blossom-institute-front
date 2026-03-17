import { AppHeader } from '@/components/layout/app-header'
import { StudentForm } from '@/components/students/student-form'

export default function NewStudentPage() {
  return (
    <>
      <AppHeader
        title="Add Student"
        breadcrumbs={[
          { label: 'Students', href: '/dashboard/students' },
          { label: 'Add Student' },
        ]}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <StudentForm mode="create" />
        </div>
      </div>
    </>
  )
}
