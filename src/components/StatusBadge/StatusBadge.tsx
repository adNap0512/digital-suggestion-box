import type { Status } from '../../utils/types';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge badge--${status}`} data-testid="status-badge">
      {status}
    </span>
  );
}
