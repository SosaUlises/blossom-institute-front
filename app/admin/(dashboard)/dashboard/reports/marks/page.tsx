'use client'

import { MarksReportView } from '@/components/admin/reports/marks-report-view'
import { AppHeader } from '@/components/layout/app-header'
import { AdminBreadcrumbs } from '@/components/layout/breadcrumbs'

export default function ReportsMarksPage() {
  return (
    <>
      <AppHeader title="Marks report" />

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <AdminBreadcrumbs
            items={[
              { label: 'Reportes', href: '/admin/dashboard/reports' },
              { label: 'Calificaciones por curso' },
            ]}
          />
          <MarksReportView />
        </div>
      </div>
    </>
  )
}
