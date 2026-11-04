import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { FIELD_GUIDES, type FieldGuide } from '@/lib/meslekRehberi';
import { ArrowRight, FileText, PenLine } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Stajyer CV Örnekleri — Alanına Göre Hazır Şablonlar | Stajyeri.net',
  description:
    'Elektrik, bilişim, makine, muhasebe ve daha fazlası için MESEM öğrencilerine özel CV örnekleri; hakkımda kalıbı, beceriler ve dersler hazır. Ücretsiz CV oluştur.',
  keywords: ['stajyer cv örneği', 'çırak cv', 'MESEM cv', 'deneyimsiz cv örneği'],
};

// Galeride gösterilecek öne çıkan alanlar (FIELD_GUIDES ile eşleşen tam adlar)
const FEATURED = [
  'Elektrik-Elektronik Teknolojisi',
  'Bilişim Teknolojileri',
  'Makine ve Tasarım Teknolojisi',
  'Muhasebe ve Finansman',
  'Yiyecek İçecek Hizmetleri',
  'Çocuk Gelişimi ve Eğitimi',
];

export default function CvOrnekleriPage() {
  const examples = FEATURED.map((name) =>
    FIELD_GUIDES.find((f) => f.name === name),
  ).filter((f): f is FieldGuide => Boolean(f));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <FileText className="w-4 h-4" /> Deneyimsizler için hazır kalıplar
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
            Stajyer CV Örnekleri
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {examples.length} farklı MESEM alanı için doldurulmuş örnek CV’ler. Hakkımda cümleni,
            becerilerini ve eğitim satırlarını alanına göre kopyala; CV Oluşturucu ile dakikalar
            içinde kendi PDF’ini indir.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto pt-6 border-t border-white/10">
            <div>
              <p className="text-xl font-black text-[#00E5FF]">{examples.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Alan Örneği</p>
            </div>
            <div>
              <p className="text-xl font-black text-white">PDF</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ücretsiz İndirme</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#FF6B00]">2 dk</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ortalama Süre</p>
            </div>
          </div>
        </div>
      </section>

      {/* Örnek kartları */}
      <section className="max-w-7xl w-full mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {examples.map((f) => (
            <div
              key={f.slug}
              className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] transition-all p-6 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{f.emoji}</span>
                <h2 className="text-sm font-black text-[#0A1931] leading-snug">{f.name}</h2>
              </div>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  Hakkımda (örnek)
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">
                  “{f.tagline} {f.neYapar.split('.')[0]} olarak bu alanda kendimi gerçek üretim
                  ortamında geliştirmek istiyorum.”
                </p>
              </div>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  Öne çıkan beceriler
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {f.beceriler.slice(0, 4).map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 rounded-full bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-bold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  Eğitim / modüller
                </p>
                <ul className="space-y-1">
                  {f.dersler.slice(0, 3).map((d) => (
                    <li key={d} className="text-[10px] text-slate-600 flex items-start gap-1.5">
                      <span className="text-[#00A8B5] mt-0.5">•</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  Kariyer hedefi
                </p>
                <p className="text-[10px] text-slate-600">{f.cikisKapilari[0]}</p>
              </div>

              <Link
                href="/cv-olustur"
                className="mt-auto pt-2 text-[11px] font-black text-[#00A8B5] flex items-center gap-1 hover:gap-2 transition-all"
              >
                Bu örnekten CV oluştur <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Çapraz bağlantılar */}
        <div className="grid sm:grid-cols-2 gap-4 mt-12 max-w-3xl mx-auto">
          <Link
            href="/rehber/onyazi"
            className="bg-[#0A1931] text-white rounded-3xl p-6 flex items-center gap-4 hover:bg-[#10294d] transition"
          >
            <PenLine className="w-8 h-8 text-[#00E5FF] flex-shrink-0" />
            <span>
              <span className="block text-sm font-black">Ön yazı örnekleri</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">
                CV’nle birlikte güçlü bir başvuru ön yazısı hazırla.
              </span>
            </span>
          </Link>
          <Link
            href="/meslek"
            className="bg-[#FF6B00] text-white rounded-3xl p-6 flex items-center gap-4 hover:bg-[#e05f00] transition"
          >
            <span className="text-3xl">📚</span>
            <span>
              <span className="block text-sm font-black">Alan rehberlerini keşfet</span>
              <span className="block text-[11px] text-white/80 mt-0.5">
                41 alanın tamamı: ne iş yapar, nereye gider.
              </span>
            </span>
          </Link>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-8">
          Örnekler alanına göre şablonlardır; kişisel bilgilerini ekledikten sonra çıkışı PDF olarak
          indir.
        </p>
      </section>

      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
