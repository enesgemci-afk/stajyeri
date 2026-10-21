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
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('cv-photos', 'cv-photos', true)
on conflict (id) do update set public = true;

-- 4a) ÖNEMLİ TEMİZLİK: Bu dosyanın eski sürümlerinde politikalar farklı
--     bucket adlarına ('logolar', 'cv-fotolar') bağlıydı. Eski adlara bağlı
--     policy'ler kalarsa 'cv-photos'a yükleme RLS hatasıyla reddedilir
--     ("new row violates row-level security policy"). Aşağıdaki blok, bu
--     bucket'lara (eski adlar dahil) değinen TÜM politikaları siler.
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') like '%company-logos%'
        or coalesce(with_check, '') like '%company-logos%'
        or coalesce(qual, '') like '%cv-photos%'
        or coalesce(with_check, '') like '%cv-photos%'
        or coalesce(qual, '') like '%logolar%'
        or coalesce(with_check, '') like '%logolar%'
        or coalesce(qual, '') like '%cv-fotolar%'
        or coalesce(with_check, '') like '%cv-fotolar%'
      )
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end
$$;

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

-- SELECT policy: upsert/çakışma kontrolü ve dosya listeleme için gerekli
drop policy if exists "isveren logo goruntuler" on storage.objects;
create policy "isveren logo goruntuler"
  on storage.objects for select
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

-- SELECT policy: upsert/çakışma kontrolü ve dosya listeleme için gerekli
drop policy if exists "ogrenci cv foto goruntuler" on storage.objects;
create policy "ogrenci cv foto goruntuler"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'cv-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5) İşveren kendi işletme kaydını günceller (logo / renk şablonu kaydı için)
alter table public.company_details enable row level security;

drop policy if exists "isveren kendi isletmesini gunceller" on public.company_details;
create policy "isveren kendi isletmesini gunceller"
  on public.company_details for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- 6) İşveren kendi ilanını günceller (ücret bilgisi vb. sonraki güncellemeler için)
alter table public.job_posts enable row level security;

drop policy if exists "isveren kendi ilanini gunceller" on public.job_posts;
create policy "isveren kendi ilanini gunceller"
  on public.job_posts for update
  to authenticated
  using (
    company_id in (select id from public.company_details where profile_id = auth.uid())
  )
  with check (
    company_id in (select id from public.company_details where profile_id = auth.uid())
  );

-- ============================================================
-- DOĞRULAMA — Run sonrası bu iki sorgunun sonucu görünür:
--   1. sorguda 8 satır (2 bucket x 4 işlem) policy,
--   2. sorguda 2 satır, ikisinde de public = true olmalıdır.
-- Sorun yaşarsanız bu çıktıyı bize iletin.
-- ============================================================
select policyname, cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;

select id, public
from storage.buckets
where id in ('company-logos', 'cv-photos')
order by id;
