import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageOpenGraph } from '@/lib/seo';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import FieldJobs from '@/components/FieldJobs';
import { FIELD_GUIDES, getFieldBySlug } from '@/lib/meslekRehberi';
import {
  CheckCircle2, BookOpen, Route, Compass, Image, MessageCircle, Tag,
  DoorOpen, ArrowRight, Wallet, Target, Sparkles, ClipboardList,
  GraduationCap, Briefcase, Award, Users, Zap,
} from 'lucide-react';

export function generateStaticParams() {
  return FIELD_GUIDES.map((f) => ({ alan: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ alan: string }> }): Promise<Metadata> {
  const { alan } = await params;
  const g = getFieldBySlug(alan);
  if (!g) return { title: 'Alan Bulunamadı', robots: { index: false, follow: false } };
  const title = g.name + ' Staj & MESEM Rehberi';
  const description = g.name + ' alanında MESEM stajı: ' + g.tagline;
  return {
    title,
    description,
    keywords: [
      g.name + ' staj',
      g.name + ' çıraklık',
      g.name + ' MESEM',
      g.name + ' iş ilanları',
      'meslek lisesi ' + g.name.toLowerCase(),
    ],
    alternates: { canonical: '/meslek/' + g.slug },
    openGraph: pageOpenGraph({ title, description, path: '/meslek/' + g.slug }),
  };
}

const YOL = [
  { t: 'Çıraklık (9-11. Sınıf)', d: 'Haftada 4 gün işletmede pratik + 1 gün okul. Ücret: net asgari ücretin en az %30u — İMEP desteğiyle işletmeye maliyeti 0 TL.', u: '%30' },
  { t: 'Kalfa Eğitimi (12. Sınıf)', d: 'Ücret en az %50ye çıkar. Kalfalık sınavına girilir.', u: '%50' },
  { t: 'Kalfalık Belgesi', d: 'Resmî meslek belgesi. İşe girişte ve usta öğreticilik eğitimine geçişte temel.', u: 'Belge' },
  { t: 'Ustalık & Kendi İşin', d: '3 yıl + ustalık eğitimi + sınav. Ustalık belgesiyle usta öğretici olur, işyeri açabilirsin.', u: 'Usta' },
];
export default async function MeslekDetayPage({ params }: { params: Promise<{ alan: string }> }) {
  const { alan } = await params;
  const guide = getFieldBySlug(alan);
  if (!guide) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <JsonLd
        data={breadcrumbLd([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Meslek Rehberi', path: '/meslek' },
          { name: guide.name, path: '/meslek/' + guide.slug },
        ])}
      />
      <SiteHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-12 pb-14 px-4">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <nav className="text-[11px] text-slate-400 mb-4 flex items-center justify-center gap-1.5">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/meslek" className="hover:text-white">Meslek Rehberi</Link>
            <span>/</span>
            <span className="text-[#00E5FF] font-bold">{guide.name}</span>
          </nav>
          <span className="text-5xl">{guide.emoji}</span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-black leading-tight text-white">{guide.name} Staj Rehberi</h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">{guide.tagline}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <Link href={'/?alan=' + encodeURIComponent(guide.name) + '#ilanlar'} className="px-5 py-2.5 rounded-full bg-[#00A8B5] text-white text-xs font-black hover:bg-[#008f9a] transition">{guide.name} İlanlarını Gör</Link>
            <Link href="/staj-ucretleri" className="px-5 py-2.5 rounded-full bg-white/10 text-white text-xs font-black hover:bg-white/20 transition">Ücreti Ne Kadar?</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-md mx-auto pt-6 border-t border-white/10">
            <div><p className="text-lg font-black text-[#00E5FF]">{guide.dersler.length}</p><p className="text-[9px] text-slate-400">Ders</p></div>
            <div><p className="text-lg font-black text-[#FF9E4D]">{guide.beceriler.length}</p><p className="text-[9px] text-slate-400">Beceri</p></div>
            <div><p className="text-lg font-black text-[#22C55E]">{guide.cikisKapilari.length}</p><p className="text-[9px] text-slate-400">Çıkış Kapısı</p></div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl w-full mx-auto px-4 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 lg:items-start">
        <div className="min-w-0">
          <section className="mb-10">
            <h2 className="text-lg font-black text-[#0A1931] mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-[#00A8B5]" /> Bu Meslek Ne İş Yapar?</h2>
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6">
              <p className="text-xs text-slate-600 leading-relaxed">{guide.neYapar}</p>
              <h3 className="text-xs font-black text-[#0A1931] mt-5 mb-3 flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5 text-[#FF6B00]" /> Tipik Görevleri</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {guide.gorevler.map((g, i) => (
                  <div key={g} className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-3.5 py-2.5">
                    <span className="w-5 h-5 rounded-lg bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-[11px] text-slate-600">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-black text-[#0A1931] mb-4 flex items-center gap-2"><Route className="w-5 h-5 text-[#00A8B5]" /> Çıraktan Ustaya Yol Haritası</h2>
            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#00A8B5] to-[#FF6B00]" />
              {YOL.map((s, i) => (
                <div key={s.t} className="relative pl-12 pb-6">
                  <span className="absolute left-0 top-0 w-10 h-10 rounded-2xl text-white text-xs font-black flex items-center justify-center shadow-md" style={{ backgroundColor: i < 2 ? '#00A8B5' : '#FF6B00' }}>{i + 1}</span>
                  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(10,25,49,0.06)] p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xs font-black text-[#0A1931]">{s.t}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black text-white" style={{ backgroundColor: i < 2 ? '#00A8B5' : '#FF6B00' }}>{s.u}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/staj-ucretleri" className="mt-3 inline-flex items-center gap-2 text-xs font-black text-[#00A8B5] hover:gap-3 transition-all"><Wallet className="w-4 h-4" /> Ücret detayları ve hesaplayıcı →</Link>
          </section>
          <section className="mb-10">
            <div className="bg-[#0A1931] rounded-3xl p-7 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] to-[#FF6B00]" />
              <h2 className="text-lg font-black text-white flex items-center gap-2"><DoorOpen className="w-5 h-5 text-[#00E5FF]" /> {guide.name} Mezunu Nereye Gider?</h2>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                {guide.cikisKapilari.map((c) => (
                  <div key={c} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                    <span className="text-xs text-slate-200">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <FieldJobs field={guide.name} />

          <section className="mt-10">
            <h2 className="text-lg font-black text-[#0A1931] mb-4">Yolculuğuna Devam Et</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/alan-secim" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] transition p-5 hover:-translate-y-0.5"><p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5"><Compass className="w-4 h-4 text-[#00A8B5]" /> Alan Seçim Testi</p><p className="text-[11px] text-slate-500 mt-1">Bu alan sana uygun mu?</p></Link>
              <Link href="/patika" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] transition p-5 hover:-translate-y-0.5"><p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5"><Route className="w-4 h-4 text-[#00A8B5]" /> Staj Patikası</p><p className="text-[11px] text-slate-500 mt-1">Kişisel yol haritanı oluştur.</p></Link>
              <Link href="/cv-ornekleri" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] transition p-5 hover:-translate-y-0.5"><p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5"><Image className="w-4 h-4 text-[#00A8B5]" /> CV Örnekleri</p><p className="text-[11px] text-slate-500 mt-1">Örnek CV'lere göz at.</p></Link>
              <Link href="/rehber/mulakat-sorulari" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] transition p-5 hover:-translate-y-0.5"><p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-[#00A8B5]" /> Mülakat Soruları</p><p className="text-[11px] text-slate-500 mt-1">Ne sorulur, nasıl cevaplanır?</p></Link>
            </div>
            <div className="mt-6 bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-700 font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#FF6B00]" /> İşletme misin? {guide.name} alanında stajyer almak İMEP desteğiyle maliyeti 0 TL olabilir.</p>
              <Link href="/tesvik-simulasyon" className="px-5 py-2.5 rounded-full bg-[#FF6B00] text-white text-xs font-black hover:bg-[#e05f00] transition flex-shrink-0 inline-flex items-center gap-1.5">Desteği Hesapla <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-20 space-y-4">
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-5">
            <p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5 mb-3"><BookOpen className="w-4 h-4 text-[#00A8B5]" /> Dersler</p>
            <div className="space-y-1.5">
              {guide.dersler.map((d) => <div key={d} className="text-[10px] text-slate-600 bg-slate-50 rounded-lg px-3 py-2 font-bold">{d}</div>)}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-5">
            <p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5 mb-3"><Tag className="w-4 h-4 text-[#FF6B00]" /> Beceriler</p>
            <div className="flex flex-wrap gap-1.5">
              {guide.beceriler.map((b) => <span key={b} className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: '#FF6B0015', color: '#c95400' }}>{b}</span>)}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-5">
            <p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5 mb-3"><Wallet className="w-4 h-4 text-[#00A8B5]" /> Ücret</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">Çırak</span><span className="text-[10px] font-black text-[#00A8B5]">%30+</span></div>
              <div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">Kalfa</span><span className="text-[10px] font-black text-[#FF6B00]">%50+</span></div>
              <div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">Usta</span><span className="text-[10px] font-black text-slate-700">Serbest</span></div>
            </div>
          </div>
        </aside>
      </div>

      <footer><SiteFooter /></footer>
    </div>
  );
}