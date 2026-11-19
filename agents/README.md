# 🤖 STAJYERI.NET AJAN EKİBİ

Siteyi **sürekli geliştiren** ajan sisteminin merkezi. Her ajanın net bir görevi,
girdisi, çıktısı ve **onay kapısı** vardır.

## Mimari

```
Telegram (sen) ──► telegram-agent.ps1 ──► scripts/agents/*.ps1
      │                                        │
      │  /blog /pazarlama /seo /satis /onayla   │
      ▼                                        ▼
  görev kuyruğu ◄── Cline (VS Code) ◄── drafts/ klasörü (taslaklar)
                                        │
                                   /onayla ──► commit + push ──► Vercel (canlı)
```

## Ajanlar

| Ajan | Script | Görev | LLM gerekli? |
|------|--------|-------|--------------|
| 📝 İçerik | `scripts/agents/blog-agent.ps1` | Haftalık blog taslağı (`drafts/blog/*.json`) | Varsa Anthropic API; yoksa iskelet |
| 🔍 SEO | `scripts/agents/seo-agent.ps1` | Sitemap + link + meta denetimi → rapor | Hayır |
| 🧠 SEO Ajanı | `.opencode/agents/seo.md` | Denetim → metadata/JSON-LD/içerik düzeltme → build + canlı doğrulama | Evet (OpenCode) |
| 📣 Pazarlama | `scripts/agents/pazarlama-agent.ps1` | Gerçek ilan verisinden sosyal post paketi | Hayır |
| 💼 Satış | `scripts/agents/satis-agent.ps1` | Pasif işverenlere kişiselleştirilmiş IMEP daveti taslağı | Hayır |
| 🎨 Tasarım | `scripts/agents/tasarim-agent.ps1` | Tasarım tutarlılık denetimi: clay kart/chip/palet/footer uyumu; ihlal >10 ise görev kuyruğuna otomatik düşer | Hayır |
| 💻 Yazılımcı | `scripts/agents/yazilim-agent.ps1` | Kod sağlığı: tsc hataları, TODO/FIXME, console.log sızıntısı, npm audit, canlı site; TS hatası varsa görev kuyruğuna düşer | Hayır |
| 📘 LinkedIn | `scripts/agents/linkedin-agent.ps1` | 5 günlük LinkedIn içerik takvimi (4 hafta rotasyonlu açı seti, gerçek ilan verisi, hashtag + saat önerileri) | Hayır |
| 💻 Kodlama | Cline (VS Code) | `gorevler` kuyruğundan implement + onaylı taslakları siteye merge | — |

## Onay Akışı (kritik)

```
1. Ajan çalışır → drafts/ altına taslak + Telegram önizleme
2. Sen taslağı incelersin (drafts/ klasörü veya Telegram mesajı)
3. Beğendiysen:  /onayla blog   (veya /onayla <dosya>)
4. onayla.ps1: blog ise lib/blogYazilari.ts'e merge + commit + push → CANLI
5. Diğer taslaklar: commit edilir, Cline görev kuyruğuna "kullan" notu düşer
```

## Guardrails (ıhlal edilemez)

1. **Kanuni rakamlar scriptten gelir, LLM uydurmaz:** %30/%50 ücret, SGK, staj günü
   gibi bilgiler her ajanın sabit veri bölümünde durur (`lib/constants.ts` ile senkron —
   değişirse scriptler de güncellenir).
2. **Doğrudan main'e ajan pushu yok:** push yalnızca `/onayla` sonrası veya Cline oturumunda
   senin komutunla.
3. **Marka dili:** her çıktı `BRAND-VOICE.md` kurallarına uyar (genç dostu, güven veren,
   "sen" dili, logo paleti).
4. **Maliyet:** blog ajanı yalnızca `ANTHROPIC_API_KEY` .env.local'de varsa LLM çağırır;
   yoksa ücretsiz iskelet üretir.

## Komutlar (Telegram)

```
/blog        → haftalık blog taslağı üret (rotasyonlu konu veya /blog <konu>)
/pazarlama   → gerçek ilan verisinden sosyal medya post paketi
/seo         → site denetim raporu (sitemap, linkler, meta)
/satis       → pasif işverenlere IMEP davet taslakları
/onayla blog  → son blog taslağını onayla ve CANLI'ya gönder
/onayla <yol>→ herhangi bir draft dosyasını onayla (commit+push)
```

---

## 🧠 OpenCode SEO Ajanı (muhakeme gerektiren işler)

Yukarıdaki `.ps1` scriptleri **LLM'siz, deterministik** denetim yapar. Metadata
yazımı, JSON-LD şeması, SSR refactor, içerik kümesi kurma gibi **muhakeme
gerektiren** işler için OpenCode ajanı var.

| Ajan | Dosya | Yetki | Görev |
|---|---|---|---|
| 🔧 **seo** (primary) | `.opencode/agents/seo.md` | Düzenleme + build + push (onaylı) | Denetler, düzeltir, doğrular, yayına hazırlar |
| 🔍 **seo-audit** (subagent) | `.opencode/agents/seo-audit.md` | Salt okur | Ölçer, kanıtlı rapor verir; dosya değiştirmez |

### Kullanım

```bash
# Oturumu repo kökünde başlat (ajanlar buradan keşfedilir)
cd ~/Desktop/stajyeri-web && opencode

# Ajanı seç
#   Tab / agent seçici → "seo"

# Sonra doğal dille görev ver:
#   "MESEM sayfasında ince içerik uyarılarını kapat"
#   "Şehir-alan sayfalarının canonical'larını doğrula"
#   "seo-audit ile denetle, kritikleri düzelt"
```

### Ölçüm aracı (ajanın da kullandığı)

```bash
npm run seo                 # canlı site, tüm sitemap
npm run seo:local           # localhost:3100 (build sonrası doğrulama)
npm run seo:strict          # uyarılar da hata sayılır (CI kapısı)
node scripts/seo-audit.mjs --json drafts/seo/rapor.json   # makine-okur rapor
```

Araç bağımlılıksızdır (yalnızca Node 18+ fetch) ve şunları doğrular:

- HTTP durumu, canonical (mutlak + kendine referans)
- `og:title` / `og:image`, tek `H1`, `<html lang>`
- JSON-LD ayrıştırma + kapsam, yinelenen başlık/açıklama
- `title` ≤ 65 / `description` ≤ 165 karakter, ince içerik (< 300 kelime)
- robots.txt kuralları (en uzun eşleşme kuralıyla) + sitemap erişilebilirliği
- `lastmod` tazeliği (her istekte "şimdi" dönüyorsa uyarır)

### Sınırlar (ajanın uyması zorunlu)

1. `npm run build` kırmızıysa push yok.
2. `git push` **kullanıcı onayı ister** (permission: `ask`).
3. Veri silen SQL/komut çalıştırılmaz (`supabase/*clear*`, `delete`, `truncate`).
4. Kanuni rakamlar `lib/constants.ts` + `BRAND-VOICE.md`'den gelir, uydurulmaz.
5. Aynı sorgu için rakip sayfa açılmaz — MESEM için tek pillar: `/mesem`.

> **Not:** `seo-audit` alt ajanı `evren/glm-5.3` modeline bağlı. Ana oturum
> `deepseek-v4.1-flash` kullanırken bu modelde tek eşzamanlı istek hakkı var;
> farklı model seçilmesi paralel çalışmayı sağlar.

