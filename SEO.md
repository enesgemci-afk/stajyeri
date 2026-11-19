# SEO ÇALIŞMASI — stajyeri.net

> Kapsam: teknik SEO temeli + yapılandırılmış veri + sayfa bazlı metadata + performans.
> Tarih: 19 Kasım 2026

---

## 1) Özet: başlangıç durumu (denetim bulguları)

Canlı site 77 URL ile tarandı. Tespit edilen kritik eksikler:

| Bulgu | Etki |
|---|---|
| Canonical etiketi yok (77/77 sayfa) | Aynı içeriğin farklı parametrelerle taranması, sıralama sinyali kaybı |
| Open Graph / Twitter etiketi yok | Paylaşımda başlık-görsel çıkmıyordu |
| 11 sayfa aynı başlığı taşıyordu ("Stajyeri.net - MESEM ve Meslek Lisesi Staj Platformu") | Anahtar kelime hedefi yok, birbirini yiyen sayfalar |
| Yapılandırılmış veri (JSON-LD) yok | Google'da zengin sonuç (iş ilanı, SSS, breadcrumb) imkânı yok |
| `/ilan/[id]` sayfaları istemcide doluyordu (~99 kelime SSR) | İş ilanları Google'a neredeyse boş sayfa olarak görünüyordu |
| `/ilanlar` listesi istemcide doluyordu (iskelet HTML) | Türkiye'nin en değerli listeleme sayfası indekslenemiyordu |
| `metadataBase` yok | Göreli canonical/OG URL'leri mutlaklaşmıyordu |
| Logo 739 KB / 2172×724 (40 px yüksekliğinde gösteriliyor) | LCP ve mobil veri israfı |
| Manifest'te yatay logo 512×512 ikon olarak bildirilmiş | Ana ekrana ekleme ikonu bozuk görünüyordu |
| Statik sayfalar sitemap'te yok / `lastmod` her istekte değişiyordu | `lastmod` sinyali güvenilmezdi |
| Hakkımızda / İletişim sayfası yok | E-E-A-T ve AdSense uyumu zayıf |

---

## 2) Yapılanlar

### Teknik temel
- `lib/seo.ts`: site sabitleri + JSON-LD üreticileri (tek kaynak).
- `app/layout.tsx`: `metadataBase`, başlık şablonu (`%s | Stajyeri.net`), kanonik,
  robots/googleBot direktifleri, Open Graph, Twitter, doğrulama alanları, ikonlar,
  `viewport` / `themeColor`.
- `app/opengraph-image.tsx`: kod ile üretilen 1200×630 marka görseli (tüm sayfalarda paylaşım görseli).
- `app/robots.ts`: oturum/panel/API yolları kapatıldı, `host` + sitemap bildirildi.
- `app/sitemap.ts`: kurumsal sayfalar eklendi (80 URL), `lastmod` artık içerik tarihine bağlı.
- `app/not-found.tsx`: 404 sayfası (noindex + iç bağlantılar).
- `next.config.ts`: `poweredByHeader: false`, sıkıştırma, AVIF/WebP, statik dosya önbelleği.

### Yapılandırılmış veri (JSON-LD)
| Sayfa | Şema |
|---|---|
| Site geneli | `EducationalOrganization` + `WebSite` (+ `SearchAction`) |
| İlan detayı | `JobPosting` (`directApply`, `validThrough`) + `BreadcrumbList` |
| Blog yazısı | `Article` + `BreadcrumbList` |
| Ücret / İMEP / şehir-alan | `FAQPage` + `BreadcrumbList` |
| Hakkımızda / İletişim | `AboutPage` / `ContactPage` + `BreadcrumbList` |

### Sayfa bazlı metadata
- 20+ sayfaya özgün başlık, açıklama, anahtar kelime, canonical ve OG bloğu yazıldı.
- Başlıklardaki tekrar eden `| Stajyeri.net` eki kaldırıldı (şablon ekliyor).
- İstemci bileşeni olan sayfalar için `layout.tsx` üzerinden metadata verildi.

### Sunucu tarafı render (en kritik düzeltme)
- `/ilan/[id]`: sunucu bileşeni ilanı önceden çekiyor, istemci bileşenine `initialJob`
  geçiyor. Başlık, işletme, şehir ve açıklama artık HTML kaynağında.
  Ek olarak ilan sayfalarına alan rehberi + şehir/alan ilanları iç bağlantıları eklendi.
- `/ilanlar`: aynı desen (`initialJobs`), liste artık SSR'da dolu geliyor.
- `app/ilan/[id]/job.ts`: `cache()` ile istek başına tek DB sorgusu (layout + page paylaşımı).

### Kurumsal sayfalar (yeni)
- `/hakkimizda` — misyon, çalışma modeli, ilkeler (E-E-A-T).
- `/iletisim` — iletişim kanalı, konu başlıkları, KVKK notu.
- `/kvkk` — başlık/açıklama/canonical eklendi.
- Footer'a Hakkımızda + İletişim bağlantıları.

### Performans / görsel
- `public/logo-640.png` (100 KB, 640×213) üretildi; header/footer `next/image` ile
  sunuluyor (AVIF/WebP + srcset).
- `public/icon-192.png`, `public/icon-512.png` (gerçek kare ikonlar); manifest güncellendi.
- Header logosuna `priority` (LCP).

### Doğrulama (yerel production build üzerinde)
- 80/80 URL: HTTP 200, canonical var, OG görseli var, tam 1 H1, yinelenen başlık yok.
- Tüm JSON-LD blokları geçerli JSON; `JobPosting` zorunlu alanları dolu.

---

## 3) Yayın sonrası yapılacaklar (elle, tek sefer)

1. **Search Console'a property ekle** (`https://www.stajyeri.net`), sitemap gönder.
2. **Bing Webmaster Tools** + **Yandex Webmaster** ekle (Türkiye trafiği için Yandex anlamlı).
3. Vercel > Settings > Environment Variables:
   - `GOOGLE_SITE_VERIFICATION` (Search Console HTML etiketi içeriği)
   - `YANDEX_VERIFICATION`
   Deploy sonrası doğrulama otomatik head'e girer.
4. **Zengin sonuç testi**: `search.google.com/test/rich-results` ile
   bir ilan URL'si (JobPosting) ve `/staj-ucretleri` (FAQPage) doğrula.
5. Google'a **IndexNow/Bing** ile hızlı indeksleme bildirimi (opsiyonel script).

---

## 4) Sonraki içerik/otorite adımları (öncelik sırası)

1. **Şehir × alan sayfalarını besle**: şu an 287 kelime civarı. Her kombinasyona
   "bu şehirde alanın durumu, ortalama ücret, ulaşım, sık sorulanlar" blokları ekle.
2. **Blog takvimi (aylık 4 yazı)**: "MESEM nedir", "çıraklık yaşı", "staj sigortası",
   "12. sınıf staj ücreti", "kalfalık sınavı soruları" gibi arama hacmi yüksek konular.
3. **Okul/MESEM koordinatörlüğü sayfaları**: her il için "X MESEM okulları" içerikleri
   (organik trafik + iş birliği kanalı).
4. **Backlink**: MEB/okul siteleri, meslek odaları, yerel işletme rehberleri, üniversite
   kariyer merkezleri; "öğrenciye ücretsiz" konumlandırması haber değeri taşıyor.
5. **Core Web Vitals**: Search Console > Core Web Vitals raporunu aylık izle;
   LCP hedefi < 2,5 sn.
6. **İlan kalitesi**: açıklaması 100 kelimenin altındaki ilanlar için işverene
   yayın öncesi minimum karakter zorunluluğu (ince içerik riskini azaltır).

---

## 5) Bakım notları

- Yeni sayfa eklerken: `app/sitemap.ts`'e URL, sayfaya `alternates.canonical` +
  `pageOpenGraph(...)` ekle.
- Statik içerik güncellendiğinde `app/sitemap.ts` içindeki `CONTENT_UPDATED`
  tarihini ilerlet.
- Başlık yazarken `| Stajyeri.net` ekleme — şablon otomatik ekliyor.
