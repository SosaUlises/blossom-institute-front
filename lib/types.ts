// Data models for the educational management system
// These are designed to be easily replaced with real API DTOs later

export type UserRole = 'admin' | 'teacher' | 'student'
export type Status = 'active' | 'inactive' | 'pending'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'late'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  status: Status
  createdAt: string
  updatedAt: string
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: Status
  enrolledCourseId?: string
  enrolledCourseName?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: string
  enrollmentDate: string
  createdAt: string
  updatedAt: string
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  specialty: string
  assignedCourses: string[]
  assignedCourseNames?: string[]
  status: Status
  bio?: string
  qualifications?: string[]
  hireDate: string
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: string
  name: string
  description?: string
  level: CourseLevel
  teacherId?: string
  teacherName?: string
  schedule: string
  capacity: number
  enrolledCount: number
  status: Status
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  title: string
  description?: string
  courseId: string
  courseName?: string
  dueDate: string
  totalPoints: number
  status: AssignmentStatus
  submissionCount?: number
  createdAt: string
  updatedAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  studentName?: string
  status: AssignmentStatus
  submittedAt?: string
  grade?: number
  feedback?: string
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  id: string
  courseId: string
  studentId: string
  studentName?: string
  date: string
  status: AttendanceStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Grade {
  id: string
  studentId: string
  studentName?: string
  courseId: string
  courseName?: string
  assignmentId?: string
  assignmentName?: string
  score: number
  maxScore: number
  percentage: number
  letterGrade?: string
  feedback?: string
  gradedAt: string
  createdAt: string
  updatedAt: string
}

// Dashboard KPIs
export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  activeCourses: number
  pendingAssignments: number
  attendanceRate: number
  averageGrade: number
}

export interface RecentActivity {
  id: string
  type: 'enrollment' | 'submission' | 'grade' | 'attendance' | 'course'
  description: string
  timestamp: string
  userId?: string
  userName?: string
}

export interface UpcomingClass {
  id: string
  courseName: string
  teacherName: string
  time: string
  room?: string
  studentsCount: number
}

// Form types for creating/editing
export type StudentFormData = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
export type TeacherFormData = Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>
export type CourseFormData = Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>
export type AssignmentFormData = Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'submissionCount'>

// API Response types (for future integration)
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter types
export interface StudentFilters {
  search?: string
  status?: Status
  courseId?: string
}

export interface TeacherFilters {
  search?: string
  status?: Status
  specialty?: string
}

export interface CourseFilters {
  search?: string
  status?: Status
  level?: CourseLevel
  teacherId?: string
}

export interface AssignmentFilters {
  search?: string
  status?: AssignmentStatus
  courseId?: string
}
