import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'Hesaplama Araçları — Brüt-Net, Mesai, İzin, Tazminat';
const description =
  'Brüt-net maaş, fazla mesai ücreti, yıllık izin günü ve kıdem-ihbar tazminatı hesaplayıcıları. Ücretsiz, kayıt gerektirmez, bilgilendirme amaçlı.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'brüt net maaş hesaplama',
    'fazla mesai hesaplama',
    'yıllık izin hesaplama',
    'kıdem tazminatı hesaplama',
    'ihbar tazminatı',
  ],
  alternates: { canonical: '/hesaplama-araclari' },
  openGraph: pageOpenGraph({ title, description, path: '/hesaplama-araclari' }),
};

export default function HesaplamaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
