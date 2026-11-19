import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'İşveren Teşvik Rehberi — Stajyer ve Çırak Teşvikleri';
const description =
  'Stajyer ve çırak çalıştırmanın işletmeye maliyeti nedir? İMEP desteği, SGK prim teşvikleri ve 3308 kapsamındaki devlet desteklerini örnek hesaplarla açıkladık.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'stajyer teşviği',
    'çırak teşviği',
    'İMEP desteği',
    'işveren teşvikleri 2026',
    'stajyer maliyeti',
    '3308 devlet desteği',
  ],
  alternates: { canonical: '/tesvik-rehberi' },
  openGraph: pageOpenGraph({ title, description, path: '/tesvik-rehberi' }),
};

export default function TesvikRehberiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
