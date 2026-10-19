'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, TURKEY_CITIES, PROGRAM_TYPES } from '@/lib/constants';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import {
  Heart,
  Bell,
  MapPin,
  Wrench,
  Building2,
  LogIn,
  Trash2,
  ChevronRight,
  Clock,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';

interface JobCard {
  id: string;
  title: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  created_at: string;
  company_details?: { company_name?: string } | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function programLabelOf(v: string) {
  return PROGRAM_TYPES.find((p) => p.value === v)?.label ?? v;
}

export default function FavorilerimPage() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  const [favs, setFavs] = useState<JobCard[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // İş alarmı
  const [alertField, setAlertField] = useState('');
  const [alertCity, setAlertCity] = useState('');
  const [alertSaved, setAlertSaved] = useState(false);
  const [savingAlert, setSavingAlert] = useState(false);
  const [alertJobs, setAlertJobs] = useState<JobCard[]>([]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);

    const { data: sp } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', session.user.id)
      .maybeSingle();

    if (!sp) {
      setLoading(false);
      return;
    }
    setStudentId(sp.id);

    // Favori ilanlar (tablo henüz yoksa sessizce boş kalır)
    const { data: favRows } = await supabase
      .from('favorites')
      .select(
        `job_id, created_at,
         job_posts ( id, title, field_name, program_type, city, district, created_at, company_details ( company_name ) )`
      )
      .eq('student_id', sp.id)
      .order('created_at', { ascending: false });

    if (favRows) {
      setFavs(
        favRows
          .map((r: Record<string, unknown>) => r.job_posts as unknown as JobCard)
          .filter(Boolean)
      );
    }

    // Kayıtlı alarm
    const { data: alert } = await supabase
      .from('job_alerts')
      .select('field_name, city')
      .eq('student_id', sp.id)
      .maybeSingle();

    if (alert) {
      setAlertField(alert.field_name ?? '');
      setAlertCity(alert.city ?? '');
      setAlertSaved(true);
      loadAlertJobs(alert.field_name ?? '', alert.city ?? '');
    }

    setLoading(false);
  }

  async function loadAlertJobs(field: string, city: string) {
    let q = supabase
      .from('job_posts')
      .select(
        `id, title, field_name, program_type, city, district, created_at, company_details ( company_name )`
      )
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - 30 * DAY_MS).toISOString())
      .order('created_at', { ascending: false })
      .limit(9);

    if (field) q = q.eq('field_name', field);
    if (city) q = q.eq('city', city);

    const { data } = await q;
    if (data) setAlertJobs(data as unknown as JobCard[]);
  }

  async function saveAlert() {
    if (!studentId) return;
    setSavingAlert(true);
    const { error } = await supabase.from('job_alerts').upsert({
      student_id: studentId,
      field_name: alertField || null,
      city: alertCity || null,
    });
    setSavingAlert(false);
    if (!error) {
      setAlertSaved(true);
      loadAlertJobs(alertField, alertCity);
    }
  }

  async function removeFav(jobId: string) {
    if (!studentId) return;
    setBusyId(jobId);
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('student_id', studentId)
      .eq('job_id', jobId);
    if (!error) setFavs((f) => f.filter((j) => j.id !== jobId));
    setBusyId(null);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader />

      <main className="max-w-5xl w-full mx-auto px-4 py-10 flex-1">
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500">Yükleniyor...</div>
        ) : !isLoggedIn ? (
          <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl border border-slate-200 shadow-lg p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-black text-[#0A1931] mb-2">Öğrenci girişi yapın</h1>
            <p className="text-xs text-slate-500 mb-6">
              Favori ilanlarınızı görmek ve iş alarmı kurmak için giriş yapmalısınız.
            </p>
            <Link
              href="/ogrenci/giris"
              className="inline-block w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition"
            >
              Öğrenci Girişi Yap
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Favoriler */}
            <section>
              <h1 className="text-lg font-black text-[#0A1931] flex items-center gap-2 mb-1">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Favori İlanlarım
              </h1>
              <p className="text-xs text-slate-500 mb-5">
                İlan detay sayfalarındaki kalp ikonuyla eklediğiniz ilanlar burada listelenir.
              </p>

              {favs.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
                  <Heart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">Henüz favori ilanınız yok.</p>
                  <Link href="/" className="text-xs font-bold text-[#00A8B5] hover:underline mt-1 inline-block">
                    İlanları keşfetmek için tıklayın
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-[#0A1931] truncate">{job.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {job.company_details?.company_name || 'Onaylı İşletme'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFav(job.id)}
                          disabled={busyId === job.id}
                          title="Favorilerden çıkar"
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <Briefcase className="w-3 h-3 text-[#00A8B5]" /> {job.field_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {job.city} / {job.district}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <Link
                        href={`/ilan/${job.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#00A8B5] hover:underline"
                      >
                        İlanı Gör <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* __PART3__ */}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Stajyeri.net &mdash; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}