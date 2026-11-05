'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, EDU_LEVELS } from '@/lib/constants';
import { APP_STATUS_META, type AppStatus } from '@/lib/appStatus';
import StudentSidebar from './StudentSidebar';
import { PANEL_TOKENS } from '@/lib/panelTokens';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

import {
  GraduationCap,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardList,
  ChevronRight,
  Building2,
  Pencil,
  X,
  Save,
  Phone,
  BookOpen,
  Sparkles,
  AlertCircle,
  Search,
} from 'lucide-react';

interface AppRow {
  id: string;
  status: AppStatus;
  created_at: string;
  job_posts?: {
    id: string;
    title: string;
    city: string | null;
    company_details?: { company_name?: string } | null;
  } | null;
}

const STATUS_META = APP_STATUS_META;

export default function OgrenciPanelPage() {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<'guest' | 'student' | 'employer'>('guest');
  const [uid, setUid] = useState<string | null>(null);

  // Profil bilgileri
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [field, setField] = useState('');
  const [education, setEducation] = useState('');
  const [spId, setSpId] = useState<string | null>(null);

  // Başvurular
  const [apps, setApps] = useState<AppRow[]>([]);

  // Profil düzenleme
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // OKUL_MODULU — öğrencinin okulu
  const [mySchool, setMySchool] = useState('');
  const [schoolOptions, setSchoolOptions] = useState<{ school_name: string; verified: boolean }[]>([]);
  const [schoolSaving, setSchoolSaving] = useState(false);
  const [schoolMsg, setSchoolMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // BECERILERIM — student_cvs.skills (CV'ye yazdığın yetkinlikler)
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;
    setUid(userId);

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, user_type')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.user_type === 'employer') {
      setFullName(profile?.full_name ?? '');
      setAuthState('employer');
      setLoading(false);
      return;
    }

    setAuthState('student');
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');

    const { data: sp } = await supabase
      .from('student_profiles')
      .select('id, field_name, education_level')
      .eq('profile_id', userId)
      .maybeSingle();

    if (sp) {
      setSpId(sp.id);
      setField(sp.field_name ?? '');
      setEducation(sp.education_level ?? '');

      // OKUL_MODULU — öğrencinin okulu + okul listesi (kolon yoksa sessizce atla)
      try {
        const { data: spFull } = await supabase
          .from('student_profiles')
          .select('school_name')
          .eq('id', sp.id)
          .maybeSingle();
        if (spFull?.school_name) setMySchool(spFull.school_name as string);

        const { data: rows } = await supabase.rpc('public_school_list');
        if (rows) setSchoolOptions(rows as { school_name: string; verified: boolean }[]);
      } catch {
        /* modül kurulu değilse kritik değil */
      }

      const { data: appList } = await supabase
        .from('applications')
        .select(
          `
          id, status, created_at,
          job_posts (
            id, title, city,
            company_details ( company_name )
          )
        `
        )
        .eq('student_id', sp.id)
        .order('created_at', { ascending: false });

      if (appList) setApps(appList as unknown as AppRow[]);

      // BECERILERIM — CV kaydından yetkinlikler (tablo/kolon yoksa sessizce atla)
      try {
        const { data: cvRow } = await supabase
          .from('student_cvs')
          .select('skills')
          .eq('profile_id', userId)
          .maybeSingle();
        if (cvRow?.skills && Array.isArray(cvRow.skills)) {
          setSkills(cvRow.skills as string[]);
        }
      } catch {
        /* student_cvs kurulmadıysa kritik değil */
      }
    }

    setLoading(false);
  }

  const handleSaveProfile = async () => {
    if (!uid) return;
    setSaving(true);
    setSaveMsg(null);

    try {
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() || null })
        .eq('id', uid);
      if (pErr) throw pErr;

      if (spId) {
        const { error: sErr } = await supabase
          .from('student_profiles')
          .update({ field_name: field, education_level: education })
          .eq('id', spId);
        if (sErr) throw sErr;
      } else {
        const { data: newSp, error: sErr } = await supabase
          .from('student_profiles')
          .insert({
            profile_id: uid,
            field_name: field,
            education_level: education,
          })
          .select('id')
          .single();
        if (sErr) throw sErr;
        setSpId(newSp.id);
      }

      setSaveMsg({ type: 'ok', text: 'Profiliniz güncellendi.' });
      setEditing(false);
    } catch (err: any) {
      setSaveMsg({ type: 'err', text: err.message || 'Güncelleme başarısız oldu.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const counts = {
    total: apps.length,
    pending: apps.filter((a) => a.status === 'pending').length,
    approved: apps.filter((a) => a.status === 'approved').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  };

  const recentApps = apps.slice(0, 5);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const firstName = fullName.split(' ')[0] || 'Öğrenci';

  const inputCls =
    'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-[#00A8B5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === 'guest') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0A1931]">Öğrenci Paneli</h1>
          <p className="text-xs text-slate-500 mt-2">Panelinizi görmek için öğrenci girişi yapın.</p>
          <div className="mt-6 space-y-2">
            <Link href="/ogrenci/giris" className="block w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition">
              Giriş Yap
            </Link>
            <Link href="/ogrenci/kayit" className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (authState === 'employer') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0A1931]">İşveren Hesabıyla Giriş Yaptınız</h1>
          <p className="text-xs text-slate-500 mt-2">
            Öğrenci paneli öğrenci hesapları içindir. İşletme panelinizden ilanlarınızı ve başvurularınızı yönetin.
          </p>
          <Link href="/isveren/panel" className="inline-block mt-6 px-6 py-3 bg-[#FF6B00] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs transition">
            İşveren Paneline Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans scroll-smooth">
      <SiteHeader
        right={
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs font-bold text-slate-500">Merhaba, {firstName}</span>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1.5 transition cursor-pointer">
              <LogOut className="w-4 h-4" /> Çıkış
            </button>
          </div>
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8 lg:items-start">
          {/* SOL SIDEBAR — SaaS dashboard navigasyonu */}
          <StudentSidebar
            fullName={fullName}
            education={education}
            field={field}
            school={mySchool}
            pendingCount={counts.pending}
            skillsCount={skills.length}
            onLogout={handleLogout}
          />

          <div className="min-w-0 mt-6 lg:mt-0">
        <section id="ozet" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-8 relative overflow-hidden scroll-mt-24">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A8B5]/10 border border-[#00A8B5]/25 text-[#00A8B5] text-[10px] font-bold mb-3">
                <Sparkles className="w-3 h-3" /> ÖĞRENCİ PANELİ
              </div>
              <h1 className={`text-2xl sm:text-3xl font-black text-[#0A1931] ${PANEL_TOKENS.fontDisplay}`}>
                Merhaba, {firstName} 👋
              </h1>
              <p className="mt-2 text-slate-500 text-xs sm:text-sm max-w-xl">
                {counts.total > 0
                  ? `${counts.total} başvurunuz takip ediliyor. Yeni fırsatları kaçırmayın!`
                  : 'Henüz başvurunuz yok. Sana uygun staj fırsatlarını keşfetmeye başla!'}
              </p>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              {counts.pending > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-extrabold">
                  ⏳ {counts.pending} başvuru incelemede
                </span>
              )}
              {skills.length > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00A8B5]/10 border border-[#00A8B5]/25 text-[#00A8B5] rounded-full text-[10px] font-extrabold">
                  <Sparkles className='w-3 h-3 inline' /> {skills.length} beceri CV'de
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/" className="px-5 py-2.5 bg-[#00A8B5] hover:bg-[#00929e] text-white text-xs font-extrabold rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-[#00A8B5]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] focus-visible:ring-offset-2">
              <Search className="w-4 h-4" /> İlanları Keşfet
            </Link>
            <Link href="/basvurularim" className="px-5 py-2.5 bg-[#0080FF]/10 hover:bg-[#0080FF]/20 border border-[#0080FF]/25 text-[#0080FF] text-xs font-extrabold rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2">
              <ClipboardList className="w-4 h-4" /> Tüm Başvurularım
            </Link>
            <Link href="/patika" className="px-5 py-2.5 bg-[#8B00FF]/10 hover:bg-[#8B00FF]/20 border border-[#8B00FF]/25 text-[#8B00FF] text-xs font-extrabold rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B00FF] focus-visible:ring-offset-2">
              <Sparkles className="w-4 h-4" /> Staj Patikamı Kur
            </Link>
          </div>
        </section>

        {/* KPI KARTLARI — skill paleti */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: ClipboardList, label: 'Toplam Başvuru', value: counts.total, tone: 'blue' as const },
            { icon: Clock, label: 'İncelemede', value: counts.pending, tone: 'amber' as const },
            { icon: CheckCircle2, label: 'Olumlu', value: counts.approved, tone: 'emerald' as const },
            { icon: Sparkles, label: 'CV Becerisi', value: skills.length, tone: 'violet' as const },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-5 hover:shadow-[0_18px_50px_rgba(0,168,181,0.16)] hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${PANEL_TOKENS.kpiIcon(s.tone)}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className={`mt-3 text-2xl font-black text-[#0A1931] leading-tight ${PANEL_TOKENS.fontDisplay}`}>{s.value}</p>
              <p className="text-[11px] text-slate-500 font-bold">{s.label}</p>
            </div>
          ))}
        </section>

        {/* BECERILERIM — CV'den gelen yetkinlikler */}
        {authState === 'student' && (
          <section id="beceriler" className="mt-6 bg-white rounded-2xl border border-slate-200 p-5 scroll-mt-24">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-black text-[#0A1931] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" /> Becerilerim
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  CV’nde işaretlediğin yetkinlikler — işverenler havuzda seni bu etiketlerle bulur.
                </p>
              </div>
              <Link
                href="/cv-olustur"
                className="text-[11px] font-extrabold text-[#00A8B5] hover:underline flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              >
                {skills.length > 0 ? 'CV’ni Güncelle' : 'CV Oluştur'} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-bold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-3">
                Henüz beceri eklemedin — CV Oluşturucu, alanına özel beceri önerileri sunar.
              </p>
            )}
          </section>
        )}

        {/* OKUL_MODULU — öğrencinin okulu */}
        {authState === 'student' && (
          <section id="okul" className="mt-6 bg-white rounded-2xl border border-slate-200 p-5 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-black text-[#0A1931] mb-1">
                  <GraduationCap className='w-3.5 h-3.5 inline' /> Okulum <span className="text-slate-400 font-bold">(koordinatörünüz sizi buradan takip eder)</span>
                </label>
                <select
                  value={mySchool}
                  onChange={(e) => setMySchool(e.target.value)}
                  className="w-full sm:max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5] cursor-pointer"
                >
                  <option value="">Başka bir okul / belirtmek istemiyorum</option>
                  {schoolOptions.map((s) => (
                    <option key={s.school_name} value={s.school_name}>
                      {s.school_name}{s.verified ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
                {schoolMsg && (
                  <p className={`text-[11px] font-bold mt-1.5 ${schoolMsg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {schoolMsg.text}
                  </p>
                )}
              </div>
              <button
                onClick={async () => {
                  if (!spId) return;
                  setSchoolSaving(true);
                  setSchoolMsg(null);
                  try {
                    const { error } = await supabase
                      .from('student_profiles')
                      .update({ school_name: mySchool || null })
                      .eq('id', spId);
                    setSchoolMsg(
                      error
                        ? { type: 'err', text: 'Kaydedilemedi — okul modülü henüz aktif edilmemiş olabilir.' }
                        : { type: 'ok', text: 'Okulunuz kaydedildi.' }
                    );
                  } finally {
                    setSchoolSaving(false);
                  }
                }}
                disabled={schoolSaving || !spId}
                className="px-5 py-2.5 bg-[#0A1931] hover:bg-[#00A8B5] text-white text-xs font-extrabold rounded-xl transition cursor-pointer disabled:opacity-60 self-start sm:self-end"
              >
                {schoolSaving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </section>
        )}

        {/* Eski istatistik grid'i hero üstüne taşındı */}

        <section id="basvurular" className="grid lg:grid-cols-3 gap-6 mt-6 scroll-mt-24">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-[#0A1931] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#00A8B5]" /> Son Başvurularım
              </h2>
              {apps.length > 0 && (
                <Link href="/basvurularim" className="text-[11px] font-bold text-[#00A8B5] hover:underline flex items-center gap-1">
                  Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {recentApps.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-500 font-bold">Henüz başvurunuz yok.</p>
                <Link href="/" className="inline-block mt-4 px-5 py-2.5 bg-[#00A8B5] hover:bg-[#00929e] text-white text-xs font-extrabold rounded-xl transition">
                  Staj İlanlarını Keşfet
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApps.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl transition">
                    <div className="min-w-0">
                      <Link href={`/ilan/${a.job_posts?.id}`} className="text-xs font-black text-[#0A1931] hover:text-[#00A8B5] transition truncate block">
                        {a.job_posts?.title ?? 'İlan'}
                      </Link>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {a.job_posts?.company_details?.company_name ?? 'İşletme'}
                        {a.job_posts?.city ? ` • ${a.job_posts.city}` : ''} • {formatDate(a.created_at)}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold whitespace-nowrap ${STATUS_META[a.status].badge}`}>
                      {STATUS_META[a.status].label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div id="profil" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 scroll-mt-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-[#0A1931] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#00A8B5]" /> Profilim
              </h2>
              <button
                onClick={() => { setEditing(!editing); setSaveMsg(null); }}
                className="text-[11px] font-bold text-[#00A8B5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {editing ? (<><X className="w-3.5 h-3.5" /> İptal</>) : (<><Pencil className="w-3.5 h-3.5" /> Düzenle</>)}
              </button>
            </div>

            {saveMsg && (
              <div className={`mb-4 p-3 rounded-xl text-[11px] font-bold flex items-center gap-2 ${saveMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveMsg.text}
              </div>
            )}

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Ad Soyad</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Telefon</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Meslek Alanı</label>
                  <select value={field} onChange={(e) => setField(e.target.value)} className={inputCls}>
                    <option value="">Seçiniz</option>
                    {MESEM_FIELDS.map((f) => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Eğitim Durumu</label>
                  <select value={education} onChange={(e) => setEducation(e.target.value)} className={inputCls}>
                    <option value="">Seçiniz</option>
                    {EDU_LEVELS.map((lv) => (<option key={lv} value={lv}>{lv}</option>))}
                  </select>
                </div>
                <button onClick={handleSaveProfile} disabled={saving} className="w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500">Ad Soyad</span>
                  <span className="text-[11px] text-slate-800 font-medium text-right">{fullName || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500">Telefon</span>
                  <span className="text-[11px] text-slate-800 font-medium">{phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500">Meslek Alanı</span>
                  <span className="text-[11px] text-slate-800 font-medium text-right">{field || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500">Eğitim Durumu</span>
                  <span className="text-[11px] text-slate-800 font-medium text-right">{education || '—'}</span>
                </div>
              </div>
            )}
          </div>
        </section>
          </div>
        </div>
      </main>

      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
