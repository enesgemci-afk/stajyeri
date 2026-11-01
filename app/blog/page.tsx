import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { BLOG_POSTS, formatBlogDate } from '@/lib/blogYazilari';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kariyer Blogu — Ücret, Belge ve Staj Rehberleri | Stajyeri.net',
  description:
    'İMEP maaşı, kalfalık belgesi, MESEM vs meslek lisesi, usta belgesi ve ilk staj mülakatı: mesleki eğitim yolculuğunda bilmen gerekenler sade dille.',
  keywords: ['çıraklık blogu', 'İMEP maaşı', 'kalfalık belgesi', 'staj rehberi', '3308 hakları'],
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <BookOpen className="w-4 h-4" /> {BLOG_POSTS.length} rehber yazı
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

      {/* Yazı kartları */}
      <section className="max-w-7xl w-full mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {BLOG_POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group bg-white rounded-3xl border border-slate-200 hover:border-[#00A8B5] hover:shadow-lg hover:shadow-[#00A8B5]/10 transition-all p-6 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-3xl">{p.emoji}</span>
                <span className="px-2.5 py-1 rounded-full bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-extrabold">
                  {p.category}
                </span>
              </div>
              <h2 className="text-sm font-black text-[#0A1931] group-hover:text-[#00A8B5] transition leading-snug">
                {p.title}
              </h2>
              <p className="text-[11px] text-slate-500 leading-relaxed">{p.description}</p>
              <div className="mt-auto pt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>
                  {formatBlogDate(p.date)} · {p.readMin} dk okuma
                </span>
                <span className="inline-flex items-center gap-1 text-[#00A8B5] group-hover:gap-2 transition-all">
                  Oku <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Çapraz bağlantılar */}
        <div className="grid sm:grid-cols-2 gap-4 mt-12 max-w-3xl mx-auto">
          <Link
            href="/patika"
            className="bg-[#0A1931] text-white rounded-3xl p-6 flex items-center gap-4 hover:bg-[#10294d] transition"
          >
            <span className="text-3xl">🗺️</span>
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
            <span className="text-3xl">💰</span>
            <span>
              <span className="block text-sm font-black">Ücretlerini hesapla</span>
              <span className="block text-[11px] text-white/80 mt-0.5">
                3308 taban ücretleri anlık hesaplayıcıyla gör.
              </span>
            </span>
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        <p className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> © 2026 Stajyeri.net — Kariyer Blogu
        </p>
      </footer>
    </div>
  );
}
