import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { GradeForm } from '@/components/grades/grade-form'

export const metadata: Metadata = {
  title: 'Add Grade',
}

export default function NewGradePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Add Grade"
        description="Enter a new grade for a student"
      />
      <GradeForm mode="create" />
    </div>
  )
}
