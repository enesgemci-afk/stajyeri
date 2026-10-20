'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type HeaderRole = 'guest' | 'student' | 'employer';

// Rol bazlı menüler:
// - Girişsiz: keşif (Ana Sayfa + Tüm İlanlar)
// - Öğrenci: kariyer araçları (Alan Seçim, CV Oluştur, Mülakat Soruları)
// - İşveren: işveren kaynakları (İMEP, Teşvik Rehberi, İşveren Paneli)
const NAV_LINKS: { href: string; label: string; roles: HeaderRole[] }[] = [
  { href: '/', label: 'Ana Sayfa', roles: ['guest', 'student', 'employer'] },
  { href: '/ilanlar', label: 'Tüm İlanlar', roles: ['guest', 'student', 'employer'] },
  { href: '/alan-secim', label: 'Alan Seçim Testi', roles: ['student'] },
  { href: '/cv-olustur', label: 'CV Oluştur', roles: ['student'] },
  { href: '/rehber/mulakat-sorulari', label: 'Mülakat Soruları', roles: ['student'] },
  { href: '/imep', label: 'İMEP Programı', roles: ['employer'] },
  { href: '/tesvik-rehberi', label: 'İşletme Teşvik Rehberi', roles: ['employer'] },
  { href: '/isveren/panel', label: 'İşveren Paneli', roles: ['employer'] },
];

interface SiteHeaderProps {
  /** Sağ tarafta sayfaya özel içerik (giriş butonları, kullanıcı menüsü vb.) */
  right?: ReactNode;
  /** Geri dönüş hedefi (varsayılan '/') */
  backHref?: string;
  /** Geri linkinin metni (varsayılan 'Ana Sayfaya Dön') */
  backLabel?: string;
  /** Logo yanında ekstra içerik (ör. admin paneli başlığı) */
  children?: ReactNode;
}

/**
 * Tüm sayfalarda kullanılan ortak üst menü.
 * Tek tasarım stili: beyaz/blur zemin, sticky, site renkleri (lacivert #0A1931,
 * teal #00A8B5 vurgu, turuncu #FF6B00 CTA) ile uyumlu.
 */
export default function SiteHeader({
  right,
  backHref = '/',
  backLabel = 'Ana Sayfaya Dön',
  children,
}: SiteHeaderProps) {
  const pathname = usePathname();
  // Oturum rolüne göre menü: girişsiz / öğrenci / işveren
  const [role, setRole] = useState<HeaderRole>('guest');

  useEffect(() => {
    let active = true;

    async function loadRole() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        setRole('guest');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!active) return;
      setRole(profile?.user_type === 'employer' ? 'employer' : 'student');
    }

    loadRole();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadRole());
    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const navLinks = NAV_LINKS.filter((link) => link.roles.includes(role));

  // Menü her sayfada sabit gösterilir. Varsayılan 'Ana Sayfaya Dön' linki
  // gereksiz olduğundan (Ana Sayfa menüde var) yalnızca özel geri linki
  // verilmişse (ör. 'İşveren Paneli', 'Siteye Dön') gösterilir.
  const showBack = backHref !== '/' || backLabel !== 'Ana Sayfaya Dön';

  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Sol: Logo (+ ekstra başlık) + Ana gezinti */}
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <img src="/logo.png" alt="Stajyeri.net" className="h-10 w-auto object-contain" />
          </Link>
          {children}

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? 'text-[#00A8B5] transition' : 'text-slate-600 hover:text-[#00A8B5] transition'}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sağ: Geri linki + sayfaya özel aksiyonlar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {showBack && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#00A8B5] transition"
            >
              <ArrowLeft className="w-4 h-4" /> {backLabel}
            </Link>
          )}
          {right}
        </div>

      </div>
    </header>
  );
}