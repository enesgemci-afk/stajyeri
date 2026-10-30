'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SiteHeader from '@/components/SiteHeader';
import { Printer, Loader2, AlertCircle } from 'lucide-react';

interface ContractData {
  studentName: string;
  birthYear: number | null;
  guardianName: string | null;
  companyName: string;
  companyCity: string | null;
  companyDistrict: string | null;
  jobTitle: string;
  fieldName: string;
  programType: string;
  createdAt: string;
  viewer: 'student' | 'employer' | 'none';
}

const PROGRAM_LABEL: Record<string, string> = {
  MESEM_4_1: 'MESEM — 4 gün işletme + 1 gün okul',
  MTAL_3_DAYS: 'Meslek Lisesi — 3 gün işletme + 2 gün okul',
  SUMMER_INTERN: 'Yaz Stajı / Beceri Eğitimi',
};

export default function SozlesmePage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContractData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const { id } = await params;
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session?.user) {
        setError('Sözleşmeyi görüntülemek için giriş yapmalısınız.');
        setLoading(false);
        return;
      }
      const uid = session.user.id;
      const { data: app } = await supabase
        .from('applications')
        .select(
          `created_at,
          job_posts!inner ( title, field_name, program_type, city,
            company_details ( company_name, city, district ) ),
          student_profiles!inner ( profile_id, profiles ( full_name ) )`
        )
        .eq('id', id)
        .maybeSingle();

      if (!alive) return;
      if (!app) {
        setError('Başvuru bulunamadı.');
        setLoading(false);
        return;
      }
      const a = app as unknown as {
        created_at: string;
        job_posts: {
          title: string; field_name: string; program_type: string; city: string | null;
          company_details?: { company_name: string; city: string | null; district: string | null } | null;
        };
        student_profiles: { profile_id: string; profiles?: { full_name: string } | null };
      };

      // Yetki: başvuru sahibi öğrenci veya ilanın işvereni
      let viewer: ContractData['viewer'] = 'none';
      if (a.student_profiles?.profile_id === uid) viewer = 'student';
      if (viewer === 'none') {
        const { data: co } = await supabase
          .from('company_details')
          .select('id')
          .eq('profile_id', uid)
          .maybeSingle();
        if (co) {
          const { data: owned } = await supabase
            .from('job_posts')
            .select('id')
            .eq('id', id)
            .eq('company_id', co.id)
            .maybeSingle();
          if (owned) viewer = 'employer';
        }
      }
      if (!alive) return;
      if (viewer === 'none') {
        setError('Bu sözleşmeyi görüntüleme yetkiniz yok.');
        setLoading(false);
        return;
      }

      // Veli adı (18 yaş altı kaydı varsa)
      let guardianName: string | null = null;
      try {
        const { data: gc } = await supabase
          .from('guardian_consents')
          .select('guardian_name, student_birth_year')
          .eq('application_id', id)
          .maybeSingle();
        if (gc) {
          guardianName = (gc as { guardian_name: string | null }).guardian_name;
        }
      } catch {
        /* veli tablosu yoksa kritik değil */
      }

      // Doğum yılı (applications varsa)
      let birthYear: number | null = null;
      try {
        const { data: raw } = await supabase
          .from('applications')
          .select('birth_year')
          .eq('id', id)
          .maybeSingle();
        birthYear = (raw as { birth_year: number | null } | null)?.birth_year ?? null;
      } catch {
        /* kolon yoksa kritik değil */
      }

      setData({
        studentName: a.student_profiles?.profiles?.full_name ?? 'Öğrenci',
        birthYear,
        guardianName,
        companyName: a.job_posts?.company_details?.company_name ?? 'İşletme',
        companyCity: a.job_posts?.company_details?.city ?? null,
        companyDistrict: a.job_posts?.company_details?.district ?? null,
        jobTitle: a.job_posts?.title ?? '',
        fieldName: a.job_posts?.field_name ?? '',
        programType: a.job_posts?.program_type ?? '',
        createdAt: a.created_at,
        viewer,
      });
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [params]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#00A8B5]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">{error || 'Bir hata oluştu.'}</p>
            <Link href="/basvurularim" className="inline-block mt-4 text-xs font-black text-[#00A8B5] hover:underline">
              Başvurularıma Dön
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <div className="no-print flex items-center justify-between gap-3 mb-6">
          <Link href="/basvurularim" className="text-xs font-black text-slate-500 hover:text-[#00A8B5] transition">
            ← Başvurularıma Dön
          </Link>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-full bg-[#00A8B5] hover:bg-[#008f9a] text-white text-xs font-black transition inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00A8B5]/30"
          >
            <Printer className="w-4 h-4" /> Yazdır / PDF İndir
          </button>
        </div>

        <div
          id="sozlesme-print"
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-[#0A1931]"
        >
          <div className="text-center border-b-2 border-[#0A1931] pb-5">
            <p className="text-lg font-black tracking-tight">MESLEKÎ EĞİTİM SÖZLEŞMESİ (ÖRNEK)</p>
            <p className="text-[10px] text-slate-500 mt-1">
              3308 Sayılı Meslekî Eğitim Kanunu kapsamında — stajyeri.net üzerinden oluşturulmuştur
            </p>
          </div>

          <div className="mt-6 space-y-4 text-xs leading-relaxed">
            <section>
              <h2 className="font-black text-sm mb-2">1. Taraflar</h2>
              <p>
                <b>Öğrenci (Çırak/Stajyer):</b> {data.studentName}
                {data.birthYear ? ` (${new Date().getFullYear() - data.birthYear} yaşında)` : ''}
                <br />
                <b>İşletme:</b> {data.companyName}
                {data.companyDistrict || data.companyCity
                  ? ` — ${[data.companyDistrict, data.companyCity].filter(Boolean).join(', ')}`
                  : ''}
              </p>
              {data.guardianName && (
                <p className="mt-1">
                  <b>Veli (Muvafakat Veren):</b> {data.guardianName} — 18 yaş altı öğrenci için veli
                  muvafakati stajyeri.net üzerinden onaylanmıştır.
                </p>
              )}
            </section>

            <section>
              <h2 className="font-black text-sm mb-2">2. Eğitimin Konusu</h2>
              <p>
                <b>Meslek Alanı:</b> {data.fieldName}
                <br />
                <b>Pozisyon:</b> {data.jobTitle}
                <br />
                <b>Eğitim Modeli:</b> {PROGRAM_LABEL[data.programType] ?? data.programType}
              </p>
            </section>

            <section>
              <h2 className="font-black text-sm mb-2">3. Tarafların Yükümlülükleri</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  İşletme, öğrenciye alanında yetkin bir <b>usta öğretici</b> gözetiminde eğitim verir;
                  iş güvenliği önlemlerini alır ve kanuni ücreti (net asgari ücretin en az %30u — kalfa
                  eğitiminde %50si) zamanında öder.
                </li>
                <li>
                  Öğrenci, işletmenin çalışma düzenine uyarak mesleği öğrenmeye gayret eder; güvenlik
                  kurallarına harfiyen uyar.
                </li>
                <li>Öğrencinin iş kazası ve meslek hastalıkları sigortası ilgili mevzuat uyarınca sağlanır.</li>
                <li>18 yaş altı öğrenciler için veli muvafakati şarttır; muvafakat olmadan eğitim başlamaz.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-black text-sm mb-2">4. Kayıt</h2>
              <p>
                Bu belge, {fmtDate(data.createdAt)} tarihinde stajyeri.net üzerinden oluşturulan başvuru
                kaydına dayanır. Resmî eğitim sözleşmesi, tarafların ıslak imzasıyla ve bağlı olduğu
                kurum onayıyla kesinleşir. Bu örnek metin bilgilendirme amaçlıdır.
              </p>
            </section>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
            <div className="border-t border-slate-300 pt-2">
              Öğrenci İmzası
              <br />
              <span className="font-bold text-slate-700">{data.studentName}</span>
            </div>
            <div className="border-t border-slate-300 pt-2">
              İşletme İmzası / Kaşe
              <br />
              <span className="font-bold text-slate-700">{data.companyName}</span>
            </div>
          </div>
          <p className="mt-6 text-center text-[9px] text-slate-400">Oluşturulma: {today} · stajyeri.net</p>
        </div>
      </main>
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Stajyeri.net</p>
      </footer>
    </div>
  );
}
