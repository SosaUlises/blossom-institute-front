import { AppHeader } from '@/components/layout/app-header'
import { StudentAssessmentsDetailReportView } from '@/components/admin/reports/student-assessments-detail-report-view'

export default function ReportsStudentAssessmentsPage() {
  return (
    <>
      <AppHeader title="Student assessments detail" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <StudentAssessmentsDetailReportView />
        </div>
      </div>
    </>
  )
}