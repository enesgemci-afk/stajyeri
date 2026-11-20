import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';
import { getActiveJobCount } from '@/lib/jobStats';

const title = 'Staj ve Çıraklık İlanları — MESEM, Meslek Lisesi, Üniversite';
const description =
  'Güncel MESEM çıraklık, meslek lisesi ve üniversite staj ilanları. Şehir, meslek alanı ve staj modeline göre filtrele, ücretsiz başvur.';

const baseMetadata: Metadata = {
  // Alt segmentler (/ilanlar/[sehir]/[alan]) şablonu devralır; bu yüzden title nesne.
  title: {
    default: title,
    template: '%s | Stajyeri.net',
  },
  description,
  keywords: [
    'staj ilanları',
    'çıraklık ilanları',
    'MESEM ilanları',
    'meslek lisesi staj ilanı',
    'stajyer aranıyor',
    'üniversite staj ilanları',
    'bursa staj ilanları',
  ],
  alternates: { canonical: '/ilanlar' },
  openGraph: pageOpenGraph({ title, description, path: '/ilanlar' }),
};

export async function generateMetadata(): Promise<Metadata> {
  const activeCount = await getActiveJobCount();
  return {
    ...baseMetadata,
    // Boş ilan vitrini ince içerik sayılmasın; ilan gelince otomatik index açılır.
    robots: activeCount === 0 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default function IlanlarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
