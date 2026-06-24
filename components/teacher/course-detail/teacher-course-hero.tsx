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
import {
  CourseThemeBackground,
  type CourseThemeGeometry,
  type CourseThemePalette,
} from './course-theme-background'

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

const COURSE_THEME_PALETTES: {
  id: CourseThemePalette
  label: string
  swatches: string[]
}[] = [
  {
    id: 'blossom',
    label: 'Blossom',
    swatches: ['bg-blue-700', 'bg-red-600', 'bg-blue-900'],
  },
  {
    id: 'royal',
    label: 'Royal',
    swatches: ['bg-indigo-700', 'bg-fuchsia-600', 'bg-sky-500'],
  },
  {
    id: 'ember',
    label: 'Ember',
    swatches: ['bg-orange-500', 'bg-red-700', 'bg-yellow-400'],
  },
  {
    id: 'electric',
    label: 'Electric',
    swatches: ['bg-cyan-500', 'bg-violet-700', 'bg-pink-500'],
  },
  {
    id: 'ocean',
    label: 'Ocean',
    swatches: ['bg-blue-600', 'bg-emerald-500', 'bg-cyan-400'],
  },
  {
    id: 'candy',
    label: 'Candy',
    swatches: ['bg-pink-500', 'bg-red-500', 'bg-amber-400'],
  },
  {
    id: 'lime',
    label: 'Lime',
    swatches: ['bg-lime-500', 'bg-blue-600', 'bg-fuchsia-500'],
  },
]

function isCourseThemeGeometry(value: string): value is CourseThemeGeometry {
  return COURSE_THEME_GEOMETRIES.some((geometry) => geometry.id === value)
}

function isCourseThemePalette(value: string): value is CourseThemePalette {
  return COURSE_THEME_PALETTES.some((palette) => palette.id === value)
}

function getInitialTheme(themeIcon?: string | null) {
  const [geometry, palette] = themeIcon?.trim().split(':') ?? []

  return {
    geometry: geometry && isCourseThemeGeometry(geometry) ? geometry : 'waves',
    palette: palette && isCourseThemePalette(palette) ? palette : 'blossom',
  }
}

export function TeacherCourseHero({ course }: Props) {
  const initialTheme = getInitialTheme(course.themeIcon)
  const [selectedGeometry, setSelectedGeometry] = useState<CourseThemeGeometry>(
    initialTheme.geometry,
  )
  const [selectedPalette, setSelectedPalette] = useState<CourseThemePalette>(
    initialTheme.palette,
  )
  const [themeDialogOpen, setThemeDialogOpen] = useState(false)

  return (
    <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
      <div className="relative mb-6 flex h-32 w-full items-center overflow-hidden rounded-2xl border border-border/40 bg-card px-6 shadow-sm md:h-36 md:px-8">
        <CourseThemeBackground
          geometry={selectedGeometry}
          palette={selectedPalette}
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
                    onClick={() => setSelectedGeometry(geometry.id)}
                    className={cn(
                      'relative h-20 overflow-hidden rounded-xl border-2 bg-card transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                      active ? 'border-primary' : 'border-border/60',
                    )}
                  >
                    <CourseThemeBackground
                      geometry={geometry.id}
                      palette={selectedPalette}
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
            <p className="text-sm font-medium text-foreground">Paleta</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {COURSE_THEME_PALETTES.map((palette) => {
                const active = selectedPalette === palette.id

                return (
                  <button
                    key={palette.id}
                    type="button"
                    aria-label={`Elegir paleta ${palette.label}`}
                    aria-pressed={active}
                    onClick={() => setSelectedPalette(palette.id)}
                    className={cn(
                      'relative flex min-w-0 flex-col items-start gap-2 rounded-xl border-2 bg-card px-3 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                      active ? 'border-primary' : 'border-border/60',
                    )}
                  >
                    <span className="max-w-full truncate pr-7">
                      {palette.label}
                    </span>
                    <span className="flex max-w-full items-center gap-1.5">
                      {palette.swatches.map((swatch) => (
                        <span
                          key={swatch}
                          className={cn(
                            'size-5 shrink-0 rounded-full border border-background/80',
                            swatch,
                          )}
                        />
                      ))}
                    </span>
                    {active ? (
                      <Check className="absolute right-3 top-3 size-4" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
