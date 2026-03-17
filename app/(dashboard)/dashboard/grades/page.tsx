'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trophy,
  BookOpen,
  User,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Empty } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableToolbar } from '@/components/shared/data-table-toolbar'
import { grades, courses, students, teachers } from '@/lib/placeholder-data'
import { cn } from '@/lib/utils'

const courseOptions = courses.map((c) => ({ value: c.id, label: c.name }))
const studentOptions = students.map((s) => ({
  value: s.id,
  label: `${s.firstName} ${s.lastName}`,
}))
const teacherOptions = teachers.map((t) => ({
  value: t.id,
  label: `${t.firstName} ${t.lastName}`,
}))

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'reviewed', label: 'Reviewed' },
]

export default function GradesPage() {
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('')
  const [studentFilter, setStudentFilter] = useState<string>('')

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      grade.courseName?.toLowerCase().includes(search.toLowerCase()) ||
      grade.assignmentName?.toLowerCase().includes(search.toLowerCase())
    const matchesCourse =
      !courseFilter || courseFilter === 'all' || grade.courseId === courseFilter
    const matchesStudent =
      !studentFilter || studentFilter === 'all' || grade.studentId === studentFilter
    return matchesSearch && matchesCourse && matchesStudent
  })

  const clearFilters = () => {
    setSearch('')
    setCourseFilter('')
    setStudentFilter('')
  }

  const hasActiveFilters =
    search !== '' ||
    (courseFilter !== '' && courseFilter !== 'all') ||
    (studentFilter !== '' && studentFilter !== 'all')

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success'
    if (percentage >= 80) return 'text-primary'
    if (percentage >= 70) return 'text-warning-foreground'
    return 'text-destructive'
  }

  const getGradeBadgeVariant = (letterGrade?: string) => {
    if (!letterGrade) return 'secondary'
    if (letterGrade.startsWith('A')) return 'default'
    if (letterGrade.startsWith('B')) return 'secondary'
    if (letterGrade.startsWith('C')) return 'outline'
    return 'destructive'
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Grades"
        description="Manage student grades and academic performance"
        actions={
          <Button asChild>
            <Link href="/dashboard/grades/new">
              <Plus className="mr-2 size-4" />
              Add Grade
            </Link>
          </Button>
        }
      />

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link href="/dashboard/grades/students">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">By Student</p>
                <p className="text-sm text-muted-foreground">View grades per student</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link href="/dashboard/grades/courses">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">By Course</p>
                <p className="text-sm text-muted-foreground">View grades per course</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link href="/dashboard/grades/new">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Pencil className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Enter Grades</p>
                <p className="text-sm text-muted-foreground">Add new grade entries</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <DataTableToolbar
              searchPlaceholder="Search grades..."
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                {
                  key: 'course',
                  label: 'Course',
                  options: courseOptions,
                  value: courseFilter,
                  onChange: setCourseFilter,
                },
                {
                  key: 'student',
                  label: 'Student',
                  options: studentOptions,
                  value: studentFilter,
                  onChange: setStudentFilter,
                },
              ]}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {filteredGrades.length === 0 ? (
              <Empty className="py-12">
                <Empty.Icon>
                  <Trophy className="size-10" />
                </Empty.Icon>
                <Empty.Title>No grades found</Empty.Title>
                <Empty.Description>
                  {hasActiveFilters
                    ? 'Try adjusting your filters or search term.'
                    : 'Get started by adding your first grade entry.'}
                </Empty.Description>
                {!hasActiveFilters && (
                  <Empty.Actions>
                    <Button asChild>
                      <Link href="/dashboard/grades/new">
                        <Plus className="mr-2 size-4" />
                        Add Grade
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
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {grade.studentName
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{grade.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{grade.courseName}</TableCell>
                        <TableCell>{grade.assignmentName || 'General Assessment'}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn('text-lg font-bold', getGradeColor(grade.percentage))}>
                              {grade.score}/{grade.maxScore}
                            </span>
                            {grade.letterGrade && (
                              <Badge variant={getGradeBadgeVariant(grade.letterGrade) as 'default' | 'secondary' | 'outline' | 'destructive'}>
                                {grade.letterGrade}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(grade.gradedAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            Published
                          </Badge>
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
                                <Link href={`/dashboard/grades/students/${grade.studentId}`}>
                                  <Eye className="mr-2 size-4" />
                                  View Student Grades
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/grades/${grade.id}/edit`}>
                                  <Pencil className="mr-2 size-4" />
                                  Edit Grade
                                </Link>
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
    </div>
  )
}
