import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Güvenlik/SEO hijyeni: x-powered-by başlığı kaldırılır
  poweredByHeader: false,
  // Sıkıştırma + modern görsel formatları (Core Web Vitals / LCP)
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // İşletme logoları dış kaynaktan (Supabase storage) gelebilir
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },
  async headers() {
    return [
      {
        // Statik marka ve ikon dosyaları uzun süre önbelleklenir
        source: '/:path(logo.png|favicon.ico|ads.txt|manifest.webmanifest)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
