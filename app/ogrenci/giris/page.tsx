'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OgrenciKayit() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [field, setField] = useState('Bilişim Teknolojileri');
  const [educationLevel, setEducationLevel] = useState('MESEM (Çırak - 9, 10, 11. Sınıf)');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student',
          field,
          education_level: educationLevel,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Kayıt başarılı olunca doğrudan ana sayfaya yönlendir
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Öğrenci & Çırak Kaydı</h1>
          <p className="text-sm text-slate-500 mt-1">Staj ve çıraklık fırsatlarına ulaşmak için profil oluşturun.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Adınız Soyadınız</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Örn: Enes Yılmaz"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">E-Posta Adresi</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="ornek@mail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Meslek Alanınız</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-800"
            >
              <option value="Bilişim Teknolojileri">Bilişim Teknolojileri</option>
              <option value="Elektrik-Elektronik">Elektrik-Elektronik</option>
              <option value="Motorlu Araçlar Teknolojisi">Motorlu Araçlar Teknolojisi</option>
              <option value="Makine Teknolojisi">Makine Teknolojisi</option>
              <option value="Muhasebe ve Finansman">Muhasebe ve Finansman</option>
              <option value="Güzellik ve Saç Bakım">Güzellik ve Saç Bakım</option>
              <option value="Yiyecek İçecek Hizmetleri">Yiyecek İçecek Hizmetleri</option>
              <option value="Adalet">Adalet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Eğitim Kademesi</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-800"
            >
              <option value="MESEM (Çırak - 9, 10, 11. Sınıf)">MESEM (Çırak - 9, 10, 11. Sınıf)</option>
              <option value="MESEM (Kalfa - 12. Sınıf)">MESEM (Kalfa - 12. Sınıf)</option>
              <option value="Meslek Lisesi (12. Sınıf Stajyeri)">Meslek Lisesi (12. Sınıf Stajyeri)</option>
              <option value="Üniversite / Ön Lisans Stajyeri">Üniversite / Ön Lisans Stajyeri</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition duration-200 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Öğrenci Profili Oluştur'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Zaten bir hesabınız var mı?{' '}
          <Link href="/ogrenci/giris" className="text-teal-600 font-semibold hover:underline">
            Öğrenci Girişi Yap
          </Link>
        </p>
      </div>
    </div>
  );
}