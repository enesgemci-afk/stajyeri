import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'Stajyer CV Oluşturucu — Ücretsiz CV Hazırla ve PDF İndir';
const description =
  "Deneyimi olmayan öğrenciler için hazır alanlarla dakikalar içinde stajyer CV'si oluştur; ATS uyumlu şablonu PDF olarak indir. Ücretsiz, üyelik gerekmez.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'stajyer cv oluştur',
    'ücretsiz cv oluşturma',
    'deneyimsiz cv örneği',
    'öğrenci cv hazırlama',
    'cv pdf indir',
  ],
  alternates: { canonical: '/cv-olustur' },
  openGraph: pageOpenGraph({ title, description, path: '/cv-olustur' }),
};

export default function CvOlusturLayout({ children }: { children: React.ReactNode }) {
  return children;
}
