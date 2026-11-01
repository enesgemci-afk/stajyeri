// ============================================================
// BAŞVURU DURUMU — tek kaynak (panel, basvurularim, isveren/*)
// 'pending = İncelemede, approved = Olumlu, rejected = Olumsuz'
// (applications.status check constraint ile aynı değerler)
// ============================================================

export type AppStatus = 'pending' | 'approved' | 'rejected';

export interface AppStatusMeta {
  label: string;
  badge: string;
  /** Filtre/özet satırlarındaki renkli nokta */
  dot: string;
}

export const APP_STATUS_META: Record<AppStatus, AppStatusMeta> = {
  pending: {
    label: 'İncelemede',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Olumlu',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Olumsuz',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
};
