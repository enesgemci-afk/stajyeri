import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'Stajyer Maliyeti ve Teşvik Simülasyonu';
const description =
  'İşletmeniz için stajyer maliyetini saniyeler içinde hesaplayın: brüt ücret, SGK primi, İMEP ve teşvik indirimleri sonrası net maliyet.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['stajyer maliyeti hesaplama', 'teşvik simülasyonu', 'çırak maliyeti', 'İMEP hesaplama'],
  alternates: { canonical: '/tesvik-simulasyon' },
  openGraph: pageOpenGraph({ title, description, path: '/tesvik-simulasyon' }),
};

export default function TesvikSimulasyonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
