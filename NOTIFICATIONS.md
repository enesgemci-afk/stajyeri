# Yeni Üye E-posta Bildirimleri

Her başarılı kayıt sonrası **enesgemci@gmail.com** adresine üyenin rol, ad-soyad ve e-posta bilgisi gönderilir.

## Gerekli Vercel ortam değişkenleri

1. [resend.com](https://resend.com) hesabından API key üretin.
2. Vercel proje → **Settings → Environment Variables**:
   - `RESEND_API_KEY` = `re_xxx`
   - `RESEND_FROM_EMAIL` = `Stajyeri.net <onboarding@resend.dev>`
3. Production alan adı doğrulanınca gönderen adresini kendi alan adınızla değiştirin:
   `Stajyeri.net <destek@stajyeri.net>`

`onboarding@resend.dev` yalnızca test içindir. Gerçek yayında Resend üzerinden alan adı doğrulaması önerilir.

## Kapsanan akışlar

- `/kayit` (öğrenci ve işveren)
- `/ogrenci/kayit`
- `/isveren/kayit`
- `/okul/kayit`

API: `POST /api/notify-signup` — Supabase access token'ını doğrular, ardından Resend HTTP API ile e-posta gönderir. E-posta hatası kullanıcının kaydını durdurmaz; bildirim `keepalive` ile gönderilir.
