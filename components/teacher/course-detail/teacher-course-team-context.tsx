'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { UserAvatar } from '@/components/shared/user-avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { SessionUser } from '@/lib/auth/session'

type Teacher = {
  profesorId: number
  nombre: string
  apellido: string
  email?: string | null
  avatarUrl?: string | null
}

type TeachersEnvelope = {
  message?: string
  data?: {
    items?: Teacher[]
  }
}

export function TeacherCourseTeamContext({ courseId }: { courseId: number }) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTeam() {
      try {
        const [teachersResponse, userResponse] = await Promise.all([
          fetch(`/api/teacher/courses/${courseId}/teachers`, {
            cache: 'no-store',
          }),
          fetch('/api/auth/me', {
            cache: 'no-store',
            credentials: 'include',
          }),
        ])

        const teachersResult = (await teachersResponse.json()) as TeachersEnvelope
        const userResult = (await userResponse.json()) as { data?: SessionUser }

        if (!cancelled && teachersResponse.ok) {
          setTeachers(teachersResult.data?.items ?? [])
        }
        if (!cancelled && userResponse.ok) {
          setCurrentUser(userResult.data ?? null)
        }
      } catch {
        if (!cancelled) {
          setTeachers([])
          setCurrentUser(null)
        }
      }
    }

    loadTeam()

    return () => {
      cancelled = true
    }
  }, [courseId])

  if (teachers.length <= 1) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group inline-flex h-7 items-center gap-2 rounded-lg px-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          aria-label={`Ver equipo docente, ${teachers.length} integrantes`}
        >
          <span className="flex -space-x-1.5">
            {teachers.slice(0, 3).map((teacher) => {
              const fullName = `${teacher.nombre} ${teacher.apellido}`.trim()

              return (
                <UserAvatar
                  key={teacher.profesorId}
                  name={fullName}
                  avatarUrl={teacher.avatarUrl}
                  size={22}
                  className="ring-2 ring-background"
                  fallbackClassName="bg-violet-500/10 text-[9px] text-violet-700 dark:text-violet-300"
                />
              )
            })}
          </span>
          <span>Equipo docente · {teachers.length}</span>
          <ChevronDown className="size-3.5 transition-transform duration-150 ease-out group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] rounded-xl border-border/60 bg-popover p-2 shadow-sm"
      >
        <div className="px-2 pb-2 pt-1">
          <p className="text-sm font-semibold text-foreground">Equipo docente</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Personas que comparten este curso.
          </p>
        </div>

        <div className="space-y-0.5">
          {teachers.map((teacher) => {
            const fullName = `${teacher.nombre} ${teacher.apellido}`.trim()
            const isCurrentUser = String(teacher.profesorId) === currentUser?.id

            return (
              <div
                key={teacher.profesorId}
                className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-2"
              >
                <UserAvatar
                  name={fullName}
                  avatarUrl={teacher.avatarUrl}
                  size={32}
                  fallbackClassName="bg-violet-500/10 text-xs text-violet-700 dark:text-violet-300"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {fullName}
                    </p>
                    {isCurrentUser ? (
                      <span className="shrink-0 rounded-md border border-border/50 bg-muted/35 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Vos
                      </span>
                    ) : null}
                  </div>
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={teacher.email ?? 'Sin email registrado'}
                  >
                    {teacher.email ?? 'Sin email registrado'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
