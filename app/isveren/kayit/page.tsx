'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TURKEY_CITIES } from '@/lib/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  AlertCircle,
  MapPin,
  Briefcase
} from 'lucide-react';

export default function IsverenKayitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // İşveren Form Bilgileri
  const [companyName, setCompanyName] = useState('');
  const [authorizedName, setAuthorizedName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Supabase Auth ile Kullanıcı Oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: authorizedName,
            role: 'employer',
          },
        },
      });

      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error('Hesap oluşturulamadı.');

      // 2. Profiles tablosuna kayıt
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: authorizedName,
        role: 'employer',
      });

      // 3. Company Details tablosuna işletme detayını ekle
      const { error: compError } = await supabase.from('company_details').insert({
        profile_id: userId,
        company_name: companyName,
        city: city,
        district: district,
        has_master_trainer: true,
      });

      if (compError) throw compError;

      router.push('/isveren');
    } catch (err: any) {
      setErrorMsg(err.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
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

      <main className="max-w-md w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#0A1931]">İşveren / Kurum Kaydı</h1>
            <p className="text-xs text-slate-500 mt-1">
              MESEM ve lise stajyerleri aramak için işletmenizi kaydedin.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Şirket / İşletme Unvanı</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Örn: Eren Otomotiv San. Tic. Ltd."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Yetkili Adı Soyadı</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={authorizedName}
                  onChange={(e) => setAuthorizedName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kurumsal E-Posta</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ik@sirketadi.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Şehir</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6B00]"
                >
                  {TURKEY_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">İlçe / Sanayi Bölgesi</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Örn: İkitelli OSB"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6B00]"
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
              disabled={loading}
              className="w-full py-3 bg-[#FF6B00] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/20 mt-3 cursor-pointer"
            >
              {loading ? 'Kayıt Yapılıyor...' : 'İşletme Hesabı Oluştur'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Zaten bir işletme hesabınız var mı?{' '}
              <Link href="/isveren/giris" className="font-extrabold text-[#FF6B00] hover:underline">
                İşveren Girişi Yap
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        stajyeri.net &bull; İşveren Yönetim Portalı
      </footer>
    </div>
  );
}