'use client'

import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { WorkspaceHeader } from '@/components/shared/workspace-header'
import { CourseForm } from '@/components/admin/courses/course-form'
import { createCourse } from '@/lib/admin/courses/api'
import type { CreateCursoDTO, UpdateCursoDTO } from '@/lib/admin/courses/types'

export default function NewCoursePage() {
  const router = useRouter()

  const handleSubmit = async (payload: CreateCursoDTO | UpdateCursoDTO) => {
    await createCourse(payload as CreateCursoDTO)
    router.push('/admin/dashboard/courses')
    router.refresh()
  }

  return (
    <>
      <AppHeader title="New course" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <WorkspaceHeader
            title="Nuevo curso"
            description="Define datos generales, estado y horarios del curso."
            metadata={
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <span className="font-medium text-foreground">Alta de curso</span>
              </div>
            }
          />
          <CourseForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}