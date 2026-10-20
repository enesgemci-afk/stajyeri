'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { PROGRAM_TYPES } from '@/lib/constants';
import { ONYAZI_EXAMPLES } from '@/lib/onyaziExamples';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import {
  Briefcase,
  MapPin,
  Building2,
  CheckCircle2,
  
  Users,
  Utensils,
  Bus,
  Send,
  AlertCircle,
  Heart,
  ShieldCheck,
  LogIn,
  ClipboardList,
  Phone,
  FileText,
  Wrench,
  Calendar,
  MessageCircle,
  Share2,
  Link2,
  Check,
} from 'lucide-react';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  quota: number;
  has_lunch: boolean;
  has_shuttle: boolean;
  created_at: string;
  company_details?: {
    company_name: string;
    has_master_trainer: boolean;
  };
}

// Benzer ilanlar kartı (Paket 2): detay nesnesinin hafif hali
interface SimilarJob {
  id: string;
  title: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  created_at: string;
  company_details?: { company_name?: string } | null;
}

export default function IlanDetayPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Oturum ve profil bilgileri
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentField, setStudentField] = useState<string | null>(null);
  const [studentEducation, setStudentEducation] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [kvkkOk, setKvkkOk] = useState(false);

  // Benzer ilanlar (Paket 2) ve paylaşım
  const [similarJobs, setSimilarJobs] = useState<SimilarJob[]>([]);
  const [copied, setCopied] = useState(false);

  const programLabel =
    PROGRAM_TYPES.find((p) => p.value === job?.program_type)?.label ?? job?.program_type;

  useEffect(() => {
    async function init() {
      if (!jobId) return;

      // 1. İlan detayını çek
      const { data, error } = await supabase
        .from('job_posts')
        .select(
          `*,
          company_details (
            company_name,
            has_master_trainer
          )`
        )
        .eq('id', jobId)
        .single();

      if (!error && data) {
        setJob(data);

        // Benzer ilanlar (Paket 2): önce aynı meslek alanı, yetmezse aynı şehir
        const similarSelect =
          'id, title, field_name, program_type, city, district, created_at, company_details ( company_name )';

        const { data: byField } = await supabase
          .from('job_posts')
          .select(similarSelect)
          .eq('is_active', true)
          .eq('field_name', data.field_name)
          .neq('id', jobId)
          .order('created_at', { ascending: false })
          .limit(6);

        let similar = ((byField ?? []) as unknown as SimilarJob[]).filter(Boolean);

        if (similar.length < 3) {
          const { data: byCity } = await supabase
            .from('job_posts')
            .select(similarSelect)
            .eq('is_active', true)
            .eq('city', data.city)
            .neq('id', jobId)
            .order('created_at', { ascending: false })
            .limit(6);
          const seen = new Set(similar.map((s) => s.id));
          for (const s of ((byCity ?? []) as unknown as SimilarJob[]).filter(Boolean)) {
            if (!seen.has(s.id)) similar = [...similar, s];
          }
        }

        setSimilarJobs(similar.slice(0, 3));
      }

      // 2. Oturum ve profil bilgilerini yükle
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      const uid = session.user.id;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', uid)
        .maybeSingle();

      const { data: sp } = await supabase
        .from('student_profiles')
        .select('id, field_name, education_level')
        .eq('profile_id', uid)
        .maybeSingle();

      setFullName(profile?.full_name ?? '');
      setPhone(profile?.phone ?? '');

      if (sp) {
        setStudentId(sp.id);
        setStudentField(sp.field_name);
        setStudentEducation(sp.education_level);

        // Bu ilana daha önce başvurulmuş mu?
        const { data: existing } = await supabase
          .from('applications')
          .select('id')
          .eq('student_id', sp.id)
          .eq('job_id', jobId)
          .maybeSingle();

        if (existing) setApplied(true);

        // Bu ilan favorilerde mi? (favorites tablosu yoksa sessizce false kalır)
        const { data: fav } = await supabase
          .from('favorites')
          .select('job_id')
          .eq('student_id', sp.id)
          .eq('job_id', jobId)
          .maybeSingle();
        setIsFav(!!fav);
      }

      setLoading(false);
    }

    init();
  }, [jobId]);

  // Kalp butonu: favori ekle/çıkar (oturum yoksa öğrenci girişine yönlendir)
  const toggleFav = async () => {
    if (!isLoggedIn || !studentId) {
      router.push('/ogrenci/giris');
      return;
    }
    if (favBusy) return;
    setFavBusy(true);
    try {
      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('student_id', studentId)
          .eq('job_id', jobId);
        if (!error) setIsFav(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ job_id: jobId, student_id: studentId });
        if (!error) setIsFav(true);
      }
    } finally {
      setFavBusy(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkOk) {
      setErrorMsg('Devam etmek için KVKK Aydınlatma Metni’ni onaylamanız gerekiyor.');
      return;
    }
    setErrorMsg('');
    setApplying(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/ogrenci/giris');
        return;
      }

      // 1. Öğrenci profili yoksa oluştur
      let sid = studentId;
      if (!sid) {
        const { data: newStudent, error: stError } = await supabase
          .from('student_profiles')
          .insert({
            profile_id: session.user.id,
            field_name: job?.field_name || 'Genel',
            education_level: 'MESEM (Çırak - 9, 10, 11. Sınıf)',
          })
          .select('id')
          .single();

        if (stError) throw new Error('Öğrenci profiliniz oluşturulamadı. Lütfen tekrar deneyin.');
        sid = newStudent.id;
        setStudentId(sid);
      }

      // 2. Başvuruyu kaydet (KVKK açık rızasıyla; kolon yoksa rıza alanı olmadan dener)
      const baseApp = {
        job_id: jobId,
        student_id: sid,
        status: 'pending',
        phone: phone.trim() || null,
        message: message.trim() || null,
      };
      let { error: appError } = await supabase
        .from('applications')
        .insert({ ...baseApp, kvkk_consented_at: new Date().toISOString() });

      if (appError && /kvkk_consented_at/.test(appError.message)) {
        ({ error: appError } = await supabase.from('applications').insert(baseApp));
      }

      if (appError) {
        if (appError.code === '23505') {
          throw new Error(
            'Bu ilana zaten başvuru yaptınız. Durumunu Başvurularım sayfasından takip edebilirsiniz.'
          );
        }
        throw new Error(appError.message || 'Başvuru gönderilirken bir hata oluştu.');
      }

      setApplied(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setApplying(false);
    }
  };

  // Paylaşım (Paket 2): WhatsApp / X / bağlantı kopyalama
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = job
    ? `${job.title} - ${job.company_details?.company_name || 'Onaylı İşletme'} staj ilanı (stajyeri.net)`
    : 'stajyeri.net staj ilanı';
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}: ${shareUrl}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // panoya erisilemediyse sessizce gec
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader />

      <main className="flex-1 py-8 px-4 sm:px-6">
        {loading ? (
          <div className="max-w-6xl mx-auto py-20 text-center text-sm text-slate-500">İlan yükleniyor...</div>
        ) : !job ? (
          <div className="max-w-md mx-auto mt-16 bg-white rounded-3xl border border-slate-200 shadow-lg p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-black text-[#0A1931] mb-2">İlan Bulunamadı</h1>
            <p className="text-xs text-slate-500 mb-6">
              Aradığınız ilan silinmiş veya adres hatalı olabilir.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-[#0A1931] hover:bg-[#00A8B5] text-white rounded-xl text-xs font-bold transition"
            >
              Aktif İlanları Gör
            </Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* SOL: İlan Detayları (kariyer.net ilan sayfası düzeni) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#0A1931] leading-snug">{job.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 font-bold">
                      <Building2 className="w-4 h-4 text-[#00A8B5]" />
                      {job.company_details?.company_name || 'İşletme adı belirtilmemiş'}
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-[#00A8B5]/10 text-[#00A8B5] rounded-full text-[11px] font-black whitespace-nowrap">
                    {programLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="bg-slate-50 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">
                      <Wrench className="w-3 h-3" /> Meslek Alanı
                    </div>
                    <div className="text-xs font-bold text-slate-800">{job.field_name}</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">
                      <MapPin className="w-3 h-3" /> Konum
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {job.district ? `${job.district} / ` : ''}{job.city}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">
                      <Users className="w-3 h-3" /> Kontenjan
                    </div>
                    <div className="text-xs font-bold text-slate-800">{job.quota ?? '-'} kişi</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">
                      <Calendar className="w-3 h-3" /> Yayın Tarihi
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {job.created_at
                        ? new Date(job.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.has_lunch && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-[#FF6B00] rounded-full text-[11px] font-bold">
                      <Utensils className="w-3 h-3" /> Yemek İmkanı
                    </span>
                  )}
                  {job.has_shuttle && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-[#00A8B5] rounded-full text-[11px] font-bold">
                      <Bus className="w-3 h-3" /> Servis İmkanı
                    </span>
                  )}
                  {job.company_details?.has_master_trainer && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Usta Öğretici Mevcut
                    </span>
                  )}
                </div>

                {/* Paylaşım (Paket 2: kariyer.net tarzı) */}
                <div className="flex items-center flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" /> Paylaş:
                  </span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp'ta paylaş"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a
                    href={xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="X'te (Twitter) paylaş"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-bold transition"
                  >
                    <Share2 className="w-3.5 h-3.5" /> X
                  </a>
                  <button
                    type="button"
                    onClick={copyLink}
                    title="Bağlantıyı kopyala"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-bold transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Kopyalandı
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" /> Bağlantıyı Kopyala
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-sm font-black text-[#0A1931] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00A8B5]" /> İşin Tanımı
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {job.description || 'İlan açıklaması girilmemiş.'}
                </p>
              </div>

              {/* Benzer İlanlar (Paket 2) */}
              {similarJobs.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                  <h2 className="text-sm font-black text-[#0A1931] mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#00A8B5]" /> Benzer İlanlar
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {similarJobs.map((s) => (
                      <Link
                        key={s.id}
                        href={`/ilan/${s.id}`}
                        className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-[#00A8B5] rounded-2xl p-4 transition-all flex flex-col gap-2"
                      >
                        <span className="px-2 py-0.5 bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-extrabold rounded-full w-fit">
                          {s.field_name}
                        </span>
                        <h3 className="text-xs font-black text-[#0A1931] group-hover:text-[#00A8B5] transition line-clamp-2">
                          {s.title}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          {s.company_details?.company_name || 'Onaylı İşletme'}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-auto">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {s.district ? `${s.district} / ` : ''}{s.city}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SAĞ: Başvuru Paneli (yapışkan) */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-7">
                {!isLoggedIn ? (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center mx-auto mb-3">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-[#0A1931] mb-1.5">Bu ilana başvurun</h3>
                    <p className="text-xs text-slate-500 mb-5">
                      Başvuru yapmak için öğrenci hesabınızla giriş yapmanız gerekiyor.
                    </p>
                    <Link
                      href="/ogrenci/giris"
                      className="w-full py-3 bg-[#00A8B5] hover:bg-[#008e9a] text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#00A8B5]/30"
                    >
                      <LogIn className="w-4 h-4" /> Giriş Yap & Başvur
                    </Link>
                    <Link
                      href="/ogrenci/kayit"
                      className="mt-2.5 w-full py-3 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Hesabım Yok, Kayıt Ol
                    </Link>
                  </div>
                ) : applied ? (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-[#0A1931] mb-1.5">Başvurunuz Alındı</h3>
                    <p className="text-xs text-slate-500 mb-5">
                      Başvurunuz işletmeye iletildi. Durumunu Başvurularım sayfasından takip edebilirsiniz.
                    </p>
                    <Link
                      href="/basvurularim"
                      className="w-full py-3 bg-[#00A8B5] hover:bg-[#008e9a] text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#00A8B5]/30"
                    >
                      <ClipboardList className="w-4 h-4" /> Başvurularıma Git
                    </Link>
                    <Link
                      href="/"
                      className="mt-2.5 w-full py-3 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Diğer İlanlara Göz At
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-black text-[#0A1931]">Bu ilana başvurun</h3>
                        <button
                          type="button"
                          onClick={toggleFav}
                          disabled={favBusy}
                          title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                          className={`p-2 rounded-xl border transition cursor-pointer disabled:opacity-50 flex-shrink-0 ${
                            isFav
                              ? 'bg-red-50 border-red-200'
                              : 'bg-white border-slate-200 hover:border-red-300'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}
                          />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Bilgileriniz başvuruyla birlikte işletmeye iletilecektir.
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Briefcase className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
                        <span className="font-bold">{fullName || 'İsimsiz Öğrenci'}</span>
                      </div>
                      {studentField && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Wrench className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          {studentField}
                        </div>
                      )}
                      {studentEducation && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          {studentEducation}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Telefon Numaranız <span className="text-slate-400 font-medium">(opsiyonel)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="05XX XXX XX XX"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ön Yazınız <span className="text-slate-400 font-medium">(opsiyonel)</span>
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          placeholder="İşletmeye kendinizi kısaca tanıtın, neden bu ilana başvurduğunuzu anlatın..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition resize-none"
                        />
                      </div>

                      {/* Hazır ön yazı şablonları (kariyer.net "Hazır Yazı Örnekleri" mini versiyonu) */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ONYAZI_EXAMPLES.map((ex) => (
                          <button
                            key={ex.id}
                            type="button"
                            title={ex.when}
                            onClick={() =>
                              setMessage((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${ex.body}` : ex.body))
                            }
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#00A8B5]/10 hover:text-[#00A8B5] text-slate-600 rounded-full text-[10px] font-extrabold transition cursor-pointer"
                          >
                            + {ex.title}
                          </button>
                        ))}
                      </div>
                      <Link
                        href="/rehber/onyazi"
                        target="_blank"
                        className="inline-block mt-1.5 text-[10px] font-bold text-[#00A8B5] hover:underline"
                      >
                        Ön yazı nasıl yazılır? Rehbere göz atın &rarr;
                      </Link>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-50/70 border border-slate-100 rounded-xl p-3">
                      <input
                        id="kvkk-consent"
                        type="checkbox"
                        checked={kvkkOk}
                        onChange={(e) => setKvkkOk(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#00A8B5] cursor-pointer flex-shrink-0"
                      />
                      <label htmlFor="kvkk-consent" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer">
                        <Link href="/kvkk" target="_blank" className="font-extrabold text-[#00A8B5] hover:underline">
                          KVKK Aydınlatma Metni
                        </Link>
                        'ni okudum; ad, telefon, meslek alanı ve ön yazı bilgilerimin başvurduğum işletmeyle
                        paylaşılmasına açık rıza veriyorum. <span className="text-red-500 font-bold">*</span>
                      </label>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={applying}
                      className="w-full py-3 bg-[#FF6B00] hover:bg-orange-600 disabled:opacity-60 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/30 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      {applying ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                    </button>

                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                      Başvurduğunuz işletme profilinize kayıtlı meslek alanı ve eğitim seviyenizi de görebilir.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Stajyeri.net &mdash; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
