# Stajyeri.net

MESEM çırak adayları, meslek lisesi ve üniversite öğrencileriyle stajyer arayan işletmeleri buluşturan staj platformu.

- **Canlı site:** https://stajyeri.vercel.app/
- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Veritabanı / Kimlik doğrulama:** Supabase (Auth, Postgres, RLS)
- **Tasarım dili:** Claymorphism + Bento Grid + logo paleti (lacivert `#0A1931` · turkuaz `#00A8B5` · turuncu `#FF6B00`)

## Özellikler

### Öğrenci Tarafı
- Rol bazlı kayıt/giriş: öğrenci (`/ogrenci/kayit`), işveren (`/isveren/kayit`), okul koordinatörü (`/okul/kayit`)
- **41 MESEM alanı rehberi** (`/meslek`) — her alan için görevler, dersler, çıkış kapıları ve canlı ilanlar
- **Meslek Seçim Rehberi** (`/meslek-rehberi`) — MEB "Karar Anı" + RIASEC temelli 5 adımlı karar yöntemi, ebeveyn köşesi
- **Alan Seçim Testi** (`/alan-secim`) — 6 soruluk ilgi testi
- **Staj Patikası** (`/patika`) — çıraktan ustaya kişisel yol haritası (MESEM + MTAL rotaları)
- **CV Oluşturucu** (`/cv-olustur`) + **CV Örnekleri** (`/cv-ornekleri`) — alan bazlı şablonlar, PDF çıktı
- **Mülakat hazırlığı** — soru bankası (`/rehber/mulakat-sorulari`) + kronometreli prova (`/rehber/mulakat-provasi`)
- **Hesaplama araçları** (`/hesaplama-araclari`) — brüt-net, fazla mesai, yıllık izin, kıdem/ihbar
- **Staj ücretleri** (`/staj-ucretleri`) — 3308 taban ücretler + hesaplayıcı
- **Üniversite stajı altyapısı** — 24 bölüm, zorunlu/gönüllü staj filtreleri, SGK rehberi
- Başvuru takibi (`/basvurularim`), favoriler + **iş alarmı** (`/favorilerim`), bildirim merkezi (`/bildirimler`)
- Öğrenci paneli (`/panel`) — sidebar dashboard, KPI kartları, beceri takibi

### İşveren Tarafı
- İlan yayınlama (`/ilan-ver`) — MESEM + üniversite bölüm seçimi, hazır iş tanımı şablonları
- İşveren paneli (`/isveren/panel`) — SaaS dashboard: başvuru dönüşüm grafiği, yanıt hızı, güven rozeti
- **Stajyer havuzu** (`/isveren/panel`) — maskeli arama + kontör sistemi
- IMEP/teşvik rehberleri (`/imep`, `/tesvik-rehberi`, `/tesvik-simulasyon`)
- İşletmeler rehberi (`/isletmeler`) — güvenli işyeri rozetleri

### Kurumsal & Güven
- **Veli onay katmanı** — 18 yaş altı başvurular için link/SMS onayı (`guven_katmani.sql`)
- Okul koordinatör paneli (`/okul`) — öğrenci-okul eşleştirme, staj raporu
- Dijital sözleşme üretimi (`/sozlesme/[id]`)
- KVKK aydınlatma metni (`/kvkk`)
- Bildirim merkezi + Telegram entegrasyonu

### İçerik
- **Kariyer Blogu** (`/blog`) — 7 rehber yazısı (SSG)
- Ön yazı örnekleri (`/rehber/onyazi`)

## 🤖 Ajan Ekibi

Site, Telegram üzerinden yönetilen **9 ajandan** oluşan sistemle sürekli geliştirilir:

```
/blog  /pazarlama  /seo  /satis  /tasarim  /yazilim  /linkedin  /onayla  (Cline kodlama)
```

Detaylar: [`agents/README.md`](agents/README.md) · Marka dili: [`agents/BRAND-VOICE.md`](agents/BRAND-VOICE.md)

## Proje Yapısı

```
app/            → Next.js sayfaları (App Router)
components/     → Paylaşılan bileşenler (SiteHeader, SiteFooter, JobCard, JobRowCard...)
lib/            → Veri + motor katmanı (constants, meslekRehberi, stajPatikasi, panelTokens...)
agents/         → Ajan ekip tanımları + marka dili
scripts/        → Telegram ajanları + bakım araçları (agents/ alt klasörü)
supabase/       → SQL migration'lar + kurulum rehberi
drafts/         → Ajan taslakları (onay bekleyen)
```

## Geliştirme

```bash
npm install
npm run dev
```

Ortam değişkenleri `.env.local` dosyasında tutulur (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).

## Yayına Alma

- Rutin: [`DEPLOY.md`](DEPLOY.md) — tsc → build → commit → push → smoke test → SQL checklist
- Veritabanı kurulumu: [`supabase/README.md`](supabase/README.md) — tek-installer (`00_install_all.sql`)
- Depo `main` branch'ine bağlı; GitHub'a push edilen her commit Vercel tarafından otomatik olarak production'a deploy edilir.

## Bakım Araçları

| Araç | Görev |
|------|-------|
| `scripts/agents/*.ps1` | 9 ajan (blog, SEO, pazarlama, satış, tasarım, yazılım, LinkedIn, onayla) |
| `scripts/check-sql-applied.mjs` | SQL migration'ların canlı DB durumunu denetler |
| `scripts/build-supabase-install.mjs` | `supabase/00_install_all.sql` üretir |
| `scripts/apply-site-footer.mjs` | Yeni sayfalara SiteFooter toplu ekler |
| `scripts/agents/clay-migrate.ps1` | Eski kart stillerini clay sistemine toplu çevirir |
| `scripts/agents/emoji-modernize.ps1` | UI emojilerini lucide ikonlarına çevirir |

