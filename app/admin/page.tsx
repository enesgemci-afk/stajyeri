'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

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

// ---- Tip tanımları ----
interface AdminJob {
  id: string;
  title: string | null;
  field_name: string | null;
  city: string | null;
  district: string | null;
  quota: number | null;
  is_active: boolean | null;
  company_details?: { company_name: string | null } | null;
}

interface AdminCompany {
  id: string;
  company_name: string | null;
  city: string | null;
  district: string | null;
  created_at: string;
}

interface AdminStudent {
  id: string;
  field_name: string | null;
  education_level: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

interface AdminApplication {
  id: string;
  status: string | null;
  created_at: string;
  job_posts?: { title: string | null } | null;
  student_profiles?: { field_name: string | null; profiles?: { full_name: string | null } | null } | null;
}

export default function AdminDashboardPage() {
  // Oturum durumu: loading -> login | denied | ready
  const [mode, setMode] = useState<'loading' | 'login' | 'denied' | 'ready'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Panel Veri State'leri
  const [activeTab, setActiveTab] = useState<'jobs' | 'companies' | 'students' | 'applications'>('jobs');
  const [loading, setLoading] = useState(false);

  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);

  // İstatistikler
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCompanies: 0,
    totalStudents: 0,
    totalApplications: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Verileri Çek (useCallback: effect'ten ÖNCE tanımlanmalı)
  const loadAdminData = useCallback(async () => {
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

      const j = (jobList ?? []) as AdminJob[];
      const c = (compList ?? []) as AdminCompany[];
      const s = (stuList ?? []) as AdminStudent[];
      const a = (appList ?? []) as AdminApplication[];

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
  }, []);

  // Oturum + yönetici bayrağı (is_admin) kontrolü
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      if (!data.session) {
        setMode('login');
        return;
      }
      const { data: prof } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.session.user.id)
        .single();
      if (!alive) return;
      if (prof?.is_admin === true) {
        setMode('ready');
        void loadAdminData();
      } else {
        setMode('denied');
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadAdminData]);

  // Yönetici Girişi — Supabase hesabı + is_admin bayrağı zorunlu
  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setBusy(true);
    try {
      // Kısa kullanıcı adı desteği: 'enesg' -> 'enesg@stajyeri.net'
      const identifier = email.includes('@') ? email.trim() : `${email.trim().toLowerCase()}@stajyeri.net`;
      const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
      if (error) {
        setLoginError('E-posta veya şifre hatalı.');
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id ?? '')
        .single();
      if (!prof?.is_admin) {
        setLoginError('Bu hesap yönetici yetkisine sahip değil.');
        return;
      }
      setPassword('');
      setMode('ready');
      void loadAdminData();
    } finally {
      setBusy(false);
    }
  };

  // Yönetici Çıkışı
  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setEmail('');
    setPassword('');
    setMode('login');
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

  // Oturum kontrolü sürerken boş dön
  if (mode === 'loading') {
    return null;
  }

  // --- YÖNETİCİ YETKİSİ OLMAYAN HESAP ---
  if (mode === 'denied') {
    return (
      <div className="min-h-screen bg-[#0A1931] flex flex-col justify-between font-sans px-4 py-8">
        <div className="max-w-md w-full mx-auto flex items-center justify-between text-xs text-slate-400">
          <Link href="/" className="hover:text-white flex items-center gap-1.5 transition">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
          <span className="font-bold text-[#00E5FF]">Stajyeri.net Security</span>
        </div>

        <div className="max-w-md w-full mx-auto my-auto bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 shadow-md">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0A1931]">Erişim Yetkisi Yok</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Bu hesap yönetici yetkisine sahip değil. Lütfen yönetici hesabınızla giriş yapın.
          </p>
          <button
            onClick={handleAdminLogout}
            className="w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Farklı Hesapla Giriş Yap
          </button>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          stajyeri.net &bull; Yetkisiz erişimler kayıt altına alınmaktadır.
        </div>
      </div>
    );
  }

  // --- GİRİŞ YAPILMAMIŞSA GÖSTERİLECEK GÜVENLİK GİRİŞ FORMU ---
  if (mode === 'login') {
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
              Merkezi yönetim paneline erişmek için yönetici hesabınızla giriş yapın.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kullanıcı Adı veya E-posta</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ör. enesg"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              disabled={busy}
              className="w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#0A1931]/20 disabled:opacity-60 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> {busy ? 'Doğrulanıyor...' : 'Güvenli Giriş Yap'}
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
      
      {/* Admin Üst Bar — ortak SiteHeader */}
      <SiteHeader
        backLabel="Siteye Dön"
        right={
          <>
            <span className="px-2.5 py-0.5 rounded-md bg-[#FF6B00] text-white text-[10px] font-black tracking-wider uppercase">
              YÖNETİCİ: ENES
            </span>
            <Link
              href="/admin/havuz"
              className="text-xs font-bold text-white bg-[#0A1931] hover:bg-[#00A8B5] px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Havuz & Kontör
            </Link>
            <button
              onClick={loadAdminData}
              className="text-xs font-bold text-slate-600 hover:text-[#00A8B5] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Yenile
            </button>
            <button
              onClick={handleAdminLogout}
              className="text-xs font-bold bg-red-600/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Çıkış Yap
            </button>
          </>
        }
      >
        <h1 className="hidden md:flex text-sm sm:text-base font-black tracking-tight text-[#0A1931] items-center gap-1.5">
          Stajyeri<span className="text-[#00A8B5]">.net</span> Admin Paneli
        </h1>
      </SiteHeader>

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
                                onClick={() => toggleJobStatus(job.id, job.is_active === true)}
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