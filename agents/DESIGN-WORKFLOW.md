# 🔄 TASARIM İŞ AKIŞI — UI UX PRO MAX WORKFLOW

> Bu dosya, her UI görevinde izlenecek adım adım çalışma akışını tanımlar.
> Kariyer.net + UI UX Pro Max Skill + Stajyeri.net marka dili birleşimi.

---

## Hızlı Komut Referansı

| Komut | Ne Yapar | Ne Zaman |
|-------|----------|----------|
| `DESIGN.md oku` | Tasarım token'larını yükle | Her UI görevinin başında |
| `/check-design` | Önceki çalışmanın uyumunu kontrol et | Her görevin sonunda |
| `/ui <detay>` | Yeni bileşen üret | Yeni UI parçası gerektiğinde |
| `/theme` | Tema/renk paleti incele | Renk kararsızlığında |

---

## AKIŞ 1: Yeni Bileşen Üretimi

```
1. DESIGN.md → Renk + tipografi + aralık token'larını oku
2. Paletten renk seç → KATEGORI_RENK veya marka paleti
3. Bileşen paternini seç → Bölüm 5 (clay kart / chip / vibrat blok / buton)
4. State'leri ekle → hover / focus-visible / active:scale / disabled:opacity
5. Responsive kontrol → 375px / 768px / 1440px'de test et
6. /check-design → uyum raporu al
```

### Örnek: Fiyat Kartı İsteği

```
Kullanıcı: "Premium fiyat kartı ekle, mor gradient"

Cline yapacak:
1. DESIGN.md → --color-violet: #8B00FF bul
2. Gradient: from-[#8B00FF] to-[#A855F7]
3. Clay kart paterni: rounded-3xl + shadow-[0_10px_40px...]
4. Focus ring: focus-visible:ring-2 focus-visible:ring-[#8B00FF]
5. Responsive: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
6. Kontrol: palet dışı renk yok mu? border var mı? (yasak)
```

---

## AKIŞ 2: Yeni Sayfa Üretimi

```
1. Layout paternini seç → Bölüm 6 (sidebar / bento / koyu hero / feed+sidebar)
2. Gradient şerit + orb'ları ekle → koyu bloklara
3. Eyebrow chip + başlık + açıklama → hero'ya
4. İçerik bölümlerini ekle → clay kart + vibrat blok
5. SiteFooter ekle → sayfa altına
6. Sitemap'e ekle → app/sitemap.ts staticUrls
7. Menüye ekle → components/SiteHeader.tsx getMenu()
8. npx tsc + npm run build → doğrula
9. git commit + push → Vercel deploy
10. Canlı smoke test → yeni route 200 dönüyor mu?
```

---

## AKIŞ 3: Mevcut Sayfa Denetimi

```
1. /tasarim (Telegram) veya tasarim-agent.ps1 çalıştır
2. İhlal listesini oku (drafts/tasarim/)
3. Her ihlal için:
   a. Eski kart stili → clay paternine çevir
   b. Palet dışı renk → paletten yakın tonla değiştir
   c. SiteFooter eksik → ekle
4. Tekrar /tasarim → ihlal 0 olana kadar
5. tsc + build → doğrula
```

---

## AKIŞ 4: Tema Değişimi

```
1. DESIGN.md → mevcut token'ları oku
2. Yeni paleti belirle (örn: koyu mod için)
3. DESIGN.md güncelle (tüm token'ları değiştir)
4. Tüm sayfaları tarayıp eski rengin kullanıldığı yerleri bul
5. Toplu değiştir (clay-migrate.ps1 tarzı script)
6. tsc + build → doğrula
```

---

## RENK PALETİ HIZLI REFERANS

### Marka (Stajyeri.net Logo)
```
Lacivert:   #0A1931  (ana koyu)
Turkuaz:    #00A8B5  (primary)
Parlak:     #00E5FF  (koyu zemin accent)
Turuncu:    #FF6B00  (CTA / uyarı)
Hover:      #00929E  (turkuaz koyu)
Hover:      #E05F00  (turuncu koyu)
```

### Panel (SaaS)
```
Mavi:       #0080FF  (panel primary)
Mor:        #8B00FF  (panel secondary)
Yeşil:      #22C55E  (panel CTA)
İndigo:     #6366F1  (izin aracı)
```

### Zemin
```
Beyaz:      #FFFFFF  (kart)
Gri:        #F8FAFC  (sayfa)
Teal tint:  #F0FBFC  (bölüm)
```

---

## YASAKLI RENK LİSTESİ (tasarım ajanı raporu: 2026-11-04)

Bu renkler palet dışı DEĞİL — hover/accent tonları olarak onaylandı:
`#00929E` `#008F9A` `#008E9A` `#008794` `#E05F00` `#C95400` `#FF9E4D` `#FF8F3F`
`#0EA5E9` `#6366F1` `#94A3B8` `#F59E0B` `#EC4899` `#10B981` `#8B5CF6` `#13294B`
`#10294D` `#0D2244` `#0D3B4F` `#F0FBFC` `#EBFAFC` `#1E293B`
