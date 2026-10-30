'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SiteHeader from '@/components/SiteHeader';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';

interface NotifRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  application: '📄',
  guardian: '🛡️',
  info: 'ℹ️',
};

export default function BildirimlerPage() {
  const [loading, setLoading] = useState(true);
  const [unauth, setUnauth] = useState(false);
  const [rows, setRows] = useState<NotifRow[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session?.user) {
        setUnauth(true);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!alive) return;
      setRows((data ?? []) as NotifRow[]);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const markAll = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('profile_id', session.user.id)
      .eq('is_read', false);
    setRows((prev) => prev.map((r) => ({ ...r, is_read: true })));
  };

  const markOne = async (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_read: true } : r)));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-black text-[#0A1931] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00A8B5]" /> Bildirimler
          </h1>
          {rows.some((r) => !r.is_read) && (
            <button
              onClick={markAll}
              className="text-[11px] font-black text-[#00A8B5] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Tümünü okundu işaretle
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Yükleniyor...
          </div>
        ) : unauth ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
            <p className="text-sm font-bold text-slate-600">Bildirimlerini görmek için giriş yap.</p>
            <Link
              href="/giris"
              className="inline-block mt-4 px-5 py-2.5 rounded-full bg-[#00A8B5] text-white text-xs font-black hover:bg-[#008f9a] transition"
            >
              Giriş Yap
            </Link>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center">
            <p className="text-sm font-bold text-slate-500">Henüz bildirimin yok.</p>
            <p className="text-xs text-slate-400 mt-1">
              Başvuru durumları, veli onayı ve yeni ilan uyarıları burada görünür.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {rows.map((r) => {
              const inner = (
                <div
                  className={`rounded-2xl border p-4 transition ${
                    r.is_read ? 'bg-white border-slate-200' : 'bg-[#00A8B5]/5 border-[#00A8B5]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none">{TYPE_ICON[r.type] ?? '🔔'}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs ${r.is_read ? 'font-bold text-slate-600' : 'font-black text-[#0A1931]'}`}>
                        {r.title}
                      </p>
                      {r.body && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{r.body}</p>}
                      <p className="text-[10px] text-slate-400 mt-1">{fmt(r.created_at)}</p>
                    </div>
                    {!r.is_read && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markOne(r.id);
                        }}
                        className="text-[10px] font-black text-slate-400 hover:text-[#00A8B5] cursor-pointer whitespace-nowrap"
                      >
                        okundu
                      </button>
                    )}
                  </div>
                </div>
              );
              return r.link ? (
                <Link key={r.id} href={r.link} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={r.id}>{inner}</div>
              );
            })}
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Stajyeri.net</p>
      </footer>
    </div>
  );
}
