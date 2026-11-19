import type { MetadataRoute } from 'next';

// PWA — siteyi telefon ana ekranına kurulabilir uygulama yapar (StajNet mobil
// uygulamasına karşılık uygulama mağazası maliyeti olmadan).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stajyeri.net — MESEM Staj İlan Portalı',
    short_name: 'Stajyeri',
    description:
      "Türkiye'nin MESEM ve meslek lisesi stajyer platformu: ilanlar, CV oluşturucu, alan seçim testi ve staj ücreti rehberi.",
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#00A8B5',
    lang: 'tr',
    dir: 'ltr',
    // Gerçek (kare) ikon dosyaları — daha önce 2172x724 yatay logo 512x512
    // olarak bildiriliyordu; kurulumda ikon kırpılıyordu.
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
