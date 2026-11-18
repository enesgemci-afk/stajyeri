-- ============================================================
-- STAJYERI.NET | TEST VERİSİ SIFIRLAMA
--
-- NASIL ÇALIŞTIRILIR:
--   1. https://supabase.com/dashboard → proje → SQL Editor
--   2. Bu dosyanın TAMAMINI yapıştır → Run
--
-- NE YAPAR:
--   Tüm test ilanlarını, başvuruları, bildirimleri, staj
--   defteri kayıtlarını, veli onaylarını ve işletme
--   kayıtlarını siler. Kullanıcı hesapları (auth.users,
--   profiles) KORUNUR.
--
-- ⚠️ GERİ ALINMAZ! Çalıştırmadan önce yedek al:
--   Dashboard → Database → Backups → Create backup
-- ============================================================

-- Adım 1: İş ilanlarını sil (bağlı başvurular cascade ile silinir)
DELETE FROM public.job_posts;

-- Adım 2: İşletme detaylarını sil (test firmaları)
DELETE FROM public.company_details;

-- Adım 3: Bildirimleri temizle
DELETE FROM public.notifications;

-- Adım 4: Staj defteri kayıtlarını sil
DELETE FROM public.staj_entries;

-- Adım 5: Veli onaylarını sil
DELETE FROM public.guardian_consents;

-- Adım 6: Favorileri temizle
DELETE FROM public.favorites;

-- Adım 7: İş alarmlarını temizle
DELETE FROM public.job_alerts;

-- Adım 8: Öne çıkan ilanları temizle
DELETE FROM public.featured_listings;

-- Adım 9: İşveren paketlerini temizle
DELETE FROM public.employer_packages;

-- Adım 10: Bülten abonelerini koru ama test olanları sil
-- (opsiyonel — gerçek aboneleri korumak için bu satırı yorumdan çıkar)
-- DELETE FROM public.newsletter_subscribers;

-- ============================================================
-- KORUNAN TABLOLAR (SİLME!):
--   auth.users         → Kullanıcı hesapları
--   public.profiles    → Kullanıcı profilleri
--   public.student_profiles → Öğrenci profilleri
--   public.school_profiles  → Okul profilleri
--   public.newsletter_subscribers → Gerçek aboneler
--   public.employer_packages → Paket tanımları (yeni)
-- ============================================================

-- Doğrulama: kaç kayıt kaldı?
SELECT 'job_posts' AS t, count(*) FROM public.job_posts
UNION ALL SELECT 'applications', count(*) FROM public.applications
UNION ALL SELECT 'company_details', count(*) FROM public.company_details
UNION ALL SELECT 'notifications', count(*) FROM public.notifications
UNION ALL SELECT 'student_profiles', count(*) FROM public.student_profiles
UNION ALL SELECT 'profiles', count(*) FROM public.profiles
ORDER BY t;
