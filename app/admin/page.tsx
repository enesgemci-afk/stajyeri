'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  Users, 
  Trash2, 
  ArrowLeft, 
  Search, 
  Lock, 
  User, 
  LogIn, 
  LogOut, 
  AlertCircle 
} from 'lucide-react';

export default function AdminDashboardPage() {
  // Giriş Doğrulama State'leri
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Panel Veri State'leri
  const [activeTab, setActiveTab] = useState<'jobs' | 'companies' | 'students' | 'applications'>('jobs');
  const [loading, setLoading] = useState(false);

  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // İstatistikler
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCompanies: 0,
    totalStudents: 0,
    totalApplications: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');

  // 1. İstemci yüklendiğinde oturumu kontrol et
  useEffect(() => {
    setIsClient(true);
    try {
      const isLogged = typeof window !== 'undefined' && sessionStorage.getItem('admin_auth') === 'true';
      if (isLogged) {
        setIsAuthenticated(true);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Admin Giriş İşlemi
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (usernameInput.trim() === 'enes' && passwordInput.trim() === 'admin') {
      try {
        sessionStorage.setItem('admin_auth', 'true');
      } catch (e) {}
      setIsAuthenticated(true);
      loadAdminData();
    } else {
      setLoginError('Hatalı kullanıcı adı veya şifre girdiniz.');
    }
  };

  // Admin Çıkış İşlemi
  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('admin_auth');
    } catch (e) {}
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Verileri Çek
  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. İlanları Çek
      const { data: jobList } = await supabase
        .from('job_posts')
        .select('*, company_details(company_name)')
        .order('created_at', { ascending: false });

      // 2. İşletmeleri Çek
      const { data: compList } = await supabase
        .from('company_details')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Öğrencileri Çek
      const { data: stuList } = await supabase
        .from('student_profiles')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      // 4. Başvuruları Çek
      const { data: appList } = await supabase
        .from('applications')
        .select('*, job_posts(title), student_profiles(field_name, profiles(full_name))')
        .order('created_at', { ascending: false });

      const j = jobList || [];
      const c = compList || [];
      const s = stuList || [];
      const a = appList || [];

      setJobs(j);
      setCompanies(c);
      setStudents(s);
      setApplications(a);

      setStats({
        totalJobs: j.length,
        activeJobs: j.filter((item) => item.is_active).length,
        totalCompanies: c.length,
        totalStudents: s.length,
        totalApplications: a.length,
      });
    } catch (error) {
      console.error('Admin veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // İlan Durumu Güncelle (Aktif / Pasif)
  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('job_posts')
      .update({ is_active: !currentStatus })
      .eq('id', jobId);

    if (!error) {
      setJobs((prev) =>
        prev.map((item) =>
          item.id === jobId ? { ...item, is_active: !currentStatus } : item
        )
      );
    }
  };

  // İlan Sil
  const deleteJob = async (jobId: string) => {
    if (!confirm('Bu ilanı tamamen silmek istediğinize emin misiniz?')) return;

    const { error } = await supabase.from('job_posts').delete().eq('id', jobId);
    if (!error) {
      setJobs((prev) => prev.filter((item) => item.id !== jobId));
    }
  };

  // Filtrelenen İlanlar
  const filteredJobs = jobs.filter((j) =>
    j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.field_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // İstemci yüklenene kadar boş dönmeyip doğrudan giriş formunu hazırla
  if (!isClient) {
    return null;
  }

  // --- GİRİŞ YAPILMAMIŞSA GÖSTERİLECEK GÜVENLİK GİRİŞ FORMU ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1931] flex flex-col justify-between font-sans px-4 py-8">
        <div className="max-w-md w-full mx-auto flex items-center justify-between text-xs text-slate-400">
          <Link href="/" className="hover:text-white flex items-center gap-1.5 transition">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
          <span className="font-bold text-[#00E5FF]">Stajyeri.net Security</span>
        </div>

        <div className="max-w-md w-full mx-auto my-auto bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0A1931] text-[#00E5FF] flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-[#0A1931]">Yönetici Doğrulaması</h1>
            <p className="text-xs text-slate-500 mt-1">
              Merkezi yönetim paneline erişmek için bilgilerinizi girin.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kullanıcı Adı</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
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
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#0A1931]/20 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Güvenli Giriş Yap
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          stajyeri.net &bull; Yetkisiz erişimler kayıt altına alınmaktadır.
        </div>
      </div>
    );
  }

  // --- GİRİŞ YAPILDIKTAN SONRAKİ TAM YÖNETİM PANELİ ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      
      {/* Admin Üst Bar */}
      <header className="bg-[#0A1931] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" /> Siteye Dön
            </Link>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FF6B00] text-white text-[10px] font-black tracking-wider uppercase">
                YÖNETİCİ: ENES
              </span>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                Stajyeri<span className="text-[#00A8B5]">.net</span> Admin Paneli
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Yenile
            </button>
            <button
              onClick={handleAdminLogout}
              className="text-xs font-bold bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* 1. Sayaçlar / Metrikler */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Toplam İlan</span>
              <Briefcase className="w-4 h-4 text-[#00A8B5]" />
            </div>
            <p className="text-2xl font-black text-[#0A1931]">{stats.totalJobs}</p>
            <span className="text-[10px] font-bold text-green-600">{stats.activeJobs} Aktif Yayında</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Kayıtlı İşletme</span>
              <Building2 className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <p className="text-2xl font-black text-[#0A1931]">{stats.totalCompanies}</p>
            <span className="text-[10px] text-slate-400">Onaylı Kurum</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Kayıtlı Öğrenci</span>
              <GraduationCap className="w-4 h-4 text-[#00A8B5]" />
            </div>
            <p className="text-2xl font-black text-[#0A1931]">{stats.totalStudents}</p>
            <span className="text-[10px] text-slate-400">MESEM & MTAL</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Başvuru</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-[#0A1931]">{stats.totalApplications}</p>
            <span className="text-[10px] text-slate-400">Öğrenci Talebi</span>
          </div>

          <div className="bg-[#0A1931] text-white p-5 rounded-2xl shadow-sm col-span-2 md:col-span-1 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#00E5FF] font-bold">
              <ShieldCheck className="w-4 h-4" /> Sistem Durumu
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Veritabanı: Aktif</p>
              <p className="text-[10px] text-slate-400">Supabase RLS Korumalı</p>
            </div>
          </div>
        </div>

        {/* 2. Sekmeler (Tabs) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                activeTab === 'jobs' ? 'bg-white text-[#0A1931] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              İlan Yönetimi ({jobs.length})
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                activeTab === 'companies' ? 'bg-white text-[#0A1931] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              İşletmeler ({companies.length})
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                activeTab === 'students' ? 'bg-white text-[#0A1931] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Öğrenciler ({students.length})
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                activeTab === 'applications' ? 'bg-white text-[#0A1931] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Başvurular ({applications.length})
            </button>
          </div>

          {/* Arama Kutusu */}
          {activeTab === 'jobs' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="İlan, şehir veya alan ara..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#00A8B5]"
              />
            </div>
          )}
        </div>

        {/* 3. Tablo İçerikleri */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">
            Yönetim verileri yükleniyor...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* TAB 1: İLAN YÖNETİMİ */}
            {activeTab === 'jobs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                      <th className="p-4">İlan Başlığı</th>
                      <th className="p-4">İşletme</th>
                      <th className="p-4">MESEM Alanı</th>
                      <th className="p-4">Şehir / İlçe</th>
                      <th className="p-4">Kontenjan</th>
                      <th className="p-4">Durum</th>
                      <th className="p-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">Kayıtlı ilan bulunamadı.</td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 font-bold text-[#0A1931]">
                            <Link href={`/ilan/${job.id}`} className="hover:text-[#00A8B5] transition">
                              {job.title}
                            </Link>
                          </td>
                          <td className="p-4">{job.company_details?.company_name || '-'}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                              {job.field_name}
                            </span>
                          </td>
                          <td className="p-4">{job.city} / {job.district}</td>
                          <td className="p-4 font-bold">{job.quota || 1} Kişi</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              job.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                            }`}>
                              {job.is_active ? 'Yayında' : 'Pasif'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleJobStatus(job.id, job.is_active)}
                                title={job.is_active ? 'İlanı Pasife Al' : 'İlanı Yayına Al'}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                  job.is_active
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {job.is_active ? 'Durdur' : 'Yayınla'}
                              </button>
                              <button
                                onClick={() => deleteJob(job.id)}
                                title="İlanı Sil"
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: İŞLETMELER */}
            {activeTab === 'companies' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                      <th className="p-4">Şirket / Kurum Adı</th>
                      <th className="p-4">Şehir</th>
                      <th className="p-4">İlçe / Sanayi Bölgesi</th>
                      <th className="p-4">Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {companies.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-bold text-[#0A1931] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#FF6B00]" /> {c.company_name}
                        </td>
                        <td className="p-4">{c.city || '-'}</td>
                        <td className="p-4">{c.district || '-'}</td>
                        <td className="p-4 text-slate-400">
                          {new Date(c.created_at).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: ÖĞRENCİLER */}
            {activeTab === 'students' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                      <th className="p-4">Öğrenci Adı</th>
                      <th className="p-4">MESEM Meslek Alanı</th>
                      <th className="p-4">Eğitim Kademesi</th>
                      <th className="p-4">Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-bold text-[#0A1931] flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-[#00A8B5]" /> {s.profiles?.full_name || 'Öğrenci'}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{s.field_name || '-'}</td>
                        <td className="p-4 text-slate-500">{s.education_level || '-'}</td>
                        <td className="p-4 text-slate-400">
                          {new Date(s.created_at).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: BAŞVURULAR */}
            {activeTab === 'applications' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                      <th className="p-4">Aday Öğrenci</th>
                      <th className="p-4">Başvurulan İlan</th>
                      <th className="p-4">Öğrenci Alanı</th>
                      <th className="p-4">Başvuru Durumu</th>
                      <th className="p-4">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-bold text-[#0A1931]">
                          {app.student_profiles?.profiles?.full_name || 'Aday'}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{app.job_posts?.title || 'İlan'}</td>
                        <td className="p-4">{app.student_profiles?.field_name || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            app.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status === 'accepted' ? 'Kabul Edildi' : app.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(app.created_at).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        stajyeri.net &bull; Merkezi Yönetim ve Denetim Portalı
      </footer>
    </div>
  );
}