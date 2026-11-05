import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { BLOG_POSTS, getPostBySlug, formatBlogDate } from '@/lib/blogYazilari';
import { ArrowRight, BookOpen, Check, Route, Sparkles } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Yazı bulunamadı | Stajyeri.net' };
  return {
    title: `${post.title} | Stajyeri.net`,
    description: post.description,
  };
}

export default async function BlogDetayPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader backHref="/blog" backLabel="Blog" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        {/* Başlık */}
        <div className="text-center">
          <span className="text-4xl">{post.emoji}</span>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-extrabold">
            {post.category}
          </div>
          <h1 className="mt-3 text-xl sm:text-3xl font-black text-[#0A1931] leading-snug">
            {post.title}
          </h1>
          <p className="text-[11px] text-slate-400 mt-2">
            {formatBlogDate(post.date)} · {post.readMin} dk okuma
          </p>
        </div>

        {/* İçerik */}
        <article className="mt-8 bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9 space-y-4">
          {post.blocks.map((b, i) => {
            if (b.type === 'h2')
              return (
                <h2 key={i} className="text-base font-black text-[#0A1931] pt-2">
                  {b.text}
                </h2>
              );
            if (b.type === 'li')
              return (
                <p key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <Check className="w-4 h-4 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                  {b.text}
                </p>
              );
            if (b.type === 'note')
              return (
                <div
                  key={i}
                  className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  {b.text}
                </div>
              );
            return (
              <p key={i} className="text-xs text-slate-700 leading-relaxed">
                {b.text}
              </p>
            );
          })}
        </article>

        {/* CTA */}
        <div className="mt-6 bg-[#0A1931] rounded-3xl p-6 sm:p-8 text-center text-white">
          <h2 className="text-sm font-black">Sıradaki adımını at</h2>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Bu yazıdaki bilgileri kendi durumuna uyarlamak için araçlarımızı kullan.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Link
              href="/patika"
              className="px-4 py-2.5 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-[11px] transition"
            >
              <Route className="w-4 h-4 inline" /> Staj Patikamı Oluştur
            </Link>
            <Link
              href="/meslek"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-full text-[11px] transition"
            >
              <BookOpen className="w-4 h-4 inline" /> Alan Rehberleri
            </Link>
            <Link
              href="/ilanlar"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-full text-[11px] transition"
            >
              İlanlara Göz At
            </Link>
          </div>
        </div>

        {/* İlgili yazılar */}
        <section className="mt-10">
          <h2 className="text-sm font-black text-[#0A1931] mb-4">İlgili yazılar</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] transition-all p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-[10px] font-extrabold text-[#00A8B5]">{r.category}</span>
                </div>
                <h3 className="text-xs font-black text-[#0A1931] group-hover:text-[#00A8B5] transition mt-2 leading-snug">
                  {r.title}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-[#00A8B5] group-hover:gap-2 transition-all">
                  Oku <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
