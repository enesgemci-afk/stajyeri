import type { Metadata, Viewport } from "next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { SITE, SITE_URL, organizationLd, websiteLd } from "@/lib/seo";

// Google Search Console / Yandex doğrulama kodları ortam değişkeninden okunur.
// Vercel > Settings > Environment Variables: GOOGLE_SITE_VERIFICATION, YANDEX_VERIFICATION
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const yandexVerification = process.env.YANDEX_VERIFICATION;

export const metadata: Metadata = {
  // metadataBase: tüm göreli canonical/OG URL'lerinin mutlak hale gelmesini sağlar
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MESEM ve Meslek Lisesi Staj İlanları | Stajyeri.net",
    template: "%s | Stajyeri.net",
  },
  description: SITE.description,
  applicationName: SITE.name,
  category: "education",
  keywords: [
    "staj ilanları",
    "MESEM staj",
    "meslek lisesi stajı",
    "çıraklık ilanları",
    "stajyer aranıyor",
    "ücretsiz staj",
    "meslek lisesi stajyeri",
    "MESEM çıraklık",
    "üniversite zorunlu staj",
    "staj ücreti 2026",
  ],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: "MESEM ve Meslek Lisesi Staj İlanları | Stajyeri.net",
    description: SITE.description,
  },
  twitter: {
    // Başlık/açıklama/görsel verilmez: X bunları og:* etiketlerinden devralır,
    // böylece her sayfa kendi OG başlığını kullanır.
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: googleVerification,
    yandex: yandexVerification,
  },
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    // Sekme favicon'u ve mobil ana ekran ikonları — logodaki mezuniyet + konum simgesi.
    icon: [{ url: '/icon.png', sizes: '512x512', type: 'image/png' }],
    shortcut: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  other: {
    // Google AdSense site doğrulaması
    "google-adsense-account": "ca-pub-9045371456495609",
  },
};

export const viewport: Viewport = {
  themeColor: "#00A8B5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Google AdSense — reklam scripti (Google talimatı: head içine, async) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9045371456495609"
          crossOrigin="anonymous"
        ></script>
        {/* Font optimizasyonu — UI/UX Pro Max: performans (preconnect) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * {
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
        `}</style>
      </head>
      <body className="bg-[#F8FAFC] text-slate-800 antialiased m-0 p-0">
        {/* Site geneli yapılandırılmış veri: marka + arama kutusu */}
        <JsonLd data={[organizationLd(), websiteLd()]} />
        {/* Klavye kullanıcıları için içerik atlama bağlantısı (a11y: skip-links) */}
        <a
          href="#ana-icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-[#0A1931] focus:px-4 focus:py-2.5 focus:text-xs focus:font-black focus:text-white focus:shadow-lg"
        >
          İçeriğe atla
        </a>
        <div id="ana-icerik">{children}</div>
      </body>
    </html>
  );
}
