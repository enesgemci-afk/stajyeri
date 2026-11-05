import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kariyer Blogu — Ücret, Belge ve Staj Rehberleri | Stajyeri.net',
  description:
    'İMEP maaşı, kalfalık belgesi, MESEM vs meslek lisesi, usta belgesi ve ilk staj mülakatı: mesleki eğitim yolculuğunda bilmen gerekenler sade dille.',
  keywords: ['çıraklık blogu', 'İMEP maaşı', 'kalfalık belgesi', 'staj rehberi', '3308 hakları'],
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
