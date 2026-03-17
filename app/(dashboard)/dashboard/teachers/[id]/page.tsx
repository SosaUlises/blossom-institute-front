import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Pencil, Mail, Phone, BookOpen, GraduationCap, Calendar } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { teachers, courses } from '@/lib/placeholder-data'

interface TeacherDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { id } = await params
  const teacher = teachers.find((t) => t.id === id)

  if (!teacher) {
    notFound()
  }

  const assignedCourses = courses.filter((c) => teacher.assignedCourses.includes(c.id))

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <>
      <AppHeader
        title={`${teacher.firstName} ${teacher.lastName}`}
        breadcrumbs={[
          { label: 'Teachers', href: '/dashboard/teachers' },
          { label: `${teacher.firstName} ${teacher.lastName}` },
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
                      {getInitials(teacher.firstName, teacher.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {teacher.firstName} {teacher.lastName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{teacher.specialty}</Badge>
                      <StatusBadge status={teacher.status} />
                    </div>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    Edit Teacher
                  </Link>
                </Button>
              </div>
              {teacher.bio && (
                <p className="mt-4 text-muted-foreground leading-relaxed">{teacher.bio}</p>
              )}
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
                    <a href={`mailto:${teacher.email}`} className="text-sm font-medium hover:underline">
                      {teacher.email}
                    </a>
                  </div>
                </div>
                {teacher.phone && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Phone className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a href={`tel:${teacher.phone}`} className="text-sm font-medium hover:underline">
                          {teacher.phone}
                        </a>
                      </div>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hire Date</p>
                    <p className="text-sm font-medium">
                      {format(new Date(teacher.hireDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Qualifications */}
            {teacher.qualifications && teacher.qualifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {teacher.qualifications.map((qual, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <GraduationCap className="size-4 text-primary" />
                        <span className="text-sm">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Assigned Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Assigned Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses assigned.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {assignedCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/dashboard/courses/${course.id}`}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{course.name}</p>
                        <p className="text-xs text-muted-foreground">{course.schedule}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
