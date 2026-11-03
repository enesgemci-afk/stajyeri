'use client';

import Link from 'next/link';
import {
  LogOut,
  GraduationCap,
  School,
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  User,
} from 'lucide-react';

interface StudentSidebarProps {
  fullName: string;
  education: string;
  field: string;
  school: string;
  pendingCount: number;
  skillsCount: number;
  onLogout: () => void;
}

const NAV: { id: string; label: string; icon: typeof LayoutDashboard; badge?: 'pending' | 'skills' }[] = [
  { id: 'ozet', label: 'Özet', icon: LayoutDashboard },
  { id: 'basvurular', label: 'Başvurularım', icon: ClipboardList, badge: 'pending' },
  { id: 'beceriler', label: 'Becerilerim', icon: Sparkles, badge: 'skills' },
  { id: 'okul', label: 'Okulum', icon: School },
  { id: 'profil', label: 'Profilim', icon: User },
];

const SOURCES = [
  { href: '/patika', icon: '🗺️', label: 'Staj Patikası' },
  { href: '/alan-secim', icon: '🧭', label: 'Alan Seçim Testi' },
  { href: '/cv-olustur', icon: '📄', label: 'CV Oluştur' },
  { href: '/staj-ucretleri', icon: '💰', label: 'Ücret Hesaplayıcı' },
  { href: '/blog', icon: '📰', label: 'Kariyer Blogu' },
];

export default function StudentSidebar({
  fullName,
  education,
  field,
  school,
  pendingCount,
  skillsCount,
  onLogout,
}: StudentSidebarProps) {
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-20">
      {/* Profil kartı */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
        <div className="w-11 h-11 rounded-xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center">
          <GraduationCap className="w-5 h-5" />
        </div>
        <p className="mt-3 text-sm font-black text-[#0A1931] leading-tight break-words">
          {fullName || 'Öğrenci'}
        </p>
        {education && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{education}</p>}
        {field && (
          <span className="mt-2 inline-flex px-2.5 py-1 rounded-full bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-bold">
            {field}
          </span>
        )}
        {school && (
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5">
            <School className="w-3 h-3" /> {school}
          </p>
        )}
      </div>

      {/* Bölüm navigasyonu (anchor) */}
      <nav className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-col gap-1">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={go(n.id)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 hover:text-[#00A8B5] hover:bg-[#00A8B5]/5 transition-all inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] focus-visible:ring-offset-2"
          >
            <n.icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{n.label}</span>
            {n.badge === 'pending' && pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-700">
                {pendingCount}
              </span>
            )}
            {n.badge === 'skills' && skillsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-[#00A8B5]/10 text-[#00A8B5]">
                {skillsCount}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Kaynak kısayolları */}
      <nav className="bg-white rounded-2xl border border-slate-200 p-2">
        <p className="px-2 pt-1 pb-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
          Kariyer Araçları
        </p>
        {SOURCES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="px-3 py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:text-[#0A1931] hover:bg-slate-50 transition inline-flex items-center gap-2.5 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] focus-visible:ring-offset-2"
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
