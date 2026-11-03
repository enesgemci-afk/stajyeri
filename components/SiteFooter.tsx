import Link from 'next/link';

// ============================================================
// SITE FOOTER — tüm alt sayfalarda ortak (UI UX Pro Max: bento dil)
// Lacivert blok + gradient üst şerit: anasayfa hero'suyla köprü kurar.
// ============================================================

const COLS: { title: string; chip: 'teal' | 'orange' | 'violet'; links: { href: string; label: string }[] }[] = [
  {
    title: 'Keşfet',
    chip: 'teal',
    links: [
      { href: '/meslek-rehberi', label: 'Meslek Seçim Rehberi' },
      { href: '/meslek', label: '41 Alan Rehberi' },
      { href: '/alan-secim', label: 'Alan Seçim Testi' },
      { href: '/patika', label: 'Staj Patikası' },
      { href: '/blog', label: 'Kariyer Blogu' },
    ],
  },
  {
    title: 'Başvuruya Hazırlan',
    chip: 'orange',
    links: [
      { href: '/cv-ornekleri', label: 'CV Örnekleri' },
      { href: '/cv-olustur', label: 'CV Oluştur' },
      { href: '/rehber/onyazi', label: 'Ön Yazı Örnekleri' },
      { href: '/rehber/mulakat-provasi', label: 'Mülakat Provası' },
      { href: '/rehber/mulakat-sorulari', label: 'Mülakat Soruları' },
    ],
  },
  {
    title: 'Hesapla & Bil',
    chip: 'violet',
    links: [
      { href: '/staj-ucretleri', label: 'Staj Ücretleri (3308)' },
      { href: '/hesaplama-araclari', label: 'Hesaplama Araçları' },
      { href: '/imep', label: 'İMEP Rehberi' },
      { href: '/tesvik-rehberi', label: 'Teşvik Rehberi' },
      { href: '/isletmeler', label: 'İşletmeler Rehberi' },
    ],
  },
];

const chipCls: Record<string, string> = {
  teal: 'bg-[#00A8B5]/15 text-[#00E5FF]',
  orange: 'bg-[#FF6B00]/15 text-[#FF9E4D]',
  violet: 'bg-[#8B00FF]/15 text-[#C084FC]',
};

export default function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="bg-[#0A1931] text-white relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
      <div className="absolute -top-24 right-10 w-72 h-72 rounded-full bg-[#00A8B5]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 left-1/4 w-80 h-80 rounded-full bg-[#FF6B00]/10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Marka */}
          <div>
            <img src="/logo.png" alt="Stajyeri.net" className="h-10 w-auto object-contain" />
            <p className="mt-4 text-[11px] text-slate-400 leading-relaxed max-w-xs">
              Geleceğin mesleğini sahada öğren, doğru staj yerini keşfet. 3308 güvencesiyle
              MESEM ve meslek lisesi stajını işletmelerle buluşturuyoruz.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-300">
                41 ALAN
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-300">
                3308 GÜVENCESİ
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-300">
                İMEP DESTEĞİ
              </span>
            </div>
          </div>

          {/* Link kolonları */}
          {COLS.map((col) => (
            <div key={col.title}>
              <p
                className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider mb-3 ${chipCls[col.chip]}`}
              >
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[11px] font-bold text-slate-300 hover:text-[#00E5FF] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] rounded"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-slate-500">
            &copy; 2026 Stajyeri.net — Tüm Hakları Saklıdır.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/kvkk" className="text-[10px] font-bold text-slate-400 hover:text-[#00E5FF] transition">
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/ilan-ver" className="text-[10px] font-bold text-slate-400 hover:text-[#00E5FF] transition">
              İşveren: İlan Ver
            </Link>
          </div>
        </div>

        {note && (
          <p className="mt-4 text-center text-[10px] text-slate-500">{note}</p>
        )}
      </div>
    </footer>
  );
}
