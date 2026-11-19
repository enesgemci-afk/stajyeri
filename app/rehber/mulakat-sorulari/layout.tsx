import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'Staj Mülakatında Sorulan Sorular ve Cevapları';
const description =
  'Staj mülakatında ne sorulur? Meslek alanına göre en sık sorulan sorular, örnek cevaplar ve mülakat öncesi hazırlık listesi — MESEM ve üniversite stajyerleri için.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'staj mülakat soruları',
    'staj mülakatında ne sorulur',
    'mülakat soruları ve cevapları',
    'çıraklık mülakatı',
    'stajyer mülakatı',
  ],
  alternates: { canonical: '/rehber/mulakat-sorulari' },
  openGraph: pageOpenGraph({ title, description, path: '/rehber/mulakat-sorulari' }),
};

export default function MulakatSorulariLayout({ children }: { children: React.ReactNode }) {
  return children;
}
