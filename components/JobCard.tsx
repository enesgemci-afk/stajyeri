'use client';

import Link from 'next/link';
import { PROGRAM_TYPES } from '@/lib/constants';
import {
  Briefcase,
  MapPin,
  Building2,
  Utensils,
  Bus,
  Heart,
  ChevronRight,
  Clock,
} from 'lucide-react';

export interface JobCardData {
  id: string;
  title: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  quota?: number | null;
  has_lunch?: boolean;
  has_shuttle?: boolean;
  wage_info?: string | null;
  created_at?: string;
  company_details?: {
    company_name?: string;
    logo_url?: string | null;
    logo_color?: string | null;
  } | null;
}

const AVATAR_COLORS = ['#00A8B5', '#FF6B00', '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#0EA5E9'];

/** İşletme adından her seferinde aynı rengi üretir (logo yoksa baş harf avatarı için). */
export function companyColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/**
 * Logo yüklenmişse gösterir; yüklenmemişse işletme adının baş harfini
 * renkli rozet olarak basar (şablon). size: sm kart içi, lg detay sayfası.
 */
export function CompanyAvatar({
  job,
  size = 'md',
}: {
  job: JobCardData;
  size?: 'sm' | 'md' | 'lg';
}) {
  const name = job.company_details?.company_name || 'İşletme';
  const logo = job.company_details?.logo_url;
  const dim =
    size === 'sm'
      ? 'w-8 h-8 text-sm rounded-lg'
      : size === 'lg'
        ? 'w-16 h-16 text-2xl rounded-2xl'
        : 'w-10 h-10 text-base rounded-xl';

  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className={`${dim} object-cover border border-slate-200 flex-shrink-0 bg-white`}
      />
    );
  }
  const color = job.company_details?.logo_color || companyColor(name);
  return (
    <div
      className={`${dim} flex items-center justify-center font-black text-white flex-shrink-0 select-none`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {name.charAt(0).toLocaleUpperCase('tr-TR')}
    </div>
  );
}

// __JOBCARD__

/**
 * Ortak ilan kartı: ana sayfa vitrininde ve /ilanlar listesinde kullanılır.
 * logo_yüklü işletmede logo, yoksa renkli baş harf şablonu gösterir.
 * Favori özelliği opsiyoneldir (giriş yapılmamışsa kalp gizlenir).
 */
export default function JobCard({
  job,
  isFav = false,
  onToggleFav,
  favBusy = false,
}: {
  job: JobCardData;
  isFav?: boolean;
  onToggleFav?: (jobId: string) => void;
  favBusy?: boolean;
}) {
  const programLabel =
    PROGRAM_TYPES.find((p) => p.value === job.program_type)?.label ?? job.program_type;
  const isNew =
    !!job.created_at && Date.now() - new Date(job.created_at).getTime() < 3 * 24 * 60 * 60 * 1000;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#00A8B5] transition-all flex flex-col justify-between gap-4 group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-[#00A8B5]/10 text-[#00A8B5] text-[11px] font-extrabold rounded-full">
              {programLabel}
            </span>
            {isNew && (
              <span className="px-2 py-1 bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-black rounded-full">
                YENİ
              </span>
            )}
          </div>
          {onToggleFav && (
            <button
              type="button"
              onClick={() => onToggleFav(job.id)}
              disabled={favBusy}
              title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 flex-shrink-0 ${
                isFav ? 'text-red-500 hover:bg-red-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
            </button>
          )}
        </div>

        <div className="flex items-start gap-3">
          <CompanyAvatar job={job} />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#0A1931] group-hover:text-[#00A8B5] transition line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs font-bold text-slate-600 mt-0.5 flex items-center gap-1.5 truncate">
              {job.company_details?.company_name || 'Onaylı İşletme'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Briefcase className="w-3.5 h-3.5 text-[#00A8B5]" /> {job.field_name}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.city} / {job.district}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
          {job.has_lunch && (
            <span className="flex items-center gap-1" title="Yemek imkanı">
              <Utensils className="w-3 h-3 text-[#FF6B00]" /> Yemek
            </span>
          )}
          {job.has_shuttle && (
            <span className="flex items-center gap-1" title="Servis imkanı">
              <Bus className="w-3 h-3 text-[#00A8B5]" /> Servis
            </span>
          )}
          {job.wage_info && (
            <span className="flex items-center gap-1 text-slate-500" title={job.wage_info}>
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[140px]">{job.wage_info}</span>
            </span>
          )}
        </div>

        <Link
          href={`/ilan/${job.id}`}
          className="px-4 py-2 bg-[#0A1931] hover:bg-[#FF6B00] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
        >
          Başvur <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

