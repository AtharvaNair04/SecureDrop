import type { DropStatus } from './api';

export function statusBadge(status: DropStatus): string {
  const map: Record<DropStatus, [string, string]> = {
    PENDING:      ['badge badge-pending',      'PENDING'],
    UNDER_REVIEW: ['badge badge-under_review', 'UNDER REVIEW'],
    RESOLVED:     ['badge badge-resolved',     'RESOLVED'],
    DISMISSED:    ['badge badge-dismissed',    'DISMISSED'],
  };
  const [cls, label] = map[status] ?? ['badge', status];
  return `<span class="${cls}">${label}</span>`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
