'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { BLOG_POSTS, formatBlogDate } from '@/lib/blogYazilari';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Newspaper,
  Route,
  Wallet,
} from 'lucide-react';

// Kategori bazlı renkler (vibrat blok dili — anasayfa araç kartlarıyla aynı)
const KATEGORI_RENK: Record<string, string> = {
  'Ücret & Haklar': '#00A8B5',
  'Belgeler & Sınavlar': '#8B00FF',
  'Yol Seçimi': '#FF6B00',
  Girişimcilik: '#22C55E',
  'Eğitim Yolu': '#0080FF',
  'Başvuru & Mülakat': '#6366F1',
};

const KATEGORILER = ['Tümü', ...Object.keys(KATEGORI_RENK)];

function renkOf(kategori: string): string {
  return KATEGORI_RENK[kategori] ?? '#00A8B5';
}

export default function BlogPage() {
  const [aktif, setAktif] = useState('Tümü');

  const featured = BLOG_POSTS[0];
  const fRenk = renkOf(featured.category);
  const toplamDk = BLOG_POSTS.reduce((a, p) => a + p.readMin, 0);

  const filtreli = useMemo(
    () => (aktif === 'Tümü' ? BLOG_POSTS.filter((p) => p.slug !== featured.slug) : BLOG_POSTS.filter((p) => p.category === aktif)),
    [aktif, featured.slug],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      {/* Hero — bento dilinde (gradient şerit + orb'lar) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <BookOpen className="w-4 h-4" /> {BLOG_POSTS.length} rehber yazı · {toplamDk} dk okuma
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
            Kariyer Blogu
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Çıraktan ustaya uzanan yolda ücret hakları, belgeler, sınavlar ve başvuru
            taktikleri — hepsi tek yerde, sade dille.
          </p>
        </div>
      </section>

      {/* ÖNE ÇIKAN YAZI — kariyer.net featured deseni */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid md:grid-cols-[1.5fr_1fr] gap-6 bg-[#0A1931] rounded-3xl p-7 sm:p-9 relative overflow-hidden mb-8 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] focus-visible:ring-offset-2"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black mb-4" style={{ backgroundColor: `${fRenk}22`, color: fRenk }}>
              ⭐ ÖNE ÇIKAN · {featured.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug group-hover:text-[#00E5FF] transition">
              {featured.emoji} {featured.title}
            </h2>
            <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">{featured.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black text-white transition-all group-hover:gap-2.5" style={{ backgroundColor: fRenk }}>
              Yazıyı Oku <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex md:flex-col justify-around items-center gap-3 md:border-l md:border-white/10 md:pl-6">
            <div className="text-center">
              <p className="text-3xl font-black text-[#00E5FF]">{BLOG_POSTS.length}</p>
              <p className="text-[10px] text-slate-400 font-bold">rehber yazı</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-[#FF9E4D]">{toplamDk}</p>
              <p className="text-[10px] text-slate-400 font-bold">dk toplam okuma</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-[#22C55E]">{KATEGORILER.length - 1}</p>
              <p className="text-[10px] text-slate-400 font-bold">kategori</p>
            </div>
          </div>
        </Link>

        {/* KATEGORİ FİLTRELERİ */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Newspaper className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {KATEGORILER.map((k) => {
            const aktifK = aktif === k;
            const renk = renkOf(k);
            const sayi = k === 'Tümü' ? BLOG_POSTS.length : BLOG_POSTS.filter((p) => p.category === k).length;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setAktif(k)}
                className={`px-3.5 py-2 rounded-full text-[11px] font-black border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] ${
                  aktifK
                    ? 'text-white shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
                style={aktifK ? { backgroundColor: renk, borderColor: renk } : undefined}
              >
                {k} <span className="opacity-60">({sayi})</span>
              </button>
            );
          })}
        </div>

        {/* YAZI KARTLARI — kategori renkli vibrat bloklar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtreli.map((p) => {
            const renk = renkOf(p.category);
            return (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-3xl border p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] focus-visible:ring-offset-2"
                style={{ backgroundColor: `${renk}0D`, borderColor: `${renk}33` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">
                    {p.emoji}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-extrabold"
                    style={{ backgroundColor: `${renk}1A`, color: renk }}
                  >
                    {p.category}
                  </span>
                </div>
                <h2 className="text-sm font-black text-[#0A1931] leading-snug">{p.title}</h2>
                <p className="text-[11px] text-slate-600 leading-relaxed">{p.description}</p>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatBlogDate(p.date)} · {p.readMin} dk
                  </span>
                  <span className="inline-flex items-center gap-1 font-black group-hover:gap-2 transition-all" style={{ color: renk }}>
                    Oku <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Çapraz bağlantılar */}
        <div className="grid sm:grid-cols-2 gap-4 mt-12 max-w-3xl mx-auto">
          <Link
            href="/patika"
            className="bg-[#0A1931] text-white rounded-3xl p-6 flex items-center gap-4 hover:bg-[#10294d] transition"
          >
            <Route className="w-7 h-7" />
            <span>
              <span className="block text-sm font-black">Staj Patikanı oluştur</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">
                Durumunu ve hedefini seç, kişisel yol haritanı al.
              </span>
            </span>
          </Link>
          <Link
            href="/staj-ucretleri"
            className="bg-[#FF6B00] text-white rounded-3xl p-6 flex items-center gap-4 hover:bg-[#e05f00] transition"
          >
            <Wallet className="w-7 h-7" />
            <span>
              <span className="block text-sm font-black">Ücretlerini hesapla</span>
              <span className="block text-[11px] text-white/80 mt-0.5">
                3308 taban ücretleri anlık hesaplayıcıyla gör.
              </span>
            </span>
          </Link>
        </div>
      </main>

      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
