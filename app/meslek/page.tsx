import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import { FIELD_GUIDES } from '@/lib/meslekRehberi';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'MESEM Meslek Rehberi — 41 Alan | Stajyeri.net',
  description:
    'MESEM ve meslek liselerinin 41 meslek alanının tamamı: ne iş yapar, nerede staj yapılır, çıraktan ustaya yol haritası ve 3308 ücret hakları. Her alan için aktif staj ilanları.',
  keywords: [
    'MESEM alanları',
    'meslek rehberi',
    'çıraklık alanları',
    'meslek lisesi alanları',
    '3308 mesleki eğitim',
  ],
};

export default function MeslekRehberiPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <BookOpen className="w-4 h-4" /> 3308 Sayılı Kanun Kapsamındaki 41 Alan
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
            MESEM Meslek Rehberi
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Hangi meslek sana uygun? Tüm MESEM alanlarını; ne iş yaptığını, hangi dersleri göreceğini,
            çıraktan ustaya yol haritasını ve o alandaki canlı staj ilanlarıyla birlikte keşfet.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-6 border-t border-white/10">
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#00E5FF]">41</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Meslek Alanı</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">184</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Meslek Dalı</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#FF6B00]">%30+</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Çırak Ücreti (asgari)</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">4+1</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">İşletme + Okul Modeli</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Kaynak: MEB e-MESEM / 3308 Sayılı Meslekî Eğitim Kanunu</p>
        </div>
      </section>

      {/* Alan kartları */}
      <section className="max-w-7xl w-full mx-auto px-4 py-14">
        <h2 className="text-xl sm:text-2xl font-black text-[#0A1931] text-center">
          Alanını Seç, Mesleğini Keşfet
        </h2>
        <p className="text-xs text-slate-500 text-center mt-2">
          Her alanın detay sayfasında mesleğin tanımı, görevleri, dersleri ve aktif ilanları seni bekliyor.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {FIELD_GUIDES.map((f) => (
            <Link
              key={f.slug}
              href={`/meslek/${f.slug}`}
              className="group bg-white rounded-3xl border border-slate-200 hover:border-[#00A8B5] hover:shadow-lg hover:shadow-[#00A8B5]/10 transition-all p-6 flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{f.emoji}</span>
                <h3 className="text-sm font-black text-[#0A1931] group-hover:text-[#00A8B5] transition">
                  {f.name}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{f.tagline}</p>
              <span className="mt-auto pt-2 text-[11px] font-black text-[#00A8B5] flex items-center gap-1 group-hover:gap-2 transition-all">
                Rehberi Oku <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Çapraz bağlantılar */}
        <div className="grid sm:grid-cols-2 gap-4 mt-12 max-w-3xl mx-auto">
          <Link
            href="/alan-secim"
            className="bg-[#0A1931] text-white rounded-3xl p-6 flex items-center gap-4 hover:bg-[#10294d] transition"
          >
            <GraduationCap className="w-8 h-8 text-[#00E5FF] flex-shrink-0" />
            <span>
              <span className="block text-sm font-black">Kararsız mısın?</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">6 soruluk Alan Seçim Testi ile sana en uygun alanları bul.</span>
            </span>
          </Link>
          <Link
            href="/staj-ucretleri"
            className="bg-[#FF6B00] text-white rounded-3xl p-6 flex items-center gap-4 hover:bg-[#e05f00] transition"
          >
            <span className="text-3xl">💰</span>
            <span>
              <span className="block text-sm font-black">Staj ücreti ne kadar?</span>
              <span className="block text-[11px] text-white/80 mt-0.5">3308 ücret hakları ve hesaplayıcı için tıkla.</span>
            </span>
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Stajyeri.net — MESEM Meslek Rehberi</p>
      </footer>
    </div>
  );
}
