import { AppHeader } from '@/components/layout/app-header'
import { AttendanceReportView } from '@/components/reports/attendance-report-view'

export default function ReportsAttendancePage() {
  return (
    <>
      <AppHeader title="Attendance report" />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Attendance by term
            </h2>
            <p className="text-sm text-muted-foreground">
              Consultá asistencia consolidada por curso y trimestre.
            </p>
          </section>

          <AttendanceReportView />
        </div>
      </div>
    </>
  )
}