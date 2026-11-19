// ============================================================
// SEO SABİTLERİ VE YAPILANDIRILMIŞ VERİ (JSON-LD) ÜRETİCİLERİ
// Tek kaynak: site adı/URL/açıklama burada. Sayfalar buradan beslenir.
// ============================================================

export const SITE_URL = 'https://www.stajyeri.net';

export const SITE = {
  name: 'Stajyeri.net',
  shortName: 'Stajyeri',
  url: SITE_URL,
  locale: 'tr_TR',
  lang: 'tr',
  description:
    'MESEM çıraklık, meslek lisesi ve üniversite staj ilanları tek platformda. 41 meslek alanı rehberi, 3308 staj ücreti hesaplayıcı, ücretsiz CV oluşturucu ve mülakat hazırlığı.',
  email: 'destek@stajyeri.net',
  logo: `${SITE_URL}/logo.png`,
} as const;

/** Göreli yolu mutlak URL'ye çevirir (JSON-LD ve canonical için). */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** JSON-LD içindeki `<` karakterini kaçırır (XSS koruması, Next.js önerisi). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// ------------------------------------------------------------
// ORGANİZASYON + SİTE (site geneli, root layout'ta bir kez)
// ------------------------------------------------------------

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE.name,
    alternateName: 'Stajyeri',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: SITE.logo,
      width: 512,
      height: 512,
    },
    description:
      "Türkiye'nin MESEM (Mesleki Eğitim Merkezi), meslek lisesi ve üniversite öğrencilerine yönelik ücretsiz staj ve çıraklık ilan platformu.",
    email: SITE.email,
    areaServed: {
      '@type': 'Country',
      name: 'Türkiye',
      identifier: 'TR',
    },
    knowsLanguage: 'tr-TR',
    sameAs: [`${SITE_URL}/hakkimizda`, `${SITE_URL}/iletisim`],
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE.name,
    inLanguage: 'tr-TR',
    description: SITE.description,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/ilanlar?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ------------------------------------------------------------
// SAYFA BAZLI ÜRETİCİLER
// ------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  /** Yol (örn. '/meslek') veya tam URL */
  path: string;
}

export function breadcrumbLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function articleLd(opts: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  image?: string;
  section?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(opts.path) },
    datePublished: opts.datePublished,
    dateModified: opts.datePublished,
    articleSection: opts.section,
    image: opts.image ? absoluteUrl(opts.image) : SITE.logo,
    inLanguage: 'tr-TR',
    author: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Sayfa meta başlıklarında tekrar eden "| Stajyeri.net" ekini temizler. */
export function cleanTitle(title: string): string {
  return title.replace(/\s*[|—–-]\s*Stajyeri\.net\s*$/i, '').trim();
}

/**
 * Sayfa bazlı Open Graph bloğu üretir. Başlık, şablon ekini tekrar etmesin diye
 * cleanTitle ile sadeleştirilir; og:url her zaman mutlak ve doğru olur.
 */
export function pageOpenGraph(opts: { title: string; description: string; path: string }) {
  return {
    type: 'website' as const,
    locale: SITE.locale,
    url: absoluteUrl(opts.path),
    siteName: SITE.name,
    title: cleanTitle(opts.title),
    description: opts.description,
    // Sayfa openGraph tanımladığında dosya tabanlı görsel devre dışı kalıyor;
    // bu yüzden dinamik OG görseli açıkça ekleniyor.
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${cleanTitle(opts.title)}`,
      },
    ],
  };
}

