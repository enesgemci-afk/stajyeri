-- ============================================================
-- STAJYERI.NET | Vitrin + Logo + CV Fotoğrafı Güncellemesi
--
-- NASIL ÇALIŞTIRILIR:
--   1. https://supabase.com/dashboard adresine girin
--   2. Projeyi seçin -> sol menüden "SQL Editor" açın
--   3. Bu dosyanın tamamını yapıştırıp "Run" butonuna basın
--
-- İçerik:
--   1. company_details.logo_url / logo_color -> işletme logosu (veya renk şablonu)
--   2. job_posts.wage_info                   -> ilan ücret bilgisi alanı
--   3. student_cvs.photo_url                 -> CV fotoğrafı
--   4. Storage bucket'ları: company-logos, cv-photos (herkes kendi klasörüne yazar)
-- ============================================================

-- 1) İşletme logosu + şablon rengi
alter table public.company_details
  add column if not exists logo_url text;
alter table public.company_details
  add column if not exists logo_color text;

-- 2) İlanda ücret bilgisi (ör. "Günlük 450 TL + yemek")
alter table public.job_posts
  add column if not exists wage_info text;

-- 3) CV fotoğrafı
alter table public.student_cvs
  add column if not exists photo_url text;

-- 4) Storage bucket'ları (herkese açık okuma, kimlikli yazma)
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cv-photos', 'cv-photos', true)
on conflict (id) do nothing;

-- İşveren yalnızca kendi klasörüne (uid/) logo yükler/günceller/siler
drop policy if exists "isveren logo yukler" on storage.objects;
create policy "isveren logo yukler"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "isveren logo gunceller" on storage.objects;
create policy "isveren logo gunceller"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "isveren logo siler" on storage.objects;
create policy "isveren logo siler"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Öğrenci yalnızca kendi klasörüne (uid/) CV fotoğrafı yükler/günceller/siler
drop policy if exists "ogrenci cv foto yukler" on storage.objects;
create policy "ogrenci cv foto yukler"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cv-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ogrenci cv foto gunceller" on storage.objects;
create policy "ogrenci cv foto gunceller"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'cv-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ogrenci cv foto siler" on storage.objects;
create policy "ogrenci cv foto siler"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cv-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
