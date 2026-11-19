import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, TURKEY_CITIES } from '@/lib/constants';
import { FIELD_GUIDES, slugifyTr } from '@/lib/meslekRehberi';
import { BLOG_POSTS } from '@/lib/blogYazilari';

const SITE_URL = 'https://www.stajyeri.net';

// Statik sayfaların son içerik güncelleme tarihi. `lastmod` her istekte
// değişirse Google bu sinyali yok sayar; bu yüzden sabit tutulur.
// İçerik güncellendiğinde bu tarihi elle ilerlet.
const CONTENT_UPDATED = new Date('2026-11-19T00:00:00.000Z');

// Her istekte güncel üretilir — yeni ilanlar anında sitemap'e düşer
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const updated = CONTENT_UPDATED;

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: updated, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/ilanlar`, lastModified: updated, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/isletmeler`, lastModified: updated, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/meslek`, lastModified: updated, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/meslek-rehberi`, lastModified: updated, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/staj-ucretleri`, lastModified: updated, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/alan-secim`, lastModified: updated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/patika`, lastModified: updated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/cv-ornekleri`, lastModified: updated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/hesaplama-araclari`, lastModified: updated, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: updated, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/rehber/mulakat-provasi`, lastModified: updated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/cv-olustur`, lastModified: updated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/okul/kayit`, lastModified: updated, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/rehber/mulakat-sorulari`, lastModified: updated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/rehber/onyazi`, lastModified: updated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/imep`, lastModified: updated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tesvik-rehberi`, lastModified: updated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tesvik-simulasyon`, lastModified: updated, changeFrequency: 'monthly', priority: 0.6 },
    // Kurumsal sayfalar (E-E-A-T + güven sinyali, AdSense uyumu)
    { url: `${SITE_URL}/hakkimizda`, lastModified: updated, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/iletisim`, lastModified: updated, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/kvkk`, lastModified: updated, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const fieldUrls: MetadataRoute.Sitemap = FIELD_GUIDES.map((g) => ({
    url: `${SITE_URL}/meslek/${g.slug}`,
    lastModified: updated,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : updated,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
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
      // Şehir+alan kombinasyonu -> o kombinasyondaki en yeni ilan tarihi
      const combos = new Map<string, string>();
      const jobUrls: MetadataRoute.Sitemap = [];

      for (const j of data as {
        id: string;
        created_at: string | null;
        city: string | null;
        field_name: string | null;
      }[]) {
        jobUrls.push({
          url: `${SITE_URL}/ilan/${j.id}`,
          lastModified: j.created_at ? new Date(j.created_at) : updated,
          changeFrequency: 'daily',
          priority: 0.7,
        });
        if (j.city && j.field_name && citySet.has(j.city) && fieldSet.has(j.field_name)) {
          const key = `${j.city}|${j.field_name}`;
          const prev = combos.get(key);
          if (j.created_at && (!prev || j.created_at > prev)) combos.set(key, j.created_at);
          else if (!combos.has(key)) combos.set(key, '');
        }
      }

      const comboUrls: MetadataRoute.Sitemap = Array.from(combos.entries()).map(([key, latest]) => {
        const [city, field] = key.split('|');
        return {
          url: `${SITE_URL}/ilanlar/${slugifyTr(city)}/${slugifyTr(field)}`,
          lastModified: latest ? new Date(latest) : updated,
          changeFrequency: 'daily' as const,
          priority: 0.6,
        };
      });

      return [...staticUrls, ...fieldUrls, ...blogUrls, ...comboUrls, ...jobUrls];
    }
  } catch {
    /* DB erişilemezse statik kısmla devam et */
  }

  return [...staticUrls, ...fieldUrls, ...blogUrls];
}
