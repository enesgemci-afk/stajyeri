import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';
import PatikaClient from './PatikaClient';

export const metadata: Metadata = {
  title: 'Staj Patikası — Çıraktan Ustaya Yol Haritan',
  description:
    'Durumunu ve hedefini seç; çıraklık, kalfalık, ustalık ve üniversite yol haritanı dakikalar içinde oluştur. 3308 ücret hakları dahil, tamamen ücretsiz.',
  keywords: [
    'staj patikası',
    'çıraktan ustaya',
    'kalfalık belgesi nasıl alınır',
    'ustalık belgesi',
    'MESEM yol haritası',
    'meslek lisesi kariyer',
  ],
  alternates: { canonical: '/patika' },
  openGraph: pageOpenGraph({
    title: 'Staj Patikası — Çıraktan Ustaya Yol Haritan',
    description:
      'Durumunu ve hedefini seç; çıraklık, kalfalık, ustalık ve üniversite yol haritanı dakikalar içinde oluştur. Ücretsiz.',
    path: '/patika',
  }),
};

export default function PatikaPage() {
  return <PatikaClient />;
}