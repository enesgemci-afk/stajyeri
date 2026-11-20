import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { SITE_URL, absoluteUrl, breadcrumbLd } from '@/lib/seo';
import { getJobForPage } from './job';
import { getActiveJobCount } from '@/lib/jobStats';

// İlan başına SEO meta (sayfa istemci bileşeni olduğu için layout üstlenir)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [job, activeCount] = await Promise.all([getJobForPage(id), getActiveJobCount()]);
  if (!job) {
    return { title: 'İlan Bulunamadı', robots: { index: false, follow: activeCount === 0 } };
  }
  const city = job.city ? ` — ${job.city}` : '';
  const desc = (job.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 155);
  const title = `${job.title}${city}`;
  const description =
    desc || `${job.title} — ${job.field_name ?? 'staj'} ilanı${city}. Ücretsiz üye ol, hemen başvur.`;
  return {
    title,
    description,
    alternates: { canonical: `/ilan/${id}` },
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url: absoluteUrl(`/ilan/${id}`),
      siteName: 'Stajyeri.net',
      title,
      description,
      images: [
        {
          url: absoluteUrl('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    robots: activeCount === 0
      ? { index: false, follow: true }
      : job.is_active
        ? undefined
        : { index: false, follow: false },
  };
}

// Google Jobs: aktif ilanlar için JobPosting yapılandırılmış verisi (SSR HTML'e gömülür)
export default async function IlanLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobForPage(id);

  if (!job || !job.is_active) return <>{children}</>;

  const plain = (job.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 4000);

  // Google Jobs ilan ömrü: yayın + 60 gün (site ilanları 60 günde arşivlenir)
  const validThrough = job.created_at
    ? new Date(new Date(job.created_at).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: plain || job.title,
    identifier: { '@type': 'PropertyValue', name: 'Stajyeri.net', value: job.id },
    datePosted: job.created_at ?? undefined,
    validThrough,
    employmentType: 'INTERN',
    // Başvurular doğrudan Stajyeri.net üzerinden alınıyor (Google Jobs: direct apply)
    directApply: true,
    industry: job.field_name ?? undefined,
    occupationalCategory: job.field_name ?? undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_details?.company_name || 'Stajyeri.net İşletmesi',
      sameAs: SITE_URL,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.district || job.city || undefined,
        addressRegion: job.city || undefined,
        addressCountry: 'TR',
      },
    },
    url: `${SITE_URL}/ilan/${job.id}`,
  };

  return (
    <>
      <JsonLd
        data={[
          ld,
          breadcrumbLd([
            { name: 'Ana Sayfa', path: '/' },
            { name: 'Staj İlanları', path: '/ilanlar' },
            { name: job.title, path: `/ilan/${job.id}` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
