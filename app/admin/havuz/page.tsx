'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Search,
  Coins,
  Lock,
  Unlock,
  X,
  PlusCircle,
  History,
  Users,
  AlertTriangle,
  Check,
} from 'lucide-react';

// ============================================================
// ADMIN | Stajyer Havuzu & Kontör Yönetimi (/admin/havuz)
// Gerçek Supabase oturumu + profiles.is_admin kontrolü.
// RPC'ler: admin_set_pool_access, admin_add_credits,
//          admin_list_employers, admin_credit_history
// ============================================================

interface EmployerRow {
  profile_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  city: string | null;
  balance: number;
  pool_granted: boolean;
}

interface TxRow {
  tx_id: string;
  employer: string;
  company: string | null;
  amount: number;
  kind: string;
  note: string | null;
  created_at: string;
}

type Mode = 'loading' | 'login' | 'denied' | 'ready';

// Kontör hareket türü etiketleri (credit_transactions.kind)
const KIND_LABEL: Record<string, string> = {
  admin_grant: 'Yönetici yüklemesi',
  pool_unlock: 'Profil açma (kontör)',
};

export default function AdminHavuzPage() {
  const [mode, setMode] = useState<Mode>('loading');

  // Giriş formu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // Liste verileri
  const [employers, setEmployers] = useState<EmployerRow[]>([]);
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [search, setSearch] = useState('');
  const [listLoading, setListLoading] = useState(false);

  // Aksiyon durumu
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Kontör yükleme penceresi
  const [creditFor, setCreditFor] = useState<EmployerRow | null>(null);
  const [creditAmount, setCreditAmount] = useState('10');
  const [creditNote, setCreditNote] = useState('');

  const loadLists = useCallback(async (q: string) => {
    setListLoading(true);
    const [eRes, tRes] = await Promise.all([
      supabase.rpc('admin_list_employers', { p_search: q && q.trim() ? q.trim() : null }),
      supabase.rpc('admin_credit_history', { p_limit: 30 }),
    ]);
    if (eRes.error) {
      setActionMsg({ type: 'err', text: 'İşveren listesi alınamadı: ' + eRes.error.message });
    } else {
      setEmployers((eRes.data ?? []) as EmployerRow[]);
    }
    if (!tRes.error) setTxs((tRes.data ?? []) as TxRow[]);
    setListLoading(false);
  }, []);

  // Oturum + admin (is_admin bayrağı) kontrolü
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (alive) setMode('login');
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
        loadLists('');
      } else {
        setMode('denied');
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadLists]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrMsg('');
    setActionMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setErrMsg(error.message);
      setBusy(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) {
      setErrMsg('Oturum alınamadı, tekrar deneyin.');
      setBusy(false);
      return;
    }
    const { data: prof } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', uid)
      .single();
    if (prof?.is_admin === true) {
      setMode('ready');
      setPassword('');
      loadLists('');
    } else {
      setMode('denied');
    }
    setBusy(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmployers([]);
    setTxs([]);
    setMode('login');
  };

  const toggleAccess = async (row: EmployerRow) => {
    setBusyId(row.profile_id);
    const next = !row.pool_granted;
    const { data, error } = await supabase.rpc('admin_set_pool_access', {
      p_employer: row.profile_id,
      p_granted: next,
      p_note: next ? 'Admin panelinden manuel yetki' : 'Admin panelinden yetki kaldırıldı',
    });
    const res = (data ?? {}) as { ok?: boolean; message?: string };
    if (error || !res.ok) {
      setActionMsg({ type: 'err', text: res.message ?? error?.message ?? 'Yetki güncellenemedi.' });
    } else {
      setActionMsg({ type: 'ok', text: res.message ?? 'Havuz erişimi güncellendi.' });
      loadLists(search);
    }
    setBusyId(null);
  };

  const submitCredit = async () => {
    if (!creditFor || busy) return;
    const amt = Number(creditAmount);
    if (!Number.isInteger(amt) || amt === 0) {
      setActionMsg({ type: 'err', text: 'Kontör miktarı sıfırdan farklı bir tam sayı olmalı.' });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc('admin_add_credits', {
      p_employer: creditFor.profile_id,
      p_amount: amt,
      p_note: creditNote.trim() || 'Admin panelinden manuel yükleme',
    });
    const res = (data ?? {}) as { ok?: boolean; message?: string };
    if (error || !res.ok) {
      setActionMsg({ type: 'err', text: res.message ?? error?.message ?? 'Kontör yüklenemedi.' });
    } else {
      setActionMsg({ type: 'ok', text: res.message ?? 'Kontör yüklendi.' });
      setCreditFor(null);
      setCreditNote('');
      loadLists(search);
    }
    setBusy(false);
  };

  if (mode === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <RefreshCw className="w-6 h-6 text-[#00A8B5] animate-spin" />
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-[#0A1931] text-white flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0A1931] text-center">Havuz & Kontör Yönetimi</h1>
          <p className="text-[11px] text-slate-500 text-center mt-1.5 mb-6">
            Bu alan yalnızca platform admin hesaplarına açıktır.
          </p>
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stajyeri.net"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Şifre</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
              />
            </div>
            {errMsg && (
              <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {errMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-[#0A1931] hover:bg-[#0D2244] text-white font-black rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
            >
              {busy ? 'Kontrol ediliyor...' : 'Admin Girişi Yap'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'denied') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black text-[#0A1931]">Yetkisiz Hesap</h1>
          <p className="text-xs text-slate-500 mt-2">
            Giriş yaptığınız hesap platform yöneticisi olarak tanımlı değil. Erişim için profilinizdeki is_admin bayrağının açık olması gerekir (SQL dosyasının sonundaki yönergeyi izleyin).
          </p>
          <button
            onClick={handleLogout}
            className="mt-6 px-6 py-3 bg-[#0A1931] hover:bg-[#0D2244] text-white text-xs font-extrabold rounded-xl transition cursor-pointer"
          >
            Başka Hesapla Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-[#0A1931] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-orange-300 text-[10px] font-bold mb-2">
              <ShieldCheck className="w-3 h-3" /> ADMIN PANELİ
            </div>
            <h1 className="text-lg sm:text-xl font-black">Stajyer Havuzu & Kontör Yönetimi</h1>
            <p className="text-[11px] text-slate-300 mt-1">
              İşverenlere havuz erişimi verin, kontör yükleyin ve harcama hareketlerini izleyin.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Çıkış
          </button>
        </div>
      </header>
      {actionMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 w-full">
          <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-xs font-bold ${actionMsg.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {actionMsg.type === 'ok' ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span className="flex-1">{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadLists(search); }}
              placeholder="İşveren, firma adı veya e-posta ile ara..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
            />
          </div>
          <button
            onClick={() => loadLists(search)}
            disabled={listLoading}
            className="px-5 py-2.5 bg-[#0A1931] hover:bg-[#0D2244] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${listLoading ? 'animate-spin' : ''}`} />
            {listLoading ? 'Yükleniyor...' : 'Listele'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00A8B5]" />
            <h2 className="text-sm font-black text-[#0A1931]">İşverenler</h2>
            <span className="text-[10px] font-bold text-slate-400">({employers.length})</span>
          </div>

          {listLoading && employers.length === 0 ? (
            <div className="p-10 flex justify-center"><RefreshCw className="w-5 h-5 text-[#00A8B5] animate-spin" /></div>
          ) : employers.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 font-medium">Kayıtlı işveren bulunamadı.</div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                      <th className="px-5 py-3 text-left">İşveren / Firma</th>
                      <th className="px-4 py-3 text-left">Şehir</th>
                      <th className="px-4 py-3 text-center">Kontör</th>
                      <th className="px-4 py-3 text-center">Havuz Erişimi</th>
                      <th className="px-5 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employers.map((row) => (
                      <tr key={row.profile_id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3">
                          <div className="font-extrabold text-[#0A1931]">{row.company_name || row.full_name || '—'}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{row.full_name}{row.email ? ` · ${row.email}` : ''}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{row.city || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black ${row.balance > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Coins className="w-3 h-3" /> {row.balance}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${row.pool_granted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {row.pool_granted ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {row.pool_granted ? 'Açık' : 'Kapalı'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setCreditFor(row); setCreditAmount('10'); setCreditNote(''); }} className="px-3 py-1.5 bg-[#00A8B5]/10 text-[#008794] border border-[#00A8B5]/30 rounded-lg text-[10px] font-black flex items-center gap-1 hover:bg-[#00A8B5]/20 transition cursor-pointer">
                              <PlusCircle className="w-3 h-3" /> Kontör Yükle
                            </button>
                            <button onClick={() => toggleAccess(row)} disabled={busyId === row.profile_id} className={`px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition disabled:opacity-50 cursor-pointer ${row.pool_granted ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-[#0A1931] text-white hover:bg-[#0D2244]'}`}>
                              {busyId === row.profile_id ? '...' : (row.pool_granted ? 'Yetkiyi Kaldır' : 'Havuz Yetkisi Ver')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-slate-100">
                {employers.map((row) => (
                  <div key={row.profile_id} className="p-4 space-y-3">
                    <div>
                      <div className="font-extrabold text-sm text-[#0A1931]">{row.company_name || row.full_name || '—'}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{row.email}{row.city ? ` · ${row.city}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[11px] ${row.balance > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Coins className="w-3 h-3" /> {row.balance}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${row.pool_granted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {row.pool_granted ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {row.pool_granted ? 'Havuz açık' : 'Havuz kapalı'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCreditFor(row); setCreditAmount('10'); setCreditNote(''); }} className="flex-1 px-3 py-2 bg-[#00A8B5]/10 text-[#008794] border border-[#00A8B5]/30 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer">
                        <PlusCircle className="w-3 h-3" /> Kontör
                      </button>
                      <button onClick={() => toggleAccess(row)} disabled={busyId === row.profile_id} className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black transition disabled:opacity-50 cursor-pointer ${row.pool_granted ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#0A1931] text-white'}`}>
                        {row.pool_granted ? 'Yetkiyi Kaldır' : 'Yetki Ver'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-[#00A8B5]" />
            <h2 className="text-sm font-black text-[#0A1931]">Kontör Hareketleri</h2>
            <span className="text-[10px] font-bold text-slate-400">(son {txs.length})</span>
          </div>
          {txs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">Henüz kontör hareketi yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                    <th className="px-5 py-3 text-left">Tarih</th>
                    <th className="px-4 py-3 text-left">İşveren</th>
                    <th className="px-4 py-3 text-left">Tür</th>
                    <th className="px-4 py-3 text-center">Tutar</th>
                    <th className="px-5 py-3 text-left">Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txs.map((t) => (
                    <tr key={t.tx_id}>
                      <td className="px-5 py-3 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-[#0A1931]">{t.company || t.employer}</div>
                        {t.company && <div className="text-[10px] text-slate-400 font-medium">{t.employer}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{KIND_LABEL[t.kind] ?? t.kind}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-black ${t.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {t.amount > 0 ? `+${t.amount}` : t.amount}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-medium">{t.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {creditFor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-black text-[#0A1931]">Kontör Yükle</h3>
              <button onClick={() => setCreditFor(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mb-5">
              {creditFor.company_name || creditFor.full_name} · Mevcut bakiye: <span className="font-black text-[#0A1931]">{creditFor.balance}</span> kontör
            </p>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Miktar (negatif girerek düşebilirsiniz)</label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
            />
            <div className="flex gap-2 mt-2.5">
              {['10', '25', '50', '100'].map((v) => (
                <button key={v} onClick={() => setCreditAmount(v)} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black transition cursor-pointer">+{v}</button>
              ))}
            </div>
            <label className="block text-xs font-bold text-slate-700 mt-4 mb-1.5">Not (opsiyonel)</label>
            <input
              type="text"
              value={creditNote}
              onChange={(e) => setCreditNote(e.target.value)}
              placeholder="ör. Telefon ile satış - 10 Ekim"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
            />
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setCreditFor(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-extrabold transition cursor-pointer">İptal</button>
              <button onClick={submitCredit} disabled={busy} className="flex-1 py-3 bg-[#0A1931] hover:bg-[#0D2244] text-white rounded-xl text-xs font-black transition disabled:opacity-50 cursor-pointer">
                {busy ? 'Yükleniyor...' : 'Kontörü Yükle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
