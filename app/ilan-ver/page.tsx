'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, PROGRAM_TYPES, TURKEY_CITIES } from '@/lib/constants';
import { JOB_TEMPLATES, GENERIC_JOB_TEMPLATE } from '@/lib/jobTemplates';
import SiteHeader from '@/components/SiteHeader';
import { useRouter } from 'next/navigation';
import { Sparkles, Palette } from 'lucide-react';
import { COMPANY_ICON_PRESETS, resolveCompanyIcon } from '@/lib/companyIcons';
import { companyColor } from '@/components/JobCard';

// Logo yüklemezse işletme baş harfi bu renklerden biriyle gösterilir (JobCard şablonu)
const LOGO_COLORS = ['#00A8B5', '#FF6B00', '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#0EA5E9'];

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
  const [wageInfo, setWageInfo] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoColor, setLogoColor] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMsg, setLogoMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setUserId(data.session.user.id);
      }
    });
  }, []);

  // İşletme logosunu Supabase Storage'a yükler (kendi klasörüne: uid/logo.xxx)
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id ?? userId;
    if (!uid) {
      setLogoMsg('Logo yüklemek için lütfen önce giriş yapın.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoMsg('Logo dosyası en fazla 2MB olabilir.');
      return;
    }

    setLogoUploading(true);
    setLogoMsg(null);
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${uid}/logo.${ext}`;
      const { error } = await supabase.storage.from('company-logos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('company-logos').getPublicUrl(path);
      setLogoUrl(pub.publicUrl);
      setLogoMsg('Logo yüklendi ✓ İlanınızda görünecek.');
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Logo yüklenemedi. Lütfen tekrar deneyin.';
      console.error('Logo yükleme hatası:', raw);
      // RLS hatası = Supabase'te storage politikası eksik/yanlış; SQL güncellemesi gerekir
      const msg = /row-level security/i.test(raw)
        ? 'Logo yüklenemedi (güvenlik ayarı güncelleniyor). Lütfen birkaç dakika sonra tekrar deneyin.'
        : raw;
      setLogoMsg(msg);
    } finally {
      setLogoUploading(false);
    }
  }

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
      const { data: company } = await supabase
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

      const { data: newPost, error: postError } = await supabase
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
        })
        .select('id')
        .single();

      if (postError) throw postError;

      // Ücret bilgisi (kolon henüz açılmamışsa sessizce atlanır, ilan yine yayınlanır)
      if (newPost && wageInfo.trim()) {
        try {
          await supabase.from('job_posts').update({ wage_info: wageInfo.trim() }).eq('id', newPost.id);
        } catch {
          /* wage_info kolonu yoksa kritik değil */
        }
      }

      // Logo / renk şablonu işletme kaydına yazılır (kolonlar yoksa sessizce atlanır)
      if (logoUrl || logoColor) {
        try {
          const patch: { logo_url?: string; logo_color?: string } = {};
          if (logoUrl) patch.logo_url = logoUrl;
          if (logoColor) patch.logo_color = logoColor;
          await supabase.from('company_details').update(patch).eq('id', companyId);
        } catch {
          /* logo kolonları yoksa kritik değil */
        }
      }

      setStatusMsg({ type: 'success', text: 'İlan başarıyla yayınlandı! Ana sayfaya yönlendiriliyorsunuz...' });
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'İlan kaydedilirken bir hata oluştu.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const logoPreset = resolveCompanyIcon(logoUrl);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <SiteHeader />
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

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

            {/* İşletme logosu + renk şablonu (logosuz işletmeler için baş harf rozeti) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#00A8B5]" /> İşletme Logosu (opsiyonel)
              </p>
              <div className="flex items-center gap-3 mt-2.5">
                {logoPreset ? (
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center select-none"
                    style={{ backgroundColor: logoColor ?? companyColor(companyName.trim() || 'İşletme') }}
                    title={logoPreset.label}
                  >
                    <logoPreset.Icon className="w-6 h-6 text-white" />
                  </div>
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo önizleme"
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-white"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white select-none"
                    style={{ backgroundColor: logoColor ?? companyColor(companyName.trim() || 'İşletme') }}
                  >
                    {(companyName.trim() || 'İ').charAt(0).toLocaleUpperCase('tr-TR')}
                  </div>
                )}
                <div className="min-w-0">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#00A8B5] rounded-xl text-[11px] font-bold text-slate-700 transition cursor-pointer">
                    {logoUploading ? 'Yükleniyor...' : logoUrl ? 'Logoyu Değiştir' : 'Logo Yükle (JPG/PNG, maks 2MB)'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleLogoChange}
                      disabled={logoUploading}
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => { setLogoUrl(null); setLogoMsg(null); }}
                      className="block mt-1 text-[10px] font-bold text-slate-400 hover:text-red-500 transition cursor-pointer"
                    >
                      Logoyu Kaldır
                    </button>
                  )}
                </div>
              </div>
              {logoMsg && (
                <p className={`text-[10px] font-bold mt-2 ${logoUrl ? 'text-green-600' : 'text-red-500'}`}>{logoMsg}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-2">
                Logo yok mu? Sorun değil — işletme adının baş harfi, seçtiğin renkte ilan kartlarında görünecek:
              </p>
              <div className="flex gap-1.5 mt-1.5">
                {LOGO_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setLogoColor(logoColor === c ? null : c)}
                    title="Şablon rengi seç"
                    className={`w-6 h-6 rounded-full transition cursor-pointer ${logoColor === c ? 'ring-2 ring-offset-2 ring-[#0A1931] scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <p className="text-[10px] text-slate-400 mt-3">
                Ya da hazır sektör sembolünden birini seç — logon yerine ilan kartlarında görünecek:
              </p>
              <div className="grid grid-cols-7 gap-1.5 mt-1.5">
                {COMPANY_ICON_PRESETS.map((p) => {
                  const selected = logoUrl === `icon:${p.key}`;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      title={p.label}
                      onClick={() => {
                        setLogoUrl(selected ? null : `icon:${p.key}`);
                        setLogoMsg(null);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer border ${
                        selected
                          ? 'border-[#0A1931] ring-2 ring-[#0A1931]/20 scale-105'
                          : 'border-slate-200 bg-white hover:border-[#00A8B5] hover:scale-105'
                      }`}
                    >
                      <p.Icon className={`w-4 h-4 ${selected ? 'text-[#0A1931]' : 'text-slate-500'}`} />
                    </button>
                  );
                })}
              </div>
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

            <div>
              <label className="block text-xs font-bold text-slate-700">Ücret / Destek Bilgisi (opsiyonel)</label>
              <input
                type="text"
                value={wageInfo}
                onChange={(e) => setWageInfo(e.target.value)}
                placeholder="Örn: Günlük 450 TL + yemek ve servis dahil"
                className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00A8B5]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Ücret bilgisi yazan ilanlar öğrencilerde belirgin şekilde daha çok ilgi görür.
              </p>
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

            {/* Hazır iş tanımı şablonu (kariyer.net "Akıllı İlan" mini versiyonu) */}
            <div className="flex items-start gap-3 bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-xl p-3.5">
              <Sparkles className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500">
                  Seçtiğin alan için hazır şablon — 1 dakikada ilan:
                </p>
                <p className="text-xs font-black text-[#0A1931] mt-0.5">
                  {(JOB_TEMPLATES[fieldName] ?? GENERIC_JOB_TEMPLATE).title}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const tpl = JOB_TEMPLATES[fieldName] ?? GENERIC_JOB_TEMPLATE;
                    setTitle(tpl.title);
                    setDescription(tpl.description);
                  }}
                  className="mt-1.5 text-[11px] font-extrabold text-[#FF6B00] hover:underline cursor-pointer"
                >
                  ✨ Bu hazır iş tanımını ilana uygula
                </button>
              </div>
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