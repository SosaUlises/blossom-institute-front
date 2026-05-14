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

type Tab = 'classes' | 'tasks' | 'students' | 'teachers' 

const tabStyles: Record<
  Tab,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    panelTitle: string
    panelDescription: string
  }
> = {
  classes: {
    label: 'Clases',
    icon: CalendarDays,
    panelTitle: 'Clases y asistencia',
    panelDescription:
      'Registro de clases, asistencia y seguimiento académico.',
  },
  tasks: {
    label: 'Tareas',
    icon: ClipboardList,
    panelTitle: 'Tareas y entregas',
    panelDescription:
      'Actividades del curso, entregas de alumnos y feedback.',
  },
  students: {
    label: 'Alumnos',
    icon: Users,
    panelTitle: 'Alumnos del curso',
    panelDescription:
      'Listado y gestión de estudiantes asignados al curso.',
  },
  teachers: {
    label: 'Profesores',
    icon: GraduationCap,
    panelTitle: 'Profesores del curso',
    panelDescription:
      'Equipo docente asignado y vinculado al curso.',
  },

}

export function TeacherCourseTabs({ course }: Props) {
  const [tab, setTab] = useState<Tab>('classes')

  const currentTab = tabStyles[tab]

  return (
    <div className="space-y-4">
      <nav
        aria-label="Secciones del curso"
        className="flex max-w-full flex-wrap gap-4 border-b border-border/70"
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
                className={`group -mb-px inline-flex min-h-10 items-center gap-2 border-b-2 px-0.5 py-2 text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 sm:px-1 ${
                  active
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                <Icon className="size-4 transition-colors duration-200 ease-out" />
                <span>{tabConfig.label}</span>
              </button>
            )
          })}
      </nav>

      <div className="rounded-2xl border border-border/70 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:bg-card/90">
        <div className="border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {currentTab.panelTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentTab.panelDescription}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {tab === 'students' && <TeacherCourseStudents courseId={course.id} />}
          {tab === 'teachers' && <TeacherCourseTeachers courseId={course.id} />}
          {tab === 'classes' && <TeacherCourseClasses courseId={course.id} />}
          {tab === 'tasks' && <TeacherCourseTasks courseId={course.id} />}
        </div>
      </div>
    </div>
  )
}
