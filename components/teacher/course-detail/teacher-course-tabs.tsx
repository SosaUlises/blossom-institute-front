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

const tabStyles: Record<
  Tab,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    activeClass: string
    idleIconClass: string
    panelTitle: string
    panelDescription: string
  }
> = {
  students: {
    label: 'Alumnos',
    icon: Users,
    activeClass:
      'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400 shadow-sm',
    idleIconClass: 'text-sky-600/80 dark:text-sky-400/80',
    panelTitle: 'Alumnos del curso',
    panelDescription:
      'Listado y gestión de estudiantes asignados al curso.',
  },
  teachers: {
    label: 'Profesores',
    icon: GraduationCap,
    activeClass:
      'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400 shadow-sm',
    idleIconClass: 'text-violet-600/80 dark:text-violet-400/80',
    panelTitle: 'Profesores del curso',
    panelDescription:
      'Equipo docente asignado y vinculado al curso.',
  },
  classes: {
    label: 'Clases',
    icon: CalendarDays,
    activeClass:
      'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-sm',
    idleIconClass: 'text-amber-600/80 dark:text-amber-400/80',
    panelTitle: 'Clases y asistencia',
    panelDescription:
      'Registro de clases, asistencia y seguimiento académico.',
  },
  tasks: {
    label: 'Tareas',
    icon: ClipboardList,
    activeClass:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm',
    idleIconClass: 'text-emerald-600/80 dark:text-emerald-400/80',
    panelTitle: 'Tareas y entregas',
    panelDescription:
      'Actividades del curso, entregas de alumnos y feedback.',
  },
}

export function TeacherCourseTabs({ course }: Props) {
  const [tab, setTab] = useState<Tab>('students')

  const currentTab = tabStyles[tab]

  return (
    <div className="space-y-5">
      <div className="rounded-[26px] border border-border/60 bg-card/90 p-2 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.16)] backdrop-blur-sm">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(tabStyles) as Tab[]).map((key) => {
            const tabConfig = tabStyles[key]
            const Icon = tabConfig.icon
            const active = tab === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`group inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? tabConfig.activeClass
                    : 'border-transparent bg-transparent text-muted-foreground hover:border-border/60 hover:bg-background/80 hover:text-foreground'
                }`}
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-xl border ${
                    active
                      ? 'border-current/15 bg-white/40 dark:bg-white/5'
                      : 'border-border/60 bg-background/70'
                  }`}
                >
                  <Icon
                    className={`size-4 ${
                      active ? 'text-current' : tabConfig.idleIconClass
                    }`}
                  />
                </span>

                <span>{tabConfig.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-[30px] border border-border/60 bg-card/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.16)]">
        <div className="border-b border-border/60 px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Module view
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {currentTab.panelTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentTab.panelDescription}
          </p>
        </div>

        <div className="p-6">
          {tab === 'students' && <TeacherCourseStudents courseId={course.id} />}
          {tab === 'teachers' && <TeacherCourseTeachers courseId={course.id} />}
          {tab === 'classes' && <TeacherCourseClasses courseId={course.id} />}
          {tab === 'tasks' && <TeacherCourseTasks courseId={course.id} />}
        </div>
      </div>
    </div>
  )
}