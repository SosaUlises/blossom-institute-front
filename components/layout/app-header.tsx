'use client'

import { useEffect, useState } from 'react'
import { Moon, PanelLeft, Sun } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { UserAvatar } from '@/components/shared/user-avatar'
import type { SessionUser } from '@/lib/auth/session'
import { CURRENT_USER_AVATAR_UPDATED_EVENT } from '@/lib/auth/client-events'
import { cn } from '@/lib/utils'

type AppHeaderProps = {
  title: string
  subtitle?: string
}

type HeaderOverride = {
  title?: string
  subtitle?: string
}

const titleLabels: Record<string, string> = {
  'Assessments detail': 'Detalle de evaluaciones',
  Attendance: 'Asistencia',
  'Attendance by range': 'Asistencia por rango',
  'Attendance report': 'Reporte de asistencia',
  'Course Detail': 'Detalle del curso',
  Courses: 'Cursos',
  'Create Grade': 'Nueva calificación',
  'Create Task': 'Nueva tarea',
  Dashboard: 'Inicio',
  'Deliveries by task': 'Entregas por tarea',
  'Edit Grade': 'Editar calificación',
  'Edit Task': 'Editar tarea',
  'Edit course': 'Editar curso',
  'Edit student': 'Editar alumno',
  'Edit teacher': 'Editar docente',
  'Homework report': 'Reporte de tareas',
  'Manage course': 'Gestionar curso',
  'Marks report': 'Reporte de notas',
  'New course': 'Nuevo curso',
  'New student': 'Nuevo alumno',
  'New teacher': 'Nuevo docente',
  Reports: 'Reportes',
  Settings: 'Configuración',
  'Student Dashboard': 'Inicio',
  'Student Grades': 'Calificaciones del alumno',
  'Student summary': 'Resumen del alumno',
  Students: 'Alumnos',
  'Submission Detail': 'Detalle de entrega',
  'Take Attendance': 'Tomar asistencia',
  'Task Detail': 'Detalle de tarea',
  'Teacher Dashboard': 'Inicio',
  Teachers: 'Docentes',
}

function getHeaderSubtitle(pathname: string) {
  if (pathname.startsWith('/admin')) {
    return 'Blossom Institute · Administración'
  }

  if (pathname.startsWith('/teacher')) {
    return 'Blossom Institute · Docentes'
  }

  if (pathname.startsWith('/student')) {
    return 'Blossom Institute · Alumno'
  }

  return 'Blossom Institute'
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [override, setOverride] = useState<HeaderOverride | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const headerTitle = override?.title ?? title
  const displayTitle = titleLabels[headerTitle] ?? headerTitle
  const displaySubtitle = override?.subtitle ?? subtitle ?? getHeaderSubtitle(pathname)
  const isStudent = pathname.startsWith('/student')
  const isTeacher = pathname.startsWith('/teacher')
  const isWorkspace = isStudent || isTeacher

  useEffect(() => {
    setOverride(null)

    function handleHeaderUpdate(event: Event) {
      const detail = (event as CustomEvent<HeaderOverride>).detail
      setOverride(detail ?? null)
    }

    window.addEventListener('app-header:update', handleHeaderUpdate)

    return () => {
      window.removeEventListener('app-header:update', handleHeaderUpdate)
    }
  }, [pathname])

  useEffect(() => {
    let active = true

    fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) return null
        const result = (await response.json()) as { data?: SessionUser }
        return result.data ?? null
      })
      .then((nextUser) => {
        if (active) setUser(nextUser)
      })
      .catch(() => {
        if (active) setUser(null)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl: string | null }>).detail

      setUser((current) =>
        current
          ? {
              ...current,
              avatarUrl: detail?.avatarUrl ?? null,
            }
          : current,
      )
    }

    window.addEventListener(CURRENT_USER_AVATAR_UPDATED_EVENT, handleAvatarUpdated)

    return () => {
      window.removeEventListener(CURRENT_USER_AVATAR_UPDATED_EVENT, handleAvatarUpdated)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b backdrop-blur supports-[backdrop-filter]:bg-background/80',
        isWorkspace
          ? 'border-border/70 bg-background/90'
          : 'border-border/60 bg-background/95',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8',
          isWorkspace ? 'py-2.5' : 'py-3',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Abrir o cerrar navegacion"
            className={cn(
              'size-11 shrink-0 rounded-2xl border-border/70 bg-background/85 shadow-sm hover:bg-muted hover:text-foreground',
              isWorkspace && 'rounded-xl shadow-[0_1px_1px_rgba(15,23,42,0.03)] dark:bg-background/35',
            )}
          >
            <PanelLeft className="size-4.5" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-foreground sm:text-[1.55rem]">
              {displayTitle}
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {displaySubtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <UserAvatar
              name={`${user.nombre} ${user.apellido}`.trim()}
              avatarUrl={user.avatarUrl}
              size={40}
              className={cn(
                'hidden sm:flex',
                isWorkspace && 'ring-border/50',
              )}
              fallbackClassName="bg-primary/10 text-primary"
            />
          ) : null}

          <Button
            variant="outline"
            size="icon"
            aria-label="Cambiar tema"
            className={cn(
              'size-11 rounded-2xl border-border/70 bg-background/85 shadow-sm transition-colors hover:bg-muted hover:text-foreground',
              isWorkspace && 'rounded-xl shadow-[0_1px_1px_rgba(15,23,42,0.03)] dark:bg-background/35',
            )}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="size-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  )
}
