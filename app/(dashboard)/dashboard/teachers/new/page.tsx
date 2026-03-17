import { AppHeader } from '@/components/layout/app-header'
import { TeacherForm } from '@/components/teachers/teacher-form'

export default function NewTeacherPage() {
  return (
    <>
      <AppHeader
        title="Add Teacher"
        breadcrumbs={[
          { label: 'Teachers', href: '/dashboard/teachers' },
          { label: 'Add Teacher' },
        ]}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <TeacherForm mode="create" />
        </div>
      </div>
    </>
  )
}
