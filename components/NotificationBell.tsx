'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

/** Üst menü bildirim zili: oturum varsa okunmamış bildirim sayısını gösterir. */
export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session?.user) return;
      setVisible(true);
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', session.user.id)
        .eq('is_read', false);
      if (!alive) return;
      setUnread(count ?? 0);
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/bildirimler"
      aria-label="Bildirimler"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:text-[#00A8B5] hover:border-[#00A8B5] transition"
    >
      <Bell className="w-[18px] h-[18px]" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B00] text-white text-[10px] font-black flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
