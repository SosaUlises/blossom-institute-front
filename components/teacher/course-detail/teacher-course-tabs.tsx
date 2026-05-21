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
    panelTitle: string
    panelDescription: string
  }
> = {
  tasks: {
    label: 'Tablón',
    icon: ClipboardList,
    panelTitle: 'Tablón docente',
    panelDescription: 'Tareas y anuncios del curso.',
  },
  classes: {
    label: 'Clases',
    icon: CalendarDays,
    panelTitle: 'Clases y asistencia',
    panelDescription: 'Registro de clases y asistencia.',
  },
  students: {
    label: 'Alumnos',
    icon: Users,
    panelTitle: 'Alumnos del curso',
    panelDescription: 'Listado y gestion de estudiantes asignados al curso.',
  },
  teachers: {
    label: 'Profesores',
    icon: GraduationCap,
    panelTitle: 'Profesores del curso',
    panelDescription: 'Equipo docente asignado y vinculado al curso.',
  },
}

export function TeacherCourseTabs({ course }: Props) {
  const [tab, setTab] = useState<Tab>('tasks')

  return (
    <div className="space-y-2">
      <nav
        aria-label="Secciones del curso"
        className="flex max-w-full gap-3 overflow-x-auto border-b border-border/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              className={`group -mb-px inline-flex min-h-9 shrink-0 items-center gap-1.5 border-b-2 px-0.5 py-1.5 text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 sm:px-1 ${
                active
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5 transition-colors duration-200 ease-out" />
              <span>{tabConfig.label}</span>
            </button>
          )
        })}
      </nav>

      <section className="space-y-2">
        <div>
          {tab === 'tasks' && <TeacherCourseTasks courseId={course.id} />}
          {tab === 'classes' && <TeacherCourseClasses courseId={course.id} />}
          {tab === 'students' && <TeacherCourseStudents courseId={course.id} />}
          {tab === 'teachers' && <TeacherCourseTeachers courseId={course.id} />}
        </div>
      </section>
    </div>
  )
}
