# Vitrin paketi ilerleme notu
Tarih: 20.10.2026

## TAMAM
- SiteHeader rol-bazli nav (ogrenci/isveren/guest)
- /ilanlar sayfasi + components/JobCard.tsx (logo_url destekli)
- supabase/vitrin_logo_cv_guncellemesi.sql (job_posts.logo_url + student_cvs.photo_url + storage bucket)
- page.tsx vitrine dondu: featuredJobs = sortedJobs.slice(0,6), baslik "Öne Çıkan İlanlar", "Tüm İlanları Gör" linki
- alan-secim redirect -> /ilanlar?alan=

## KALAN
1. ilan-ver: logo yukleme (Supabase Storage 'logolar' bucket'a upload -> job_posts.logo_url), logosuz icin bas-harf sablonlari; inceleme cikti bu script calisirken alindi
2. cv-olustur: fotograf yukleme (student_cvs.photo_url), onizlemede fotoraf
3. /ilanlar sayfasina ?alan= parametre destegi (yoksa ekle)
4. tsc + build + commit + push + canli dogrulama

## NOT
- Duzenleme yontemi: Node script (scripts/apply-*.mjs) ile regex-replace; PowerShell ile metin YAZMA yasak (mojibake).
- JobCard props API: job objesinde company_details.logo_url ve logo_uri bekliyor (dosyaya bak).
- Storage bucket adi SQL'de: 'logolar' ve 'cv-fotolar' (SQL dosyasindan teyit et).
