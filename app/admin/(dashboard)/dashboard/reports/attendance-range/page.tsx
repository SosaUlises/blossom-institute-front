import { AppHeader } from '@/components/layout/app-header'
import { AttendanceRangeReportView } from '@/components/admin/reports/attendance-range-report-view'

export default function ReportsAttendanceRangePage() {
  return (
    <>
      <AppHeader title="Attendance by range" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Attendance by range
            </h2>
            <p className="text-sm text-muted-foreground">
              Consultá la asistencia consolidada por curso dentro de un rango de fechas.
            </p>
          </section>

          <AttendanceRangeReportView />
        </div>
      </div>
    </>
  )
}