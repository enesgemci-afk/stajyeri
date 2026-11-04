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
| 📣 Pazarlama | `scripts/agents/pazarlama-agent.ps1` | Gerçek ilan verisinden sosyal post paketi | Hayır |
| 💼 Satış | `scripts/agents/satis-agent.ps1` | Pasif işverenlere kişiselleştirilmiş IMEP daveti taslağı | Hayır |
| 🎨 Tasarım | `scripts/agents/tasarim-agent.ps1` | Tasarım tutarlılık denetimi: clay kart/chip/palet/footer uyumu; ihlal >10 ise görev kuyruğuna otomatik düşer | Hayır |
| 💻 Yazılımcı | `scripts/agents/yazilim-agent.ps1` | Kod sağlığı: tsc hataları, TODO/FIXME, console.log sızıntısı, npm audit, canlı site; TS hatası varsa görev kuyruğuna düşer | Hayır |
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
