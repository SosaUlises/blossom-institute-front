'use client'

import { useState } from 'react'
import { Check, Palette } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { TeacherCourseDetail } from '@/lib/teacher/course-detail/types'
import { cn } from '@/lib/utils'

type Props = {
  course: TeacherCourseDetail
}

const COURSE_THEME_OPTIONS = [
  'big-ben',
  'telephone-booth',
  'bus',
  'soldado',
  'te',
] as const

export function TeacherCourseHero({ course }: Props) {
  const themeIcon = course.themeIcon?.trim() || 'telephone-booth'
  const [selectedTheme, setSelectedTheme] = useState(themeIcon)
  const [themeDialogOpen, setThemeDialogOpen] = useState(false)

  return (
    <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
      <div className="relative mb-6 flex h-32 w-full items-center overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-card via-card/90 to-muted/30 px-6 shadow-sm md:h-36 md:px-8">
        <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4 z-20 size-9 border border-border/50 bg-background/80 text-muted-foreground shadow-sm backdrop-blur-md hover:bg-background hover:text-foreground"
            aria-label="Cambiar portada"
          >
            <Palette className="size-4" />
          </Button>
        </DialogTrigger>
        <div className="relative z-10 flex flex-col">
          <h1 className="break-words text-3xl font-extrabold text-foreground tracking-tight md:text-5xl">
            {course.nombre}
          </h1>

          {course.descripcion?.trim() ? (
            <p className="mt-3 text-lg font-medium tracking-wide text-muted-foreground/90 md:text-xl">
              {course.descripcion.trim()}
            </p>
          ) : null}
        </div>
        <img
          src={`/assets/course-themes/${selectedTheme}.png`}
          alt=""
          aria-hidden="true"
          className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 h-[82%] md:h-[92%] w-auto object-contain drop-shadow-xl pointer-events-none z-10"
        />
      </div>

      <DialogContent className="max-w-2xl rounded-2xl p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Elegir portada del curso</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          {COURSE_THEME_OPTIONS.map((theme) => {
            const active = selectedTheme === theme

            return (
              <button
                key={theme}
                type="button"
                aria-label={`Elegir portada ${theme}`}
                aria-pressed={active}
                onClick={() => {
                  setSelectedTheme(theme)
                  setThemeDialogOpen(false)
                }}
                className={cn(
                  'relative flex aspect-square items-center justify-center rounded-xl border-2 bg-muted/20 transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                  active ? 'border-primary' : 'border-border/60',
                )}
              >
                <img
                  src={`/assets/course-themes/${theme}.png`}
                  alt=""
                  aria-hidden="true"
                  className="h-2/3 object-contain"
                />
                {active ? (
                  <span className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-4" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
