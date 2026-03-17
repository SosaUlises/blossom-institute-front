'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  Calendar,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableToolbar } from '@/components/shared/data-table-toolbar'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { assignments, courses, teachers } from '@/lib/placeholder-data'
import type { AssignmentStatus } from '@/lib/types'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Graded' },
  { value: 'late', label: 'Late' },
]

const courseOptions = courses.map((c) => ({ value: c.id, label: c.name }))
const teacherOptions = teachers.map((t) => ({
  value: t.id,
  label: `${t.firstName} ${t.lastName}`,
}))

export default function AssignmentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [courseFilter, setCourseFilter] = useState<string>('')
  const [teacherFilter, setTeacherFilter] = useState<string>('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isLoading] = useState(false)

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(search.toLowerCase()) ||
      assignment.courseName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      !statusFilter || statusFilter === 'all' || assignment.status === statusFilter
    const matchesCourse =
      !courseFilter || courseFilter === 'all' || assignment.courseId === courseFilter
    // Teacher filter would require joining with courses data
    const matchesTeacher = !teacherFilter || teacherFilter === 'all'
    return matchesSearch && matchesStatus && matchesCourse && matchesTeacher
  })

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setCourseFilter('')
    setTeacherFilter('')
  }

  const hasActiveFilters =
    search !== '' ||
    (statusFilter !== '' && statusFilter !== 'all') ||
    (courseFilter !== '' && courseFilter !== 'all') ||
    (teacherFilter !== '' && teacherFilter !== 'all')

  const handleDelete = () => {
    // Placeholder for delete logic
    setDeleteId(null)
  }

  const getTeacherForCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    return course?.teacherName || 'N/A'
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Assignments"
        description="Manage homework and assignments for all courses"
        actions={
          <Button asChild>
            <Link href="/dashboard/assignments/new">
              <Plus className="mr-2 size-4" />
              Create Assignment
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <DataTableToolbar
              searchPlaceholder="Search assignments..."
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
                  key: 'course',
                  label: 'Course',
                  options: courseOptions,
                  value: courseFilter,
                  onChange: setCourseFilter,
                },
                {
                  key: 'teacher',
                  label: 'Teacher',
                  options: teacherOptions,
                  value: teacherFilter,
                  onChange: setTeacherFilter,
                },
              ]}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {filteredAssignments.length === 0 ? (
              <Empty className="py-12">
                <Empty.Icon>
                  <ClipboardList className="size-10" />
                </Empty.Icon>
                <Empty.Title>No assignments found</Empty.Title>
                <Empty.Description>
                  {hasActiveFilters
                    ? 'Try adjusting your filters or search term.'
                    : 'Get started by creating your first assignment.'}
                </Empty.Description>
                {!hasActiveFilters && (
                  <Empty.Actions>
                    <Button asChild>
                      <Link href="/dashboard/assignments/new">
                        <Plus className="mr-2 size-4" />
                        Create Assignment
                      </Link>
                    </Button>
                  </Empty.Actions>
                )}
              </Empty>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-center">Submissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <FileText className="size-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{assignment.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {assignment.totalPoints} points
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.courseName}</TableCell>
                        <TableCell>{getTeacherForCourse(assignment.courseId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="size-4 text-muted-foreground" />
                            {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{assignment.submissionCount || 0}</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={assignment.status as AssignmentStatus} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/assignments/${assignment.id}`}>
                                  <Eye className="mr-2 size-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/assignments/${assignment.id}/edit`}>
                                  <Pencil className="mr-2 size-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(assignment.id)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Assignment"
        description="Are you sure you want to delete this assignment? This action cannot be undone and will remove all associated submissions."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
