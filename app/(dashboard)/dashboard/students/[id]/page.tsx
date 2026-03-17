import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Pencil, Mail, Phone, Calendar, MapPin, AlertCircle } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { students } from '@/lib/placeholder-data'

interface StudentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params
  const student = students.find((s) => s.id === id)

  if (!student) {
    notFound()
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <>
      <AppHeader
        title={`${student.firstName} ${student.lastName}`}
        breadcrumbs={[
          { label: 'Students', href: '/dashboard/students' },
          { label: `${student.firstName} ${student.lastName}` },
        ]}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {getInitials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {student.firstName} {student.lastName}
                    </h1>
                    <p className="text-muted-foreground">
                      Student ID: {student.id.padStart(6, '0')}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={student.status} />
                    </div>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/students/${student.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    Edit Student
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Mail className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${student.email}`} className="text-sm font-medium hover:underline">
                      {student.email}
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Phone className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a href={`tel:${student.phone}`} className="text-sm font-medium hover:underline">
                      {student.phone}
                    </a>
                  </div>
                </div>
                {student.address && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{student.address}</p>
                      </div>
                    </div>
                  </>
                )}
                {student.emergencyContact && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <AlertCircle className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p className="text-sm font-medium">{student.emergencyContact}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Enrollment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Enrollment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="text-sm font-medium">
                      {student.dateOfBirth
                        ? format(new Date(student.dateOfBirth), 'MMMM d, yyyy')
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enrollment Date</p>
                    <p className="text-sm font-medium">
                      {format(new Date(student.enrollmentDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Enrolled Course</p>
                  {student.enrolledCourseName ? (
                    <Link
                      href={`/dashboard/courses/${student.enrolledCourseId}`}
                      className="inline-flex items-center rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      {student.enrolledCourseName}
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">No course enrolled</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
