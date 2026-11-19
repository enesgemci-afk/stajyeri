import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'MESEM Okul ve Koordinatörlük Kaydı';
const description =
  'Meslek lisesi ve MESEM koordinatörlükleri için ücretsiz kurum kaydı: öğrencilerinizi staj ilanlarıyla eşleştirin, sözleşmeleri dijital yönetin.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['MESEM koordinatörlük', 'okul kaydı', 'meslek lisesi staj takibi', 'eğitim sözleşmesi dijital'],
  alternates: { canonical: '/okul/kayit' },
  openGraph: pageOpenGraph({ title, description, path: '/okul/kayit' }),
};

export default function OkulKayitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
