-- ============================================================
-- STAJYERI.NET | Favoriler + İş Alarmı + KVKK onayı
--
-- NASIL ÇALIŞTIRILIR:
--   1. https://supabase.com/dashboard adresine girin
--   2. Projeyi seçin -> sol menüden "SQL Editor" açın
--   3. Bu dosyanın tamamını yapıştırıp "Run" butonuna basın
--
-- İçerik:
--   1. favorites     -> öğrencilerin favori ilanları (kalp)
--   2. job_alerts    -> iş alarmı kriterleri (öğrenci başına tek kayıt)
--   3. applications.kvkk_consented_at -> başvuru sırasında KVKK açık rıza zamanı
-- ============================================================

-- ------------------------------------------------------------
-- 1) FAVORİLER
-- ------------------------------------------------------------
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references public.job_posts(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists favorites_job_student_unique
  on public.favorites (job_id, student_id);

create index if not exists favorites_student_idx
  on public.favorites (student_id);

alter table public.favorites enable row level security;

drop policy if exists "favoriler okuma" on public.favorites;
create policy "favoriler okuma"
  on public.favorites for select using (true);

drop policy if exists "ogrenci kendi favorisini ekler" on public.favorites;
create policy "ogrenci kendi favorisini ekler"
  on public.favorites for insert
  to authenticated
  with check (
    exists (
      select 1 from public.student_profiles sp
      where sp.id = student_id and sp.profile_id = auth.uid()
    )
  );

drop policy if exists "ogrenci kendi favorisini siler" on public.favorites;
create policy "ogrenci kendi favorisini siler"
  on public.favorites for delete
  to authenticated
  using (
    exists (
      select 1 from public.student_profiles sp
      where sp.id = student_id and sp.profile_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 2) İŞ ALARMI — öğrenci başına tek kriter kaydı (alan + şehir)
-- ------------------------------------------------------------
create table if not exists public.job_alerts (
  student_id uuid primary key references public.student_profiles(id) on delete cascade,
  field_name text,
  city       text,
  created_at timestamptz not null default now()
);

alter table public.job_alerts enable row level security;

drop policy if exists "alarm okuma" on public.job_alerts;
create policy "alarm okuma"
  on public.job_alerts for select using (true);

drop policy if exists "ogrenci alarm kaydeder" on public.job_alerts;
create policy "ogrenci alarm kaydeder"
  on public.job_alerts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.student_profiles sp
      where sp.id = student_id and sp.profile_id = auth.uid()
    )
  );

drop policy if exists "ogrenci alarm gunceller" on public.job_alerts;
create policy "ogrenci alarm gunceller"
  on public.job_alerts for update
  to authenticated
  using (
    exists (
      select 1 from public.student_profiles sp
      where sp.id = student_id and sp.profile_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 3) Başvurulara KVKK açık rıza zamanı (UYUM MODÜLÜ v1)
--    NOT: Uygulama, kolon yoksa bu alanı göndermeden yeniden
--    dener; bu yüzden kolon eklenene kadar da başvuru çalışır.
-- ------------------------------------------------------------
alter table public.applications
  add column if not exists kvkk_consented_at timestamptz;

comment on column public.applications.kvkk_consented_at
  is 'Öğrencinin başvuru sırasında KVKK Aydınlatma Metni''ne verdiği açık rıza zamanı';