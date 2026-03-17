'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { courses, students, assignments } from '@/lib/placeholder-data'
import type { Grade } from '@/lib/types'

interface GradeFormProps {
  grade?: Grade
  mode: 'create' | 'edit'
}

interface FormData {
  studentId: string
  courseId: string
  assignmentId: string
  score: number
  maxScore: number
  gradedAt: Date
  feedback: string
  status: string
}

interface FormErrors {
  studentId?: string
  courseId?: string
  score?: string
  maxScore?: string
}

export function GradeForm({ grade, mode }: GradeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    studentId: grade?.studentId || '',
    courseId: grade?.courseId || '',
    assignmentId: grade?.assignmentId || '',
    score: grade?.score || 0,
    maxScore: grade?.maxScore || 100,
    gradedAt: grade?.gradedAt ? new Date(grade.gradedAt) : new Date(),
    feedback: grade?.feedback || '',
    status: 'published',
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Get students for selected course
  const courseStudents = formData.courseId
    ? students.filter((s) => s.enrolledCourseId === formData.courseId)
    : students

  // Get assignments for selected course
  const courseAssignments = formData.courseId
    ? assignments.filter((a) => a.courseId === formData.courseId)
    : assignments

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.studentId) {
      newErrors.studentId = 'Please select a student'
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course'
    }

    if (formData.score < 0) {
      newErrors.score = 'Score cannot be negative'
    }

    if (formData.maxScore <= 0) {
      newErrors.maxScore = 'Max score must be greater than 0'
    }

    if (formData.score > formData.maxScore) {
      newErrors.score = 'Score cannot exceed max score'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success(
      mode === 'create' ? 'Grade added successfully' : 'Grade updated successfully'
    )

    router.push('/dashboard/grades')
  }

  const handleCancel = () => {
    router.back()
  }

  const percentage = formData.maxScore > 0 ? (formData.score / formData.maxScore) * 100 : 0
  const letterGrade = 
    percentage >= 93 ? 'A' :
    percentage >= 90 ? 'A-' :
    percentage >= 87 ? 'B+' :
    percentage >= 83 ? 'B' :
    percentage >= 80 ? 'B-' :
    percentage >= 77 ? 'C+' :
    percentage >= 73 ? 'C' :
    percentage >= 70 ? 'C-' :
    percentage >= 67 ? 'D+' :
    percentage >= 60 ? 'D' : 'F'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Student & Course</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="course">Course *</FieldLabel>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, courseId: value, studentId: '', assignmentId: '' })
                  }
                >
                  <SelectTrigger
                    id="course"
                    className={errors.courseId ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseId && (
                  <p className="text-sm text-destructive">{errors.courseId}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="student">Student *</FieldLabel>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, studentId: value })
                  }
                >
                  <SelectTrigger
                    id="student"
                    className={errors.studentId ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studentId && (
                  <p className="text-sm text-destructive">{errors.studentId}</p>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="assignment">Assessment / Assignment</FieldLabel>
              <Select
                value={formData.assignmentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignmentId: value })
                }
              >
                <SelectTrigger id="assignment">
                  <SelectValue placeholder="Select an assignment (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Assessment</SelectItem>
                  {courseAssignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade Information</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="score">Score *</FieldLabel>
                <Input
                  id="score"
                  type="number"
                  min={0}
                  max={formData.maxScore}
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({ ...formData, score: parseFloat(e.target.value) || 0 })
                  }
                  className={errors.score ? 'border-destructive' : ''}
                />
                {errors.score && (
                  <p className="text-sm text-destructive">{errors.score}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="maxScore">Max Score *</FieldLabel>
                <Input
                  id="maxScore"
                  type="number"
                  min={1}
                  value={formData.maxScore}
                  onChange={(e) =>
                    setFormData({ ...formData, maxScore: parseFloat(e.target.value) || 100 })
                  }
                  className={errors.maxScore ? 'border-destructive' : ''}
                />
                {errors.maxScore && (
                  <p className="text-sm text-destructive">{errors.maxScore}</p>
                )}
              </Field>

              <Field>
                <FieldLabel>Calculated Grade</FieldLabel>
                <div className="flex h-9 items-center gap-2 rounded-md border bg-muted px-3">
                  <span className="font-bold">{percentage.toFixed(1)}%</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-semibold">{letterGrade}</span>
                </div>
              </Field>
            </div>

            <Field>
              <FieldLabel>Date Graded</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal sm:w-64'
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {format(formData.gradedAt, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.gradedAt}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, gradedAt: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="feedback">Comments / Feedback</FieldLabel>
            <Textarea
              id="feedback"
              value={formData.feedback}
              onChange={(e) =>
                setFormData({ ...formData, feedback: e.target.value })
              }
              placeholder="Enter feedback or comments for the student..."
              rows={4}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="status">Grade Status</FieldLabel>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Draft grades are not visible to students
            </p>
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'create'
              ? 'Saving...'
              : 'Updating...'
            : mode === 'create'
              ? 'Save Grade'
              : 'Update Grade'}
        </Button>
      </div>
    </form>
  )
}
