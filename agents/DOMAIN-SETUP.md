# 🌐 STAJYERI.NET — DOMAIN BAĞLAMA KILAVUZU (TAMAMLANDI ✅)

> **Durum: 18.11.2026 itibarıyla canlıda.** Site `https://www.stajyeri.net` adresinde,
> `stajyeri.net` → `www` (308) yönlendirmeli. Registrar: **Spaceship** (API ile yönetiliyor).

## Mevcut kurulum (gerçek değerler)

| Kayıt | Tip | Değer | Nerede |
|-------|-----|-------|--------|
| Nameserver | NS | `launch1.spaceship.net`, `launch2.spaceship.net` | Spaceship (provider: basic) |
| @ | A | `216.198.79.1` VE `64.29.17.1` | Spaceship DNS |
| www | CNAME | `64137db3c49a10e2.vercel-dns-017.com` | Spaceship DNS (proje-özel) |

- Vercel doğrulaması: `vercel domains verify stajyeri.net` → **configured_correctly**
- SSL: Vercel otomatik (Let's Encrypt, http-01) ✅
- DNS TTL: 300 sn (hızlı değişiklik için bilinçli düşük tutuluyor)

## DNS değişikliği gerekirse (Spaceship API)

```
PUT https://spaceship.dev/api/v1/dns/records/stajyeri.net
Headers: X-Api-Key, X-Api-Secret
Gövde: {"force": true, "items": [{"type":"A","address":"...","name":"@","ttl":300}, ...]}
```
- CNAME alanının adı `cname` (örn: `{"type":"CNAME","cname":"...","name":"www"}`)
- Kayıt silmek: aynı uca `DELETE` + düz array gövde
- Mevcut kayıtları listelemek: `GET .../dns/records/stajyeri.net?take=100&skip=0`

### Eski kurulum (kaldırıldı)
- ~~A @ 76.76.21.21~~ → Vercel'in yeni anycast IP'lerine geçirildi
- ~~CNAME www cname.vercel-dns.com~~ → proje-özel CNAME'e geçirildi
- ~~NS1 (Netlify DNS)~~ → Spaceship basic DNS'e alındı (Netlify "çok yakında" sayfası kaldırıldı)

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

## 8. Supabase Auth URL Güncelleme (OPSİYONEL — düşük öncelik)
> Site tüm girişlerde e-posta+şifre (`signInWithPassword`) kullanıyor; magic link /
> OAuth yok. Bu yüzden kritik değil. Yine de düzenli olmak istersen:
1. https://supabase.com/dashboard → proje → **Authentication** → **URL Configuration**
2. **Site URL:** `https://www.stajyeri.net` olarak değiştir
3. **Redirect URLs** listesine ekle:
   - `https://www.stajyeri.net/**`
   - `https://stajyeri.net/**`
   - `http://localhost:3000/**` (geliştirme için)
4. Save
