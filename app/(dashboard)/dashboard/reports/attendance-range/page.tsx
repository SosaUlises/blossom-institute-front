import { AppHeader } from '@/components/layout/app-header'

export default function ReportsAttendanceRangePage() {
  return (
    <>
      <AppHeader title="Attendance by range" />
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-border/70 bg-card/95 p-8 text-sm text-muted-foreground">
            Próximamente: reporte de asistencia por rango de fechas.
          </div>
        </div>
      </div>
    </>
  )
}