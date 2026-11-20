import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { SITE, breadcrumbLd, pageOpenGraph } from '@/lib/seo';
import {
  Target,
  ShieldCheck,
  Users,
  GraduationCap,
  Wallet,
  FileCheck2,
  ArrowRight,
  Building2,
} from 'lucide-react';

const title = 'Hakkımızda — MESEM ve Meslek Lisesi Staj Platformu';
const description =
  "Stajyeri.net kim, ne yapıyor? MESEM çıraklığı ve meslek lisesi stajını 3308 sayılı kanun çerçevesinde işletmelerle buluşturan ücretsiz platformun amacı ve ilkeleri.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ['stajyeri.net hakkında', 'MESEM staj platformu', 'meslek lisesi staj sitesi'],
  alternates: { canonical: '/hakkimizda' },
  openGraph: pageOpenGraph({ title, description, path: '/hakkimizda' }),
};

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: 'Doğrulanmış işletme',
    body: 'İlan veren işletmelerin usta öğretici bilgisi ve iletişim kanalları kontrol edilir; öğrenci değerlendirmeleriyle Güvenli İşyeri rozeti oluşur.',
  },
  {
    icon: Wallet,
    title: 'Öğrenciye her zaman ücretsiz',
    body: '4904 sayılı kanun gereği öğrencilerden iş bulma karşılığında ücret alınmaz. CV oluşturucu, ücret hesaplayıcı ve tüm rehberler ücretsizdir.',
  },
  {
    icon: Users,
    title: '18 yaş altına özel koruma',
    body: 'Reşit olmayan başvurularda veli onayı akışı devreye girer; kişisel veriler KVKK kapsamında, veli onayı olmadan işletmeyle paylaşılmaz.',
  },
  {
    icon: FileCheck2,
    title: 'Mevzuata uygun içerik',
    body: 'Ücret, sigorta ve belge bilgileri 3308 sayılı Meslekî Eğitim Kanunu ve MEB mevzuatı esas alınarak hazırlanır; her rehberde güncel tablolar kullanılır.',
  },
];

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: title,
            description,
            url: `${SITE.url}/hakkimizda`,
            inLanguage: 'tr-TR',
            about: { '@id': `${SITE.url}/#organization` },
          },
          breadcrumbLd([
            { name: 'Ana Sayfa', path: '/' },
            { name: 'Hakkımızda', path: '/hakkimizda' },
          ]),
        ]}
      />
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
              <Target className="w-4 h-4" /> Misyonumuz
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
              Mesleki eğitimi sahada görünür kılıyoruz
            </h1>
            <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
              Stajyeri.net; MESEM çıraklığı, meslek lisesi stajı ve üniversite zorunlu stajı arayan
              öğrencileri, usta öğretici eşliğinde eğitim vermeye hazır işletmelerle buluşturan
              ücretsiz bir platformdur.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <article className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9 space-y-4">
            <h2 className="text-base sm:text-lg font-black text-[#0A1931]">Neden Stajyeri?</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Türkiye&apos;de 544 binden fazla MESEM öğrencisi ve yüz binlerce meslek lisesi
              öğrencisi her yıl işletme arıyor; işletmeler ise uygun stajyeri bulmakta zorlanıyor.
              Bu eşleşme çoğu zaman okul koridorlarında, tanıdık aracılığıyla ya da eksik bilgiyle
              kuruluyor. Stajyeri.net bu süreci tek bir yerde toplar:{' '}
              <strong>ilan, başvuru, veli onayı ve eğitim sözleşmesi</strong> aynı akış içinde
              yürür.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Platform bir aracı kurum değildir; öğrenciden ücret almaz. İşletmeler ilanlarını
              ücretsiz yayınlar, öğrenciler ücretsiz başvurur. Gelir modeli yalnızca reklam ve
              işletmelere sunulan ek görünürlük paketlerine dayanır.
            </p>

            <h2 className="text-base sm:text-lg font-black text-[#0A1931] pt-3">Ne sunuyoruz?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: GraduationCap, t: '41 meslek alanı rehberi', d: 'Her alanın dersleri, becerileri, çıkış kapıları ve aktif ilanları.' },
                { icon: Wallet, t: '3308 ücret hesaplayıcı', d: 'Çırak, kalfa ve stajyer ücretinin kanuni tabanı, anlık hesap.' },
                { icon: FileCheck2, t: 'Ücretsiz CV ve ön yazı', d: 'Deneyimsiz öğrenciye uygun şablonlar, PDF çıktısı.' },
                { icon: Building2, t: 'İşletme ve teşvik rehberi', d: 'İMEP desteği, SGK primleri ve stajyer maliyeti.' },
              ].map((f) => (
                <div key={f.t} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
                  <f.icon className="w-5 h-5 text-[#00A8B5]" />
                  <p className="mt-2 text-xs font-black text-[#0A1931]">{f.t}</p>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>

            <h2 className="text-base sm:text-lg font-black text-[#0A1931] pt-3">İlkelerimiz</h2>
            <div className="space-y-3">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-[#0A1931]">{p.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 bg-[#F0FBFC] border border-[#00A8B5]/20 rounded-2xl p-5">
              <p className="text-xs font-black text-[#0A1931]">Bize ulaşın</p>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                Stajyeri.net, MESEM, meslek lisesi ve üniversite öğrencilerinin güvenli ve ücretli
                staj fırsatlarına ulaşmasını kolaylaştırmak için kuruldu. Amacımız, öğrencileri
                usta öğretici bilgisi doğrulanmış işletmelerle buluştururken başvuru sürecini
                anlaşılır, hızlı ve herkes için ücretsiz tutmak.
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-2">
                Küçük ve orta ölçekli işletmelerin de stajyer bulmasını destekliyoruz: ücretsiz ilan
                yayını, aday takibi ve İMEP/3308 rehberleriyle işverenlerin mevzuata uygun karar
                vermesine yardımcı oluyoruz. Platform, 4904 sayılı kanun gereği öğrencilerden iş
                bulma karşılığında ücret almaz.
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-2">
                İletişim için <strong>destek@stajyeri.net</strong> adresine yazabilir veya{' '}
                <Link href="/iletisim" className="text-[#00A8B5] font-bold hover:underline">
                  iletişim sayfamızı
                </Link>{' '}
                kullanabilirsiniz. Hata bildirimleri ve işletme doğrulama talepleri bu kanaldan yanıtlanır.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/ilanlar"
                  className="px-4 py-2.5 bg-[#00A8B5] hover:bg-[#00929e] text-white text-[11px] font-black rounded-full transition"
                >
                  İlanlara Göz At
                </Link>
                <Link
                  href="/isveren/kayit"
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:border-[#FF6B00] text-[#0A1931] text-[11px] font-black rounded-full transition inline-flex items-center gap-1"
                >
                  İşletme Kaydı <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
