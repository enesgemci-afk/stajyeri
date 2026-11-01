import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hesaplama Araçları — Brüt-Net, Mesai, İzin, Tazminat | Stajyeri.net',
  description:
    'Brüt-net maaş, fazla mesai ücreti, yıllık izin günü ve kıdem-ihbar tazminatı hesaplayıcıları. Ücretsiz, kayıt gerektirmez, bilgilendirme amaçlı.',
  keywords: [
    'brüt net maaş hesaplama',
    'fazla mesai hesaplama',
    'yıllık izin hesaplama',
    'kıdem tazminatı hesaplama',
    'ihbar tazminatı',
  ],
};

export default function HesaplamaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
