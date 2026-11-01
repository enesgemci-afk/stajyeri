# SUPABASE KURULUM & MIGRATION REHBERİ — stajyeri-web

> Tüm modüller **idempotenttir** (tekrar çalıştırılabilir). Sıralamaya uymak yeterli.

## Hızlı Kurulum (önerilen)

Tek dosyayla hepsi:

1. https://supabase.com/dashboard → proje → **SQL Editor**
2. `supabase/00_install_all.sql` içeriğini yapıştır → **Run**

> `00_install_all.sql` otomatik üretilir; **elle düzenlemeyin**.
> Yeni modül eklerken: `scripts/build-supabase-install.mjs` içindeki `ORDER` listesine
> ekleyin, sonra `node scripts/build-supabase-install.mjs` ile yeniden üretin.

## Modül Sırası ve Ne İşe Yaradıkları

| # | Dosya | Özellik |
|---|-------|---------|
| 1 | `applications_table.sql` | Başvurular tablosu (ilan+öğrenci FK, durum, KVKK notu) |
| 2 | `favorites_table.sql` | Favoriler + **İş Alarmı** (`job_alerts`) + KVKK onay kolonu |
| 3 | `student_cvs.sql` | Öğrenci CV'leri (beceriler, deneyim — panel "Becerilerim") |
| 4 | `guven_katmani.sql` | Veli onay katmanı (link/sms/e-devlet, konsent token'ları) |
| 5 | `veli_onay_fix.sql` | Veli onay karar akışı düzeltmesi |
| 6 | `okul_modulu.sql` | Okul profilleri + öğrenci-okul eşleşmesi (koordinatör modülü) |
| 7 | `ileri_paket.sql` | Bildirim merkezi, staj defteri, yanıt hızı, Premium, e-bülten, RPC'ler |
| 8 | `havuz_kredi.sql` | Stajyer havuzu (maskeli arama) + kontör/kredi + admin yetkileri |
| 9 | `havuz_bildirim.sql` | Havuz bildirimleri (admin işlemleri → işverene bilgi) |
| 10 | `vitrin_logo_cv_guncellemesi.sql` | Vitrin kolonları (logo_url, logo_color, cv güncellemeleri) |
| 11 | `is_alarmi_tetik.sql` | **İş alarmı bildirim tetikleyicisi** (`notify_job_alerts` RPC) |

## Kurulum Durumu Kontrol Listesi (canlı proje)

- [x] 1–7 ve 8–10: canlı projede kurulu (önceki paketlerle)
- [ ] 11 `is_alarmi_tetik.sql`: **SQL Editor'de çalıştırıldıysa burayı işaretle**
      (iş alarmı bildirimleri bu adımla aktifleşir; çalıştırılmadıysa ilan yayın akışı etkilenmez,
      sadece bildirimler gitmez)

> Yeni SQL eklenince buraya not düşün. Adım 2 build + push öncesi kontrol listesinde
> "SQL gerekiyorsa" maddesinin kaynağıdır (bkz. kök dizindeki `DEPLOY.md`).

## Temel Tablolar

Aşağıdakiler modül dosyalarında **değildir**; canlı projede elle kurulmuş durumda:
`profiles`, `student_profiles`, `job_posts`, `company_details` (ve `auth.*` Supabase çekirdeği).
Yeni bir ortamda sıfırdan kurulum gerekiyorsa bu tabloların DDL'i öncelikle oluşturulmalıdır.
