'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import {
  School, LogIn, LogOut, AlertCircle, Loader2, Users, FileText, ClipboardList,
  CheckCircle2, Clock, ShieldAlert, Printer, BadgeCheck,
} from 'lucide-react';

interface PanelStudent {
  student_id: string;
  full_name: string | null;
  field_name: string | null;
  education_level: string | null;
  has_cv: boolean;
  total_apps: number;
  approved: number;
  rejected: number;
  pending: number;
  guardian_pending: number;
}

interface PanelData {
  school: { name: string; city: string | null; district: string | null; verified: boolean };
  students: PanelStudent[];
}

export default function OkulPanelPage() {
  const [mode, setMode] = useState<'loading' | 'login' | 'denied' | 'ready'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [data, setData] = useState<PanelData | null>(null);

  const loadPanel = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setMode('login'); return; }

    const { data: prof } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .maybeSingle();
    if (prof?.user_type !== 'school') { setMode('denied'); return; }

    const { data: panel, error } = await supabase.rpc('school_panel_data');
    if (error || !panel) { setMode('denied'); return; }

    setData(panel as unknown as PanelData);
    setMode('ready');
  }, []);

  useEffect(() => {
    // Ertelenmiş çağrı: effect içinde senkron setState zincirini engeller
    const t = setTimeout(() => { void loadPanel(); }, 0);
    return () => clearTimeout(t);
  }, [loadPanel]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setLoginError('E-posta veya şifre hatalı.'); return; }
      await loadPanel();
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail('');
    setPassword('');
    setData(null);
    setMode('login');
  };

  if (mode === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-[#00A8B5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (mode === 'denied') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-[#0A1931]">Okul Hesabı Gerekli</h1>
            <p className="text-xs text-slate-500 mt-2">
              Bu panel yalnızca okul koordinatörü hesapları içindir. Okulunuz kayıtlı değilse koordinatör kaydı oluşturun.
            </p>
            <div className="mt-6 space-y-2">
              <Link href="/okul/kayit" className="block w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white font-extrabold rounded-xl text-xs transition">
                Okul Koordinatör Kaydı
              </Link>
              <button onClick={handleLogout} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition cursor-pointer">
                Farklı Hesapla Giriş Yap
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-7">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <School className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-[#0A1931]">Okul Koordinatör Paneli</h1>
              <p className="text-xs text-slate-500 mt-1.5">
                Öğrencilerinizin staj başvurularını tek panelden izleyin.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Kurum e-postanız"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition"
              />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifreniz"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A8B5] transition"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-[#0A1931] hover:bg-[#00A8B5] text-white text-xs font-extrabold rounded-xl transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Panele Giriş Yap
              </button>
            </form>

            <p className="text-center text-[11px] text-slate-500 mt-5">
              Okul hesabınız yok mu?{' '}
              <Link href="/okul/kayit" className="font-black text-[#00A8B5] hover:underline">Koordinatör Kaydı Oluştur</Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const students = data?.students ?? [];
  const totals = {
    students: students.length,
    withCv: students.filter((s) => s.has_cv).length,
    apps: students.reduce((a, s) => a + Number(s.total_apps), 0),
    approved: students.reduce((a, s) => a + Number(s.approved), 0),
    pending: students.reduce((a, s) => a + Number(s.pending), 0),
    guardian: students.reduce((a, s) => a + Number(s.guardian_pending), 0),
  };

  const fieldMap = new Map<string, { count: number; apps: number; approved: number }>();
  for (const s of students) {
    const key = s.field_name || 'Belirtilmedi';
    const cur = fieldMap.get(key) ?? { count: 0, apps: 0, approved: 0 };
    cur.count += 1;
    cur.apps += Number(s.total_apps);
    cur.approved += Number(s.approved);
    fieldMap.set(key, cur);
  }
  const byField = Array.from(fieldMap.entries()).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-slate-500 hover:text-[#00A8B5] flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Raporu Yazdır
            </button>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1.5 transition cursor-pointer">
              <LogOut className="w-4 h-4" /> Çıkış
            </button>
          </div>
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <section className="bg-gradient-to-br from-[#0A1931] via-[#0D2244] to-[#0A1931] text-white rounded-3xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold mb-4">
            🎓 OKUL KOORDINATÖR PANELİ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{data?.school.name}</h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm">
            {[data?.school.district, data?.school.city].filter(Boolean).join(', ') || 'Konum belirtilmedi'}
            {' · '}{totals.students} kayıtlı öğrenci · {totals.apps} başvuru
          </p>
          {data?.school.verified ? (
            <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11px] font-black">
              <BadgeCheck className="w-4 h-4" /> Doğrulanmış Okul — kayıt formunda listeleniyorsunuz
            </span>
          ) : (
            <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-black">
              <ShieldAlert className="w-4 h-4" /> Doğrulama bekliyor — öğrenciler sizinle eşleşince burada görünecek
            </span>
          )}
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {[
            { icon: Users, label: 'Kayıtlı Öğrenci', value: totals.students, cls: 'bg-slate-100 text-[#0A1931]' },
            { icon: FileText, label: 'CV Oluşturan', value: totals.withCv, cls: 'bg-teal-50 text-[#00A8B5]' },
            { icon: ClipboardList, label: 'Toplam Başvuru', value: totals.apps, cls: 'bg-slate-100 text-[#0A1931]' },
            { icon: CheckCircle2, label: 'Yerleşen', value: totals.approved, cls: 'bg-emerald-50 text-emerald-600' },
            { icon: Clock, label: 'İncelemede', value: totals.pending, cls: 'bg-amber-50 text-amber-600' },
            { icon: ShieldAlert, label: 'Veli Onayı Bekleyen', value: totals.guardian, cls: 'bg-orange-50 text-orange-600' },
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

        {/* Alan bazlı özet */}
        <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-xs font-black text-[#0A1931] mb-3">Alan Bazlı Özet</h2>
          {byField.length === 0 ? (
            <p className="text-[11px] text-slate-500">
              Henüz okulunuzla eşleşen öğrenci yok. Öğrencileriniz kayıt sırasında okul adınızı seçmeli (veya öğrenci panelinden sonradan seçmeli).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="text-left py-2 font-black">Alan</th>
                    <th className="text-right py-2 font-black">Öğrenci</th>
                    <th className="text-right py-2 font-black">Başvuru</th>
                    <th className="text-right py-2 font-black">Yerleşen</th>
                  </tr>
                </thead>
                <tbody>
                  {byField.map(([name, v]) => (
                    <tr key={name} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 font-bold text-[#0A1931]">{name}</td>
                      <td className="py-2 text-right font-bold">{v.count}</td>
                      <td className="py-2 text-right font-bold">{v.apps}</td>
                      <td className="py-2 text-right font-bold text-emerald-600">{v.approved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Öğrenci listesi */}
        <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-xs font-black text-[#0A1931] mb-3">Öğrencilerim ({totals.students})</h2>
          {students.length === 0 ? (
            <p className="text-[11px] text-slate-500">Eşleşen öğrenci bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="text-left py-2 font-black">Öğrenci</th>
                    <th className="text-left py-2 font-black">Alan</th>
                    <th className="text-left py-2 font-black">Eğitim</th>
                    <th className="text-center py-2 font-black">CV</th>
                    <th className="text-right py-2 font-black">Başvuru</th>
                    <th className="text-right py-2 font-black">Olumlu</th>
                    <th className="text-right py-2 font-black">Bekleyen</th>
                    <th className="text-right py-2 font-black">Veli Onayı</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.student_id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 font-black text-[#0A1931]">{s.full_name || 'İsimsiz'}</td>
                      <td className="py-2.5 text-slate-600">{s.field_name || '—'}</td>
                      <td className="py-2.5 text-slate-600">{s.education_level || '—'}</td>
                      <td className="py-2.5 text-center">{s.has_cv ? '✅' : '—'}</td>
                      <td className="py-2.5 text-right font-bold">{s.total_apps}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">{s.approved}</td>
                      <td className="py-2.5 text-right font-bold text-amber-600">{s.pending}</td>
                      <td className="py-2.5 text-right font-bold">
                        {s.guardian_pending > 0 ? (
                          <span className="text-orange-600">{s.guardian_pending} bekliyor</span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-[11px] text-slate-400 leading-relaxed">
          Gizlilik: Panel yalnızca özet bilgileri gösterir; öğrencilerin başvuru mesajları ve iletişim bilgileri koordinatörle paylaşılmaz (KVKK).
        </p>
      </main>
    </div>
  );
}
