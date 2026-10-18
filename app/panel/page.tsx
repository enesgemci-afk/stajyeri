'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS } from '@/lib/constants';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

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

type AppStatus = 'pending' | 'approved' | 'rejected';

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

const EDU_LEVELS = [
  'MESEM (Çırak - 9, 10, 11. Sınıf)',
  'MESEM (Kalfa - 12. Sınıf)',
  'Meslek Lisesi (12. Sınıf Stajyeri)',
  'Üniversite / Önlisans Stajyeri',
];

const STATUS_META: Record<AppStatus, { label: string; badge: string }> = {
  pending: { label: 'İncelemede', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Olumlu', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Olumsuz', badge: 'bg-red-50 text-red-700 border-red-200' },
};

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
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
        <section className="bg-gradient-to-br from-[#0A1931] via-[#0D2244] to-[#0A1931] text-white rounded-3xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A8B5]/15 border border-[#00A8B5]/30 text-[#00E5FF] text-[10px] font-bold mb-4">
            <Sparkles className="w-3 h-3" /> ÖĞRENCİ PANELİ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Merhaba, {firstName} 👋</h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-xl">
            {counts.total > 0
              ? `${counts.total} başvurunuz takip ediliyor. Yeni fırsatları kaçırmayın!`
              : 'Henüz başvurunuz yok. Sana uygun staj fırsatlarını keşfetmeye başla!'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="px-5 py-2.5 bg-[#00A8B5] hover:bg-[#00929e] text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2">
              <Search className="w-4 h-4" /> İlanları Keşfet
            </Link>
            <Link href="/basvurularim" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Tüm Başvurularım
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: ClipboardList, label: 'Toplam Başvuru', value: counts.total, cls: 'bg-slate-100 text-[#0A1931]' },
            { icon: Clock, label: 'İncelemede', value: counts.pending, cls: 'bg-amber-50 text-amber-600' },
            { icon: CheckCircle2, label: 'Olumlu', value: counts.approved, cls: 'bg-emerald-50 text-emerald-600' },
            { icon: XCircle, label: 'Olumsuz', value: counts.rejected, cls: 'bg-red-50 text-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.cls}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-[#0A1931]">{s.value}</p>
                <p className="text-[11px] text-slate-500 font-bold">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-6 mt-6">
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

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7">
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
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[11px] text-slate-400">
        &copy; 2026 Stajyeri.net &bull; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
