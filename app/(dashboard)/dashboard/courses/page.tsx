'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Users, Clock, GraduationCap } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableToolbar } from '@/components/shared/data-table-toolbar'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { courses, teachers } from '@/lib/placeholder-data'
import type { Course, CourseLevel } from '@/lib/types'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const levelColors: Record<CourseLevel, string> = {
  beginner: 'bg-success/10 text-success border-success/20',
  intermediate: 'bg-warning/10 text-warning-foreground border-warning/20',
  advanced: 'bg-primary/10 text-primary border-primary/20',
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; course: Course | null }>({
    open: false,
    course: null,
  })

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        search === '' ||
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.teacherName?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === '' || statusFilter === 'all' || course.status === statusFilter
      const matchesLevel = levelFilter === '' || levelFilter === 'all' || course.level === levelFilter

      return matchesSearch && matchesStatus && matchesLevel
    })
  }, [search, statusFilter, levelFilter])

  const hasActiveFilters = (statusFilter !== '' && statusFilter !== 'all') || (levelFilter !== '' && levelFilter !== 'all')

  const handleClearFilters = () => {
    setStatusFilter('')
    setLevelFilter('')
  }

  const handleDelete = () => {
    console.log('Deleting course:', deleteDialog.course?.id)
    setDeleteDialog({ open: false, course: null })
  }

  return (
    <>
      <AppHeader
        title="Courses"
        breadcrumbs={[{ label: 'Courses' }]}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            title="Courses"
            description="Manage course offerings and schedules"
            actions={
              <Button asChild>
                <Link href="/dashboard/courses/new">
                  <Plus className="mr-2 size-4" />
                  Add Course
                </Link>
              </Button>
            }
          />

          <DataTableToolbar
            searchPlaceholder="Search courses..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: statusOptions,
                value: statusFilter,
                onChange: setStatusFilter,
              },
              {
                key: 'level',
                label: 'Level',
                options: levelOptions,
                value: levelFilter,
                onChange: setLevelFilter,
              },
            ]}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
                No courses found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={levelColors[course.level]}>
                              {course.level}
                            </Badge>
                            <StatusBadge status={course.status} />
                          </div>
                          <h3 className="font-semibold truncate">{course.name}</h3>
                          {course.teacherName && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                              <GraduationCap className="size-3" />
                              <span className="truncate">{course.teacherName}</span>
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 shrink-0">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/courses/${course.id}`}>
                                <Eye className="mr-2 size-4" />
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/courses/${course.id}/edit`}>
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteDialog({ open: true, course })}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="size-3" />
                          <span className="truncate">{course.schedule}</span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="size-3" />
                              <span>Enrollment</span>
                            </div>
                            <span className="font-medium">
                              {course.enrolledCount}/{course.capacity}
                            </span>
                          </div>
                          <Progress
                            value={(course.enrolledCount / course.capacity) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t bg-muted/30 px-5 py-3">
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View course details
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, course: open ? deleteDialog.course : null })}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteDialog.course?.name}"? This action cannot be undone and will affect all enrolled students.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
