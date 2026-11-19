import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageOpenGraph } from '@/lib/seo';
import { supabase } from '@/lib/supabaseClient';
import IlanlarClient from './IlanlarClient';

// Sayfa her istekte taze ilan listesiyle sunucuda oluşturulur (SEO + hız).
export const dynamic = 'force-dynamic';

const title = 'Staj ve Çıraklık İlanları — MESEM, Meslek Lisesi, Üniversite';
const description =
  'Güncel MESEM çıraklık, meslek lisesi ve üniversite staj ilanları. Şehir, meslek alanı ve staj modeline göre filtrele, ücretsiz başvur.';

export const metadata: Metadata = {
  // Alt segmentler (/ilanlar/[sehir]/[alan]) şablonu devralır; bu yüzden title nesne.
  title: {
    default: title,
    template: '%s | Stajyeri.net',
  },
  description,
  keywords: [
    'staj ilanları',
    'çıraklık ilanları',
    'MESEM ilanları',
    'meslek lisesi staj ilanı',
    'stajyer aranıyor',
    'üniversite staj ilanları',
    'bursa staj ilanları',
  ],
  alternates: { canonical: '/ilanlar' },
  openGraph: pageOpenGraph({ title, description, path: '/ilanlar' }),
};

interface JobPost {
  id: string;
  title: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  quota?: number | null;
  has_lunch?: boolean;
  has_shuttle?: boolean;
  created_at?: string;
  company_details?: {
    company_name?: string;
    logo_url?: string | null;
    logo_color?: string | null;
  } | null;
}

export default async function IlanlarPage() {
  const { data } = await supabase
    .from('job_posts')
    .select(
      `id, title, field_name, program_type, city, district, quota, has_lunch, has_shuttle,
       wage_info, created_at,
       company_details ( company_name, logo_url, logo_color )`
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const jobs = (data ?? []) as unknown as JobPost[];

  // Listeleme sayfası için ItemList: Google'a "bunlar sıralı ilanlar" der.
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Aktif staj ve çıraklık ilanları',
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 20).map((job, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://www.stajyeri.net/ilan/${job.id}`,
      name: job.title,
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'Ana Sayfa', path: '/' },
            { name: 'Staj İlanları', path: '/ilanlar' },
          ]),
          ...(jobs.length > 0 ? [itemListLd] : []),
        ]}
      />
      <IlanlarClient initialJobs={jobs} />
    </>
  );
}
