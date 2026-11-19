import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'MESEM Meslek Alanı Seçim Testi — 6 Soruda Sana Uygun Alan';
const description =
  '9. sınıfa geçenler için meslek alanı seçim testi: 6 soruda ilgi ve becerilerini ölç, 41 MESEM alanı arasından sana en uygun 3 alanı ve o alanların staj ilanlarını gör.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'meslek alanı seçim testi',
    'MESEM alan seçimi',
    'hangi meslek alanı bana uygun',
    'meslek testi',
    '9. sınıf alan seçimi',
  ],
  alternates: { canonical: '/alan-secim' },
  openGraph: pageOpenGraph({ title, description, path: '/alan-secim' }),
};

export default function AlanSecimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
