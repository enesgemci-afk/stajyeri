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

## 3.5) MESEM araması için kurulan küme (19 Kasım 2026, 2. faz)

Amaç: "MESEM" ve türevlerinde (MESEM nedir, MESEM başvuru, MESEM yaş sınırı,
MESEM ücret, MESEM alanları) organik görünürlük.

### Pillar sayfa: `/mesem`
- Hedef başlık: **"MESEM Nedir? Mesleki Eğitim Merkezi Rehberi (2026)"**
- 1.419 kelime, 10 H2, içindekiler menüsü (anchor'lı).
- Şema: `Article` + `FAQPage` (8 soru) + `BreadcrumbList`.
- İlk paragrafta tanım doğrudan verildi (featured snippet / AI özeti hedefi).
- Bölümler: MESEM nedir · kimler başvurabilir (yaş) · 4 adımda kayıt · 4+1 modeli ·
  ücret-sigorta · kalfalık-ustalık-usta öğreticilik · 41 alan · MESEM vs meslek lisesi · SSS.
- Alt bağlantılar: /ilanlar, /staj-ucretleri, /imep, /tesvik-rehberi, /meslek/{alan},
  /blog/kalfalik-belgesi-nasil-alinir, /blog/usta-belgesi-ile-isyeri-acma, /patika, /alan-secim.

### Destek yazıları (blog)
| URL | Hedef sorgu |
|---|---|
| `/blog/mesem-yas-siniri-ve-kayit-sartlari` | "MESEM yaş sınırı", "MESEM kayıt şartları", "MESEM'e kimler başvurabilir" |
| `/blog/mesem-staj-yeri-nasil-bulunur` | "MESEM staj yeri nasıl bulunur", "çırak işletme bulma" |

Her iki yazı da Article + Breadcrumb şeması taşır ve pillar sayfaya/ilanlara bağlanır.

### İç bağlantı ağı
- **Header** → "Yolunu Seç" menüsünün ilk maddesi: "MESEM Nedir?"
- **Footer** → "Keşfet" kolonunun ilk maddesi: "MESEM Nedir?"
- **Ana sayfa** → hero'da turuncu "MESEM nedir, nasıl başvurulur?" butonu +
  "MESEM REHBERİ" bandı (4 istatistik + 3 iç bağlantı).
- **/meslek** → hero altında "MESEM nedir, nasıl başvurulur?" bağlantısı.
- **Sitemap** → `/mesem` priority 0.95 ile eklendi.

### Canlı doğrulama
- `/mesem`: 200, canonical doğru, OG görseli var, 1 H1, 3 JSON-LD bloğu (Article/FAQ/Breadcrumb),
  8 SSS sorusu geçerli şemada.
- İki blog yazısı 200 + canonical + Article şeması.
- 73 URL tarandı: kırık yok, canonical/OG eksik yok, yinelenen başlık yok.

> Not: İlan verisi temizlendiği için sitemap 80 → 73 URL'ye düştü (ilan sayfaları azaldı).
> Boş ilan listesi hem dönüşüm hem SEO açısından zayıf; gerçek ilan eklendikçe
> `/ilan/{id}` ve `/ilanlar/{sehir}/{alan}` sayfaları sitemap'e otomatik geri döner.

---

## 3.6) SEO ajanı + denetim aracı (19 Kasım 2026, 3. faz)

### Araç: `scripts/seo-audit.mjs`
Bağımlılıksız (Node 18+ fetch). `npm run seo` / `seo:local` / `seo:strict`.
Sitemap'teki tüm URL'leri gezer; canonical, OG, H1, JSON-LD, başlık/açıklama,
ince içerik, robots kuralları ve `lastmod` tazeliğini doğrular.

Tasarım kararları:
- **Marka eki ayrımı:** 65 karakteri aşan başlıkta taşma yalnızca
  `| Stajyeri.net` ekindeyse *bilgi* notu (Google zaten sonu keser, anahtar
  kelime kaybı yok); içerik kısmı taşıyorsa *uyarı*.
- **`--base` gerçekten yerel test eder:** sitemap üretim URL'i döndürse de
  aynı yol verilen host üzerinden çekilir.
- **robots.txt:** Google'ın "en uzun eşleşme kazanır, eşitlikte Allow" kuralı
  uygulanır (`Allow: /okul/kayit` vs `Disallow: /okul` yanlış pozitifi engellenir).

### Ajanlar (`.opencode/agents/`)
| Ajan | Tip | Yetki |
|---|---|---|
| `seo` | primary | Düzenler, build eder; `git push` onay ister |
| `seo-audit` | subagent | Salt okur (edit/shell kapalı, sadece audit komutu) |

`seo-audit`, ana oturumla aynı modelde eşzamanlı istek sınırına takıldığı için
`evren/glm-5.3` modeline bağlandı.

### Bu turda düzeltilenler (denetim: 47 → 11 uyarı, 0 kritik)
- 11 sayfada `description` 165 karakterin altına indirildi
  (`lib/seo.ts`, `/mesem`, `/meslek`, `/meslek-rehberi`, `/patika`, `/ilanlar`,
  `/alan-secim`, `/kvkk`, `/hakkimizda`, `/okul/kayit`, blog yazısı).
- `mesem-yas-siniri` başlığı 84 → 59 karakter (anahtar kelime kesilmesi giderildi).
- `/ilanlar`'a `BreadcrumbList` eklendi; ilan varsa `ItemList` de ekleniyor.
- Araçtaki iki hata düzeltildi (canonical host karşılaştırması, `--base` yönlendirmesi).

### Kalan 11 uyarı — hepsi ince içerik (sonraki ajan görevi)
`/isletmeler` 140 · `/okul/kayit` 156 · `/patika` 202 · `/alan-secim` 203 ·
`/hesaplama-araclari` 209 · `/iletisim` 219 · `/blog` 221 · `/tesvik-rehberi` 279 ·
`/rehber/mulakat-provasi` 273 · iki blog yazısı 290/293 kelime.

Öncelik: `/isletmeler` (işveren dönüşümü) ve `/alan-secim` (öğrenci dönüşümü).

---

## 4) Sonraki içerik/otorite adımları (öncelik sırası)

1. **MESEM kümesini genişlet (aylık 2 yazı)**: "MESEM kayıt tarihleri 2026",
   "MESEM'den üniversiteye geçiş", "MESEM sigortası nasıl sorgulanır",
   "MESEM kalfalık sınavı soruları", "MESEM'de alan değiştirme".
2. **Şehir × alan sayfalarını besle**: şu an 287 kelime civarı. Her kombinasyona
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
- Yeni MESEM içeriği eklerken `/mesem` pillar sayfasına iç bağlantı ver (küme otoritesi
  tek sayfada toplanır; birbirine rakip iki "MESEM nedir" sayfası açma).
- Ücret tutarları veya mevzuat değiştiğinde `/mesem` sayfasının sonundaki
  "Son güncelleme" notunu ve `articleLd` tarihini birlikte güncelle.
- Statik içerik güncellendiğinde `app/sitemap.ts` içindeki `CONTENT_UPDATED`
  tarihini ilerlet.
- Başlık yazarken `| Stajyeri.net` ekleme — şablon otomatik ekliyor.
