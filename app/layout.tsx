import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stajyeri.net - MESEM ve Meslek Lisesi Staj Platformu",
  description: "Geleceğin mesleğini sahada öğren, doğru staj yerini keşfet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Google AdSense — site doğrulama meta etiketi */}
        <meta name="google-adsense-account" content="ca-pub-9045371456495609" />
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