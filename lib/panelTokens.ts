// ============================================================
// İŞVEREN PANELİ TASARIM TOKEN'LARI
// Kaynak: UI UX Pro Max Skill — "SaaS Analytics Dashboard" reçetesi
// (Glassmorphism + Flat · Primary #0080FF · Secondary #8B00FF · CTA #22C55E)
// İlke: "Tokens before components" — ham hex'i sınıflara buradan ver.
// ============================================================

export const PANEL_TOKENS = {
  colors: {
    primary: '#0080FF',
    secondary: '#8B00FF',
    cta: '#22C55E',
    bg: '#F8FAFC',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
  },
  /** Başlık fontu (Space Grotesk) — layout.tsx'te değişken tanımlı */
  fontDisplay: '[font-family:var(--font-grotesk)]',
  /** Ana CTA butonu — skill paletindeki CTA yeşili */
  ctaBtn:
    'bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-extrabold rounded-xl transition-all active:scale-[0.98] inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2',
  /** İkincil (ghost) buton — koyu zeminde */
  ghostBtnOnDark:
    'bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold rounded-xl transition-all active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1931]',
  /** KPI kartı ikon karesi */
  kpiIcon: (tone: 'blue' | 'emerald' | 'amber' | 'violet' | 'slate') =>
    ({
      blue: 'bg-[#0080FF]/10 text-[#0080FF]',
      emerald: 'bg-emerald-50 text-emerald-600',
      amber: 'bg-amber-50 text-amber-600',
      violet: 'bg-[#8B00FF]/10 text-[#8B00FF]',
      slate: 'bg-slate-100 text-slate-400',
    })[tone],
} as const;
