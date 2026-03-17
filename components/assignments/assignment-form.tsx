'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon, Upload, X } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { courses, teachers } from '@/lib/placeholder-data'
import type { Assignment } from '@/lib/types'

interface AssignmentFormProps {
  assignment?: Assignment
  mode: 'create' | 'edit'
}

interface FormData {
  title: string
  description: string
  courseId: string
  teacherId: string
  dueDate: Date | undefined
  totalPoints: number
  isPublished: boolean
}

interface FormErrors {
  title?: string
  courseId?: string
  teacherId?: string
  dueDate?: string
  totalPoints?: string
}

export function AssignmentForm({ assignment, mode }: AssignmentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])

  const [formData, setFormData] = useState<FormData>({
    title: assignment?.title || '',
    description: assignment?.description || '',
    courseId: assignment?.courseId || '',
    teacherId: '',
    dueDate: assignment?.dueDate ? new Date(assignment.dueDate) : undefined,
    totalPoints: assignment?.totalPoints || 100,
    isPublished: assignment?.status !== 'pending',
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }

    if (formData.totalPoints <= 0) {
      newErrors.totalPoints = 'Points must be greater than 0'
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
      mode === 'create'
        ? 'Assignment created successfully'
        : 'Assignment updated successfully'
    )

    router.push('/dashboard/assignments')
  }

  const handleCancel = () => {
    router.back()
  }

  const handleAddAttachment = () => {
    // Placeholder for file upload logic
    const newAttachment = `Attachment ${attachments.length + 1}.pdf`
    setAttachments([...attachments, newAttachment])
    toast.success('Attachment added')
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  // Get teacher for selected course
  const selectedCourse = courses.find((c) => c.id === formData.courseId)
  const courseTeacher = selectedCourse
    ? teachers.find((t) => t.id === selectedCourse.teacherId)
    : null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title *</FieldLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter assignment title"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter assignment description and instructions..."
                rows={4}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="course">Course *</FieldLabel>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, courseId: value })
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
                <FieldLabel htmlFor="teacher">Teacher</FieldLabel>
                <Input
                  id="teacher"
                  value={courseTeacher ? `${courseTeacher.firstName} ${courseTeacher.lastName}` : 'Select a course first'}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Automatically assigned based on course
                </p>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Due Date *</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.dueDate && 'text-muted-foreground',
                        errors.dueDate && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {formData.dueDate
                        ? format(formData.dueDate, 'PPP')
                        : 'Select due date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, dueDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.dueDate && (
                  <p className="text-sm text-destructive">{errors.dueDate}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="points">Total Points *</FieldLabel>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  value={formData.totalPoints}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalPoints: parseInt(e.target.value) || 0,
                    })
                  }
                  className={errors.totalPoints ? 'border-destructive' : ''}
                />
                {errors.totalPoints && (
                  <p className="text-sm text-destructive">{errors.totalPoints}</p>
                )}
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAttachment}
              className="w-full border-dashed"
            >
              <Upload className="mr-2 size-4" />
              Upload Attachment
            </Button>

            {attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                  >
                    <span className="text-sm">{attachment}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP (Max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-medium">Publish Assignment</span>
              <span className="text-sm text-muted-foreground">
                When published, students will be able to see and submit this assignment
              </span>
            </div>
            <Switch
              checked={formData.isPublished}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublished: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create Assignment'
              : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
