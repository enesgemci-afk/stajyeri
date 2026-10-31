import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, TURKEY_CITIES } from '@/lib/constants';
import { FIELD_GUIDES, slugifyTr } from '@/lib/meslekRehberi';

const SITE_URL = 'https://stajyeri.vercel.app';

// Her istekte güncel üretilir — yeni ilanlar anında sitemap'e düşer
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/ilanlar`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/isletmeler`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/meslek`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/staj-ucretleri`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/alan-secim`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/cv-olustur`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/rehber/mulakat-sorulari`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/rehber/onyazi`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/imep`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tesvik-rehberi`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tesvik-simulasyon`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const fieldUrls: MetadataRoute.Sitemap = FIELD_GUIDES.map((g) => ({
    url: `${SITE_URL}/meslek/${g.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  try {
    const { data } = await supabase
      .from('job_posts')
      .select('id, created_at, city, field_name')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (data && data.length > 0) {
      const citySet = new Set(TURKEY_CITIES);
      const fieldSet = new Set(MESEM_FIELDS);
      const combos = new Set<string>();
      const jobUrls: MetadataRoute.Sitemap = [];

      for (const j of data as {
        id: string;
        created_at: string | null;
        city: string | null;
        field_name: string | null;
      }[]) {
        jobUrls.push({
          url: `${SITE_URL}/ilan/${j.id}`,
          lastModified: j.created_at ? new Date(j.created_at) : now,
          changeFrequency: 'daily',
          priority: 0.7,
        });
        if (j.city && j.field_name && citySet.has(j.city) && fieldSet.has(j.field_name)) {
          combos.add(`${j.city}|${j.field_name}`);
        }
      }

      const comboUrls: MetadataRoute.Sitemap = Array.from(combos).map((key) => {
        const [city, field] = key.split('|');
        return {
          url: `${SITE_URL}/ilanlar/${slugifyTr(city)}/${slugifyTr(field)}`,
          lastModified: now,
          changeFrequency: 'daily' as const,
          priority: 0.6,
        };
      });

      return [...staticUrls, ...fieldUrls, ...comboUrls, ...jobUrls];
    }
  } catch {
    /* DB erişilemezse statik kısmla devam et */
  }

  return [...staticUrls, ...fieldUrls];
}
