import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import FieldJobs from '@/components/FieldJobs';
import { FIELD_GUIDES, getFieldBySlug } from '@/lib/meslekRehberi';
import {
  CheckCircle2,
  BookOpen,
  Route,
  Tag,
  DoorOpen,
  ArrowRight,
  Wallet,
  Target,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

/** 41 alanın tamamını build sırasında statik üret (SEO + hız) */
export function generateStaticParams() {
  return FIELD_GUIDES.map((f) => ({ alan: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ alan: string }>;
}): Promise<Metadata> {
  const { alan } = await params;
  const guide = getFieldBySlug(alan);
  if (!guide) return { title: 'Alan Bulunamadı | Stajyeri.net' };
  return {
    title: `${guide.name} Staj & MESEM Rehberi | Stajyeri.net`,
    description: `${guide.name} alanında MESEM/meslek lisesi stajı: ${guide.tagline} Ne iş yapar, hangi dersleri görürsün, ücreti ne kadar — ve ${guide.name.toLowerCase()} aktif staj ilanları.`,
    keywords: [
      `${guide.name} staj`,
      `${guide.name} MESEM`,
      `${guide.name} çıraklık`,
      `${guide.name} meslek lisesi`,
      `${guide.name} iş ilanları`,
    ],
  };
}

const YOL = [
  {
    title: 'Çıraklık (9-11. Sınıf)',
    desc: 'Haftada 4 gün işletmede pratik + 1 gün okul. Ücret: net asgari ücretin en az %30u — İMEP desteğiyle işletmeye maliyeti 0 TL.',
  },
  {
    title: 'Kalfa Eğitimi (12. Sınıf)',
    desc: 'Ücret en az %50ye çıkar. Sonunda kalfalık sınavına girilir — mesleği tek başına yapma yetkisi kazanırsın.',
  },
  {
    title: 'Kalfalık Belgesi',
    desc: 'Resmî meslek belgesi. İşe girişte, ücret artışında ve usta öğreticilik eğitimine geçişte temelini oluşturur.',
  },
  {
    title: 'Ustalık & Kendi İşin',
    desc: '3 yıl çalışma + ustalık eğitimi sonrası ustalık sınavı. Ustalık belgesiyle usta öğretici olur, bazı mesleklerde kendi iş yerini açabilirsin.',
  },
];

export default async function MeslekDetayPage({
  params,
}: {
  params: Promise<{ alan: string }>;
}) {
  const { alan } = await params;
  const guide = getFieldBySlug(alan);
  if (!guide) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-12 pb-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav className="text-[11px] text-slate-400 mb-4 flex items-center justify-center gap-1.5">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/meslek" className="hover:text-white">Meslek Rehberi</Link>
            <span>/</span>
            <span className="text-[#00E5FF] font-bold">{guide.name}</span>
          </nav>
          <span className="text-5xl">{guide.emoji}</span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-black leading-tight text-white">
            {guide.name} Staj Rehberi
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {guide.tagline}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <Link
              href={`/?alan=${encodeURIComponent(guide.name)}#ilanlar`}
              className="px-5 py-2.5 rounded-full bg-[#00A8B5] text-white text-xs font-black hover:bg-[#008f9a] transition"
            >
              {guide.name} İlanlarını Gör
            </Link>
            <Link
              href="/staj-ucretleri"
              className="px-5 py-2.5 rounded-full bg-white/10 text-white text-xs font-black hover:bg-white/20 transition"
            >
              Ücreti Ne Kadar?
            </Link>
          </div>
        </div>
      </section>

      {/* Ne iş yapar + Görevler */}
      <section className="max-w-6xl w-full mx-auto px-4 py-12 grid md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-black text-[#0A1931] flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#00A8B5]" /> Bu Meslek Ne İş Yapar?
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">{guide.neYapar}</p>
          <h3 className="text-xs font-black text-[#0A1931] mt-5 mb-2 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-[#FF6B00]" /> Tipik Görevleri
          </h3>
          <ul className="space-y-1.5">
            {guide.gorevler.map((g) => (
              <li key={g} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-[#0A1931] flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-[#00A8B5]" /> MESEM’de Görülen Dersler
            </h2>
            <div className="flex flex-wrap gap-2">
              {guide.dersler.map((d) => (
                <span key={d} className="px-3 py-1.5 rounded-full bg-[#00A8B5]/10 text-[#008f9a] text-[11px] font-bold">
                  {d}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Eğitim modeli: haftada 4 gün işletmede pratik, 1 gün okulda teorik — yılın 12 ayı boyunca.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-[#0A1931] flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#FF6B00]" /> Kazandığın Beceriler
            </h2>
            <div className="flex flex-wrap gap-2">
              {guide.beceriler.map((b) => (
                <span key={b} className="px-3 py-1.5 rounded-full bg-[#FF6B00]/10 text-[#c95400] text-[11px] font-bold">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Yol haritası */}
      <section className="max-w-6xl w-full mx-auto px-4 pb-12">
        <h2 className="text-xl sm:text-2xl font-black text-[#0A1931] flex items-center gap-2">
          <Route className="w-5 h-5 text-[#00A8B5]" /> Çıraktan Ustaya Yol Haritası
        </h2>
        <p className="text-xs text-slate-500 mt-2">3308 Sayılı Kanun garantili ücret ve belge yolu — her adım resmîdir.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {YOL.map((s, i) => (
            <div key={s.title} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative">
              <span className="absolute -top-3 left-5 w-7 h-7 rounded-full bg-[#0A1931] text-white text-xs font-black flex items-center justify-center">
                {i + 1}
              </span>
              <h3 className="text-xs font-black text-[#0A1931] mt-2">{s.title}</h3>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <Link
          href="/staj-ucretleri"
          className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#00A8B5] hover:gap-3 transition-all"
        >
          <Wallet className="w-4 h-4" /> Ücret detayları ve hesaplayıcı →
        </Link>
      </section>

      {/* Çıkış kapıları */}
      <section className="max-w-6xl w-full mx-auto px-4 pb-12">
        <div className="bg-[#0A1931] rounded-3xl p-7">
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-[#00E5FF]" /> {guide.name} Mezunu Nereye Gider?
          </h2>
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

      {/* Canlı ilanlar */}
      <FieldJobs field={guide.name} />

      {/* Çapraz bağlantılar */}
      <section className="max-w-6xl w-full mx-auto px-4 pb-16">
        <h2 className="text-lg font-black text-[#0A1931] mb-4">Yolculuğuna Devam Et</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/alan-secim" className="bg-white rounded-3xl border border-slate-200 hover:border-[#00A8B5] transition p-5">
            <p className="text-xs font-black text-[#0A1931]">🧭 Alan Seçim Testi</p>
            <p className="text-[11px] text-slate-500 mt-1">Bu alan sana uygun mu? 6 soruda keşfet.</p>
          </Link>
          <Link href="/cv-olustur" className="bg-white rounded-3xl border border-slate-200 hover:border-[#00A8B5] transition p-5">
            <p className="text-xs font-black text-[#0A1931]">📄 CV Oluştur</p>
            <p className="text-[11px] text-slate-500 mt-1">Bu alandaki becerileri CV’ne ekle, PDF indir.</p>
          </Link>
          <Link href="/rehber/mulakat-sorulari" className="bg-white rounded-3xl border border-slate-200 hover:border-[#00A8B5] transition p-5">
            <p className="text-xs font-black text-[#0A1931]">💬 Mülakat Soruları</p>
            <p className="text-[11px] text-slate-500 mt-1">Staj mülakatında ne sorulur, nasıl cevaplanır?</p>
          </Link>
        </div>
        <div className="mt-6 bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-700 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            İşletme misin? {guide.name} alanında stajyer almak İMEP desteğiyle maliyeti 0 TL olabilir.
          </p>
          <Link
            href="/tesvik-simulasyon"
            className="px-5 py-2.5 rounded-full bg-[#FF6B00] text-white text-xs font-black hover:bg-[#e05f00] transition flex-shrink-0 inline-flex items-center gap-1.5"
          >
            Desteği Hesapla <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Stajyeri.net — {guide.name} Meslek Rehberi</p>
      </footer>
    </div>
  );
}
