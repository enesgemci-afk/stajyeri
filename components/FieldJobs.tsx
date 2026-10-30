'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import JobCard, { type JobCardData } from '@/components/JobCard';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * Meslek rehberi detay sayfasının "Aktif İlanlar" bölümü.
 * Server-rendered sayfada statik içerik SEO için SSR'da kalır; ilanlar
 * client tarafta canlı olarak çekilir.
 */
export default function FieldJobs({ field }: { field: string }) {
  const [jobs, setJobs] = useState<JobCardData[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from('job_posts')
        .select('*')
        .eq('field_name', field)
        .order('created_at', { ascending: false })
        .limit(6);
      if (!alive) return;
      const rows = ((data ?? []) as (JobCardData & { status?: string; is_active?: boolean })[]).filter(
        (j) =>
          (j.is_active === undefined || j.is_active === true) &&
          (!j.status || j.status === 'active'),
      );
      setJobs(rows);
    })();
    return () => {
      alive = false;
    };
  }, [field]);

  return (
    <section className="max-w-6xl w-full mx-auto px-4 pb-16">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-[#0A1931] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00A8B5]" />
          {field} Aktif Staj İlanları
        </h2>
        <Link
          href={`/?alan=${encodeURIComponent(field)}#ilanlar`}
          className="text-xs font-black text-[#00A8B5] hover:underline whitespace-nowrap"
        >
          Tümünü Gör →
        </Link>
      </div>

      {jobs === null ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> İlanlar yükleniyor...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-bold text-slate-600">Bu alanda şu an yayınlanan ilan yok.</p>
          <p className="text-xs text-slate-400 mt-1">
            Yeni ilanlar yayınlandığında burada listelenir. Alarm kurup bekleyebilirsin.
          </p>
          <Link
            href={`/?alan=${encodeURIComponent(field)}#ilanlar`}
            className="inline-block mt-4 px-5 py-2.5 rounded-full bg-[#00A8B5] text-white text-xs font-black hover:bg-[#008f9a] transition"
          >
            İlan Aramaya Git
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
