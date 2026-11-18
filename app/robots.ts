import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.stajyeri.net';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/okul/kayit'],
      // Özel/kişisel alanlar dizine eklenmez (KVKK + gizlilik)
      disallow: [
        '/admin',
        '/panel',
        '/isveren/panel',
        '/okul',
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
