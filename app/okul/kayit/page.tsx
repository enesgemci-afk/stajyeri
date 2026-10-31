'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TURKEY_CITIES } from '@/lib/constants';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { useRouter } from 'next/navigation';
import { School, Mail, Lock, User, MapPin, AlertCircle, BadgeCheck } from 'lucide-react';

export default function OkulKayitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorTitle, setCoordinatorTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: coordinatorName, user_type: 'school' } },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Hesap oluşturulamadı, lütfen tekrar deneyin.');

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: userId, full_name: coordinatorName, user_type: 'school' });
      if (profileError) throw profileError;

      const { error: schoolError } = await supabase
        .from('school_profiles')
        .insert({
          profile_id: userId,
          school_name: schoolName.trim(),
          city,
          district: district.trim() || null,
          coordinator_title: coordinatorTitle.trim() || null,
        });
      if (schoolError) throw schoolError;

      router.push('/okul');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('already registered')) {
        setErrorMsg('Bu e-posta ile zaten bir hesap var. Lütfen giriş yapın.');
      } else if (msg.includes('duplicate key') || msg.includes('unique')) {
        setErrorMsg('Bu okul adı zaten kayıtlı. Farklı bir ad ile deneyin.');
      } else {
        setErrorMsg(msg || 'Kayıt sırasında bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <School className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-[#0A1931]">Okul Koordinatör Kaydı</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Okulunuzun staj süreçlerini tek panelden izleyin. Kayıt sonrası yönetici onayıyla
              okulunuz öğrenci kayıt formunda listelenir.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Okul Adı *</label>
              <input
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Örn. Şehit Kemal Mesleki ve Teknik Anadolu Lisesi"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">İl *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition cursor-pointer"
                  >
                    {TURKEY_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">İlçe</label>
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Örn. Kadıköy"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Koordinatör Adı *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    required
                    value={coordinatorName}
                    onChange={(e) => setCoordinatorName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unvan</label>
                <input
                  value={coordinatorTitle}
                  onChange={(e) => setCoordinatorTitle(e.target.value)}
                  placeholder="Örn. Bölüm Şefi"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kurum E-postası *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@meb.gov.tr"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Şifre *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white text-xs font-extrabold rounded-xl transition cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Kayıt oluşturuluyor…' : 'Okul Hesabı Oluştur'}
            </button>
          </form>

          <div className="mt-5 bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed flex items-start gap-2">
            <BadgeCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Okul hesabınız admin onayına kadar öğrenci kayıt formunda görünmez; panelinize yine de erişebilirsiniz.
          </div>

          <p className="text-center text-[11px] text-slate-500 mt-5">
            Zaten hesabınız var mı?{' '}
            <Link href="/okul" className="font-black text-[#00A8B5] hover:underline">Okul Paneline Giriş</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
