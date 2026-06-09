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

type Tab = 'tasks' | 'classes' | 'students' | 'teachers'

const tabStyles: Record<
  Tab,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  tasks: {
    label: 'Tablón',
    icon: ClipboardList,
  },
  classes: {
    label: 'Clases',
    icon: CalendarDays,
  },
  students: {
    label: 'Alumnos',
    icon: Users,
  },
  teachers: {
    label: 'Docentes',
    icon: GraduationCap,
  },
}

export function TeacherCourseTabs({ course }: Props) {
  const [tab, setTab] = useState<Tab>('tasks')

  return (
    <div className="space-y-2">
      <nav
        aria-label="Secciones del curso"
        role="tablist"
        className="grid grid-cols-4 border-b border-border/60"
      >
        {(Object.keys(tabStyles) as Tab[]).map((key) => {
          const tabConfig = tabStyles[key]
          const Icon = tabConfig.icon
          const active = tab === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              role="tab"
              aria-selected={active}
              aria-controls={`course-panel-${key}`}
              id={`course-tab-${key}`}
              className={`group -mb-px inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 border-b-2 px-1 py-2 text-xs font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 sm:text-sm ${
                active
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <Icon className="hidden size-3.5 shrink-0 transition-colors duration-200 ease-out sm:block" />
              <span className="truncate">{tabConfig.label}</span>
            </button>
          )
        })}
      </nav>

      <section
        id={`course-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`course-tab-${tab}`}
        className="pt-1"
      >
        {tab === 'tasks' && <TeacherCourseTasks courseId={course.id} />}
        {tab === 'classes' && <TeacherCourseClasses courseId={course.id} />}
        {tab === 'students' && <TeacherCourseStudents courseId={course.id} />}
        {tab === 'teachers' && <TeacherCourseTeachers courseId={course.id} />}
      </section>
    </div>
  )
}
