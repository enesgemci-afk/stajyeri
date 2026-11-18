# 🌐 STAJYERI.NET — DOMAIN BAĞLAMA KILAVUZU

## 1. Domain Satın Al (yoksa)
- Namecheap / GoDaddy / Turhost / İsimtescil → **stajyeri.net** satın al
- DNS yönetim paneline erişimin olsun

## 2. Vercel'e Domain Ekle
1. https://vercel.com/dashboard → **stajyeri** projesi → **Settings** → **Domains**
2. **Add Domain** → `stajyeri.net` yaz → Add
3. Aynı şekilde `www.stajyeri.net` da ekle
4. Vercel sana DNS kayıtlarını gösterecek:

## 3. DNS Kayıtları (domain yönetim paneline gir)

### A) Ana domain (stajyeri.net)
| Tip | Name | Value |
|-----|------|-------|
| A | @ | `76.76.21.21` |

### B) WWW (www.stajyeri.net)
| Tip | Name | Value |
|-----|------|-------|
| CNAME | www | `cname.vercel-dns.com` |

> Not: Vercel panelinde gösterilen değerleri kullan. Yukarıdaki standart Vercel değerleridir.

## 4. DNS Yayılması
- DNS değişiklikleri 5 dakika - 48 saat içinde yayılır (genelde 10-30 dk)
- Kontrol: https://dnschecker.org → `stajyeri.net` → A record → 76.76.21.21

## 5. Vercel Doğrulaması
- DNS yayıldıktan sonra Vercel otomatik SSL sertifikası üretir (Let's Encrypt)
- Vercel Dashboard → Domains → `stajyeri.net` → **Valid Configuration** yazmalı
- `stajyeri.vercel.app` otomatik olarak `stajyeri.net`'e yönlendirilir

## 6. Kod Tarafı (ZATEN YAPILDI)
- ✅ Tüm `stajyeri.vercel.app` → `https://www.stajyeri.net` değiştirildi (14 dosya)
- ✅ `sitemap.ts` → SITE_URL güncellendi
- ✅ `robots.ts` → SITE_URL güncellendi
- ✅ Ajan scriptleri → Telegram rapor URL'leri güncellendi
- ✅ JSON-LD → ilan detay sayfaları güncellendi

## 7. Doğrulama
```
# DNS kontrol
nslookup stajyeri.net
nslookup www.stajyeri.net

# Site kontrol (browser)
https://stajyeri.net        → anasayfa yüklenmeli
https://www.stajyeri.net    → anasayfa yüklenmeli
https://stajyeri.vercel.app → otomatik yönlendirilmeli → stajyeri.net
```

## 8. Supabase Auth URL Güncelleme (ÖNEMLİ!)
1. https://supabase.com/dashboard → proje → **Authentication** → **URL Configuration**
2. **Site URL:** `https://www.stajyeri.net` olarak değiştir
3. **Redirect URLs** listesine ekle:
   - `https://www.stajyeri.net/**`
   - `https://stajyeri.net/**`
   - `http://localhost:3000/**` (geliştirme için)
4. Save

> Bu adım yapılmazsa login/kayıt sonrası yönlendirme eski URL'ye gider!
