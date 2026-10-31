import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

const SITE_URL = 'https://stajyeri.vercel.app';

interface JobMeta {
  id: string;
  title: string;
  description: string | null;
  field_name: string | null;
  city: string | null;
  district: string | null;
  created_at: string | null;
  is_active: boolean | null;
  company_details?: { company_name?: string | null } | null;
}

async function getJob(id: string): Promise<JobMeta | null> {
  const { data } = await supabase
    .from('job_posts')
    .select(
      'id, title, description, field_name, city, district, created_at, is_active, company_details(company_name)'
    )
    .eq('id', id)
    .maybeSingle();
  return (data ?? null) as unknown as JobMeta | null;
}

// İlan başına SEO meta (sayfa 'use client' olduğu için layout üstlenir)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) {
    return { title: 'İlan Bulunamadı | Stajyeri.net', robots: { index: false, follow: false } };
  }
  const city = job.city ? ` — ${job.city}` : '';
  const desc = (job.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 155);
  return {
    title: `${job.title}${city} | Stajyeri.net`,
    description: desc || `${job.title} — ${job.field_name ?? 'staj'} ilanı${city}. Ücretsiz üye ol, hemen başvur.`,
    alternates: { canonical: `/ilan/${id}` },
    robots: job.is_active ? undefined : { index: false, follow: false },
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
  const job = await getJob(id);

  if (!job || !job.is_active) return <>{children}</>;

  const plain = (job.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 4000);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: plain || job.title,
    identifier: { '@type': 'PropertyValue', name: 'Stajyeri.net', value: job.id },
    datePosted: job.created_at ?? undefined,
    employmentType: 'INTERN',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {children}
    </>
  );
}
