'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { supabase } from '@/lib/supabaseClient';
import { BLOG_POSTS, formatBlogDate } from '@/lib/blogYazilari';
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  Compass,
  GraduationCap,
  Landmark,
  MapPin,
  MessageCircle,
  Newspaper,
  Store,
  Wallet,
} from 'lucide-react';

const KATEGORILER: { ad: string; renk: string; icon: typeof Wallet; aciklama: string }[] = [
  { ad: 'Ücret & Haklar', renk: '#00A8B5', icon: Wallet, aciklama: 'Ücret tabloları ile haklar' },
  { ad: 'Belgeler & Sınavlar', renk: '#8B00FF', icon: Award, aciklama: 'Belge ve sınav rehberleri' },
  { ad: 'Yol Seçimi', renk: '#FF6B00', icon: Compass, aciklama: 'MESEM mi, meslek lisesi mi?' },
  { ad: 'Girişimcilik', renk: '#22C55E', icon: Store, aciklama: 'İşyeri açma ve girişim' },
  { ad: 'Eğitim Yolu', renk: '#0080FF', icon: GraduationCap, aciklama: 'Üniversiteye geçiş' },
  { ad: 'Başvuru & Mülakat', renk: '#6366F1', icon: MessageCircle, aciklama: 'Ön yazı, CV ve mülakat' },
];

function renkOf(k: string): string {
  return KATEGORILER.find((x) => x.ad === k)?.renk ?? '#00A8B5';
}

interface MiniJob {
  id: string;
  title: string;
  city: string;
  field_name: string;
}

export default function BlogPage() {
  const [aktifK, setAktifK] = useState<string | null>(null);
  const [jobs, setJobs] = useState<MiniJob[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('job_posts')
          .select('id, title, city, field_name')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(4);
        if (alive && data) setJobs(data as MiniJob[]);
      } catch { /* sessiz */ }
    })();
    return () => { alive = false; };
  }, []);

  const filtreli = useMemo(
    () => (aktifK ? BLOG_POSTS.filter((p) => p.category === aktifK) : BLOG_POSTS),
    [aktifK],
  );

  const featured = BLOG_POSTS[0];
  const fRenk = renkOf(featured.category);
  const toplamDk = BLOG_POSTS.reduce((a, p) => a + p.readMin, 0);
  const populer = [...BLOG_POSTS].sort((a, b) => b.readMin - a.readMin).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <BookOpen className="w-4 h-4" /> {BLOG_POSTS.length} rehber yazı · {toplamDk} dk okuma
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">Kariyer Blogu</h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Ücret hakları, belgeler, sınavlar ve başvuru taktikleri — sade dille.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {/* Kategori kartları */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {KATEGORILER.map((k) => {
            const sayi = BLOG_POSTS.filter((p) => p.category === k.ad).length;
            const secili = aktifK === k.ad;
            return (
              <button
                key={k.ad}
                type="button"
                onClick={() => setAktifK(secili ? null : k.ad)}
                className={'group text-left rounded-3xl border p-5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] focus-visible:ring-offset-2 ' + (secili ? 'shadow-xl -translate-y-0.5' : 'hover:-translate-y-0.5 hover:shadow-lg')}
                style={{ backgroundColor: k.renk + '0D', borderColor: secili ? k.renk : k.renk + '33' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center" style={{ color: k.renk }}>
                    <k.icon className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black" style={{ backgroundColor: k.renk + '1A', color: k.renk }}>
                    {sayi} yazı
                  </span>
                </div>
                <p className="mt-3 text-xs font-black text-[#0A1931]">{k.ad}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{k.aciklama}</p>
              </button>
            );
          })}
        </section>

        {/* Featured */}
        <section className="mt-10">
          <Link href={'/blog/' + featured.slug} className="group grid md:grid-cols-[1.5fr_1fr] gap-6 bg-[#0A1931] rounded-3xl p-7 sm:p-9 relative overflow-hidden transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] focus-visible:ring-offset-2">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black mb-4" style={{ backgroundColor: fRenk + '22', color: fRenk }}>
                {'\u2b50 \u00d6NE \u00c7IKAN \u00b7 '}{featured.category}
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
                <p className="text-3xl font-black text-[#22C55E]">{KATEGORILER.length}</p>
                <p className="text-[10px] text-slate-400 font-bold">kategori</p>
              </div>
            </div>
          </Link>
        </section>
      </main>

      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
