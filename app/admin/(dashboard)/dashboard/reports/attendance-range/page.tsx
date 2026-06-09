import { AttendanceRangeReportView } from '@/components/admin/reports/attendance-range-report-view'
import { AppHeader } from '@/components/layout/app-header'
import { AdminBreadcrumbs } from '@/components/layout/breadcrumbs'

export default function ReportsAttendanceRangePage() {
  return (
    <>
      <AppHeader title="Attendance by range" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <AdminBreadcrumbs
            items={[
              { label: 'Reportes', href: '/admin/dashboard/reports' },
              { label: 'Asistencia por período' },
            ]}
          />
          <AttendanceRangeReportView />
        </div>
      </div>
    </>
  )
}
