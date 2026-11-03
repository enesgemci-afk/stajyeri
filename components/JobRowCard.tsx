'use client';

import Link from 'next/link';
import { MapPin, Utensils, Bus, Heart, ChevronRight, Clock, Briefcase } from 'lucide-react';
import { CompanyAvatar, type JobCardData } from '@/components/JobCard';
import { programTypeLabel } from '@/lib/constants';

/**
 * Kariyer.net tarzı tam genişlik SATIR ilan kartı — /ilanlar listesi için.
 * JobCard (2 kolonlu grid) alternatifi: yatay düzen + sağda hızlı aksiyonlar.
 * Claymorphism gölge dili anasayfa/ilanlar ile aynı.
 */
export default function JobRowCard({
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
  const dateStr = job.created_at
    ? new Date(job.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] hover:shadow-[0_18px_50px_rgba(0,168,181,0.16)] hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 group">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 pt-0.5">
          <CompanyAvatar job={job} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/ilan/${job.id}`}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] rounded"
              >
                <h3 className="text-sm font-black text-[#0A1931] group-hover:text-[#00A8B5] transition line-clamp-1">
                  {job.title}
                </h3>
              </Link>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5 truncate">
                {job.company_details?.company_name || 'Onaylı İşletme'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {onToggleFav && (
                <button
                  type="button"
                  onClick={() => onToggleFav(job.id)}
                  disabled={favBusy}
                  title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 ${
                    isFav ? 'text-red-500 hover:bg-red-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
                </button>
              )}
              {dateStr && <span className="text-[10px] font-bold text-slate-400">{dateStr}</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> {job.city} / {job.district}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-[#00A8B5]" /> {job.field_name}
            </span>
            {job.has_lunch && (
              <span className="flex items-center gap-1">
                <Utensils className="w-3 h-3 text-[#FF6B00]" /> Yemek
              </span>
            )}
            {job.has_shuttle && (
              <span className="flex items-center gap-1">
                <Bus className="w-3 h-3 text-[#00A8B5]" /> Servis
              </span>
            )}
            {job.wage_info && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[140px]">{job.wage_info}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
            <span className="px-3 py-1 bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-extrabold rounded-full">
              {programTypeLabel(job.program_type)}
            </span>
            <div className="flex items-center gap-2.5">
              {job.quota ? (
                <span className="text-[10px] font-bold text-slate-500">{job.quota} kişilik kontenjan</span>
              ) : null}
              <Link
                href={`/ilan/${job.id}`}
                className="px-4 py-2 bg-[#0A1931] hover:bg-[#00A8B5] text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] focus-visible:ring-offset-2"
              >
                Başvur <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
