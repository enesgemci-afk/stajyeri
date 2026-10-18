'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PROGRAM_TYPES } from '@/lib/constants';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import {
  
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  ClipboardList,
  Phone,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  LogIn,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

type AppStatus = 'pending' | 'approved' | 'rejected';

interface AppRow {
  id: string;
  status: AppStatus;
  phone: string | null;
  message: string | null;
  created_at: string;
  job_posts?: {
    id: string;
    title: string;
    field_name: string;
    city: string | null;
    district: string | null;
    program_type: string;
  } | null;
  student_profiles?: {
    field_name: string | null;
    education_level: string | null;
    profiles?: { full_name: string; phone: string | null } | null;
  } | null;
}

const STATUS_META: Record<AppStatus, { label: string; badge: string; icon: typeof Clock }> = {
  pending: {
    label: 'İncelemede',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  approved: {
    label: 'Olumlu',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Olumsuz',
    badge: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
};

type StatusFilter = 'all' | AppStatus;

export default function IsverenBasvurularPage() {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<'guest' | 'student' | 'employer'>('guest');
  const [companyName, setCompanyName] = useState('');

  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);

  // Filtreler
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [jobFilter, setJobFilter] = useState('');
  const [search, setSearch] = useState('');

  // Detay genişletme + durum güncelleme
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyApp, setBusyApp] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.user_type === 'student') {
      setAuthState('student');
      setLoading(false);
      return;
    }

    setAuthState('employer');

    const { data: co } = await supabase
      .from('company_details')
      .select('id, company_name')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!co) {
      setLoading(false);
      return;
    }

    setCompanyName(co.company_name);

    const { data: jobList } = await supabase
      .from('job_posts')
      .select('id, title')
      .eq('company_id', co.id)
      .order('created_at', { ascending: false });

    setJobs(jobList ?? []);

    const { data: appList, error } = await supabase
      .from('applications')
      .select(
        `
        id, status, phone, message, created_at,
        job_posts!inner ( id, title, field_name, city, district, program_type ),
        student_profiles!inner (
          field_name, education_level,
          profiles ( full_name, phone )
        )
      `
      )
      .eq('job_posts.company_id', co.id)
      .order('created_at', { ascending: false });

    if (error) {
      setMsg({ type: 'err', text: 'Başvurular yüklenirken hata oluştu.' });
    } else {
      setApps((appList ?? []) as unknown as AppRow[]);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: AppStatus) {
    setBusyApp(id);
    setMsg(null);

    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);

    setBusyApp(null);

    if (error) {
      setMsg({ type: 'err', text: 'Durum güncellenemedi: ' + error.message });
    } else {
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      setMsg({ type: 'ok', text: 'Başvuru durumu güncellendi. Değişiklik öğrencinin paneline anında yansır.' });
      setTimeout(() => setMsg(null), 4000);
    }
  }

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === 'pending').length,
    approved: apps.filter((a) => a.status === 'approved').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  };

  const filtered = apps.filter((a) => {
    const okStatus = statusFilter === 'all' || a.status === statusFilter;
    const okJob = jobFilter === '' || a.job_posts?.id === jobFilter;
    const q = search.trim().toLowerCase();
    const okSearch =
      q === '' ||
      (a.student_profiles?.profiles?.full_name ?? '').toLowerCase().includes(q) ||
      (a.job_posts?.title ?? '').toLowerCase().includes(q);
    return okStatus && okJob && okSearch;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const programLabelOf = (v?: string) =>
    PROGRAM_TYPES.find((p) => p.value === v)?.label ?? v ?? '-';

  const phoneOf = (a: AppRow) => a.phone || a.student_profiles?.profiles?.phone || null;

  const CHIPS: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tümü', count: counts.all },
    { key: 'pending', label: 'İncelemede', count: counts.pending },
    { key: 'approved', label: 'Olumlu', count: counts.approved },
    { key: 'rejected', label: 'Olumsuz', count: counts.rejected },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#00A8B5]/20 border-t-[#00A8B5] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold mt-4">Başvurular yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Header — ortak SiteHeader */}
      <SiteHeader backHref="/isveren/panel" backLabel="İşveren Paneli" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1">
        {authState === 'guest' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-[#0A1931]">Giriş yapmalısınız</p>
            <p className="text-xs text-slate-500 mt-1">Başvuruları görüntülemek için işveren hesabınızla giriş yapın.</p>
            <Link href="/isveren/giris" className="inline-block mt-5 px-6 py-3 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition">
              İşveren Girişi
            </Link>
          </div>
        )}

        {authState === 'student' && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-[#0A1931]">Bu ekran işverenlere özeldir</p>
            <p className="text-xs text-slate-500 mt-1">Kendi başvurularınızı öğrenci panelinden takip edebilirsiniz.</p>
            <div className="flex gap-2 justify-center mt-5">
              <Link href="/panel" className="px-5 py-2.5 bg-[#0A1931] hover:bg-[#00A8B5] text-white text-xs font-extrabold rounded-xl transition">
                Öğrenci Panelim
              </Link>
              <Link href="/basvurularim" className="px-5 py-2.5 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 text-xs font-extrabold rounded-xl transition">
                Başvurularım
              </Link>
            </div>
          </div>
        )}

        {authState === 'employer' && !companyName && (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-[#0A1931]">Firma kaydınız bulunmuyor</p>
            <p className="text-xs text-slate-500 mt-1">İlan verdiğinizde firma kaydınız otomatik oluşur.</p>
            <Link href="/ilan-ver" className="inline-block mt-5 px-6 py-3 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition">
              İlan Ver
            </Link>
          </div>
        )}

        {authState === 'employer' && companyName && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h1 className="text-lg font-black text-[#0A1931] flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#00A8B5]" /> Başvuru Değerlendirme
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {companyName} &bull; {counts.all} toplam başvuru
                </p>
              </div>
              <Link href="/ilan-ver" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition">
                <Briefcase className="w-4 h-4" /> Yeni İlan Ver
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="flex flex-wrap gap-1.5">
                {CHIPS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setStatusFilter(c.key)}
                    className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold transition cursor-pointer ${statusFilter === c.key ? 'bg-[#0A1931] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {c.label} ({c.count})
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 lg:ml-auto lg:flex-1 lg:max-w-md">
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:border-[#00A8B5] transition cursor-pointer"
                >
                  <option value="">Tüm İlanlar</option>
                  {jobs.map((j) => (<option key={j.id} value={j.id}>{j.title}</option>))}
                </select>
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Aday adı veya ilan ara..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                  />
                </div>
              </div>
            </div>

            {msg && (
              <div className={`mb-4 p-3 rounded-xl text-[11px] font-bold flex items-center gap-2 ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {msg.text}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-500 font-bold">
                  {apps.length === 0 ? 'Henüz başvuru almadınız.' : 'Filtrelere uyan başvuru bulunamadı.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((a) => {
                  const expanded = expandedId === a.id;
                  const adayAd = a.student_profiles?.profiles?.full_name ?? 'Öğrenci';
                  const tel = phoneOf(a);
                  const st = STATUS_META[a.status];
                  const StIcon = st.icon;

                  return (
                    <div key={a.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expanded ? null : a.id)}
                        className="w-full text-left p-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#0A1931] text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                            {adayAd.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-[#0A1931] truncate">{adayAd}</p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {a.student_profiles?.field_name ?? '—'} &bull; {a.job_posts?.title ?? 'İlan'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-extrabold ${st.badge}`}>
                            <StIcon className="w-3 h-3" /> {st.label}
                          </span>
                          <span className="text-[11px] text-slate-400 hidden md:block">{formatDate(a.created_at)}</span>
                          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {expanded && (
                        <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                          <div className="grid md:grid-cols-2 gap-5">
                            <div>
                              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-[#00A8B5]" /> Aday Bilgileri
                              </h3>
                              <div className="space-y-2 text-[11px]">
                                <div className="flex justify-between gap-3">
                                  <span className="text-slate-500 font-bold">Ad Soyad</span>
                                  <span className="text-slate-800 font-extrabold text-right">{adayAd}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <span className="text-slate-500 font-bold">Meslek Alanı</span>
                                  <span className="text-slate-800 font-extrabold text-right">{a.student_profiles?.field_name ?? '—'}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <span className="text-slate-500 font-bold">Eğitim Durumu</span>
                                  <span className="text-slate-800 font-extrabold text-right">{a.student_profiles?.education_level ?? '—'}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <span className="text-slate-500 font-bold">Başvuru Tarihi</span>
                                  <span className="text-slate-800 font-extrabold text-right flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {formatDate(a.created_at)}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <span className="text-slate-500 font-bold">Telefon</span>
                                  {tel ? (
                                    <a href={`tel:${tel.replace(/\s/g, '')}`} className="text-[#00A8B5] font-extrabold flex items-center gap-1.5 hover:underline">
                                      <Phone className="w-3 h-3" /> {tel}
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">Belirtilmedi</span>
                                  )}
                                </div>
                              </div>

                              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 mt-5 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#00A8B5]" /> Ön Yazı
                              </h3>
                              {a.message ? (
                                <p className="text-[11px] text-slate-700 bg-white border border-slate-200 rounded-xl p-3.5 leading-relaxed italic">
                                  &ldquo;{a.message}&rdquo;
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">Aday ön yazı bırakmamış.</p>
                              )}
                            </div>

                            <div>
                              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-[#FF6B00]" /> Başvurulan İlan
                              </h3>
                              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-[11px]">
                                <p className="font-black text-[#0A1931] text-xs">{a.job_posts?.title ?? 'İlan'}</p>
                                <div className="flex justify-between gap-3">
                                  <span className="text-slate-500 font-bold">Alan</span>
                                  <span className="text-slate-800 font-extrabold text-right">{a.job_posts?.field_name ?? '—'}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <span className="text-slate-500 font-bold">Program</span>
                                  <span className="text-slate-800 font-extrabold text-right">{programLabelOf(a.job_posts?.program_type)}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <span className="text-slate-500 font-bold">Konum</span>
                                  <span className="text-slate-800 font-extrabold text-right flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {[a.job_posts?.district, a.job_posts?.city].filter(Boolean).join(', ') || '—'}
                                  </span>
                                </div>
                                <Link href={`/ilan/${a.job_posts?.id}`} className="inline-flex items-center gap-1.5 text-[#00A8B5] font-extrabold hover:underline mt-1">
                                  <ExternalLink className="w-3.5 h-3.5" /> İlan Sayfasını Aç
                                </Link>
                              </div>

                              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 mt-5">Başvuru Durumu</h3>
                              <div className="flex gap-2">
                                {(Object.keys(STATUS_META) as AppStatus[]).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => updateStatus(a.id, s)}
                                    disabled={busyApp === a.id || a.status === s}
                                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-default ${
                                      a.status === s
                                        ? STATUS_META[s].badge + ' border'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0A1931]'
                                    } ${busyApp === a.id ? 'opacity-50' : ''}`}
                                  >
                                    {s === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                    {s === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {s === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                                    {STATUS_META[s].label}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2">Durum değişikliği öğrencinin paneline anında yansır.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[11px] text-slate-400">
        &copy; 2026 Stajyeri.net &bull; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
