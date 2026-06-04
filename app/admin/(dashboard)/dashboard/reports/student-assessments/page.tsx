import { StudentAssessmentsDetailReportView } from '@/components/admin/reports/student-assessments-detail-report-view'
import { AppHeader } from '@/components/layout/app-header'
import { AdminBreadcrumbs } from '@/components/layout/breadcrumbs'

export default function ReportsStudentAssessmentsPage() {
  return (
    <>
      <AppHeader title="Assessments detail" />

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <AdminBreadcrumbs
            items={[
              { label: 'Reportes', href: '/admin/dashboard/reports' },
              { label: 'Evaluaciones del alumno' },
            ]}
          />
          <StudentAssessmentsDetailReportView />
        </div>
      </div>
    </>
  )
}
