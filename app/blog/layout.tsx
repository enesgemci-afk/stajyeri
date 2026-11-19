import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'Kariyer Blogu — Ücret, Belge ve Staj Rehberleri';
const description =
  'İMEP maaşı, kalfalık belgesi, MESEM vs meslek lisesi, usta belgesi ve ilk staj mülakatı: mesleki eğitim yolculuğunda bilmen gerekenler sade dille.';

export const metadata: Metadata = {
  // Blog yazıları (blog/[slug]) bu şablonu devralır.
  title: {
    default: title,
    template: '%s | Stajyeri.net',
  },
  description,
  keywords: ['çıraklık blogu', 'İMEP maaşı', 'kalfalık belgesi', 'staj rehberi', '3308 hakları'],
  alternates: { canonical: '/blog' },
  openGraph: pageOpenGraph({ title, description, path: '/blog' }),
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
