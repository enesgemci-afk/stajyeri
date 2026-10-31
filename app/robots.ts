import type { MetadataRoute } from 'next';

const SITE_URL = 'https://stajyeri.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Özel/kişisel alanlar dizine eklenmez (KVKK + gizlilik)
      disallow: [
        '/admin',
        '/panel',
        '/isveren/panel',
        '/bildirimler',
        '/basvurularim',
        '/favorilerim',
        '/sozlesme',
        '/veli-onay',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
