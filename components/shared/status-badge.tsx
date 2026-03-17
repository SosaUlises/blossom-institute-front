import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Status, AttendanceStatus, AssignmentStatus } from '@/lib/types'

type BadgeStatus = Status | AttendanceStatus | AssignmentStatus

const statusConfig: Record<BadgeStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning-foreground border-warning/20 hover:bg-warning/20',
  },
  present: {
    label: 'Present',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  absent: {
    label: 'Absent',
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
  late: {
    label: 'Late',
    className: 'bg-warning/10 text-warning-foreground border-warning/20 hover:bg-warning/20',
  },
  excused: {
    label: 'Excused',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  },
  graded: {
    label: 'Graded',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
}

interface StatusBadgeProps {
  status: BadgeStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
