'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import {
  Pencil,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  MoreHorizontal,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { assignments, students, courses } from '@/lib/placeholder-data'
import type { AssignmentStatus } from '@/lib/types'

// Mock submission data
const mockSubmissions = [
  { id: '1', studentId: '1', studentName: 'Sarah Johnson', status: 'graded' as AssignmentStatus, submittedAt: '2026-03-14T10:30:00Z', grade: 92 },
  { id: '2', studentId: '2', studentName: 'Michael Chen', status: 'submitted' as AssignmentStatus, submittedAt: '2026-03-15T14:20:00Z', grade: null },
  { id: '3', studentId: '3', studentName: 'Emily Davis', status: 'late' as AssignmentStatus, submittedAt: '2026-03-16T23:45:00Z', grade: null },
  { id: '4', studentId: '5', studentName: 'Sophia Martinez', status: 'graded' as AssignmentStatus, submittedAt: '2026-03-13T09:15:00Z', grade: 88 },
  { id: '5', studentId: '7', studentName: 'Olivia Garcia', status: 'pending' as AssignmentStatus, submittedAt: null, grade: null },
]

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const assignment = assignments.find((a) => a.id === id)

  if (!assignment) {
    notFound()
  }

  const course = courses.find((c) => c.id === assignment.courseId)
  const enrolledStudents = students.filter(
    (s) => s.enrolledCourseId === assignment.courseId
  )

  const totalStudents = enrolledStudents.length || 30
  const submitted = mockSubmissions.filter(
    (s) => s.status === 'submitted' || s.status === 'graded' || s.status === 'late'
  ).length
  const pending = mockSubmissions.filter((s) => s.status === 'pending').length
  const graded = mockSubmissions.filter((s) => s.status === 'graded').length

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={assignment.title}
        description={`Assignment for ${assignment.courseName}`}
        actions={
          <Button asChild>
            <Link href={`/dashboard/assignments/${id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit Assignment
            </Link>
          </Button>
        }
      />

      {/* Assignment Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{assignment.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {assignment.courseName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>Due: {format(new Date(assignment.dueDate), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>Created: {format(new Date(assignment.createdAt), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span>Teacher: {course?.teacherName || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={assignment.status as AssignmentStatus} />
              <span className="text-lg font-semibold">
                {assignment.totalPoints} pts
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {assignment.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {assignment.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-muted-foreground" />
                <span className="text-sm">Assignment_Instructions.pdf</span>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="mr-2 size-4" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-muted-foreground" />
                <span className="text-sm">Reference_Material.docx</span>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="mr-2 size-4" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
        />
        <StatCard
          title="Submitted"
          value={submitted}
          description={`${Math.round((submitted / totalStudents) * 100)}% submission rate`}
          icon={CheckCircle}
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={AlertCircle}
        />
        <StatCard
          title="Graded"
          value={graded}
          description={`${Math.round((graded / submitted) * 100)}% of submissions`}
          icon={FileText}
        />
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {submission.studentName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{submission.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.submittedAt
                        ? format(new Date(submission.submittedAt), 'PPP p')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={submission.status} />
                    </TableCell>
                    <TableCell>
                      {submission.grade !== null ? (
                        <span className="font-medium">
                          {submission.grade}/{assignment.totalPoints}
                        </span>
                      ) : (
                        '-'
                      )}
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 size-4" />
                            View Submission
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 size-4" />
                            Grade Submission
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 size-4" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
