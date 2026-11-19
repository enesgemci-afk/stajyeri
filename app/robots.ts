import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.stajyeri.net';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/okul/kayit'],
        // Özel/kişisel alanlar dizine eklenmez (KVKK + gizlilik).
        // Not: giriş/kayıt/panel gibi oturum sayfaları da indekslenmemeli —
        // aksi halde Google'da "thin content" olarak görünür.
        disallow: [
          '/admin',
          '/panel',
          '/isveren/panel',
          '/isveren/basvurular',
          '/okul',
          '/bildirimler',
          '/basvurularim',
          '/favorilerim',
          '/sozlesme',
          '/veli-onay',
          '/ilan-ver',
          '/giris',
          '/kayit',
          '/ogrenci/giris',
          '/ogrenci/kayit',
          '/isveren/giris',
          '/api',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
