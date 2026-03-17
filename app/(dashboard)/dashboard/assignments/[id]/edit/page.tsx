import { use } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { AssignmentForm } from '@/components/assignments/assignment-form'
import { assignments } from '@/lib/placeholder-data'

export const metadata: Metadata = {
  title: 'Edit Assignment',
}

export default function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const assignment = assignments.find((a) => a.id === id)

  if (!assignment) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Edit Assignment"
        description={`Update details for "${assignment.title}"`}
      />
      <AssignmentForm assignment={assignment} mode="edit" />
    </div>
  )
}
