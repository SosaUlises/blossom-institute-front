'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'
import { TeacherCourseClasses } from './teacher-course-classes'
import { TeacherCourseStudents } from './teacher-course-students'
import { TeacherCourseTasks } from './teacher-course-tasks'
import { TeacherCourseTeachers } from './teacher-course-teachers'

type Props = {
  course: TeacherCourseDetail
}

type Tab = 'tablon' | 'clases' | 'alumnos' | 'docentes'

const tabs: Tab[] = ['tablon', 'clases', 'alumnos', 'docentes']

function isSupportedTab(value: string | null): value is Tab {
  return value !== null && tabs.includes(value as Tab)
}

const tabStyles: Record<
  Tab,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  tablon: {
    label: 'Tablón',
    icon: ClipboardList,
  },
  clases: {
    label: 'Clases',
    icon: CalendarDays,
  },
  alumnos: {
    label: 'Alumnos',
    icon: Users,
  },
  docentes: {
    label: 'Docentes',
    icon: GraduationCap,
  },
}

export function TeacherCourseTabs({ course }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const tab: Tab = isSupportedTab(requestedTab) ? requestedTab : 'tablon'

  const selectTab = (nextTab: Tab) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())

    if (nextTab === 'tablon') {
      nextSearchParams.delete('tab')
    } else {
      nextSearchParams.set('tab', nextTab)
    }

    const query = nextSearchParams.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const focusTab = (nextTab: Tab) => {
    window.requestAnimationFrame(() => {
      document.getElementById(`course-tab-${nextTab}`)?.focus()
    })
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <nav
        aria-label="Secciones del curso"
        role="tablist"
        aria-orientation="horizontal"
        className="-mx-1 flex overflow-x-auto border-b border-border/60 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((key) => {
          const tabConfig = tabStyles[key]
          const Icon = tabConfig.icon
          const active = tab === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => selectTab(key)}
              onKeyDown={(event) => {
                const currentIndex = tabs.indexOf(key)
                let nextIndex = currentIndex

                if (event.key === 'ArrowRight') {
                  nextIndex = (currentIndex + 1) % tabs.length
                } else if (event.key === 'ArrowLeft') {
                  nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
                } else if (event.key === 'Home') {
                  nextIndex = 0
                } else if (event.key === 'End') {
                  nextIndex = tabs.length - 1
                } else {
                  return
                }

                event.preventDefault()
                const nextTab = tabs[nextIndex]
                selectTab(nextTab)
                focusTab(nextTab)
              }}
              role="tab"
              aria-selected={active}
              aria-controls={`course-panel-${key}`}
              id={`course-tab-${key}`}
              tabIndex={active ? 0 : -1}
              className={cn(
                'group -mb-px inline-flex min-h-12 min-w-max items-center justify-center gap-2 border-b-2 px-3.5 text-sm font-medium transition-[border-color,color,background-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 active:scale-[0.99] sm:px-5',
                active
                  ? 'border-foreground font-semibold text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0 transition-colors duration-150 ease-out',
                  active ? 'text-foreground' : 'text-muted-foreground/75',
                )}
              />
              <span className="truncate">{tabConfig.label}</span>
            </button>
          )
        })}
      </nav>

      <section
        id={`course-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`course-tab-${tab}`}
        tabIndex={0}
        className="pt-0"
      >
        {tab === 'tablon' && (
          <TeacherCourseTasks courseId={course.id} courseName={course.nombre} />
        )}
        {tab === 'clases' && <TeacherCourseClasses courseId={course.id} />}
        {tab === 'alumnos' && <TeacherCourseStudents courseId={course.id} />}
        {tab === 'docentes' && <TeacherCourseTeachers courseId={course.id} />}
      </section>
    </div>
  )
}
