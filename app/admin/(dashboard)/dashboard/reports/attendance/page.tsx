import { AppHeader } from '@/components/layout/app-header'
import { AttendanceReportView } from '@/components/admin/reports/attendance-report-view'

export default function ReportsAttendancePage() {
  return (
    <>
      <AppHeader title="Attendance report" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AttendanceReportView />
        </div>
      </div>
    </>
  )
}