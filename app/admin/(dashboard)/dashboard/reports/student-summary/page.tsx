import { AppHeader } from '@/components/layout/app-header'
import { StudentSummaryReportView } from '@/components/admin/reports/student-summary-report-view'

export default function ReportsStudentSummaryPage() {
  return (
    <>
      <AppHeader title="Student summary" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <StudentSummaryReportView />
        </div>
      </div>
    </>
  )
}