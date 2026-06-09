import { HomeworkReportView } from '@/components/admin/reports/homework-report-view'
import { AppHeader } from '@/components/layout/app-header'
import { AdminBreadcrumbs } from '@/components/layout/breadcrumbs'

export default function ReportsHomeworkPage() {
  return (
    <>
      <AppHeader title="Homework report" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <AdminBreadcrumbs
            items={[
              { label: 'Reportes', href: '/admin/dashboard/reports' },
              { label: 'Tareas por curso' },
            ]}
          />
          <HomeworkReportView />
        </div>
      </div>
    </>
  )
}
