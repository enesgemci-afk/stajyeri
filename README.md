# Stajyeri.net

MESEM çırak adayları, meslek lisesi ve üniversite öğrencileriyle stajyer arayan işletmeleri buluşturan staj platformu.

- **Canlı site:** https://stajyeri.vercel.app/
- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Veritabanı / Kimlik doğrulama:** Supabase (Auth, Postgres, RLS)

## Özellikler

- Öğrenci ve işveren için ayrı kayıt / giriş akışları (`/ogrenci/kayit`, `/isveren/kayit`)
- İşletmelerin staj ilanı yayınlaması (`/ilan-ver`), ilan detay sayfaları (`/ilan/id`)
- Ana sayfada meslek alanı, program tipi ve şehre göre filtrelenebilir ilan listesi
- MESEM 41 meslek alanı ve 81 il desteği (`lib/constants.ts`)
- Başvuru sistemi ve yönetim paneli (`/admin`)

## Geliştirme

```bash
npm install
npm run dev
```

Ortam değişkenleri `.env.local` dosyasında tutulur (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Yayına Alma

Depo `main` branch'ine bağlı; GitHub'a push edilen her commit Vercel tarafından otomatik olarak production'a deploy edilir.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
