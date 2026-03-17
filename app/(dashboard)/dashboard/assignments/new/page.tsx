import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { AssignmentForm } from '@/components/assignments/assignment-form'

export const metadata: Metadata = {
  title: 'Create Assignment',
}

export default function NewAssignmentPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Create Assignment"
        description="Add a new assignment for students"
      />
      <AssignmentForm mode="create" />
    </div>
  )
}
