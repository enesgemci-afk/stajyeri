# YAYIN (DEPLOY) RUTİNİ — stajyeri-web

> Kural: **"Lokalde bitti" ≠ "Sitede var"**. Aşağıdaki 6 adım her özellik sonrası işlenir.

## 1) Tip kontrolü
```
npx tsc --noEmit        # 0 hata olmalı
```

## 2) Production build
```
npm run build
```
- Çıktıdaki route listesinde yeni sayfayı gör (○ statik / ● SSG / ƒ dinamik)
- Yeni SQL gerektiren özellikse adım 6'yı işaretle

## 3) Commit
```
git add -A
git commit -m "<Türkçe özellik mesajı>"   # mevcut commit tarzıyla uyumlu
```

## 4) Push → Vercel otomatik deploy
```
git push origin main
```

## 5) Canlıyı kokla (smoke test)
```
# Yeni route'a HEAD/GET at; 200 dönmeli:
Invoke-WebRequest -Uri 'https://stajyeri.vercel.app/<yeni-sayfa>' -UseBasicParsing
```
Deploy genelde 1-3 dakika sürer; 200 gelmeden kullanıcıya "yayında" denmez.

## 6) Veritabanı gerekiyorsa
- `supabase/README.md` dosyasındaki kurulum sırasını takip et
- SQL Editor'de çalıştır, README'deki tabloda "✓ çalıştırıldı" olarak işaretle
- Sıralı liste değiştiyse installer'ı yeniden üret: `node scripts/build-supabase-install.mjs`

## 7) Tasarım / içerik bakımı (isteğe bağlı araçlar)
- **Yeni sayfalara toplu SiteFooter:** `node scripts/apply-site-footer.mjs`
- **Eski kartları clay sistemine çevir:** `powershell -File scripts\agents\clay-migrate.ps1`
- **Kalan UI emojilerini ikonlaştır:** `powershell -File scripts\agents\emoji-modernize.ps1`
- **Tasarım tutarlılık denetimi:** Telegram'dan `/tasarim` veya script doğrudan
- **Kod sağlığı denetimi:** Telegram'dan `/yazilim`

---
**Ajan entegrasyonu:** `scripts/telegram-daily.ps1` günlük özette derleme/ilan/başvuru sayar;
derleme kırmızıysa yayına çıkmadan Telegram'a bildirim düşer (bkz. AGENTS.md iş akışı).
