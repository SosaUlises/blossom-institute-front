'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Mail, BookOpen } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import { teachers } from '@/lib/placeholder-data'
import type { Teacher } from '@/lib/types'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const specialtyOptions = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'English Literature', label: 'English Literature' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Chemistry', label: 'Chemistry' },
]

export default function TeachersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teacher: Teacher | null }>({
    open: false,
    teacher: null,
  })

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        search === '' ||
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        teacher.email.toLowerCase().includes(search.toLowerCase()) ||
        teacher.specialty.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === '' || statusFilter === 'all' || teacher.status === statusFilter
      const matchesSpecialty = specialtyFilter === '' || specialtyFilter === 'all' || teacher.specialty === specialtyFilter

      return matchesSearch && matchesStatus && matchesSpecialty
    })
  }, [search, statusFilter, specialtyFilter])

  const hasActiveFilters = (statusFilter !== '' && statusFilter !== 'all') || (specialtyFilter !== '' && specialtyFilter !== 'all')

  const handleClearFilters = () => {
    setStatusFilter('')
    setSpecialtyFilter('')
  }

  const handleDelete = () => {
    console.log('Deleting teacher:', deleteDialog.teacher?.id)
    setDeleteDialog({ open: false, teacher: null })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <>
      <AppHeader
        title="Teachers"
        breadcrumbs={[{ label: 'Teachers' }]}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <PageHeader
            title="Teachers"
            description="Manage faculty members and their assignments"
            actions={
              <Button asChild>
                <Link href="/dashboard/teachers/new">
                  <Plus className="mr-2 size-4" />
                  Add Teacher
                </Link>
              </Button>
            }
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <DataTableToolbar
                  searchPlaceholder="Search teachers..."
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
                      key: 'specialty',
                      label: 'Specialty',
                      options: specialtyOptions,
                      value: specialtyFilter,
                      onChange: setSpecialtyFilter,
                    },
                  ]}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                />

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead className="hidden md:table-cell">Specialty</TableHead>
                        <TableHead className="hidden lg:table-cell">Assigned Courses</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                            No teachers found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTeachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                    {getInitials(teacher.firstName, teacher.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {teacher.firstName} {teacher.lastName}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Mail className="size-3" />
                                    {teacher.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="secondary">{teacher.specialty}</Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <BookOpen className="size-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {teacher.assignedCourses.length} course{teacher.assignedCourses.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={teacher.status} />
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
                                    <Link href={`/dashboard/teachers/${teacher.id}`}>
                                      <Eye className="mr-2 size-4" />
                                      View details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
                                      <Pencil className="mr-2 size-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteDialog({ open: true, teacher })}
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
                  <span>Showing {filteredTeachers.length} of {teachers.length} teachers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, teacher: open ? deleteDialog.teacher : null })}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${deleteDialog.teacher?.firstName} ${deleteDialog.teacher?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
