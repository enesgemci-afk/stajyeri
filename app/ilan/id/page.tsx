'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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
  Calendar,
  Send
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

  useEffect(() => {
    async function fetchJobDetail() {
      if (!jobId) return;

      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          company_details (
            company_name,
            has_master_trainer
          )
        `)
        .eq('id', jobId)
        .single();

      if (!error && data) {
        setJob(data);
      }
      setLoading(false);
    }

    fetchJobDetail();
  }, [jobId]);

  const handleApply = async () => {
    setErrorMsg('');
    setApplying(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/giris');
      return;
    }

    // 1. Öğrencinin student_profile kaydını kontrol et veya oluştur
    let { data: student } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', session.user.id)
      .maybeSingle();

    let studentId = student?.id;

    if (!studentId) {
      const { data: newStudent, error: stError } = await supabase
        .from('student_profiles')
        .insert({
          profile_id: session.user.id,
          field_name: job?.field_name || 'Genel',
          education_level: 'MESEM',
        })
        .select('id')
        .single();

      if (stError) {
        setErrorMsg('Öğrenci profili oluşturulamadı.');
        setApplying(false);
        return;
      }
      studentId = newStudent.id;
    }

    // 2. Başvuruyu ekle
    const { error: appError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        student_id: studentId,
        status: 'pending',
      });

    if (appError) {
      if (appError.code === '23505') {
        setErrorMsg('Bu ilana zaten daha önce başvuru yaptınız.');
      } else {
        setErrorMsg(appError.message || 'Başvuru yapılırken hata oluştu.');
      }
    } else {
      setApplied(true);
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm font-bold text-slate-500">
        İlan detayları yükleniyor...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <p className="text-base font-bold text-slate-700 mb-4">İlan bulunamadı veya yayından kaldırılmış.</p>
        <Link href="/" className="px-4 py-2 bg-[#0A1931] text-white rounded-xl text-xs font-bold">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16">
      {/* Üst Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#00A8B5] transition">
            <ArrowLeft className="w-4 h-4" /> Tüm İlanlar
          </Link>
          <img src="/logo.png" alt="Stajyeri.net" className="h-8 w-auto object-contain" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol / Ana İlan Detayı */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <span className="px-3 py-1 bg-[#00A8B5]/10 text-[#00A8B5] text-xs font-bold rounded-lg inline-block mb-3">
                {job.program_type}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0A1931] leading-snug">
                {job.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-slate-500 border-b border-slate-100 pb-6">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Building2 className="w-4 h-4 text-[#00A8B5]" />
                  {job.company_details?.company_name || 'Kurumsal İşletme'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.city} / {job.district}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {job.field_name}
                </span>
              </div>

              {/* Açıklama */}
              <div className="pt-6">
                <h2 className="text-sm font-bold text-[#0A1931] mb-3">İş Tanımı & Detaylar</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>

            {/* İlan Sağlanan İmkanlar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-[#0A1931] mb-4">Sağlanan İmkanlar & Kanuni Şartlar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2 text-slate-700">
                  <Utensils className="w-4 h-4 text-[#FF6B00]" />
                  <span>Öğle Yemeği: <strong>{job.has_lunch ? 'Var' : 'Yok'}</strong></span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2 text-slate-700">
                  <Bus className="w-4 h-4 text-[#00A8B5]" />
                  <span>Servis / Ulaşım: <strong>{job.has_shuttle ? 'Var' : 'Yok'}</strong></span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Usta Öğretici: <strong>{job.company_details?.has_master_trainer ? 'Onaylı Eğitmen Mevcut' : 'Belirtilmedi'}</strong></span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2 text-slate-700">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Açık Kontenjan: <strong>{job.quota} Kişi</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ / Başvuru Paneli */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <h3 className="text-base font-black text-[#0A1931] mb-2">Başvurunu Tamamla</h3>
              <p className="text-xs text-slate-500 mb-6">
                Başvurunuz işletmeye anında iletilir ve staj sözleşmesi süreci başlatılır.
              </p>

              {applied ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-green-800">Başvurunuz Başarıyla İletildi!</p>
                  <p className="text-[11px] text-green-600 mt-1">İşveren profilinizi incelediğinde dönüş sağlayacaktır.</p>
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <p className="text-xs text-red-500 font-semibold mb-3 bg-red-50 p-2.5 rounded-lg">
                      {errorMsg}
                    </p>
                  )}
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full py-3.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-black rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" /> {applying ? 'İletiliyor...' : 'İlana Hemen Başvur'}
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}