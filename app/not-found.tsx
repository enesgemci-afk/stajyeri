import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Compass, Search, ArrowRight } from 'lucide-react';

// 404: arama motorlarına noindex sinyali + kullanıcıyı doğru sayfalara yönlendirme.
export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı',
  description: 'Aradığınız sayfa taşınmış veya kaldırılmış olabilir.',
  // 404 sayfası kök canonical'ı devralmasın (noindex zaten var).
  alternates: { canonical: null },
  robots: { index: false, follow: true },
};

const ONERILER = [
  { href: '/ilanlar', label: 'Staj İlanları' },
  { href: '/meslek', label: '41 Alan Rehberi' },
  { href: '/staj-ucretleri', label: 'Staj Ücretleri (3308)' },
  { href: '/cv-olustur', label: 'CV Oluştur' },
  { href: '/blog', label: 'Kariyer Blogu' },
  { href: '/iletisim', label: 'İletişim' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] text-[10px] font-black">
            <Search className="w-3 h-3" /> 404
          </span>
          <h1 className="mt-4 text-2xl sm:text-3xl font-black text-[#0A1931]">
            Aradığın sayfayı bulamadık
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Bağlantı eski olabilir ya da sayfa kaldırılmış olabilir. Aşağıdaki sayfalardan devam
            edebilirsin.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {ONERILER.map((o) => (
              <Link
                key={o.href}
                href={o.href}
                className="px-3 py-2.5 bg-white border border-slate-200 hover:border-[#00A8B5] rounded-xl text-[11px] font-black text-[#0A1931] hover:text-[#00A8B5] transition"
              >
                {o.label}
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white text-xs font-black rounded-xl transition"
          >
            <Compass className="w-4 h-4" /> Ana Sayfaya Dön <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
