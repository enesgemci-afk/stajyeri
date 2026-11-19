import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'Staj Mülakat Provası — Sesli Soru-Cevap Pratiği';
const description =
  'Mülakata girmeden önce pratik yap: alanına uygun soruları sesli yanıtla, süre tut, geri bildirim al. Tarayıcıda çalışır, kayıt gerekmez.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['mülakat provası', 'staj mülakatı pratiği', 'sesli mülakat', 'mülakat simülasyonu'],
  alternates: { canonical: '/rehber/mulakat-provasi' },
  openGraph: pageOpenGraph({ title, description, path: '/rehber/mulakat-provasi' }),
};

export default function MulakatProvasiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
