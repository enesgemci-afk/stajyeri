'use client';

// Veli Muvafakatname Onay Sayfası (girişsiz erişim, benzersiz token ile)
// Akış: 18 yaş altı öğrenci başvuru sırasında veli adı + GSM girer;
// sistem benzersiz token'lı bu sayfayı oluşturur. Öğrenci linki
// WhatsApp'tan velisine iletir; veli buradan onaylar veya ret eder.
// Onay, security definer RPC tarafından zaman + IP damgasıyla kayda geçer.

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SiteHeader from '@/components/SiteHeader';
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
} from 'lucide-react';

interface ConsentInfo {
  guardian_name: string;
  student_name: string;
  job_title: string;
  company_name: string;
  job_city: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expires_at: string;
}

export default function VeliOnayPage() {
  const params = useParams();
  const token = params?.token as string;

  const [info, setInfo] = useState<ConsentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data, error: rpcErr } = await supabase.rpc('get_guardian_consent', {
          p_token: token,
        });
        if (rpcErr) throw new Error(rpcErr.message);
        if (!data) {
          setError('Onay bağlantısı bulunamadı. Link hatalı veya süresi geçmiş olabilir.');
        } else {
          const c = data as ConsentInfo;
          setInfo(c);
          setExpired(c.status === 'expired' || new Date(c.expires_at) < new Date());
        }
      } catch {
        setError('Onay bilgisi yüklenemedi. Lütfen linki tekrar kontrol edin.');
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
    else {
      setError('Onay bağlantısı geçersiz.');
      setLoading(false);
    }
  }, [token]);

  async function decide(decision: 'approve' | 'reject') {
    setActing(true);
    setError('');
    try {
      const { data, error: rpcErr } = await supabase.rpc('approve_guardian_consent', {
        p_token: token,
        p_decision: decision,
      });
      if (rpcErr) throw new Error(rpcErr.message);
      const res = (data ?? {}) as { ok?: boolean; status?: string; err?: string };
      if (res.ok && res.status) {
        setResult(res.status as 'approved' | 'rejected');
      } else if (res.err === 'expired') {
        setError('Onay süresi (7 gün) doldu. Öğrenci, başvurularım sayfasından yeni istek oluşturabilir.');
      } else if (res.err === 'already_done') {
        setError('Bu başvuru için onay işlemi daha önce yapılmış.');
      } else {
        setError('İşlem tamamlanamadı. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('İşlem sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setActing(false);
    }
  }

  // Yükleniyor / bulunamadı ekranları
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans">
        <SiteHeader />
        <div className="max-w-lg mx-auto py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#00A8B5] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-4">Veli onay bilgisi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans">
        <SiteHeader />
        <div className="max-w-lg mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-black text-[#0A1931] mb-2">Bağlantı Bulunamadı</h1>
            <p className="text-xs text-slate-500">{error || 'Onay bağlantısı geçersiz.'}</p>
            <p className="text-[10px] text-slate-400 mt-4">
              Öğrencinizden yeni bir onay bağlantısı isteyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Karar sonrası sonuç / daha önce karara bağlanmış / süresi dolmuş istekler
  const finalStatus: 'approved' | 'rejected' | 'expired' | null = result
    ? result
    : expired
      ? 'expired'
      : info.status === 'approved' || info.status === 'rejected'
        ? info.status
        : null;

  if (finalStatus) {
    const meta = {
      approved: {
        icon: <CheckCircle2 className="w-7 h-7" />,
        cls: 'bg-emerald-50 text-emerald-500',
        title: 'Onayınız Kaydedildi',
        text: `${info.student_name} adlı öğrencinin "${info.job_title}" başvurusu için veli muvafakatiniz onaylandı. İşletme artık başvuruyu değerlendirebilir.`,
      },
      rejected: {
        icon: <XCircle className="w-7 h-7" />,
        cls: 'bg-red-50 text-red-500',
        title: 'Onay Verilmedi',
        text: 'Bu başvuru veli onayı olmadan ilerlemeyecektir. Öğrencinizle görüşerek yeniden değerlendirebilirsiniz.',
      },
      expired: {
        icon: <Clock className="w-7 h-7" />,
        cls: 'bg-amber-50 text-amber-500',
        title: 'Onay Süresi Doldu',
        text: 'Bu onay bağlantısının 7 günlük geçerlilik süresi dolmuş. Öğrenciniz, başvurularım sayfasından yeni bir onay isteyebilir.',
      },
    }[finalStatus];

    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans">
        <SiteHeader />
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${meta.cls}`}>
              {meta.icon}
            </div>
            <h1 className="text-lg font-black text-[#0A1931] mb-2">{meta.title}</h1>
            <p className="text-xs text-slate-500 leading-relaxed">{meta.text}</p>
            <p className="text-[10px] text-slate-400 mt-4">
              Onay kayıtları tarih ve IP bilgisiyle, KVKK kapsamında saklanır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ANA EKRAN — onay bekleyen muvafakatname
  const expires = new Date(info.expires_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] text-[11px] font-black mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> VELİ MUVAFAKATNAMESİ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0A1931]">Sayın {info.guardian_name},</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Öğrenciniz <b className="text-[#0A1931]">{info.student_name}</b>, aşağıdaki staj başvurusunu
            yaptı. 18 yaşından küçük öğrencilerin işyeri eğitimine{' '}
            <b className="text-[#0A1931]">veli izni</b> yasal olarak gereklidir (3308 sayılı Kanun).
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100 flex-wrap">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide">Başvuru Bilgileri</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
              <Clock className="w-3 h-3" /> {expires} tarihine kadar geçerli
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-center">
            {[
              { k: 'Pozisyon', v: info.job_title, Icon: null },
              { k: 'İşletme', v: info.company_name, Icon: Building2 },
              { k: 'Konum', v: info.job_city || '—', Icon: MapPin },
              { k: 'Öğrenci', v: info.student_name, Icon: null },
            ].map((c) => (
              <div key={c.k} className="bg-slate-50 rounded-2xl p-3.5">
                <dt className="text-[10px] font-black text-slate-400 uppercase">{c.k}</dt>
                <dd className="text-xs font-black text-[#0A1931] mt-1 break-words flex items-center justify-center gap-1.5">
                  {c.Icon && <c.Icon className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />}
                  {c.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* __VELI_B3__ */}
      </main>
    </div>
  );
}
