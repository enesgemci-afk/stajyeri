'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PROGRAM_TYPES } from '@/lib/constants';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import {
  Building2,
  LogIn,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  ShieldAlert,
  MessageCircle,
  Star,
  X,
} from 'lucide-react';

type AppStatus = 'pending' | 'approved' | 'rejected';

interface ApplicationRow {
  id: string;
  status: AppStatus;
  guardian_status?: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
  job_posts?: {
    id: string;
    company_id?: string | null;
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

// VELI_ONAY_ENTEGRASYON — veli onay bağlantısı (SSR'da window yoksa sabit origin)
const consentLink = (token: string) =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/veli-onay/${token}`
    : `https://stajyeri.vercel.app/veli-onay/${token}`;

// GUVEN_KATMANI — puanlama kriterleri (trainer_ratings kolonlarıyla birebir)
const RATING_CRITERIA: {
  key: 'education_quality' | 'safety' | 'respect' | 'wage_order';
  label: string;
  hint: string;
}[] = [
  { key: 'education_quality', label: 'Eğitim Kalitesi', hint: 'Usta öğreticiden gerçekte öğrendin mi?' },
  { key: 'safety', label: 'İş Güvenliği', hint: 'Ekipman, koruyucu malzeme, güvenli ortam' },
  { key: 'respect', label: 'Saygı / İletişim', hint: 'Nazik, koruyucu ve saygılı bir ortam' },
  { key: 'wage_order', label: 'Ücret Düzeni', hint: "3308'e uygun ve düzenli ödeme" },
];

// GUVEN_KATMANI — yıldız seçici satırı (1-5)
function StarRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-black text-slate-700">{label}</p>
        <p className="text-[10px] text-slate-400">{hint}</p>
      </div>
      <div className="flex gap-0.5 flex-shrink-0">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} ${n} yıldız`}
            className="cursor-pointer p-0.5"
          >
            <Star className={`w-5 h-5 ${n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BasvurularimPage() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [errorMsg, setErrorMsg] = useState('');
  // VELI_ONAY_ENTEGRASYON — başvuruId -> bekleyen veli onay token'ı (tekrar gönderme için)
  const [consentMap, setConsentMap] = useState<Record<string, string>>({});
  // GUVEN_KATMANI — usta öğretici/işyeri puanlama state'leri
  const [studentId, setStudentId] = useState<string | null>(null);
  const [ratedMap, setRatedMap] = useState<Record<string, boolean>>({});
  const [ratingAppId, setRatingAppId] = useState<string | null>(null);
  const [rateScores, setRateScores] = useState<Record<string, number>>({});
  const [rateTrainer, setRateTrainer] = useState('');
  const [rateComment, setRateComment] = useState('');
  const [rateRecommend, setRateRecommend] = useState(true);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingError, setRatingError] = useState('');

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

      // GUVEN_KATMANI — puanlama kaydı için öğrenci profil id'si
      setStudentId(sp.id);

      // Başvuruları ilan ve işletme bilgisiyle çek (veli kolonu yoksa klasik sorguya geri dön)
      let apps: ApplicationRow[] | null = null;
      let appErr = '';
      const primary = await supabase
        .from('applications')
        .select(
          `
          id, status, guardian_status, phone, message, created_at,
          job_posts (
            id, company_id, title, city, district, program_type, field_name,
            company_details ( company_name )
          )
        `
        )
        .eq('student_id', sp.id)
        .order('created_at', { ascending: false });

      if (primary.error && /guardian_status/.test(primary.error.message)) {
        const fallback = await supabase
          .from('applications')
          .select(
            `
            id, status, phone, message, created_at,
            job_posts (
              id, company_id, title, city, district, program_type, field_name,
              company_details ( company_name )
            )
          `
          )
          .eq('student_id', sp.id)
          .order('created_at', { ascending: false });
        appErr = fallback.error?.message ?? '';
        apps = (fallback.data ?? null) as unknown as ApplicationRow[] | null;
      } else {
        appErr = primary.error?.message ?? '';
        apps = (primary.data ?? null) as unknown as ApplicationRow[] | null;
      }

      if (appErr) {
        setErrorMsg('Başvurular yüklenirken bir hata oluştu.');
      } else if (apps) {
        setApplications(apps);
      }

      // VELI_ONAY_ENTEGRASYON — bekleyen veli onay bağlantılarını çek (tekrar gönderme için)
      const { data: consents } = await supabase
        .from('guardian_consents')
        .select('application_id, consent_token')
        .eq('student_id', sp.id)
        .eq('status', 'pending');

      if (consents) {
        const map: Record<string, string> = {};
        consents.forEach((c: { application_id: string; consent_token: string }) => {
          map[c.application_id] = c.consent_token;
        });
        setConsentMap(map);
      }

      // GUVEN_KATMANI — puanlanmış başvuruları çek (tablo yoksa sessizce atla)
      const { data: rated } = await supabase
        .from('trainer_ratings')
        .select('application_id')
        .eq('student_id', sp.id)
        .limit(200);
      if (rated) {
        const rm: Record<string, boolean> = {};
        rated.forEach((r: { application_id: string }) => {
          rm[r.application_id] = true;
        });
        setRatedMap(rm);
      }

      setLoading(false);
    }

    load();
  }, []);

  // GUVEN_KATMANI — puanlama formunu aç (alanları sıfırla)
  const openRating = (appId: string) => {
    setRatingAppId(appId);
    setRateScores({});
    setRateTrainer('');
    setRateComment('');
    setRateRecommend(true);
    setRatingError('');
  };

  // GUVEN_KATMANI — anonim usta öğretici/işyeri değerlendirmesini kaydet
  const submitRating = async (e: FormEvent, app: ApplicationRow) => {
    e.preventDefault();
    setRatingError('');
    const companyId = app.job_posts?.company_id ?? null;
    if (!studentId || !companyId) {
      setRatingError('Değerlendirme şu anda kaydedilemiyor (işletme bilgisi eksik).');
      return;
    }
    const incomplete = RATING_CRITERIA.some((c) => {
      const v = rateScores[c.key];
      return !(typeof v === 'number' && v >= 1 && v <= 5);
    });
    if (incomplete) {
      setRatingError('Lütfen 4 kriterin tamamına yıldız verin.');
      return;
    }
    setRatingBusy(true);
    const { error } = await supabase.from('trainer_ratings').insert({
      application_id: app.id,
      student_id: studentId,
      company_id: companyId,
      trainer_name: rateTrainer.trim() || null,
      education_quality: rateScores.education_quality,
      safety: rateScores.safety,
      respect: rateScores.respect,
      wage_order: rateScores.wage_order,
      comment: rateComment.trim() || null,
      would_recommend: rateRecommend,
    });
    setRatingBusy(false);
    if (error) {
      // Aynı başvuruya ikinci puan (unique index) — kullanıcıya başarı gibi göster
      if (/duplicate|unique/i.test(error.message)) {
        setRatedMap((m) => ({ ...m, [app.id]: true }));
        setRatingAppId(null);
        return;
      }
      setRatingError(
        /row-level security|does not exist|permission/i.test(error.message)
          ? 'Puanlama kaydedilemedi (güvenlik katmanı güncellemesi gerekebilir).'
          : 'Değerlendirme kaydedilemedi, lütfen tekrar deneyin.'
      );
      return;
    }
    setRatedMap((m) => ({ ...m, [app.id]: true }));
    setRatingAppId(null);
  };

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
                      <div key={app.id} className="w-full">
                      <div
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
                              {app.guardian_status === 'pending' && (
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> Veli onayı bekleniyor
                                  </span>
                                  {consentMap[app.id] && (
                                    <a
                                      href={`https://wa.me/?text=${encodeURIComponent(
                                        `Staj başvurum için veli onayınız gerekiyor. Onaylamak için: ${consentLink(consentMap[app.id])}`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 transition"
                                    >
                                      <MessageCircle className="w-3 h-3" /> Onayı Tekrar Gönder
                                    </a>
                                  )}
                                </div>
                              )}
                              {app.guardian_status === 'approved' && (
                                <span className="mt-2 inline-flex px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Veli onayı verildi
                                </span>
                              )}
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
                          {app.status === 'approved' && !ratedMap[app.id] && (
                            <button
                              type="button"
                              onClick={() => openRating(app.id)}
                              className="px-3 py-1.5 rounded-full text-[11px] font-black bg-[#00A8B5] hover:bg-[#008e9a] text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                            >
                              <Star className="w-3.5 h-3.5" /> Ustamı Puanla
                            </button>
                          )}
                          {app.status === 'approved' && ratedMap[app.id] && (
                            <span className="px-3 py-1.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Değerlendirildi
                            </span>
                          )}
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

                      {/* GUVEN_KATMANI — anonim usta öğretici/işyeri değerlendirme formu */}
                      {ratingAppId === app.id && (
                        <form
                          onSubmit={(e) => submitRating(e, app)}
                          className="mt-2 bg-white rounded-2xl border-2 border-[#00A8B5]/30 shadow-sm p-5 space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Ustamı Puanla
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {app.job_posts?.company_details?.company_name ?? 'İşletme'} · Değerlendirmen
                                anonimdir; işletme bireysel puanını asla görmez, yalnızca genel skor birikir.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRatingAppId(null)}
                              className="text-slate-400 hover:text-slate-600 transition cursor-pointer flex-shrink-0"
                              aria-label="Puanlamayı kapat"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            {RATING_CRITERIA.map((c) => (
                              <StarRow
                                key={c.key}
                                label={c.label}
                                hint={c.hint}
                                value={rateScores[c.key] ?? 0}
                                onChange={(n) => setRateScores((s) => ({ ...s, [c.key]: n }))}
                              />
                            ))}
                          </div>

                          {/* GUVEN_KATMANI — form devam: usta adı, tavsiye, yorum, onay */}
                          <div>
                            <label className="block text-[11px] font-black text-slate-700 mb-1">
                              Usta Öğreticinin Adı{' '}
                              <span className="text-slate-400 font-medium">(opsiyonel — sadece bu staj için)</span>
                            </label>
                            <input
                              type="text"
                              value={rateTrainer}
                              onChange={(e) => setRateTrainer(e.target.value)}
                              placeholder="Örn: Mehmet Usta"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                            />
                          </div>

                          <label className="flex items-center gap-2.5 cursor-pointer select-none bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-200">
                            <input
                              type="checkbox"
                              checked={rateRecommend}
                              onChange={(e) => setRateRecommend(e.target.checked)}
                              className="w-4 h-4 accent-[#00A8B5] cursor-pointer flex-shrink-0"
                            />
                            <span className="text-[11px] font-bold text-slate-700">
                              👍 Bu işyerunu diğer stajyerlere tavsiye ederim
                            </span>
                          </label>

                          <div>
                            <label className="block text-[11px] font-black text-slate-700 mb-1">
                              Deneyimini Yaz{' '}
                              <span className="text-slate-400 font-medium">(opsiyonel, tamamen anonim)</span>
                            </label>
                            <textarea
                              value={rateComment}
                              onChange={(e) => setRateComment(e.target.value)}
                              rows={3}
                              placeholder="Neler öğrendin? Ortam nasıldı? Adın-soyadın asla işletmeye gösterilmez."
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition resize-none"
                            />
                          </div>

                          {ratingError && (
                            <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                              {ratingError}
                            </p>
                          )}

                          <div className="flex items-center gap-2.5 pt-1">
                            <button
                              type="submit"
                              disabled={ratingBusy}
                              className="px-5 py-2.5 bg-[#00A8B5] hover:bg-[#008e9a] disabled:opacity-60 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-2"
                            >
                              <Star className="w-4 h-4" /> {ratingBusy ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRatingAppId(null)}
                              disabled={ratingBusy}
                              className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-60"
                            >
                              Vazgeç
                            </button>
                          </div>
                        </form>
                      )}
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
