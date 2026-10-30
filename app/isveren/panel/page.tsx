'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import StudentPool from '@/components/StudentPool';

import {
  Building2,
  LogOut,
  PlusCircle,
  Briefcase,
  ClipboardList,
  Clock,
  CheckCircle2,
  MapPin,
  Users,
  Power,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  Lock,
  ShieldCheck,
} from 'lucide-react';

type AppStatus = 'pending' | 'approved' | 'rejected';

interface JobRow {
  id: string;
  title: string;
  field_name: string;
  city: string | null;
  district: string | null;
  quota: number | null;
  is_active: boolean;
  created_at: string;
}

interface IncomingAppRow {
  id: string;
  status: AppStatus;
  guardian_status?: string | null;
  birth_year?: number | null;
  phone: string | null;
  message: string | null;
  created_at: string;
  job_posts?: { id: string; title: string; field_name?: string | null; city?: string | null } | null;
  student_profiles?: {
    profile_id?: string | null;
    field_name: string | null;
    profiles?: { full_name: string } | null;
  } | null;
}

/** Eşleşme skoru: alan uyumu (60) + CV şehir uyumu (40) */
function matchPct(a: IncomingAppRow, cityMap: Record<string, string | undefined>): number {
  const fieldOk = !!a.student_profiles?.field_name && a.student_profiles.field_name === a.job_posts?.field_name;
  const city = a.student_profiles?.profile_id ? cityMap[a.student_profiles.profile_id] : undefined;
  const cityOk = !!city && !!a.job_posts?.city && city === a.job_posts.city;
  return (fieldOk ? 60 : 25) + (cityOk ? 40 : 15);
}

const STATUS_OPTIONS: { value: AppStatus; label: string }[] = [
  { value: 'pending', label: 'İncelemede' },
  { value: 'approved', label: 'Olumlu' },
  { value: 'rejected', label: 'Olumsuz' },
];

const STATUS_BADGE: Record<AppStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function IsverenPanelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<'guest' | 'employer' | 'student'>('guest');
  const [fullName, setFullName] = useState('');

  // Firma bilgisi
  const [company, setCompany] = useState<{
    id: string;
    company_name: string;
    city: string | null;
    district: string | null;
  } | null>(null);

  // Veriler
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [apps, setApps] = useState<IncomingAppRow[]>([]);

  // Sekme
  const [tab, setTab] = useState<'jobs' | 'apps' | 'pool'>('jobs');

  // Güncelleme geri bildirimi
  const [busyJob, setBusyJob] = useState<string | null>(null);
  const [busyApp, setBusyApp] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  // GUVEN_KATMANI — işletmenin güven skoru (işveren kendi rozetini görür)
  const [trust, setTrust] = useState<{ trust_score: number; rating_count: number; badge: string } | null>(null);
  // İLERİ PAKET — yanıt hızı + eşleşme için CV şehir haritası
  const [respTime, setRespTime] = useState<{ avg_hours: number; sample_count: number } | null>(null);
  const [cityMap, setCityMap] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
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
      .select('full_name, user_type')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.user_type === 'student') {
      setFullName(profile?.full_name ?? '');
      setAuthState('student');
      setLoading(false);
      return;
    }

    setAuthState('employer');
    setFullName(profile?.full_name ?? '');

    const { data: co } = await supabase
      .from('company_details')
      .select('id, company_name, city, district')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (co) {
      setCompany(co);

      const { data: jobList } = await supabase
        .from('job_posts')
        .select('id, title, field_name, city, district, quota, is_active, created_at')
        .eq('company_id', co.id)
        .order('created_at', { ascending: false });

      if (jobList) setJobs(jobList as JobRow[]);

      // VELI_ONAY_ENTEGRASYON — veli kolonlarıyla çek; SQL çalıştırılmadıysa klasik sorguya geri dön
      let appList: IncomingAppRow[] | null = null;
      let appErrMsg = '';
      const primary = await supabase
        .from('applications')
        .select(
          `
          id, status, birth_year, guardian_status, phone, message, created_at,
          job_posts!inner ( id, title, company_id, field_name, city ),
          student_profiles!inner (
            profile_id,
            field_name,
            profiles ( full_name )
          )
        `
        )
        .eq('job_posts.company_id', co.id)
        .order('created_at', { ascending: false });

      if (primary.error && /birth_year|guardian_status/.test(primary.error.message)) {
        const fallback = await supabase
          .from('applications')
          .select(
            `
            id, status, phone, message, created_at,
            job_posts!inner ( id, title, company_id, field_name, city ),
            student_profiles!inner (
              profile_id,
              field_name,
              profiles ( full_name )
            )
          `
          )
          .eq('job_posts.company_id', co.id)
          .order('created_at', { ascending: false });
        appErrMsg = fallback.error?.message ?? '';
        appList = (fallback.data ?? null) as unknown as IncomingAppRow[] | null;
      } else {
        appErrMsg = primary.error?.message ?? '';
        appList = (primary.data ?? null) as unknown as IncomingAppRow[] | null;
      }

      if (appList) setApps(appList);
      if (appErrMsg) console.error('Başvuru listesi hatası:', appErrMsg);

      // GUVEN_KATMANI v2 — işletmenin toplu güven skoru (RPC; hata olursa sessizce atla)
      const { data: trustRows } = await supabase
        .rpc('get_company_trust_scores', { p_company_id: co.id });
      const trustRow = (trustRows as { trust_score: number; rating_count: number; badge: string }[] | null)?.[0];
      if (trustRow) setTrust(trustRow);

      // İLERİ PAKET — ortalama yanıt süresi (SQL çalıştırılmadıysa sessizce atlanır)
      try {
        const { data: rt } = await supabase.rpc('get_company_response_time', { p_company_id: co.id });
        const row = (rt as { avg_hours: number; sample_count: number }[] | null)?.[0];
        if (row && row.sample_count > 0) setRespTime(row);
      } catch {
        /* kolon/fonksiyon yoksa kritik değil */
      }

      // İLERİ PAKET — eşleşme skoru için öğrenci CV şehirleri
      try {
        const { data: cvs } = await supabase.from('student_cvs').select('profile_id, city').limit(500);
        if (cvs) {
          const m: Record<string, string | undefined> = {};
          for (const c of cvs as { profile_id: string; city: string | null }[]) {
            if (c.profile_id && c.city) m[c.profile_id] = c.city;
          }
          setCityMap(m);
        }
      } catch {
        /* tablo yoksa kritik değil */
      }
    }

      setLoading(false);
    }

    load();
  }, []);

  const toggleJob = async (job: JobRow) => {
    setBusyJob(job.id);
    setActionMsg(null);
    try {
      const { error } = await supabase
        .from('job_posts')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);
      if (error) throw error;
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_active: !j.is_active } : j))
      );
    } catch (err: unknown) {
      setActionMsg({ type: 'err', text: err instanceof Error && err.message ? err.message : 'İlan güncellenemedi.' });
    } finally {
      setBusyJob(null);
    }
  };

  const updateAppStatus = async (appId: string, status: AppStatus) => {
    setBusyApp(appId);
    setActionMsg(null);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', appId);
      if (error) throw error;
      setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
      setActionMsg({ type: 'ok', text: 'Başvuru durumu güncellendi.' });
    } catch (err: unknown) {
      setActionMsg({ type: 'err', text: err instanceof Error && err.message ? err.message : 'Durum güncellenemedi.' });
    } finally {
      setBusyApp(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const counts = {
    activeJobs: jobs.filter((j) => j.is_active).length,
    totalJobs: jobs.length,
    totalApps: apps.length,
    pendingApps: apps.filter((a) => a.status === 'pending').length,
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === 'guest') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0A1931]">İşveren Paneli</h1>
          <p className="text-xs text-slate-500 mt-2">Panelinizi görmek için işveren girişi yapın.</p>
          <div className="mt-6 space-y-2">
            <Link href="/isveren/giris" className="block w-full py-3 bg-[#0A1931] hover:bg-[#FF6B00] text-white font-extrabold rounded-xl text-xs transition">
              İşveren Girişi
            </Link>
            <Link href="/isveren/kayit" className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition">
              İşletme Kaydı Oluştur
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (authState === 'student') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0A1931]">Öğrenci Hesabıyla Giriş Yaptınız</h1>
          <p className="text-xs text-slate-500 mt-2">İşveren paneli işletme hesapları içindir.</p>
          <Link href="/panel" className="inline-block mt-6 px-6 py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white font-extrabold rounded-xl text-xs transition">
            Öğrenci Paneline Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader
        right={
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs font-bold text-slate-500">{company?.company_name ?? fullName}</span>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1.5 transition cursor-pointer">
              <LogOut className="w-4 h-4" /> Çıkış
            </button>
          </div>
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <section className="bg-gradient-to-br from-[#0A1931] via-[#0D2244] to-[#0A1931] text-white rounded-3xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-orange-300 text-[10px] font-bold mb-4">
            <Building2 className="w-3 h-3" /> İŞVEREN PANELİ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {company ? company.company_name : `Hoş geldiniz${fullName ? `, ${fullName}` : ''}`}
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-xl">
            {company
              ? `${counts.activeJobs} aktif ilanınız var, ${counts.pendingApps} başvuru yanıt bekliyor.`
              : 'Başlamak için ilk ilanınızı oluşturun — stajyer arayan binlerce öğrenciye ulaşın.'}
          </p>
          {company && (
            <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {[company.district, company.city].filter(Boolean).join(', ') || 'Konum belirtilmedi'}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/ilan-ver" className="px-5 py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#FF6B00]/25">
              <PlusCircle className="w-4 h-4" /> Yeni İlan Ver
            </Link>
            {company && (
              <button onClick={() => setTab('apps')} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer">
                <ClipboardList className="w-4 h-4" /> Gelen Başvurular ({counts.totalApps})
              </button>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: Power, label: 'Aktif İlan', value: counts.activeJobs, cls: 'bg-emerald-50 text-emerald-600' },
            { icon: Briefcase, label: 'Toplam İlan', value: counts.totalJobs, cls: 'bg-slate-100 text-[#0A1931]' },
            { icon: ClipboardList, label: 'Toplam Başvuru', value: counts.totalApps, cls: 'bg-slate-100 text-[#0A1931]' },
            { icon: Clock, label: 'Bekleyen Başvuru', value: counts.pendingApps, cls: 'bg-amber-50 text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.cls}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-[#0A1931]">{s.value}</p>
                <p className="text-[11px] text-slate-500 font-bold">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {company && (
          <section className="mt-6 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200/60 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#0A1931]">Güven Skorunuz — Güvenli İşyeri Rozeti</p>
                {trust ? (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {trust.trust_score}/5 puan · {trust.rating_count} anonim stajyer değerlendirmesi
                    {trust.badge !== 'none' && ' · Rozetiniz ilanlarınızda öğrencilere görünür'}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Henüz değerlendirme yok. Stajyerleriniz stajı tamamladığında usta öğreticisini ve işyerünü anonim
                    olarak puanlar; 3 değerlendirme toplayınca rozetiniz ilanlarınızda otomatik görünür.
                  </p>
                )}
              </div>
              {trust && trust.badge !== 'none' && (
                <span
                  className={`px-3 py-1.5 rounded-full text-[11px] font-black border whitespace-nowrap ${
                    trust.badge === 'gold'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : trust.badge === 'silver'
                        ? 'bg-slate-100 text-slate-600 border-slate-300'
                        : 'bg-orange-50 text-orange-700 border-orange-300'
                  }`}
                >
                  {trust.badge === 'gold' ? '🏆 Altın' : trust.badge === 'silver' ? '🥈 Gümüş' : '🥉 Bronz'} Rozet
                </span>
              )}
            </div>
          </section>
        )}

        {company ? (
          <>
            <section className="flex gap-2 mt-6 bg-white border border-slate-200 rounded-2xl p-1.5 w-full sm:w-auto sm:inline-flex">
              <button onClick={() => setTab('jobs')} className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${tab === 'jobs' ? 'bg-[#0A1931] text-white' : 'text-slate-500 hover:text-[#0A1931]'}`}>
                İlanlarım ({counts.totalJobs})
              </button>
              <button onClick={() => setTab('apps')} className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${tab === 'apps' ? 'bg-[#0A1931] text-white' : 'text-slate-500 hover:text-[#0A1931]'}`}>
                Gelen Başvurular ({counts.totalApps})
              </button>
              <button onClick={() => setTab('pool')} className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${tab === 'pool' ? 'bg-[#0A1931] text-white' : 'text-slate-500 hover:text-[#0A1931]'}`}>
                <Users className="w-3.5 h-3.5" /> Stajyer Havuzu
              </button>
            </section>

            {tab === 'jobs' && (
              <section className="mt-4 space-y-3">
                {jobs.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold">Henüz ilanınız yok.</p>
                    <Link href="/ilan-ver" className="inline-block mt-4 px-5 py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition">
                      İlk İlanınızı Verin
                    </Link>
                  </div>
                ) : (
                  jobs.map((j) => (
                    <div key={j.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/ilan/${j.id}`} className="text-xs font-black text-[#0A1931] hover:text-[#00A8B5] transition">
                            {j.title}
                          </Link>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${j.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {j.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {j.field_name}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {[j.district, j.city].filter(Boolean).join(', ') || '—'}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Kontenjan: {j.quota ?? '—'}</span>
                          <span>{formatDate(j.created_at)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/ilan-ver?edit=${j.id}`}
                          className="px-4 py-2 rounded-xl text-[11px] font-extrabold transition flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 hover:border-[#00A8B5] hover:text-[#00A8B5] whitespace-nowrap"
                        >
                          ✏️ Düzenle
                        </Link>
                        <button
                          onClick={() => toggleJob(j)}
                          disabled={busyJob === j.id}
                          className={`px-4 py-2 rounded-xl text-[11px] font-extrabold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap ${j.is_active ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {busyJob === j.id ? 'Güncelleniyor...' : j.is_active ? 'Pasife Al' : 'Aktifleştir'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}

            {tab === 'pool' && <StudentPool />}

        {tab === 'apps' && (
              <section className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] text-slate-400 font-bold">Başvuruları aday detayıyla incelemek için:</p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-extrabold">
                      <CheckCircle2 className="w-3 h-3" /> KVKK uyumlu açık rızayla gelir ✅
                    </span>
                    {respTime && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-700 rounded-full text-[10px] font-extrabold"
                        title={`${respTime.sample_count} sonuçlandırılmış başvurunun ortalaması`}
                      >
                        ⚡ Ort. {respTime.avg_hours >= 24
                          ? `${Math.round(respTime.avg_hours / 24)} günde dönüyorsunuz`
                          : `${respTime.avg_hours} saatte dönüyorsunuz`}
                      </span>
                    )}
                  </div>
                  <Link href="/isveren/basvurular" className="text-[11px] font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1 whitespace-nowrap">
                    Başvuru Değerlendirme Ekranı <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {actionMsg && (
                  <div className={`p-3 rounded-xl text-[11px] font-bold flex items-center gap-2 ${actionMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {actionMsg.text}
                  </div>
                )}

                {apps.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold">Henüz başvuru almadınız.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Aktif ilanlarınız olduğunda öğrenci başvuruları burada görünecek.</p>
                  </div>
                ) : (
                  apps.map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-[#00A8B5]" />
                            {a.student_profiles?.profiles?.full_name ?? 'Öğrenci'}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                matchPct(a, cityMap) >= 85
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : matchPct(a, cityMap) >= 60
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                              title="Alan ve şehir uyumuna göre hesaplanan eşleşme skoru"
                            >
                              Eşleşme %{matchPct(a, cityMap)}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {a.student_profiles?.field_name ?? '—'} • <span className="font-bold">{a.job_posts?.title ?? 'İlan'}</span> • {formatDate(a.created_at)}
                          </p>
                          {a.phone && <p className="text-[11px] text-slate-500 mt-0.5">Tel: {a.phone}</p>}
                          {a.guardian_status === 'pending' && (
                            <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                              <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                                18 yaş altı başvuru — veli muvafakati bekleniyor (3308 sayılı Kanun).
                                Veli onay bağlantısını onaylayana kadar bu başvuruyu sonuçlandıramazsınız.
                              </p>
                            </div>
                          )}
                          {a.message && (
                            <p className="text-[11px] text-slate-600 mt-2 bg-slate-50 rounded-xl p-3 italic">&ldquo;{a.message}&rdquo;</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {a.guardian_status === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Veli Onayı Bekleniyor
                            </span>
                          )}
                          <select
                            value={a.status}
                            onChange={(e) => updateAppStatus(a.id, e.target.value as AppStatus)}
                            disabled={busyApp === a.id || a.guardian_status === 'pending'}
                            title={a.guardian_status === 'pending' ? 'Veli onayı verilene kadar başvuru kilitlidir' : undefined}
                            className={`px-3 py-2 rounded-xl border text-[11px] font-extrabold focus:outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${STATUS_BADGE[a.status]}`}
                          >
                            {STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </>
        ) : (
          <section className="mt-6 bg-white rounded-3xl border border-slate-200 p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 font-bold">Firma kaydınız bulunmuyor.</p>
            <p className="text-[11px] text-slate-400 mt-1">İlan verme sayfasını kullandığınızda firma kaydınız otomatik oluşturulur.</p>
            <Link href="/ilan-ver" className="inline-block mt-4 px-5 py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition">
              İlan Ver ve Başla
            </Link>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[11px] text-slate-400">
        &copy; 2026 Stajyeri.net &bull; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
