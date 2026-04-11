import { AppHeader } from '@/components/layout/app-header'
import { DeliveriesByTaskReportView } from '@/components/admin/reports/deliveries-by-task-report-view'

export default function ReportsDeliveriesPage() {
  return (
    <>
      <AppHeader title="Deliveries by task" />

      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <DeliveriesByTaskReportView />
        </div>
      </div>
    </>
  )
}