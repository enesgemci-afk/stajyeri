'use client';

import Link from 'next/link';
import { LogOut, Building2, Briefcase, ClipboardList, Users, MapPin } from 'lucide-react';
import { PANEL_TOKENS } from '@/lib/panelTokens';
import { type AppStatus } from '@/lib/appStatus';

interface SidebarProps {
  tab: 'jobs' | 'apps' | 'pool';
  onTab: (t: 'jobs' | 'apps' | 'pool') => void;
  counts: { totalJobs: number; totalApps: number; pendingApps: number };
  poolGranted: boolean;
  balance: number;
  companyName: string;
  location: string;
  trustBadge: string | null;
  onLogout: () => void;
}

const NAV: { id: 'jobs' | 'apps' | 'pool'; label: string; icon: typeof Briefcase }[] = [
  { id: 'jobs', label: 'İlanlarım', icon: Briefcase },
  { id: 'apps', label: 'Başvurular', icon: ClipboardList },
  { id: 'pool', label: 'Stajyer Havuzu', icon: Users },
];

const SOURCES = [
  { href: '/tesvik-simulasyon', icon: '🏛️', label: 'İMEP teşviki hesapla' },
  { href: '/imep', icon: '📚', label: 'İMEP nedir?' },
  { href: '/staj-ucretleri', icon: '💰', label: '3308 ücret tabloları' },
  { href: '/blog', icon: '📰', label: 'Kariyer Blogu' },
];

export default function IsverenSidebar({
  tab,
  onTab,
  counts,
  poolGranted,
  balance,
  companyName,
  location,
  trustBadge,
  onLogout,
}: SidebarProps) {
  const badgeChip =
    trustBadge === 'gold'
      ? 'bg-amber-50 text-amber-700 border-amber-300'
      : trustBadge === 'silver'
        ? 'bg-slate-100 text-slate-600 border-slate-300'
        : 'bg-orange-50 text-orange-700 border-orange-300';
  const badgeLabel =
    trustBadge === 'gold' ? '🏆 Altın' : trustBadge === 'silver' ? '🥈 Gümüş' : '🥉 Bronz';

  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-6">
      {/* Firma kartı */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0080FF] via-[#8B00FF] to-[#22C55E]" />
        <div className="w-11 h-11 rounded-xl bg-[#0080FF]/10 text-[#0080FF] flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <p className={`mt-3 text-sm font-black text-[#0A1931] leading-tight break-words ${PANEL_TOKENS.fontDisplay}`}>
          {companyName}
        </p>
        {location && (
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location}
          </p>
        )}
        {trustBadge && trustBadge !== 'none' && (
          <span className={`mt-2 inline-flex px-2.5 py-1 rounded-full text-[10px] font-black border ${badgeChip}`}>
            {badgeLabel} Rozet
          </span>
        )}
      </div>

      {/* Navigasyon */}
      <nav className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-col gap-1">
        {NAV.map((n) => {
          const active = tab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onTab(n.id)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 ${
                active
                  ? 'bg-[#0080FF]/10 text-[#0080FF] shadow-[inset_0_0_0_1px_rgba(0,128,255,0.25)]'
                  : 'text-slate-500 hover:text-[#1E293B] hover:bg-slate-50'
              }`}
            >
              <n.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{n.label}</span>
              {n.id === 'jobs' && counts.totalJobs > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${active ? 'bg-[#0080FF] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {counts.totalJobs}
                </span>
              )}
              {n.id === 'apps' && counts.pendingApps > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-700">
                  {counts.pendingApps}
                </span>
              )}
              {n.id === 'pool' && poolGranted && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-[#8B00FF]/10 text-[#8B00FF]">
                  {balance}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Kaynak kısayolları */}
      <nav className="bg-white rounded-2xl border border-slate-200 p-2">
        <p className="px-2 pt-1 pb-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
          Kaynaklar
        </p>
        {SOURCES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="px-3 py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:text-[#1E293B] hover:bg-slate-50 transition inline-flex items-center gap-2.5 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
          >
            <span>{s.icon}</span> {s.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-500 hover:text-red-500 hover:bg-red-50 transition cursor-pointer inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
      >
        <LogOut className="w-4 h-4" /> Çıkış Yap
      </button>
    </aside>
  );
}
