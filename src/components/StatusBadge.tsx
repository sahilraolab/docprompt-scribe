import { Badge } from '@/components/ui/badge';
import { Status } from '@/types';

interface StatusBadgeProps {
  status: Status | string;
  className?: string;
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
  Draft: { variant: 'secondary', label: 'Draft' },
  Pending: { variant: 'outline', label: 'Pending' },
  Approved: { variant: 'default', label: 'Approved' },
  Rejected: { variant: 'destructive', label: 'Rejected' },
  Sent: { variant: 'outline', label: 'Sent' },
  Received: { variant: 'default', label: 'Received' },
  Closed: { variant: 'secondary', label: 'Closed' },
  Active: { variant: 'default', label: 'Active' },
  Planning: { variant: 'outline', label: 'Planning' },
  OnHold: { variant: 'destructive', label: 'On Hold' },
  Completed: { variant: 'default', label: 'Completed' },
  Cancelled: { variant: 'destructive', label: 'Cancelled' },
  // Task statuses
  NotStarted: { variant: 'secondary', label: 'Not Started' },
  InProgress: { variant: 'outline', label: 'In Progress' },
  Blocked: { variant: 'destructive', label: 'Blocked' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'secondary', label: status };
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
