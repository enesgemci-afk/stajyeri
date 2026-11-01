import type { Metadata } from 'next';
import PatikaClient from './PatikaClient';

export const metadata: Metadata = {
  title: 'Staj Patikası — Çıraktan Ustaya Yol Haritan | Stajyeri.net',
  description:
    'Durumunu ve hedefini seç; çıraklık, kalfalık, ustalık, üniversite ve iş bulma yol haritanı dakikalar içinde oluştur. 3308 ücret hakları ve belgeler dahil, tamamen ücretsiz.',
  keywords: [
    'staj patikası',
    'çıraktan ustaya',
    'kalfalık belgesi nasıl alınır',
    'ustalık belgesi',
    'MESEM yol haritası',
    'meslek lisesi kariyer',
  ],
};

export default function PatikaPage() {
  return <PatikaClient />;
}