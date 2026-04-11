import { AppHeader } from '@/components/layout/app-header'
import { AttendanceRangeReportView } from '@/components/admin/reports/attendance-range-report-view'

export default function ReportsAttendanceRangePage() {
  return (
    <>
      <AppHeader title="Attendance by range" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AttendanceRangeReportView />
        </div>
      </div>
    </>
  )
}