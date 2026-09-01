'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { getTeacherCourseDetail } from '@/lib/teacher/course-detail/api'
import { getTeacherCourseStudents } from '@/lib/teacher/course-detail/students'
import { createTeacherGrade } from '@/lib/teacher/grades/api'
import type { GradeFormPayload } from '@/lib/teacher/grades/types'
import { TeacherGradePageHeader } from './teacher-grade-page-header'
import { TeacherGradeForm } from './teacher-grade-form'

type Props = {
  courseId: number
  alumnoId: number
}

type StudentContext = {
  name: string
  email?: string | null
  avatarUrl?: string | null
}

export function TeacherGradeCreateView({ courseId, alumnoId }: Props) {
  const router = useRouter()
  const [loadingContext, setLoadingContext] = useState(true)
  const [studentContext, setStudentContext] = useState<StudentContext | null>(null)
  const [courseName, setCourseName] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadContext() {
      try {
        setLoadingContext(true)
        const [courseResult, studentsResult] = await Promise.allSettled([
          getTeacherCourseDetail(courseId),
          getTeacherCourseStudents(courseId),
        ])

        if (!active) return

        if (courseResult.status === 'fulfilled') {
          setCourseName(courseResult.value.nombre)
        }

        if (studentsResult.status === 'fulfilled') {
          const student = studentsResult.value.find(
            (item) => item.alumnoId === alumnoId,
          )

          if (student) {
            setStudentContext({
              name: `${student.nombre} ${student.apellido}`.trim(),
              email: student.email,
              avatarUrl: student.avatarUrl,
            })
          }
        }
      } finally {
        if (active) {
          setLoadingContext(false)
        }
      }
    }

    void loadContext()

    return () => {
      active = false
    }
  }, [alumnoId, courseId])

  const handleSubmit = async (payload: GradeFormPayload) => {
    await createTeacherGrade(courseId, alumnoId, payload)

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}/students/${alumnoId}/grades`)
    }, 700)
  }

  return (
    <div className="space-y-5">
      <TeacherGradePageHeader
        mode="create"
        loading={loadingContext}
        studentName={studentContext?.name}
        studentEmail={studentContext?.email}
        studentAvatarUrl={studentContext?.avatarUrl}
        courseName={courseName}
      />

      <TeacherGradeForm
        mode="create"
        onSubmit={handleSubmit}
        submitLabel="Guardar calificación"
      />
    </div>
  )
}
