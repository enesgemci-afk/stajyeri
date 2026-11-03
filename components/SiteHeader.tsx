'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArrowLeft, ChevronDown, Menu, X, PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import NotificationBell from '@/components/NotificationBell';

type HeaderRole = 'guest' | 'student' | 'employer';

// Alt menü öğesi: dropdown içinde kısa açıklamayla gösterilir
interface NavItem {
  href: string;
  label: string;
  desc: string;
}

// Aşağı açılan menü grubu
interface NavGroup {
  key: string;
  label: string;
  items: NavItem[];
}

/**
 * Rol bazlı menü planı (kalabalığı önlemek için alt menülere gruplandı):
 *
 *  Ana Sayfa          → herkese doğrudan
 *  İlanlar ▾          → Tüm İlanlar (herkes) + Favorilerim (öğrenci)
 *  Kariyer Araçları ▾ → girişsiz + öğrenci: Alan Seçim, CV Oluştur, Mülakat, Ön Yazı
 *  İşveren ▾          → HERKESE görünür (kariyer.net'teki gibi):
 *                        işveren: Panel + İlan Ver + İMEP + Teşvik
 *                        öğrenci: İMEP + Teşvik + İşveren Girişi
 *                        girişsiz: İlan Ver + İMEP + Teşvik + İşveren Girişi
 */
function getMenu(role: HeaderRole): NavGroup[] {
  const groups: NavGroup[] = [
    {
      key: 'ilanlar',
      label: 'İlanlar',
      items: [
        { href: '/ilanlar', label: 'Tüm İlanlar', desc: 'Aktif staj ve çıraklık ilanları' },
        { href: '/isletmeler', label: 'İşletmeler', desc: 'Stajyer alan işletmeleri keşfet' },
        ...(role === 'student'
          ? [
              {
                href: '/favorilerim',
                label: 'Favorilerim',
                desc: 'Kaydettiğin ilanlar ve iş alarmların',
              },
            ]
          : []),
      ],
    },
  ];

  if (role !== 'employer') {
    groups.push({
      key: 'yolun',
      label: 'Yolunu Seç',
      items: [
        { href: '/meslek-rehberi', label: 'Meslek Seçim Rehberi', desc: '5 adımda bilinçli meslek kararı' },
        { href: '/meslek', label: 'Meslek Rehberi', desc: '41 MESEM alanı: ne iş yapar, nereye gider' },
        { href: '/patika', label: 'Staj Patikası', desc: 'Çıraktan ustaya kişisel yol haritan' },
        { href: '/alan-secim', label: 'Alan Seçim Testi', desc: '9. sınıflar için 6 soruluk rehber' },
        { href: '/staj-ucretleri', label: 'Staj Ücretleri', desc: '3308 ücret hakları + hesaplayıcı' },
        { href: '/hesaplama-araclari', label: 'Hesaplama Araçları', desc: 'Brüt-net, mesai, izin, tazminat' },
        { href: '/blog', label: 'Kariyer Blogu', desc: 'Ücret, belge ve kariyer rehberleri' },
      ],
    });
    groups.push({
      key: 'hazirlik',
      label: 'Başvuruya Hazırlan',
      items: [
        { href: '/cv-ornekleri', label: 'CV Örnekleri', desc: 'Alanına göre hazır şablonlar' },
        { href: '/cv-olustur', label: 'CV Oluştur', desc: 'Ücretsiz CV oluştur, PDF indir' },
        { href: '/rehber/onyazi', label: 'Ön Yazı Örnekleri', desc: 'Hazır şablonlarla güçlü başvuru' },
        { href: '/rehber/mulakat-provasi', label: 'Mülakat Provası', desc: 'Kronometreli prova + öz puanlama' },
        { href: '/rehber/mulakat-sorulari', label: 'Mülakat Soruları', desc: 'Alanına göre sorular ve ipuçları' },
      ],
    });
  }

  // İşveren grubu HERKESE görünür — işveren adayları siteyi hangi rolde
  // gezerse gezsin (girişsiz / öğrenci) bu menüye ulaşabilmeli.
  groups.push({
    key: 'isveren',
    label: 'İşveren',
    items: [
      ...(role === 'employer'
        ? [
            { href: '/isveren/panel', label: 'İşveren Paneli', desc: 'İlanların ve başvuruların' },
            { href: '/ilan-ver', label: 'İlan Ver', desc: '1 dakikada stajyer ilanı yayınla' },
      { href: '/okul', label: 'Okul Paneli', desc: 'Koordinatör: öğrenci başvurularını izle' },
          ]
        : role === 'student'
          ? [
              // Öğrenci hesabıyla "İlan Ver" gösterilmez (izin yok),
              // ancak işletme sahibi biriyse farklı hesapla girebilsin
              { href: '/isveren/giris', label: 'İşveren Girişi', desc: 'İşletme hesabına geç' },
            ]
          : [
              { href: '/ilan-ver', label: 'İlan Ver', desc: 'Stajyer aramaya başla' },
      { href: '/okul', label: 'Okul Paneli', desc: 'Okul koordinatörü hesabı' },
              { href: '/isveren/giris', label: 'İşveren Girişi', desc: 'İşletme hesabına giriş yap' },
            ]),
      { href: '/imep', label: 'İMEP Programı', desc: 'İMEP stajyer desteği rehberi' },
      { href: '/tesvik-simulasyon', label: 'Teşvik Simülatörü', desc: 'Stajyer size gerçekte neye mal olur?' },
      { href: '/tesvik-rehberi', label: 'İşletme Teşvik Rehberi', desc: '3308 kapsamındaki destekler' },
    ],
  });

  return groups;
}

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
  // Menü durumu türetilmiş state: hangi rotada açıldıysa yalnızca o rotada
  // açıktır — rota değişince (taray geri/ileri dahil) menüler kendiliğinden kapanır.
  // (Effect'e setState koymadan lint temiz kalır.)
  const [menu, setMenu] = useState<{ openKey: string | null; mobile: boolean; path: string }>({
    openKey: null,
    mobile: false,
    path: '',
  });
  const openKey = menu.path === pathname ? menu.openKey : null;
  const mobileOpen = menu.path === pathname ? menu.mobile : false;
  const setOpenKey = useCallback(
    (key: string | null) => setMenu((m) => ({ ...m, openKey: key, path: pathname })),
    [pathname],
  );
  const setMobileOpen = useCallback(
    (open: boolean) => setMenu((m) => ({ ...m, mobile: open, path: pathname })),
    [pathname],
  );
  const navRef = useRef<HTMLDivElement>(null);

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

  // Dropdown açıkken dışına tıklayınca kapat
  useEffect(() => {
    if (!openKey) return;
    function onDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openKey, setOpenKey]);

  // Kaydırınca clay gölge — UI UX Pro Max: sticky header derinliği
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const groups = getMenu(role);

  // Aktif link tespiti: tam eşleşme veya alt yol ('/ilanlar' grubu '/ilan/123'ü etkilemez)
  const isItemActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  // Menü her sayfada sabit gösterilir. Varsayılan 'Ana Sayfaya Dön' linki
  // gereksiz olduğundan (Ana Sayfa menüde var) yalnızca özel geri linki
  // verilmişse (ör. 'İşveren Paneli', 'Siteye Dön') gösterilir.
  const showBack = backHref !== '/' || backLabel !== 'Ana Sayfaya Dön';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-[0_12px_40px_rgba(10,25,49,0.08)] border-b border-slate-200/70'
          : 'bg-white/95 backdrop-blur border-b border-slate-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Sol: Logo (+ ekstra başlık) + Ana gezinti */}
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <img src="/logo.png" alt="Stajyeri.net" className="h-10 w-auto object-contain" />
          </Link>
          {children}

          <nav ref={navRef} className="hidden lg:flex items-center gap-1 text-xs font-bold">
            <Link
              href="/"
              className={
                isItemActive('/')
                  ? 'px-4 py-2 rounded-full bg-[#00A8B5]/10 text-[#00A8B5] font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]'
                  : 'px-4 py-2 rounded-full text-slate-600 hover:text-[#00A8B5] hover:bg-[#00A8B5]/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]'
              }
            >
              Ana Sayfa
            </Link>
            {groups.map((group) => {
              // Tek öğeli grup dropdown'a gerek yok → düz link (ör. girişsizde İlanlar)
              if (group.items.length === 1) {
                const item = group.items[0];
                return (
                  <Link
                    key={group.key}
                    href={item.href}
                    className={
                      isItemActive(item.href)
                        ? 'px-4 py-2 rounded-full bg-[#00A8B5]/10 text-[#00A8B5] font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]'
                        : 'px-4 py-2 rounded-full text-slate-600 hover:text-[#00A8B5] hover:bg-[#00A8B5]/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]'
                    }
                  >
                    {group.label}
                  </Link>
                );
              }
              const open = openKey === group.key;
              const groupActive = group.items.some((item) => isItemActive(item.href));
              return (
                <div key={group.key} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : group.key)}
                    aria-expanded={open}
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] ${
                      open
                        ? 'bg-[#00A8B5]/10 text-[#00A8B5] shadow-[inset_0_0_0_1px_rgba(0,168,181,0.25)]'
                        : groupActive
                          ? 'text-[#00A8B5] hover:bg-[#00A8B5]/5'
                          : 'text-slate-600 hover:text-[#00A8B5] hover:bg-[#00A8B5]/5'
                    }`}
                  >
                    {group.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="absolute left-0 top-full pt-2.5 z-50">
                      <div className="w-72 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_24px_70px_rgba(10,25,49,0.14)] p-2.5 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenKey(null)}
                            className="relative block px-3.5 py-3 rounded-2xl hover:bg-[#00A8B5]/8 focus-visible:bg-[#00A8B5]/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]"
                          >
                            <span className="block text-xs font-black text-[#0A1931]">{item.label}</span>
                            <span className="block text-[10px] font-medium text-slate-400 mt-0.5">{item.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sağ: İlan Ver CTA + Bildirim zili + geri linki + sayfaya özel aksiyonlar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link
            href="/ilan-ver"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8F3F] text-white text-xs font-black shadow-lg shadow-[#FF6B00]/25 hover:-translate-y-0.5 hover:shadow-[#FF6B00]/40 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            <PlusCircle className="w-3.5 h-3.5" /> İlan Ver
          </Link>
          <NotificationBell />
          {/* Mobil menü düğmesi (lg altında görünür) */}
          <button
            type="button"
            aria-label="Menüyü aç/kapat"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:text-[#00A8B5] hover:border-[#00A8B5] transition cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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

      {/* Mobil menü paneli — bento kartlar (Claymorphism) */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-gradient-to-b from-[#F0FBFC] to-white px-4 py-5 max-h-[78vh] overflow-y-auto space-y-4">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block text-center py-3 rounded-2xl bg-[#0A1931] text-white text-xs font-black shadow-[0_10px_30px_rgba(10,25,49,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]"
          >
            Ana Sayfa
          </Link>

          {groups.map((group, gi) => (
            <div
              key={group.key}
              className="bg-white rounded-3xl p-3 shadow-[0_10px_40px_rgba(10,25,49,0.06)] border border-slate-100"
            >
              <p
                className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider mb-2 ${
                  gi % 2 === 0 ? 'bg-[#00A8B5]/10 text-[#00A8B5]' : 'bg-[#FF6B00]/10 text-[#FF6B00]'
                }`}
              >
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3.5 py-3 rounded-2xl hover:bg-[#00A8B5]/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]"
                  >
                    <span className="block text-xs font-black text-[#0A1931]">{item.label}</span>
                    <span className="block text-[10px] font-medium text-slate-400 mt-0.5">{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <Link
            href="/ilan-ver"
            onClick={() => setMobileOpen(false)}
            className="block text-center py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#FF8F3F] text-white text-xs font-black shadow-lg shadow-[#FF6B00]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
          >
            + İlan Ver — Ücretsiz Başla
          </Link>
        </div>
      )}
    </header>
  );
}