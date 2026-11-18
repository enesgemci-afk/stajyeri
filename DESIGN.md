# 🎨 STAJYERI.NET — TASARIM SİSTEMİ (DESIGN.md)

> Bu dosya projenin tek tasarım gerçeğidir. Her Cline görevi, her ajan çıktısı
> ve her yeni bileşen bu token'lara uymak ZORUNDADIR. Renk uydurma YASAKTIR.

---

## 1. RENK TOKEN'LARI

### 1a) Marka Renkleri (Logo Paleti)

| Token | Hex | Kullanım | Kural |
|-------|-----|----------|-------|
| `--color-primary` | `#00A8B5` | Linkler, aktif sekmeler, birincil vurgu | Koyu zeminde `#00E5FF` |
| `--color-primary-dark` | `#00929E` | Primary hover | Sadece hover'da |
| `--color-primary-deep` | `#008F9A` | Primary 2. hover kademesi | Nadiren |
| `--color-dark` | `#0A1931` | Ana koyu blok, kart başlığı metni | Beyaz metinle |
| `--color-dark-hover` | `#10294D` | Koyu blok hover | Gradient'te |
| `--color-dark-deep` | `#0D2244` | Koyu blok 3. kademe | Nadiren |
| `--color-cta` | `#FF6B00` | Ana CTA, uyarı, kalfa vurgusu | Hover: `#E05F00` |
| `--color-cta-hover` | `#E05F00` | CTA hover | Sadece hover'da |
| `--color-cta-light` | `#FF9E4D` | CTA gradient bitişi | Gradient'te |
| `--color-accent` | `#00E5FF` | Koyu zeminde parlak vurgu | SADECE koyu zeminde |

### 1b) Fonksiyonel Renkler

| Token | Hex | Kullanım |
|-------|-----|----------|
| `--color-surface` | `#F8FAFC` | Sayfa arka planı |
| `--color-surface-teal` | `#F0FBFC` | Açık turkuaz tint |
| `--color-text` | `#1E293B` | Ana metin |
| `--color-text-muted` | `#64748B` | İkincil metin |
| `--color-border` | `#E2E8F0` | Kenarlık |
| `--color-success` | `#22C55E` | Olumlu |
| `--color-warning` | `#F59E0B` | Uyarı |
| `--color-danger` | `#EF4444` | Hata |
| `--color-info` | `#0080FF` | Panel primary |
| `--color-violet` | `#8B00FF` | Premium, featured |
| `--color-indigo` | `#6366F1` | Blog kategorisi |

### 1c) Yasaklı Renkler

- Palet dışı herhangi bir hex değeri
- `#000000` düz siyah (yerine `#0A1931`)
- RGB/RGBA fonksiyonel tanım (Tailwind arbitrary hex kullan)

---

## 2. TİPOGRAFİ

| Token | Font | Kullanım |
|-------|------|----------|
| `--font-body` | `Plus Jakarta Sans` | Tüm body metni (global tanımlı) |
| `--font-display` | `Space Grotesk` | Panel başlıkları, KPI rakamları |

### Boyut Skalası

| Tailwind | Kullanım |
|----------|----------|
| `text-[9px]` | Chip etiketleri, micro badges |
| `text-[10px]` | Kart meta, kategori chip'leri |
| `text-[11px]` | Kart açıklamaları, body paragrafları |
| `text-xs` | Kart başlıkları, form etiketleri |
| `text-sm` | Alt başlıklar |
| `text-lg` | Bölüm başlıkları |
| `text-xl` | Sayfa alt başlıkları |
| `text-2xl` | Sayfa başlıkları, KPI rakamları |
| `text-3xl` | Hero başlıkları |
| `text-4xl` | Ana hero başlığı |

### Ağırlık

| Tailwind | Kullanım |
|----------|----------|
| `font-normal` | Uzun paragraf metni |
| `font-bold` | Kart meta, linkler |
| `font-extrabold` | Buton metinleri, chip'ler |
| `font-black` | Başlıklar, KPI rakamları, CTA |

---

## 3. ARALIK — 8px Ritmi

| Desen | Tailwind |
|-------|----------|
| Kart içi padding | `p-4` / `p-5` / `p-6` |
| Kartlar arası | `gap-4` / `gap-5` |
| Bölümler arası | `py-10` / `py-14` |
| Hero padding | `pt-14 pb-16` |
| Sidebar içi | `p-5` |
| Chip içi | `px-3 py-1.5` |
| Buton içi | `px-4 py-2.5` |
| Icon-text gap | `gap-2` |

---

## 4. GÖLGE SİSTEMİ (Claymorphism)

| Token | Tailwind | Kullanım |
|-------|----------|----------|
| Clay | `shadow-[0_10px_40px_rgba(10,25,49,0.07)]` | Standart kart |
| Clay hover | `shadow-[0_18px_50px_rgba(0,168,181,0.16)]` | Kart hover |
| Header | `shadow-[0_12px_40px_rgba(10,25,49,0.08)]` | Sticky header |
| Dropdown | `shadow-[0_24px_70px_rgba(10,25,49,0.14)]` | Dropdown panel |

**Kural:** Kartlar border KULLANMAZ. Yalnızca clay gölge.

---


## 5. BİLEŞEN PATERNLERİ

### Clay Kart
```html
<div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-5 hover:shadow-[0_18px_50px_rgba(0,168,181,0.16)] hover:-translate-y-0.5 transition-all duration-200">
```
Yasak: `border border-slate-200` + `shadow-sm` kombinasyonu.

### Eyebrow Chip
```html
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A8B5]/10 border border-[#00A8B5]/20 text-[#00A8B5] text-[10px] font-black mb-2">
  <Icon /> BÖLÜM ADI
</div>
```

### Gradient Şerit
```html
<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
```

### Orb
```html
<div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />
```

### Vibrat Renk Blok
```html
<Link style={{ backgroundColor: color + '0D', borderColor: color + '33' }} className="group rounded-3xl border p-6 hover:-translate-y-1 hover:shadow-xl">
```

### Durum Rozeti
| Durum | Sınıf |
|-------|-------|
| İncelemede | `bg-amber-50 text-amber-700 border-amber-200` |
| Olumlu | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| Olumsuz | `bg-red-50 text-red-700 border-red-200` |

### Buton Paternleri
| Tip | Desen |
|-----|-------|
| CTA | `bg-[#FF6B00] hover:bg-[#E05F00] text-white rounded-xl font-black active:scale-[0.98]` |
| Teal | `bg-[#00A8B5] hover:bg-[#00929E] text-white rounded-xl font-black` |
| Tint | `bg-[#00A8B5]/10 hover:bg-[#00A8B5]/20 border border-[#00A8B5]/25 text-[#00A8B5]` |
| Gradient | `bg-gradient-to-r from-[#FF6B00] to-[#FF8F3F] text-white rounded-full font-black` |

---

## 6. LAYOUT PATERNLERİ

### Sidebar Dashboard
```html
<div className="lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8 lg:items-start">
  <aside className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-20">...</aside>
  <div className="min-w-0 mt-6 lg:mt-0">...</div>
</div>
```

### Koyu Hero
```html
<section className="relative overflow-hidden bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center">
  <!-- strip + orbs -->
  <div className="max-w-4xl mx-auto relative z-10">...</div>
</section>
```

---

## 7. RESPONSIVE

| BP | Tailwind | Kural |
|----|----------|-------|
| < 640 | varsayılan | Tek kolon, hamburger |
| ≥ 640 | `sm:` | 2 kolon başlar |
| ≥ 768 | `md:` | Bento 2 kolon |
| ≥ 1024 | `lg:` | Sidebar + dropdown nav |
| ≥ 1280 | `xl:` | max-w-7xl |

---

## 8. YASAKLAR

1. Palet dışı hex kullanmak
2. `border border-slate-200` + `shadow-sm` (eski stil)
3. `text-black` (yerine `text-[#0A1931]`)
4. `focus:outline-none` tek başına (ring ile birlikte)
5. Emoji UI ikonu olarak (yerine lucide-react)
6. `!important` kullanımı
7. Yeni renk icat etmek

---

## 9. UI/UX PRO MAX TEMEL KURALLARI (audit sonrası eklendi)

> Kaynak: github.com/nextlevelbuilder/ui-ux-pro-max-skill — quick-reference öncelik
> tablosuna göre projeye uyarlanmıştır. globals.css'teki temel kurallarla birlikte çalışır.

### 9a) Erişilebilirlik (CRITICAL)
| Kural | Uygulama |
|-------|----------|
| Klavye odak görünürlüğü | `:focus-visible` global halka (globals.css) — her etkileşimli öğede garantili |
| Skip link | layout.tsx'te "İçeriğe atla" → `#ana-icerik` |
| aria-label | Tüm icon-only butonlarda zorunlu; durum değişen butonlara `aria-pressed`/`aria-expanded` |
| Emoji ikon yasağı | UI'da yalnızca lucide-react; emoji yalnızca içerik metninde |
| Kontrast | Koyu zeminde (`#0A1931`) en az `text-slate-400`; `text-slate-500` koyu zeminde YASAK (3.66:1) |

### 9b) Dokunma Hedefi (CRITICAL)
| Kural | Uygulama |
|-------|----------|
| Min hedef | 44×44px (görsel küçükse `after:-inset-*` ile vurma alanı büyütülür) |
| Buton yüksekliği | Metinli butonlarda `min-h-11`; icon butonlarda `w-10 h-10` + hit-area |
| Escape | Açılır menü/modal/mobil panel `Escape` ile kapanır |

### 9c) Performans (HIGH)
| Kural | Uygulama |
|-------|----------|
| Tailwind CDN YASAK | `@tailwindcss/postcss` + `app/globals.css` import (layout.tsx) kullanılır |
| Font | Google Fonts + `preconnect`; Space Grotesk `&family=Space+Grotesk` ile aynı istekte |
| CLS | `img` etiketlerinde `width` + `height` ver |

### 9d) Tipografi & Hareket (MEDIUM)
| Kural | Uygulama |
|-------|----------|
| Min metin | Nav/body/link metinleri en az `text-xs` (12px); `text-[9px]`–`text-[10px]` yalnızca chip/micro badge |
| Display font | Hero/panel başlık + KPI: `font-display` sınıfı (Space Grotesk) |
| Reduced motion | `prefers-reduced-motion: reduce` → animasyonlar kapalı (globals.css) |
| Loading feedback | Async butonlarda `disabled` + anlamlı metin/spinner ('...' değil) |
