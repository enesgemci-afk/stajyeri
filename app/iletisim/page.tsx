import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { SITE, breadcrumbLd, pageOpenGraph } from '@/lib/seo';
import { Mail, Clock, ShieldAlert, Building2, GraduationCap, LifeBuoy } from 'lucide-react';

const title = 'İletişim — Destek, Hata Bildirimi ve İş Birliği';
const description =
  'Stajyeri.net iletişim: hesap ve başvuru sorunları, ilan kaldırma talepleri, hata bildirimi ve iş birliği için bize ulaşın. Yanıt süresi genellikle 1-2 iş günüdür.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['stajyeri.net iletişim', 'staj platformu destek', 'ilan kaldırma talebi'],
  alternates: { canonical: '/iletisim' },
  openGraph: pageOpenGraph({ title, description, path: '/iletisim' }),
};

const KONULAR = [
  {
    icon: GraduationCap,
    title: 'Öğrenci & veli',
    body: 'Hesap açma, başvuru durumu, veli onayı ve CV ile ilgili sorular.',
  },
  {
    icon: Building2,
    title: 'İşletme',
    body: 'İlan yayınlama, ilan güncelleme, usta öğretici doğrulaması ve teşvikler.',
  },
  {
    icon: ShieldAlert,
    title: 'İçerik bildirimi',
    body: 'Hatalı, yanıltıcı veya mevzuata aykırı ilan bildirimleri (kaldırma talepleri).',
  },
  {
    icon: LifeBuoy,
    title: 'İş birliği',
    body: 'Okul, MESEM koordinatörlüğü, STK ve basın iş birlikleri.',
  },
];

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: title,
            description,
            url: `${SITE.url}/iletisim`,
            inLanguage: 'tr-TR',
            about: { '@id': `${SITE.url}/#organization` },
            mainEntity: {
              '@type': 'Organization',
              name: SITE.name,
              url: SITE.url,
              email: SITE.email,
            },
          },
          breadcrumbLd([
            { name: 'Ana Sayfa', path: '/' },
            { name: 'İletişim', path: '/iletisim' },
          ]),
        ]}
      />
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
              <Mail className="w-4 h-4" /> Bize Ulaşın
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">İletişim</h1>
            <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
              Sorunu, önerini ya da bildirimini yaz — her mesajı okuyoruz.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12 space-y-5">
          {/* E-posta kartı */}
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
            <h2 className="text-base sm:text-lg font-black text-[#0A1931]">E-posta ile yazın</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
              Tüm talep ve bildirimler için tek kanal e-postadır. Mesajınızda hesabınızda kullandığınız
              e-posta adresini ve varsa ilan bağlantısını belirtmeniz süreci hızlandırır.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white text-xs font-black rounded-xl transition"
            >
              <Mail className="w-4 h-4" /> {SITE.email}
            </a>
            <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> Yanıt süresi: genellikle 1-2 iş günü
            </p>
          </div>

          {/* Konu kartları */}
          <div className="grid sm:grid-cols-2 gap-4">
            {KONULAR.map((k) => (
              <div
                key={k.title}
                className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-5"
              >
                <span className="w-10 h-10 rounded-xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center">
                  <k.icon className="w-5 h-5" />
                </span>
                <p className="mt-3 text-xs font-black text-[#0A1931]">{k.title}</p>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{k.body}</p>
              </div>
            ))}
          </div>

          {/* KVKK notu */}
          <div className="bg-[#F0FBFC] border border-[#00A8B5]/20 rounded-3xl p-6">
            <p className="text-xs font-black text-[#0A1931]">Kişisel veriler hakkında</p>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
              E-posta yoluyla ilettiğiniz bilgiler yalnızca talebinizi yanıtlamak için işlenir.
              Ayrıntılar için{' '}
              <Link href="/kvkk" className="text-[#00A8B5] font-bold hover:underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni inceleyebilirsiniz. Platformun nasıl çalıştığını merak ediyorsanız{' '}
              <Link href="/hakkimizda" className="text-[#00A8B5] font-bold hover:underline">
                Hakkımızda
              </Link>{' '}
              sayfasına göz atın.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
