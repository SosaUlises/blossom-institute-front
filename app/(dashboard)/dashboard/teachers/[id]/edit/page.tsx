import { notFound } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { TeacherForm } from '@/components/teachers/teacher-form'
import { teachers } from '@/lib/placeholder-data'

interface EditTeacherPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const { id } = await params
  const teacher = teachers.find((t) => t.id === id)

  if (!teacher) {
    notFound()
  }

  return (
    <>
      <AppHeader
        title={`Edit ${teacher.firstName} ${teacher.lastName}`}
        breadcrumbs={[
          { label: 'Teachers', href: '/dashboard/teachers' },
          { label: `${teacher.firstName} ${teacher.lastName}`, href: `/dashboard/teachers/${teacher.id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <TeacherForm teacher={teacher} mode="edit" />
        </div>
      </div>
    </>
  )
}
