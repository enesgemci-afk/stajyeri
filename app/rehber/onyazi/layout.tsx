import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/seo';

const title = 'Staj Başvurusu İçin Ön Yazı (Motivasyon Yazısı) Örnekleri';
const description =
  'CV’ne eşlik edecek ön yazı nasıl yazılır? Meslek alanına göre hazır ön yazı şablonları, dikkat edilecek hatalar ve kısa-öz yazım rehberi.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'ön yazı örneği',
    'motivasyon yazısı',
    'staj başvuru yazısı',
    'ön yazı nasıl yazılır',
    'iş başvuru mektubu örneği',
  ],
  alternates: { canonical: '/rehber/onyazi' },
  openGraph: pageOpenGraph({ title, description, path: '/rehber/onyazi' }),
};

export default function OnYaziLayout({ children }: { children: React.ReactNode }) {
  return children;
}
