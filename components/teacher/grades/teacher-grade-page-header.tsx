'use client'

import { Pencil } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { PersonAvatar } from '@/components/teacher/course-detail/course-people-ui'

type Props = {
  mode: 'create' | 'edit'
  loading?: boolean
  studentName?: string | null
  studentEmail?: string | null
  studentAvatarUrl?: string | null
  courseName?: string | null
}

export function TeacherGradePageHeader({
  mode,
  loading = false,
  studentName,
  studentEmail,
  studentAvatarUrl,
  courseName,
}: Props) {
  const title = mode === 'create' ? 'Crear calificación' : 'Editar calificación'
  const eyebrow = mode === 'create' ? 'Nueva calificación' : 'Edición'
  const contextLabel =
    studentName && courseName
      ? `${studentName} · ${courseName}`
      : studentName || courseName || 'Seguimiento académico del alumno'

  return (
    <header className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] dark:bg-card/90 sm:p-5">
      {loading ? (
        <div className="flex items-center gap-3" aria-hidden="true">
          <Skeleton className="size-12 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-36 rounded-full" />
            <Skeleton className="h-6 w-56 rounded-full" />
            <Skeleton className="h-4 w-64 max-w-full rounded-full" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <PersonAvatar
              name={studentName ?? 'Alumno'}
              avatarUrl={studentAvatarUrl}
              tone="student"
              size={48}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {eyebrow}
                </p>
                {mode === 'edit' ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-background/35">
                    <Pencil className="size-3" />
                    En edición
                  </span>
                ) : null}
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {contextLabel}
              </p>
            </div>
          </div>

          {studentEmail ? (
            <span className="w-fit rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-background/35">
              {studentEmail}
            </span>
          ) : null}
        </div>
      )}
    </header>
  )
}
