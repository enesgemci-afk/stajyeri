'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { PROGRAM_TYPES } from '@/lib/constants';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Users,
  Utensils,
  Bus,
  Send,
  AlertCircle,
  LogIn,
  ClipboardList,
  Phone,
  FileText,
  Wrench,
  Calendar,
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

      if (!error && data) setJob(data);

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
      }

      setLoading(false);
    }

    init();
  }, [jobId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // 2. Başvuruyu kaydet
      const { error: appError } = await supabase.from('applications').insert({
        job_id: jobId,
        student_id: sid,
        status: 'pending',
        phone: phone.trim() || null,
        message: message.trim() || null,
      });

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#00A8B5] transition">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Stajyeri.net" className="h-8 w-auto object-contain" />
          </Link>
        </div>
      </header>

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
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-sm font-black text-[#0A1931] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00A8B5]" /> İşin Tanımı
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {job.description || 'İlan açıklaması girilmemiş.'}
                </p>
              </div>
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
                      <h3 className="text-base font-black text-[#0A1931]">Bu ilana başvurun</h3>
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
