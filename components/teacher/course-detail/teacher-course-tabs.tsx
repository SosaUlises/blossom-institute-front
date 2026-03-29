'use client'

import { useState } from 'react'
import {
  Users,
  GraduationCap,
  ClipboardList,
  CalendarDays,
} from 'lucide-react'

import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'
import { TeacherCourseStudents } from './teacher-course-students'
import { TeacherCourseTeachers } from './teacher-course-teachers'
import { TeacherCourseClasses } from './teacher-course-classes'
import { TeacherCourseTasks } from './teacher-course-tasks'

type Props = {
  course: TeacherCourseDetail
}

type Tab = 'students' | 'teachers' | 'classes' | 'tasks'

export function TeacherCourseTabs({ course }: Props) {
  const [tab, setTab] = useState<Tab>('students')

  const tabs = [
    { key: 'students', label: 'Alumnos', icon: Users },
    { key: 'teachers', label: 'Profesores', icon: GraduationCap },
    { key: 'classes', label: 'Clases', icon: CalendarDays },
    { key: 'tasks', label: 'Tareas', icon: ClipboardList },
  ] as const

  return (
    <div className="space-y-6">
      {/* Tabs header */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/70 bg-card/80 p-2 backdrop-blur-sm">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.key

          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_18px_44px_-24px_rgba(30,42,68,0.18)]">
        {tab === 'students' && <TeacherCourseStudents courseId={course.id} />}
        {tab === 'teachers' && <TeacherCourseTeachers courseId={course.id} />}
        {tab === 'classes' && <TeacherCourseClasses courseId={course.id} />}
        {tab === 'tasks' && <TeacherCourseTasks courseId={course.id} />}
      </div>
    </div>
  )
}