-- ============================================================
-- STAJYERI.NET | Öğrenci CV Kayıtları (CV Oluşturucu aracı)
--
-- NASIL ÇALIŞTIRILIR:
--   1. https://supabase.com/dashboard adresine girin
--   2. Projeyi seçin -> sol menüden "SQL Editor" açın
--   3. Bu dosyanın tamamını yapıştırıp "Run" butonuna basın
--
-- İçerik:
--   student_cvs -> /cv-olustur sayfasında girişli öğrencinin
--   CV verisi (öğrenci başına tek kayıt, yalnız sahibi okur/yazar)
-- ============================================================

create table if not exists public.student_cvs (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  full_name       text,
  phone           text,
  email           text,
  city            text,
  education_level text,
  field_name      text,
  school_name     text,
  about           text,
  skills          jsonb not null default '[]'::jsonb,
  experiences     jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Öğrenci başına tek CV
create unique index if not exists student_cvs_profile_unique
  on public.student_cvs (profile_id);

alter table public.student_cvs enable row level security;

drop policy if exists "ogrenci kendi cv'sini gorur" on public.student_cvs;
create policy "ogrenci kendi cv'sini gorur"
  on public.student_cvs for select
  to authenticated
  using (profile_id = auth.uid());

drop policy if exists "ogrenci kendi cv'sini kaydeder" on public.student_cvs;
create policy "ogrenci kendi cv'sini kaydeder"
  on public.student_cvs for insert
  to authenticated
  with check (profile_id = auth.uid());

drop policy if exists "ogrenci kendi cv'sini gunceller" on public.student_cvs;
create policy "ogrenci kendi cv'sini gunceller"
  on public.student_cvs for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

comment on table public.student_cvs
  is 'CV Oluşturucu aracıyla kaydedilen öğrenci özgeçmişleri (öğrenci başına tek kayıt)';