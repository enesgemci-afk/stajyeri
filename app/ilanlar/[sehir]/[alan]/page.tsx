import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, TURKEY_CITIES } from '@/lib/constants';
import { slugifyTr } from '@/lib/meslekRehberi';
import JobCard, { type JobCardData } from '@/components/JobCard';
import SiteHeader from '@/components/SiteHeader';

const SITE_URL = 'https://stajyeri.vercel.app';

const CITY_BY_SLUG = new Map(TURKEY_CITIES.map((c) => [slugifyTr(c), c]));
const FIELD_BY_SLUG = new Map(MESEM_FIELDS.map((f) => [slugifyTr(f), f]));

const POPULAR_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Kayseri'];

interface Props {
  params: Promise<{ sehir: string; alan: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sehir, alan } = await params;
  const city = CITY_BY_SLUG.get(sehir);
  const field = FIELD_BY_SLUG.get(alan);
  if (!city || !field) {
    return { title: 'Sayfa Bulunamadı | Stajyeri.net', robots: { index: false, follow: false } };
  }
  return {
    title: `${city} ${field} Staj ve Çıraklık İlanları | Stajyeri.net`,
    description: `${city} üzerinde ${field} alanındaki güncel MESEM çıraklık, meslek lisesi ve yaz stajı ilanları. Ücretsiz üye ol, tek tıkla başvur.`,
    alternates: { canonical: `/ilanlar/${sehir}/${alan}` },
  };
}

export default async function SehirAlanPage({ params }: Props) {
  const { sehir, alan } = await params;
  const city = CITY_BY_SLUG.get(sehir);
  const field = FIELD_BY_SLUG.get(alan);
  if (!city || !field) notFound();

  const { data } = await supabase
    .from('job_posts')
    .select(
      'id, title, field_name, program_type, city, district, quota, has_lunch, has_shuttle, wage_info, created_at, company_details(company_name, logo_url, logo_color)'
    )
    .eq('city', city)
    .eq('field_name', field)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(24);

  const jobs = (data ?? []) as unknown as JobCardData[];

  const otherFields = MESEM_FIELDS.filter((f) => f !== field)
    .slice(0, 10)
    .map((f) => ({ name: f, href: `/ilanlar/${slugifyTr(city)}/${slugifyTr(f)}` }));
  const otherCities = POPULAR_CITIES.filter((c) => c !== city).map((c) => ({
    name: c,
    href: `/ilanlar/${slugifyTr(c)}/${slugifyTr(field)}`,
  }));

  const faq = [
    {
      q: `${city} üzerinde ${field} alanında stajyer ücreti ne kadar?`,
      a: '3308 sayılı kanuna göre çırak öğrenciler yaş grubuna göre asgari ücretin yüzde 30-50 aralığında ücret alır; işletmeler ayrıca İMEP desteklerinden yararlanır. Güncel tablolar için Staj Ücretleri sayfamıza göz atın.',
    },
    {
      q: 'MESEM öğrencisi bu ilanlara nasıl başvurur?',
      a: 'Stajyeri.net ücretsiz üyeliği oluşturup alanınıza uygun ilanlara tek tıkla başvurabilirsiniz. 18 yaş altı başvurularda veli onayı sistemi devreye girer; süreç dijital ve güvenlidir.',
    },
    {
      q: `${field} alanında staj süresi ne kadar sürer?`,
      a: 'MESEM programında haftada 4 gün işletmede 1 gün okulda eğitim sürer; yaz dönemi beceri eğitimlerinde süre işletme ile okul koordinasyonunda planlanır.',
    },
    {
      q: 'Bu ilanları veren işletmeler güvenilir mi?',
      a: 'İşletme profillerinde usta öğretici bilgisi ve stajyer değerlendirmelerinden hesaplanan Güvenli İşyeri rozeti görünür. Yalnızca doğrulanmış işletmelere başvurmanız önerilir.',
    },
  ];

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'İlanlar', item: `${SITE_URL}/ilanlar` },
      { '@type': 'ListItem', position: 3, name: `${city} ${field}`, item: `${SITE_URL}/ilanlar/${sehir}/${alan}` },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <nav className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#00A8B5] transition">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/ilanlar" className="hover:text-[#00A8B5] transition">İlanlar</Link>
          <span>/</span>
          <span className="font-bold text-slate-700">{city} {field}</span>
        </nav>

        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-[#0A1931]">
          {city} {field} Staj ve Çıraklık İlanları
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          {city} üzerinde {field} alanındaki güncel MESEM çıraklık, meslek lisesi stajyeri ve yaz stajı ilanları — hepsi tek sayfada.
        </p>

        <p className="mt-4 text-[11px] font-extrabold text-[#00A8B5]">
          {jobs.length > 0 ? `${jobs.length} aktif ilan` : 'Şu anda aktif ilan yok'}
        </p>

        {jobs.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <div className="mt-4 bg-white rounded-3xl border border-slate-200 p-10 text-center">
            <p className="text-sm font-black text-[#0A1931]">Bu kriterlerde henüz ilan yok</p>
            <p className="text-xs text-slate-500 mt-2">
              Yeni ilanlar eklendiğinde ilk sen gör — iş alarmı kur, eşleşen ilanlar anında haber verilsin.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              <Link
                href={`/ilanlar?alan=${encodeURIComponent(field)}`}
                className="px-5 py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition"
              >
                Tüm {field} İlanları
              </Link>
              <Link
                href="/ilanlar"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition"
              >
                Tüm İlanlara Göz At
              </Link>
            </div>
          </div>
        )}

        {/* Diğer alanlar + şehirler — iç linkleme */}
        <section className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-xs font-black text-[#0A1931] mb-3">Diğer Alanlarda {city} İlanları</h2>
            <div className="flex flex-wrap gap-1.5">
              {otherFields.map((f) => (
                <Link
                  key={f.name}
                  href={f.href}
                  className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-[#00A8B5]/10 border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-[#00A8B5] transition"
                >
                  {f.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-xs font-black text-[#0A1931] mb-3">{field} İlanlarının Olduğu Diğer Şehirler</h2>
            <div className="flex flex-wrap gap-1.5">
              {otherCities.map((c) => (
                <Link
                  key={c.name}
                  href={c.href}
                  className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-[#00A8B5]/10 border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-[#00A8B5] transition"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SSS */}
        <section className="mt-10">
          <h2 className="text-base font-black text-[#0A1931]">Sıkça Sorulan Sorular</h2>
          <div className="mt-4 space-y-2.5">
            {faq.map((f) => (
              <details key={f.q} className="bg-white rounded-2xl border border-slate-200 p-4 group">
                <summary className="text-xs font-black text-[#0A1931] cursor-pointer list-none flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-[#00A8B5] group-open:rotate-45 transition text-base leading-none">+</span>
                </summary>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-2.5">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* İşveren CTA */}
        <section className="mt-10 bg-gradient-to-br from-[#0A1931] to-[#0D2244] rounded-3xl p-8 text-center">
          <h2 className="text-lg font-black text-white">{city} üzerinde stajyer mi arıyorsunuz?</h2>
          <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
            İşletmenizi ücretsiz kaydedin, {field} alanındaki binlerce öğrenciye ulaşın. Usta öğretici ve İMEP desteğiyle stajyeriniz size neredeyse maliyetsiz gelir.
          </p>
          <Link
            href="/ilan-ver"
            className="inline-block mt-5 px-6 py-3 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition"
          >
            Ücretsiz İlan Ver
          </Link>
        </section>
      </main>
    </div>
  );
}
