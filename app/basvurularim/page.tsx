'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PROGRAM_TYPES } from '@/lib/constants';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import {
  
  Building2,
  ClipboardList,
  LogIn,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

type AppStatus = 'pending' | 'approved' | 'rejected';

interface ApplicationRow {
  id: string;
  status: AppStatus;
  phone: string | null;
  message: string | null;
  created_at: string;
  job_posts?: {
    id: string;
    title: string;
    city: string | null;
    district: string | null;
    program_type: string;
    field_name: string;
    company_details?: { company_name?: string } | null;
  } | null;
}

const STATUS_META: Record<AppStatus, { label: string; badge: string; dot: string }> = {
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

type FilterKey = 'all' | AppStatus;

export default function BasvurularimPage() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      // Öğrenci profili
      const { data: sp } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', session.user.id)
        .maybeSingle();

      if (!sp) {
        setLoading(false);
        return;
      }

      // Başvuruları ilan ve işletme bilgisiyle çek
      const { data: apps, error } = await supabase
        .from('applications')
        .select(
          `
          id, status, phone, message, created_at,
          job_posts (
            id, title, city, district, program_type, field_name,
            company_details ( company_name )
          )
        `
        )
        .eq('student_id', sp.id)
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMsg('Başvurular yüklenirken bir hata oluştu.');
      } else if (apps) {
        setApplications(apps as unknown as ApplicationRow[]);
      }

      setLoading(false);
    }

    load();
  }, []);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const filtered =
    filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const programLabelOf = (value?: string) =>
    PROGRAM_TYPES.find((p) => p.value === value)?.label ?? value ?? '-';

  const CHIPS: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'Tümü', count: counts.all },
    { key: 'pending', label: 'İncelemede', count: counts.pending },
    { key: 'approved', label: 'Olumlu', count: counts.approved },
    { key: 'rejected', label: 'Olumsuz', count: counts.rejected },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-500">Başvurularınız yükleniyor...</div>
          ) : !isLoggedIn ? (
            <div className="mt-10 bg-white rounded-3xl border border-slate-200 shadow-lg p-10 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h1 className="text-lg font-black text-[#0A1931] mb-2">Giriş Yapın</h1>
              <p className="text-xs text-slate-500 mb-6">
                Başvurularınızı görebilmek için öğrenci hesabınızla giriş yapmanız gerekiyor.
              </p>
              <Link
                href="/ogrenci/giris"
                className="inline-block w-full py-3 bg-[#00A8B5] hover:bg-[#008e9a] text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#00A8B5]/30"
              >
                <LogIn className="w-4 h-4" /> Öğrenci Girişi
              </Link>
            </div>
          ) : (
            <>
              {/* Başlık (kariyer.net Başvurularım ekranı düzeni) */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <div>
                  <h1 className="text-xl font-black text-[#0A1931]">Başvurularım</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Başvurularınızın güncel durumunu buradan takip edebilirsiniz.
                  </p>
                </div>
                <Link
                  href="/"
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  Yeni Başvuru Yap <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Durum filtre çipleri */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CHIPS.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => setFilter(chip.key)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      filter === chip.key
                        ? 'bg-[#0A1931] text-white border-[#0A1931] shadow-md shadow-[#0A1931]/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#00A8B5]'
                    }`}
                  >
                    {chip.label}
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        filter === chip.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {chip.count}
                    </span>
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-black text-[#0A1931] mb-1.5">
                    {filter === 'all' ? 'Henüz bir başvurunuz yok' : 'Bu duruma ait başvurunuz yok'}
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Aktif ilanlara göz atıp hemen başvurabilirsiniz.
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-5 py-2.5 bg-[#0A1931] hover:bg-[#00A8B5] text-white rounded-xl text-xs font-bold transition"
                  >
                    Aktif İlanları Gör
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((app) => {
                    const meta = STATUS_META[app.status] ?? STATUS_META.pending;
                    return (
                      <div
                        key={app.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0A1931]/5 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-[#0A1931]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-black text-[#0A1931] truncate">
                                {app.job_posts?.title ?? 'İlan kaldırılmış'}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {app.job_posts?.company_details?.company_name ?? 'İşletme bilgisi yok'}
                                {app.job_posts?.district || app.job_posts?.city
                                  ? ` — ${[app.job_posts?.district, app.job_posts?.city].filter(Boolean).join(' / ')}`
                                  : ''}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {formatDate(app.created_at)}
                                </span>
                                {app.job_posts?.field_name && <span>{app.job_posts.field_name}</span>}
                                {app.job_posts?.program_type && (
                                  <span>{programLabelOf(app.job_posts.program_type)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                          <span
                            className={`px-3 py-1.5 rounded-full text-[11px] font-black border flex items-center gap-1.5 ${meta.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                          {app.job_posts?.id && (
                            <Link
                              href={`/ilan/${app.job_posts.id}`}
                              className="px-3 py-1.5 text-[11px] font-bold text-[#00A8B5] hover:bg-[#00A8B5]/5 rounded-lg transition flex items-center gap-1"
                            >
                              İlanı Gör <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Stajyeri.net &mdash; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
