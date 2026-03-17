'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Mail, Phone } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableToolbar } from '@/components/shared/data-table-toolbar'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { students, courses } from '@/lib/placeholder-data'
import type { Student, Status } from '@/lib/types'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
]

const courseOptions = courses.map((c) => ({ value: c.id, label: c.name }))

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [courseFilter, setCourseFilter] = useState<string>('')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; student: Student | null }>({
    open: false,
    student: null,
  })

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        search === '' ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === '' || statusFilter === 'all' || student.status === statusFilter
      const matchesCourse = courseFilter === '' || courseFilter === 'all' || student.enrolledCourseId === courseFilter

      return matchesSearch && matchesStatus && matchesCourse
    })
  }, [search, statusFilter, courseFilter])

  const hasActiveFilters = statusFilter !== '' && statusFilter !== 'all' || courseFilter !== '' && courseFilter !== 'all'

  const handleClearFilters = () => {
    setStatusFilter('')
    setCourseFilter('')
  }

  const handleDelete = () => {
    // In a real app, this would call an API to delete the student
    console.log('Deleting student:', deleteDialog.student?.id)
    setDeleteDialog({ open: false, student: null })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <>
      <AppHeader
        title="Students"
        breadcrumbs={[{ label: 'Students' }]}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            title="Students"
            description="Manage student enrollments and information"
            actions={
              <Button asChild>
                <Link href="/dashboard/students/new">
                  <Plus className="mr-2 size-4" />
                  Add Student
                </Link>
              </Button>
            }
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <DataTableToolbar
                  searchPlaceholder="Search students..."
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
                  ]}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                />

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        <TableHead className="hidden lg:table-cell">Enrolled Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                            No students found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                    {getInitials(student.firstName, student.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground md:hidden">
                                    {student.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="size-3 text-muted-foreground" />
                                  {student.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="size-3" />
                                  {student.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {student.enrolledCourseName || '-'}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={student.status} />
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8">
                                    <MoreHorizontal className="size-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/students/${student.id}`}>
                                      <Eye className="mr-2 size-4" />
                                      View details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/students/${student.id}/edit`}>
                                      <Pencil className="mr-2 size-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteDialog({ open: true, student })}
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Showing {filteredStudents.length} of {students.length} students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, student: open ? deleteDialog.student : null })}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteDialog.student?.firstName} ${deleteDialog.student?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
