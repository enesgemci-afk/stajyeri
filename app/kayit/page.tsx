'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, TURKEY_CITIES } from '@/lib/constants';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  GraduationCap, 
   
  AlertCircle,
  MapPin,
  Briefcase
} from 'lucide-react';

export default function KayitPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'employer'>('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ortak Alanlar
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Öğrenci Alanları
  const [studentField, setStudentField] = useState(MESEM_FIELDS[0]);
  const [educationLevel, setEducationLevel] = useState('MESEM (9-12. Sınıf)');

  // İşveren Alanları
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Supabase Auth ile Kullanıcı Oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: role,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error('Kullanıcı hesabı oluşturulamadı.');
      }

      // 2. Profiles tablosuna kayıt
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          user_type: role,
        });

      if (profileError) throw profileError;

      // 3. Role Özel Tabloya Kayıt
      if (role === 'student') {
        const { error: stError } = await supabase
          .from('student_profiles')
          .insert({
            profile_id: userId,
            field_name: studentField,
            education_level: educationLevel,
          });

        if (stError) throw stError;
        router.push('/panel');
      } else {
        const { error: compError } = await supabase
          .from('company_details')
          .insert({
            profile_id: userId,
            company_name: companyName,
            city: city,
            district: district,
            has_master_trainer: true,
          });

        if (compError) throw compError;
        router.push('/isveren/panel');
      }

    } catch (err: any) {
      const msg = err?.message || '';
      setErrorMsg(
        msg.includes('already registered')
          ? 'Bu e-posta adresi ile zaten bir hesabınız var. Lütfen giriş yapın.'
          : msg || 'Kayıt işlemi sırasında bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      
      {/* Üst Bar — ortak SiteHeader */}
      <SiteHeader />

      {/* Form Alanı */}
      <main className="max-w-lg w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#0A1931]">Hesap Oluşturun</h1>
            <p className="text-xs text-slate-500 mt-1">
              Stajyeri.net ile kariyerinize veya işletmenize ilk adımı atın.
            </p>
          </div>

          {/* Kolayca Değiştirilebilir Rol Seçim Sekmeleri */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                role === 'student'
                  ? 'bg-white text-[#0A1931] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#00A8B5]" /> Öğrenci / Çırak
            </button>

            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                role === 'employer'
                  ? 'bg-white text-[#0A1931] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#FF6B00]" /> İşletme / İşveren
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Ad Soyad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'employer' ? 'Yetkili Adı Soyadı' : 'Ad Soyad'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A8B5] focus:bg-white transition"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A8B5] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Öğrenciye Özel Alanlar */}
            {role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meslek Alanınız</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      value={studentField}
                      onChange={(e) => setStudentField(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5] cursor-pointer"
                    >
                      {MESEM_FIELDS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Eğitim Durumu</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5] cursor-pointer"
                  >
                    <option value="MESEM (Çırak - 9/10/11. Sınıf)">MESEM (Çırak - 9, 10, 11. Sınıf)</option>
                    <option value="MESEM (Kalfa - 12. Sınıf)">MESEM (Kalfa - 12. Sınıf)</option>
                    <option value="MTAL (Meslek Lisesi Stajyeri)">MTAL (Meslek Lisesi 12. Sınıf)</option>
                    <option value="Ön Lisans / Üniversite">Ön Lisans / Üniversite</option>
                  </select>
                </div>
              </>
            )}

            {/* İşverene Özel Alanlar */}
            {role === 'employer' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İşletme / Kurum Adı</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Örn: Aydın Otomotiv Sanayi Ltd."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A8B5] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Şehir</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5] cursor-pointer"
                    >
                      {TURKEY_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">İlçe / Sanayi Sitesi</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Örn: İkitelli OSB"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A8B5] focus:bg-white transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Hata Mesajı */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Kayıt Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0A1931]/10 mt-3"
            >
              {loading ? 'Hesap Açılıyor...' : 'Kayıt Ol'}
            </button>

          </form>

          {/* Giriş Yap Linki */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Zaten bir hesabınız var mı?{' '}
              <Link href="/giris" className="font-extrabold text-[#00A8B5] hover:underline">
                Giriş Yapın
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