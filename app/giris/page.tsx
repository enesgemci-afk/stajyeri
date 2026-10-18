'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { useRouter } from 'next/navigation';
import { 
  LogIn, 
  Mail, 
  Lock, 
   
  AlertCircle,
  Building2,
  GraduationCap
} from 'lucide-react';

export default function GirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Supabase ile Giriş Yap
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // 2. Kullanıcının rolünü profilden kontrol et
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .maybeSingle();

        let isEmployer = profile?.user_type === 'employer';

        // Profil kaydı yoksa ya da eski kayıtlardan rol bilgisi hatalıysa
        // işletme detay kaydından kontrol et
        if (!isEmployer) {
          const { data: company } = await supabase
            .from('company_details')
            .select('id')
            .eq('profile_id', data.user.id)
            .maybeSingle();
          isEmployer = !!company;
        }

        // Role göre doğru sayfaya yönlendir (öğrenci paneli henüz mevcut değil)
        if (isEmployer) {
          router.push('/ilan-ver');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message === 'Invalid login credentials' 
        ? 'E-posta adresi veya şifre hatalı.' 
        : err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      
      {/* Üst Bar — ortak SiteHeader */}
      <SiteHeader />

      {/* Giriş Form Kartı */}
      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#0A1931]">Hesabınıza Giriş Yapın</h1>
            <p className="text-xs text-slate-500 mt-1">
              Öğrenci veya işletme hesabınızla sisteme bağlanın.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* E-Posta */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@alanadi.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A8B5] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Şifre</label>
                <a href="#" className="text-[11px] font-semibold text-[#00A8B5] hover:underline">
                  Şifremi Unuttum?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A8B5] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Hata Mesajı */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0A1931]/10 mt-2"
            >
              {loading ? (
                'Giriş Yapılıyor...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Giriş Yap
                </>
              )}
            </button>

          </form>

          {/* Kayıt Ol Linki */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Henüz bir hesabınız yok mu?{' '}
              <Link href="/kayit" className="font-extrabold text-[#FF6B00] hover:underline">
                Ücretsiz Kayıt Olun
              </Link>
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        stajyeri.net &bull; 3308 Sayılı Kanun Uyumlu MESEM Platformu
      </footer>

    </div>
  );
}