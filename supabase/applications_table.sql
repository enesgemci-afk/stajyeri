-- ============================================================
-- STAJYERI.NET | applications (Başvurular) tablosu düzeltmesi
--
-- NASIL ÇALIŞTIRILIR:
--   1. https://supabase.com/dashboard adresine girin
--   2. Projeyi seçin -> sol menüden "SQL Editor" açın
--   3. Bu dosyanın tamamını yapıştırıp "Run" butonuna basın
--
-- NOT: Mevcut 'applications' tablosu eksik şemalıdır (ilan ve
-- öğrenci referans sütunları yoktur) ve içerisi boştur. Bu yüzden
-- silinip doğru şemayla yeniden oluşturulur. Veri kaybı yoktur.
-- ============================================================

drop table if exists public.applications;

create table public.applications (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references public.job_posts(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  status     text not null default 'pending'
             check (status in ('pending', 'approved', 'rejected')),
  phone      text,
  message    text,
  created_at timestamptz not null default now()
);

comment on column public.applications.status  is 'pending = İncelemede, approved = Olumlu, rejected = Olumsuz';
comment on column public.applications.phone   is 'Başvuru sırasında öğrencinin ilettiği telefon';
comment on column public.applications.message is 'Öğrencinin işletmeye yazdığı ön yazı / not';

-- Aynı öğrencinin aynı ilana ikinci kez başvurmasını engeller
-- (uygulama 23505 hata kodunu "zaten başvurdunuz" mesajı için kullanır)
create unique index applications_job_student_unique
  on public.applications (job_id, student_id);

-- Listeleme sorguları için performans indeksleri
create index applications_job_idx     on public.applications (job_id);
create index applications_student_idx on public.applications (student_id);
create index applications_status_idx  on public.applications (status);

-- ------------------------------------------------------------
-- Güvenlik: Sadece giriş yapmış öğrenciler kendi adına başvuru
-- ekleyebilir; herkes (admin paneli dahil) listeleyebilir.
-- (Diğer tablolarla tutarlı olacak şekilde okuma herkese açık
-- bırakıldı; ileride işveren paneli için güncellenebilir.)
-- ------------------------------------------------------------
alter table public.applications enable row level security;

create policy "basvurular herkes listeleyebilir"
  on public.applications
  for select
  using (true);

create policy "ogrenci kendi adina basvurur"
  on public.applications
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.student_profiles sp
      where sp.id = student_id
        and sp.profile_id = auth.uid()
    )
  );
