# 🎨 MARKA DİLİ — STAJYERI.NET

Tüm ajan çıktıları (blog, sosyal medya, e-posta, davet) bu kurallara uyar.

## Hedef Kitle
1. **Birincil:** 14-18 yaş MESEM / meslek lisesi öğrencileri + velileri
2. **İkincil:** Üniversite (MYO/Lisans) öğrencileri
3. **Üçüncül:** Stajyer almak isteyen küçük ve orta ölçekli işletmeler

## Ses Tonu
- Genç dostu ama güven veren; **"sen" dili** (öğrenciye), **"siz" dili** (işverene/veliye)
- Kısa cümleler, somut fayda ("maaşlı", "sigortalı", "devlet desteği")
- Jargon yok: "3308 kapsamında" yerine "3308 güvencesiyle"
- Uydurma vaat yok: emin olunmayan bilgi yazılmaz, "MEB'den teyit et" denir

## Renk Paleti (logo)
| Renk | Hex | Kullanım |
|------|-----|----------|
| Lacivert | `#0A1931` | Ana koyu blok, başlık zemini |
| Turkuaz | `#00A8B5` | Birincil vurgu, linkler, olumlu |
| Turkuaz parlak | `#00E5FF` | Koyu zeminde vurgu |
| Turuncu | `#FF6B00` | CTA, dikkat, kalfa/üst düzey vurgu |

## Emoji Kullanımı
Ölçülü: başlıkta 1 emoji, liste öğelerinde yok. Onaylı set:
📢 (ilan/duyuru) · 💰 (ücret) · 🎓 (eğitim) · 🔧 (teknik) · 🏪 (işletme) · ✅ (onay)

## KANUNİ RAKAMLAR (LLM UYDURMAZ — kaynak: lib/constants.ts + 3308)
- Çırak ücreti: **net asgari ücretin en az %30'u**
- Kalfa eğitimi: **en az %50'si**
- MTAL beceri eğitimi: **en az %30'u, SGK primi devletçe**
- İMEP: işletmeye **brüt asgari ücretin %30'u destek**, SGK primleri Hazine'den
- Üniversite stajı: **ücret serbest**, SGK primi Genç İstihdam Paketi kapsamında devletçe
- Kalfalık sonrası usta yolu: **3 yıl çalışma + ustalık eğitimi + sınav**
- Ustalık belgesi: bazı mesleklerde **işyeri açma şartı**

> Bu rakamlar değişirse: `lib/constants.ts` + bu dosya + ajan scriptlerinin
> sabit bölümleri birlikte güncellenir. Asgari ücret zamları yıllık kontrol edilir.

## Yasal Hassasiyet
- "Garantili iş" gibi ifadeler **yasak** — "iş bulma potansiyeli yüksek" denir
- MEB/İŞKUR resmi bağlantısı ima edilmez — "MEB uygulamalarıyla uyumlu" denir
- Ücret hesaplamalarında "bilgilendirme amaçlıdır" notu zorunlu
