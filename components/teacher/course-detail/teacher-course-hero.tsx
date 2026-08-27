'use client'

import { useEffect, useState } from 'react'
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
import {
  CourseThemeBackground,
  parseCourseTheme,
  serializeCourseTheme,
  type CourseThemeColors,
  type CourseThemeGeometry,
} from './course-theme-background'
import { updateTeacherCourseTheme } from '@/lib/teacher/course-detail/api'

type Props = {
  course: TeacherCourseDetail
}

const COURSE_THEME_GEOMETRIES: {
  id: CourseThemeGeometry
  label: string
}[] = [
  { id: 'waves', label: 'Ondas' },
  { id: 'ribbons', label: 'Cintas' },
  { id: 'diagonals', label: 'Diagonales' },
  { id: 'arcs', label: 'Arcos' },
  { id: 'mosaic', label: 'Mosaico' },
  { id: 'sunset', label: 'Horizonte' },
]

const COURSE_THEME_COLOR_FIELDS: {
  id: keyof CourseThemeColors
  label: string
}[] = [
  { id: 'primary', label: 'Color 1' },
  { id: 'secondary', label: 'Color 2' },
  { id: 'accent', label: 'Color 3' },
]

export function TeacherCourseHero({ course }: Props) {
  const initialTheme = parseCourseTheme(course.themeIcon)
  const [selectedGeometry, setSelectedGeometry] = useState<CourseThemeGeometry>(
    initialTheme.geometry,
  )
  const [selectedColors, setSelectedColors] = useState<CourseThemeColors>(
    initialTheme.colors,
  )
  const [themeDialogOpen, setThemeDialogOpen] = useState(false)

  useEffect(() => {
    const nextTheme = parseCourseTheme(course.themeIcon)
    setSelectedGeometry(nextTheme.geometry)
    setSelectedColors(nextTheme.colors)
  }, [course.id, course.themeIcon])

  function persistCourseTheme(
    geometry: CourseThemeGeometry,
    colors: CourseThemeColors,
  ) {
    const theme = serializeCourseTheme(geometry, colors)

    void updateTeacherCourseTheme(course.id, theme).catch(() => undefined)
  }

  function handleGeometryChange(geometry: CourseThemeGeometry) {
    setSelectedGeometry(geometry)
    persistCourseTheme(geometry, selectedColors)
  }

  function handleColorChange(field: keyof CourseThemeColors, value: string) {
    setSelectedColors((current) => {
      const nextColors = {
        ...current,
        [field]: value,
      }

      persistCourseTheme(selectedGeometry, nextColors)

      return nextColors
    })
  }

  return (
    <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
      <div className="relative mb-6 flex h-32 w-full items-center overflow-hidden rounded-2xl border border-border/40 bg-card px-6 shadow-sm md:h-36 md:px-8">
        <CourseThemeBackground
          geometry={selectedGeometry}
          colors={selectedColors}
        />
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
        <div className="relative z-10 flex max-w-[68%] flex-col md:max-w-[56%]">
          <h1 className="break-words text-3xl font-extrabold text-foreground tracking-tight md:text-5xl">
            {course.nombre}
          </h1>

          {course.descripcion?.trim() ? (
            <p className="mt-3 text-lg font-medium tracking-wide text-muted-foreground/90 md:text-xl">
              {course.descripcion.trim()}
            </p>
          ) : null}
        </div>
      </div>

      <DialogContent className="max-w-3xl rounded-2xl p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Elegir portada del curso</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 p-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Geometria</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {COURSE_THEME_GEOMETRIES.map((geometry) => {
                const active = selectedGeometry === geometry.id

                return (
                  <button
                    key={geometry.id}
                    type="button"
                    aria-label={`Elegir geometria ${geometry.label}`}
                    aria-pressed={active}
                    onClick={() => handleGeometryChange(geometry.id)}
                    className={cn(
                      'relative h-20 overflow-hidden rounded-xl border-2 bg-card transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                      active ? 'border-primary' : 'border-border/60',
                    )}
                  >
                    <CourseThemeBackground
                      geometry={geometry.id}
                      colors={selectedColors}
                    />
                    <span className="absolute bottom-2 left-2 z-10 rounded-lg border border-border/60 bg-background/85 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                      {geometry.label}
                    </span>
                    {active ? (
                      <span className="absolute right-2 top-2 z-10 inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-4" />
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Colores</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {COURSE_THEME_COLOR_FIELDS.map((field) => (
                <label
                  key={field.id}
                  className="relative flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border-2 border-border/60 bg-card px-3 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25"
                >
                  <span
                    className="size-8 shrink-0 rounded-lg border border-border/60"
                    style={{ backgroundColor: selectedColors[field.id] }}
                  />
                  <span className="flex min-w-0 flex-col items-start">
                    <span className="max-w-full truncate">{field.label}</span>
                    <span className="font-mono text-xs uppercase text-muted-foreground">
                      {selectedColors[field.id]}
                    </span>
                  </span>
                  <input
                    type="color"
                    value={selectedColors[field.id]}
                    aria-label={`Elegir ${field.label}`}
                    onChange={(event) =>
                      handleColorChange(field.id, event.target.value)
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
