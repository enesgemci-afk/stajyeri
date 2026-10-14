'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, PROGRAM_TYPES, TURKEY_CITIES } from '@/lib/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function IlanVerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [fieldName, setFieldName] = useState<string>(MESEM_FIELDS[0]);
  const [programType, setProgramType] = useState<string>(PROGRAM_TYPES[0].value);
  const [city, setCity] = useState<string>('İstanbul');
  const [district, setDistrict] = useState('');
  const [quota, setQuota] = useState(1);
  const [hasShuttle, setHasShuttle] = useState(false);
  const [hasLunch, setHasLunch] = useState(true);
  const [description, setDescription] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setUserId(data.session.user.id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || userId;

    if (!currentUserId) {
      setStatusMsg({ type: 'error', text: 'İlan yayınlamak için lütfen önce giriş yapın.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      let { data: company } = await supabase
        .from('company_details')
        .select('id')
        .eq('profile_id', currentUserId)
        .maybeSingle();

      let companyId = company?.id;

      if (!companyId) {
        const { data: newCompany, error: compError } = await supabase
          .from('company_details')
          .insert({
            profile_id: currentUserId,
            company_name: companyName || 'İşletme',
            city,
            district,
            has_master_trainer: true,
          })
          .select('id')
          .single();

        if (compError) throw compError;
        companyId = newCompany.id;
      }

      const { error: postError } = await supabase
        .from('job_posts')
        .insert({
          company_id: companyId,
          title,
          field_name: fieldName,
          program_type: programType,
          city,
          district,
          quota: Number(quota),
          has_shuttle: hasShuttle,
          has_lunch: hasLunch,
          description,
          is_active: true,
        });

      if (postError) throw postError;

      setStatusMsg({ type: 'success', text: 'İlan başarıyla yayınlandı! Ana sayfaya yönlendiriliyorsunuz...' });
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'İlan kaydedilirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#00A8B5] transition">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
          <span className="text-lg font-black text-[#0A1931]">
            Stajyeri<span className="text-[#00A8B5]">.net</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-[#0A1931] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" /> Yeni MESEM & Staj İlanı Yayınla
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              3308 sayılı kanun kapsamında işletmenizin stajyer ihtiyacını karşılamak için formu doldurun.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700">İşletme / Kurum Ünvanı</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Örn: Eren Otomotiv San. ve Tic. Ltd. Şti."
                className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">İlan Başlığı</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: CNC Torna & Freze MESEM Çırağı"
                className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Meslek Alanı (33 MESEM Alanı)</label>
                <select
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5] cursor-pointer"
                >
                  {MESEM_FIELDS.map((field) => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Staj Modeli</label>
                <select
                  value={programType}
                  onChange={(e) => setProgramType(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5] cursor-pointer"
                >
                  {PROGRAM_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Şehir (81 İl)</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5] cursor-pointer"
                >
                  {TURKEY_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">İlçe / Sanayi Bölgesi (OSB)</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Örn: İkitelli OSB"
                  className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Kontenjan</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={quota}
                  onChange={(e) => setQuota(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5]"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={hasLunch}
                  onChange={(e) => setHasLunch(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00A8B5]"
                />
                Öğle Yemeği Sağlanıyor
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={hasShuttle}
                  onChange={(e) => setHasShuttle(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00A8B5]"
                />
                Servis / Ulaşım Var
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">İlan Detayı</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Öğrencinin yapacağı işler ve çalışma ortamı hakkında kısa bilgi..."
                className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5]"
              />
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  statusMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-black rounded-xl text-sm transition shadow-md shadow-[#FF6B00]/25"
            >
              {loading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}