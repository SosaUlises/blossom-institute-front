'use client'

import { Moon, PanelLeft, Sun } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

type AppHeaderProps = {
  title: string
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

export function AppHeader({ title }: AppHeaderProps) {
  const { toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const displayTitle = titleLabels[title] ?? title
  const subtitle = getHeaderSubtitle(pathname)

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="size-11 shrink-0 rounded-2xl border-border/70 bg-background/85 shadow-sm hover:bg-muted hover:text-foreground"
          >
            <PanelLeft className="size-4.5" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-foreground sm:text-[1.55rem]">
              {displayTitle}
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-11 rounded-2xl border-border/70 bg-background/85 shadow-sm transition-colors hover:bg-muted hover:text-foreground"
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
