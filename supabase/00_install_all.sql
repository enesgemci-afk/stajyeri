-- ============================================================
-- STAJYERI.NET | TAM KURULUM (OTOMATİK ÜRETİLEN)
-- Üretim: node scripts/build-supabase-install.mjs — ELLE DÜZENLEME!
-- İçerik: 11 modül, aşağıdaki sırayla birleştirildi.
-- Tüm modüller idempotenttir; bu dosya tekrar çalıştırılabilir.
--
-- NOT: Temel tablolar (profiles, student_profiles, job_posts,
-- company_details) canlı projede mevcuttur; bu dosya modül
-- migration'larını kurar.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: applications_table.sql
-- ════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: favorites_table.sql
-- ════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: student_cvs.sql
-- ════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: guven_katmani.sql
-- ════════════════════════════════════════════════════════════

-- ============================================================
-- STAJYERI.NET | GÜVEN KATMANI MIGRATION (v1) — 3 Modül
--   MODÜL 1: Veli Onay ve Yasal Muvafakat (18 yaş altı)
--   MODÜL 2: Usta Öğretici Puanlama + İşyeri Güven Skoru
--   MODÜL 3: Teşvik Simülatörü Lead'leri (B2B)
-- SQL Editor -> TAMAMINI yapıştır -> Run. Idempotenttir.
-- ============================================================

-- ------------------------------------------------------------
-- MODÜL 1a: applications tablosuna veli onayı + doğum yılı
-- ------------------------------------------------------------
alter table public.applications
  add column if not exists guardian_status text not null default 'not_required';

alter table public.applications
  add column if not exists birth_year int;

alter table public.applications
  drop constraint if exists applications_guardian_status_check;

alter table public.applications
  add constraint applications_guardian_status_check
  check (guardian_status in ('not_required', 'pending', 'approved', 'rejected'));

comment on column public.applications.guardian_status is
  '18 yaş altı başvurularda veli muvafakat durumu; pending = veli onayı bekleniyor (yasal kilit)';

-- ------------------------------------------------------------
-- MODÜL 1b: guardian_consents (veli muvafakat kayıtları)
--   Başvuru başına tek kayıt; onay token ile giriş yapmadan yapılır
-- ------------------------------------------------------------
create table if not exists public.guardian_consents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  guardian_name text not null,
  guardian_phone text,
  relation text,
  student_birth_year int,
  consent_token text not null,
  provider text not null default 'link',
  status text not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  approved_at timestamptz,
  approver_ip text,
  consent_text_version text not null default 'v1',
  created_at timestamptz not null default now(),
  constraint guardian_status_chk check (status in ('pending', 'approved', 'rejected', 'expired')),
  constraint guardian_provider_chk check (provider in ('link', 'sms', 'edevlet'))
);

create unique index if not exists guardian_consents_token_unique
  on public.guardian_consents (consent_token);

create unique index if not exists guardian_consents_application_unique
  on public.guardian_consents (application_id);

create index if not exists guardian_consents_student_idx
  on public.guardian_consents (student_id);

alter table public.guardian_consents enable row level security;

-- Öğrenci yalnızca kendi muvafakat kaydını görür (veli sayfası RPC ile okur)
drop policy if exists "ogrenci kendi muvafakatini gorur" on public.guardian_consents;
create policy "ogrenci kendi muvafakatini gorur"
  on public.guardian_consents for select
  to authenticated
  using (
    student_id in (select id from public.student_profiles where profile_id = auth.uid())
  );

-- Öğrenci yalnızca kendi başvurusu için muvafakat oluşturur
drop policy if exists "ogrenci muvafakat olusturur" on public.guardian_consents;
create policy "ogrenci muvafakat olusturur"
  on public.guardian_consents for insert
  to authenticated
  with check (
    student_id in (select id from public.student_profiles where profile_id = auth.uid())
  );

-- ------------------------------------------------------------
-- MODÜL 1c: RPC — veli sayfası token ile bilgi okur (girişsiz)
-- ------------------------------------------------------------
create or replace function public.get_guardian_consent(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
begin
  select
    gc.status, gc.expires_at, gc.guardian_name,
    coalesce(p.full_name, 'Öğrenci') as student_name,
    jp.title as job_title,
    cd.company_name,
    jp.city as job_city
  into v_rec
  from public.guardian_consents gc
  join public.applications a on a.id = gc.application_id
  join public.student_profiles sp on sp.id = gc.student_id
  join public.profiles p on p.id = sp.profile_id
  join public.job_posts jp on jp.id = a.job_id
  join public.company_details cd on cd.id = jp.company_id
  where gc.consent_token = p_token;

  if not found then
    return null;
  end if;

  -- Bekleyen istekte süre dolduysa otomatik düşür
  if v_rec.status = 'pending' and v_rec.expires_at < now() then
    update public.guardian_consents
      set status = 'expired'
      where consent_token = p_token and status = 'pending';
    v_rec.status := 'expired';
  end if;

  return json_build_object(
    'guardian_name', v_rec.guardian_name,
    'student_name', v_rec.student_name,
    'job_title', v_rec.job_title,
    'company_name', v_rec.company_name,
    'job_city', v_rec.job_city,
    'status', v_rec.status,
    'expires_at', v_rec.expires_at
  );
end;
$$;

-- ------------------------------------------------------------
-- MODÜL 1d: RPC — veli kararı (onay/ret) + zaman & IP damgası
--   Onay, applications.guardian_status alanına da yazılır; işveren
--   paneli 'approved' olmadan 18 yaş altı başvuruyu onaylayamaz.
-- ------------------------------------------------------------
create or replace function public.approve_guardian_consent(p_token text, p_decision text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_app uuid;
  v_expires timestamptz;
  v_new text;
begin
  if p_decision not in ('approve', 'reject') then
    return json_build_object('ok', false, 'err', 'invalid_decision');
  end if;

  select gc.id, gc.application_id, gc.expires_at
    into v_id, v_app, v_expires
  from public.guardian_consents gc
  where gc.consent_token = p_token and gc.status = 'pending';

  if v_id is null then
    return json_build_object('ok', false, 'err', 'already_done');
  end if;

  if v_expires < now() then
    update public.guardian_consents
      set status = 'expired'
      where id = v_id and status = 'pending';
    return json_build_object('ok', false, 'err', 'expired');
  end if;

  v_new := case when p_decision = 'approve' then 'approved' else 'rejected' end;

  update public.guardian_consents
    set status = v_new,
        approved_at = now(),
        approver_ip = coalesce(inet_client_addr()::text, 'kayitli-degil')
    where id = v_id and status = 'pending';

  update public.applications
    set guardian_status = v_new
    where id = v_app;

  return json_build_object('ok', true, 'status', v_new);
end;
$$;

-- Veli, giriş yapmadan bu iki fonksiyonu kullanabilir
grant execute on function public.get_guardian_consent(text) to anon, authenticated;
grant execute on function public.approve_guardian_consent(text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- MODÜL 2a: trainer_ratings — usta öğretici değerlendirmeleri
--   Anonimdir: yalnızca öğrenci kendi kaydını görür; işveren bireysel
--   puanları göremez, yalnızca toplu skoru (aşağıdaki view).
-- ------------------------------------------------------------
create table if not exists public.trainer_ratings (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  company_id uuid not null references public.company_details(id) on delete cascade,
  trainer_name text,
  education_quality int not null,
  safety int not null,
  respect int not null,
  wage_order int not null,
  comment text,
  would_recommend boolean not null default true,
  created_at timestamptz not null default now(),
  constraint trainer_score_range_chk
    check (education_quality between 1 and 5
       and safety between 1 and 5
       and respect between 1 and 5
       and wage_order between 1 and 5)
);

create unique index if not exists trainer_ratings_application_unique
  on public.trainer_ratings (application_id);

create index if not exists trainer_ratings_company_idx
  on public.trainer_ratings (company_id);

alter table public.trainer_ratings enable row level security;

drop policy if exists "ogrenci kendi puanini gorur" on public.trainer_ratings;
create policy "ogrenci kendi puanini gorur"
  on public.trainer_ratings for select
  to authenticated
  using (
    student_id in (select id from public.student_profiles where profile_id = auth.uid())
  );

-- Yalnızca ONAYLANMIŞ (yerleşilen) stajını puanlayabilir
drop policy if exists "ogrenci onayli stajini puanlar" on public.trainer_ratings;
create policy "ogrenci onayli stajini puanlar"
  on public.trainer_ratings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.applications a
      join public.student_profiles sp on sp.id = a.student_id
      where a.id = application_id
        and sp.profile_id = auth.uid()
        and a.status = 'approved'
    )
  );

-- ------------------------------------------------------------
-- MODÜL 2b: get_company_trust_scores — Güven Skoru fonksiyonu
--   (Eski company_trust_scores VIEW'i, Supabase güvenlik tarayıcısının
--    "Security Definer View" Critical uyarısı verdiği için KALDIRILDI.
--    Aynı veri artık dar kapsamlı SECURITY DEFINER fonksiyondan döner;
--    bireysel puanlar asla dışarı sızmaz — yalnızca toplu skor döner.)
--   Ağırlıklar: %35 eğitim, %30 güvenlik, %25 saygı, %10 ücret düzeni
--   Rozet: >=3 puan & >=4.5 GOLD | >=4.0 SILVER | >=3.5 BRONZE
-- ------------------------------------------------------------
drop view if exists public.company_trust_scores;

create or replace function public.get_company_trust_scores(p_company_id uuid default null)
returns table (company_id uuid, trust_score numeric, rating_count bigint, badge text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with agg as (
    select
      tr.company_id as cid,
      count(*)      as rc,
      avg(0.35 * tr.education_quality + 0.30 * tr.safety + 0.25 * tr.respect + 0.10 * tr.wage_order) as rs
    from public.trainer_ratings tr
    where (p_company_id is null or tr.company_id = p_company_id)
    group by tr.company_id
  )
  select
    cd.id,
    round(coalesce(agg.rs, 0)::numeric, 2),
    coalesce(agg.rc, 0),
    case
      when coalesce(agg.rc, 0) >= 3 and coalesce(agg.rs, 0) >= 4.5 then 'gold'
      when coalesce(agg.rc, 0) >= 3 and coalesce(agg.rs, 0) >= 4.0 then 'silver'
      when coalesce(agg.rc, 0) >= 3 and coalesce(agg.rs, 0) >= 3.5 then 'bronze'
      else 'none'
    end
  from public.company_details cd
  left join agg on agg.cid = cd.id
  where (p_company_id is null or cd.id = p_company_id);
end;
$$;

-- Toplu skor herkese açık (bireysel puanlar kapalı kalır)
grant execute on function public.get_company_trust_scores(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- MODÜL 3: simulator_leads — teşvik simülatörü lead formu (girişsiz)
--   Okuma policy'si YOKTUR: lead'leri yalnızca service/admin okur.
-- ------------------------------------------------------------
create table if not exists public.simulator_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  contact_name text not null,
  phone text not null,
  employee_count int,
  intern_type text,
  in_osb boolean not null default true,
  estimated_support text,
  created_at timestamptz not null default now()
);

alter table public.simulator_leads enable row level security;

drop policy if exists "ziyaretciler lead birakabilir" on public.simulator_leads;
create policy "ziyaretciler lead birakabilir"
  on public.simulator_leads for insert
  to anon, authenticated
  with check (true);

-- ------------------------------------------------------------
-- DOĞRULAMA — Run sonrası çıktıda kolonlar/tablolar görünmeli
-- ------------------------------------------------------------
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'applications'
  and column_name in ('guardian_status', 'birth_year');

select
  to_regclass('public.guardian_consents')    as guardian_consents,
  to_regclass('public.trainer_ratings')      as trainer_ratings,
  to_regclass('public.simulator_leads')      as simulator_leads;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'get_guardian_consent', 'approve_guardian_consent', 'get_company_trust_scores'
  )
order by routine_name;

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: veli_onay_fix.sql
-- ════════════════════════════════════════════════════════════

-- ============================================================
-- STAJYERI.NET | VELİ ONAY RPC YAMASI (canlı DB'de çalışan düzeltme)
-- Hata: get_guardian_consent → "column sp.full_name does not exist"
-- Sebep: student_profiles'ta isim kolonu yok; isim profiles.full_name'de
--        (student_profiles.profile_id → profiles.id)
-- Çalıştır: Supabase SQL Editor → tamamını yapıştır → Run (idempotent)
-- ============================================================

create or replace function public.get_guardian_consent(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
begin
  select
    gc.status, gc.expires_at, gc.guardian_name,
    coalesce(p.full_name, 'Öğrenci') as student_name,
    jp.title as job_title,
    cd.company_name,
    jp.city as job_city
  into v_rec
  from public.guardian_consents gc
  join public.applications a on a.id = gc.application_id
  join public.student_profiles sp on sp.id = gc.student_id
  join public.profiles p on p.id = sp.profile_id
  join public.job_posts jp on jp.id = a.job_id
  join public.company_details cd on cd.id = jp.company_id
  where gc.consent_token = p_token;

  if not found then
    return null;
  end if;

  if v_rec.status = 'pending' and v_rec.expires_at < now() then
    update public.guardian_consents
      set status = 'expired'
      where consent_token = p_token and status = 'pending';
    v_rec.status := 'expired';
  end if;

  return json_build_object(
    'guardian_name', v_rec.guardian_name,
    'student_name', v_rec.student_name,
    'job_title', v_rec.job_title,
    'company_name', v_rec.company_name,
    'job_city', v_rec.job_city,
    'status', v_rec.status,
    'expires_at', v_rec.expires_at
  );
end;
$$;

grant execute on function public.get_guardian_consent(text) to anon, authenticated;

-- DOĞRULAMA: aşağıdaki çağrı 200 dönmeli ve hata vermemeli
-- (test-token bulunamadığı için sonuç null olur — bu NORMAL, hata OLMAZ)
-- select public.get_guardian_consent('test-token');

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: okul_modulu.sql
-- ════════════════════════════════════════════════════════════

-- ============================================================
-- STAJYERI.NET | OKUL KOORDINATOR MODULU (B2B)
--   1. school_profiles (okul hesabi + admin dogrulamasi)
--   2. student_profiles.school_name (ogrenci-okul eslestirmesi)
--   3. profiles.user_type ailesine 'school' ekleme
--   4. RPC: public_school_list (kayit dropdown'u — herkese acik)
--   5. RPC: school_panel_data (koordinator paneli verisi)
--   6. RPC: admin_list_schools / admin_set_school_verified
-- Çalıştır: SQL Editor → TAMAMINI yapıştır → Run (idempotent)
-- ============================================================

-- 0) user_type CHECK kısıtı varsa 'school' dahil genişlet
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%user_type%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;
alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('student', 'employer', 'school'));

-- 1) Okul profilleri
create table if not exists public.school_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  school_name text not null,
  city text,
  district text,
  coordinator_title text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists school_profiles_name_lower_unique
  on public.school_profiles (lower(btrim(school_name)));
alter table public.school_profiles enable row level security;

drop policy if exists "okul kendi kaydini gorur" on public.school_profiles;
create policy "okul kendi kaydini gorur"
  on public.school_profiles for select to authenticated
  using (profile_id = auth.uid());

drop policy if exists "okul kendi kaydini olusturur" on public.school_profiles;
create policy "okul kendi kaydini olusturur"
  on public.school_profiles for insert to authenticated
  with check (profile_id = auth.uid());

drop policy if exists "okul kendi kaydini gunceller" on public.school_profiles;
create policy "okul kendi kaydini gunceller"
  on public.school_profiles for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Kayıt dropdown'u için güvenli okuma (yalnızca listede gösterilecek kolonlar)
create or replace function public.public_school_list()
returns table (id uuid, school_name text, city text, district text, verified boolean)
language sql
security definer
set search_path = public
stable
as $$
  select id, school_name, city, district, verified
  from public.school_profiles
  order by verified desc, school_name asc
  limit 500;
$$;
grant execute on function public.public_school_list() to anon, authenticated;
-- 2) Öğrencilere okul alanı
alter table public.student_profiles add column if not exists school_name text;

-- Öğrenci kendi profilini güncelleyebilsin (yoksa ekle)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'student_profiles' and cmd = 'UPDATE'
  ) then
    create policy "ogrenci kendi profilini gunceller"
      on public.student_profiles for update to authenticated
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end $$;

-- 3) Koordinatör paneli verisi (yalnızca KENDİ okulunun öğrencileri)
create or replace function public.school_panel_data()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school public.school_profiles%rowtype;
  v_students json;
begin
  select * into v_school from public.school_profiles where profile_id = auth.uid();
  if not found then return null; end if;

  select coalesce(json_agg(t order by t.full_name), '[]'::json) into v_students
  from (
    select
      sp.id as student_id,
      p.full_name,
      sp.field_name,
      sp.education_level,
      (sc.id is not null) as has_cv,
      (select count(*) from public.applications a where a.student_id = sp.id) as total_apps,
      (select count(*) from public.applications a where a.student_id = sp.id and a.status = 'approved') as approved,
      (select count(*) from public.applications a where a.student_id = sp.id and a.status = 'rejected') as rejected,
      (select count(*) from public.applications a where a.student_id = sp.id and a.status = 'pending') as pending,
      (select count(*) from public.applications a where a.student_id = sp.id and a.guardian_status = 'pending') as guardian_pending
    from public.student_profiles sp
    join public.profiles p on p.id = sp.profile_id
    left join public.student_cvs sc on sc.profile_id = sp.profile_id
    where sp.school_name is not null
      and lower(btrim(sp.school_name)) = lower(btrim(v_school.school_name))
  ) t;

  return json_build_object(
    'school', json_build_object(
      'name', v_school.school_name,
      'city', v_school.city,
      'district', v_school.district,
      'verified', v_school.verified
    ),
    'students', v_students
  );
end;
$$;
grant execute on function public.school_panel_data() to authenticated;

-- 4) Admin: okul listesi
create or replace function public.admin_list_schools()
returns table (profile_id uuid, school_name text, city text, district text, verified boolean, student_count bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not coalesce(public.is_admin(), false) then
    return;
  end if;
  return query
    select s.profile_id, s.school_name, s.city, s.district, s.verified,
      (select count(*) from public.student_profiles sp
       where sp.school_name is not null
         and lower(btrim(sp.school_name)) = lower(btrim(s.school_name)))
    from public.school_profiles s
    order by s.verified desc, s.created_at desc;
end;
$$;
grant execute on function public.admin_list_schools() to authenticated;

-- 5) Admin: doğrulama ver/al + işveren-öğrenci tarzı bildirim
create or replace function public.admin_set_school_verified(p_profile uuid, p_verified boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if not coalesce(public.is_admin(), false) then
    return json_build_object('ok', false, 'err', 'not_admin');
  end if;
  if not exists (select 1 from public.school_profiles where profile_id = p_profile) then
    return json_build_object('ok', false, 'err', 'not_found');
  end if;
  update public.school_profiles set verified = p_verified where profile_id = p_profile;
  perform public.create_notification(
    p_profile, 'school',
    case when p_verified then 'Okul hesabınız doğrulandı ✓' else 'Okul hesabınızın doğrulaması kaldırıldı' end,
    case when p_verified
      then 'Öğrenci kayıt formunda okulunuz artık seçilebilir; koordinatör panelinizden öğrenci başvurularını izleyebilirsiniz.'
      else 'Hesap bilgilerinizi kontrol edin; sorularınız için site yönetimiyle iletişime geçin.'
    end,
    '/okul'
  );
  return json_build_object('ok', true);
end;
$$;
grant execute on function public.admin_set_school_verified(uuid, boolean) to authenticated;

-- DOĞRULAMA — school_profiles VAR, school_name_col=1, rpc_count=4 beklenir
select to_regclass('public.school_profiles') as school_profiles,
       (select count(*) from information_schema.columns
         where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'school_name') as school_name_col,
       (select count(*) from information_schema.routines
         where routine_schema = 'public' and routine_name in
         ('public_school_list', 'school_panel_data', 'admin_list_schools', 'admin_set_school_verified')) as rpc_count;

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: ileri_paket.sql
-- ════════════════════════════════════════════════════════════

-- ============================================================
-- STAJYERI.NET | İLERİ PAKET MIGRATION
--   1. Bildirim merkezi (notifications) + create_notification RPC
--   2. Staj Defteri (staj_entries) — öğrenci günlük, işveren okur
--   3. Yanıt hızı (applications.responded_at + get_company_response_time)
--   4. Stajyeri+ Premium (profiles.premium_until + admin_set_premium)
--   5. E-bülten (newsletter_subscribers)
--   6. Veli onay kararı → öğrenciye bildirim (RPC güncellemesi)
--   7. Yeni başvuru → işverene bildirim (notify_employer_new_application)
-- SQL Editor -> TAMAMINI yapıştır -> Run. Idempotenttir.
-- ============================================================

-- 1) Yanıt hızı kolonu
alter table public.applications
  add column if not exists responded_at timestamptz;
comment on column public.applications.responded_at is
  'İşverenin başvuruya ilk kez sonuç (onay/ret) verdiği an — yanıt hızı rozeti için';

-- 2) Bildirim merkezi
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'info',
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_profile_idx
  on public.notifications (profile_id, created_at desc);
alter table public.notifications enable row level security;

drop policy if exists "kullanici kendi bildirimini gorur" on public.notifications;
create policy "kullanici kendi bildirimini gorur"
  on public.notifications for select to authenticated
  using (profile_id = auth.uid());

drop policy if exists "kullanici kendi bildirimini okur" on public.notifications;
create policy "kullanici kendi bildirimini okur"
  on public.notifications for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Sistem bildirimi yazar (yalnızca SECURITY DEFINER — istemci insert edemez)
create or replace function public.create_notification(
  p_profile_id uuid, p_type text, p_title text, p_body text default null, p_link text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_profile_id is null then return; end if;
  insert into public.notifications (profile_id, type, title, body, link)
  values (p_profile_id, coalesce(p_type, 'info'), p_title, p_body, p_link);
end;
$$;
grant execute on function public.create_notification(uuid, text, text, text, text) to authenticated;

-- 3) Staj Defteri — onaylanan staj için günlük eğitim kaydı
create table if not exists public.staj_entries (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  entry_date date not null default current_date,
  work_done text not null,
  hours int,
  created_at timestamptz not null default now(),
  constraint staj_entry_unique unique (application_id, entry_date)
);
create index if not exists staj_entries_app_idx on public.staj_entries (application_id, entry_date desc);
alter table public.staj_entries enable row level security;

-- Öğrenci kendi defterini görür
drop policy if exists "ogrenci kendi defterini gorur" on public.staj_entries;
create policy "ogrenci kendi defterini gorur"
  on public.staj_entries for select to authenticated
  using (student_id in (select id from public.student_profiles where profile_id = auth.uid()));

-- Onaylanmış staja günlük yazar (başvuru approved olmalı)
drop policy if exists "ogrenci onayli staja yazar" on public.staj_entries;
create policy "ogrenci onayli staja yazar"
  on public.staj_entries for insert to authenticated
  with check (
    student_id in (select id from public.student_profiles where profile_id = auth.uid())
    and exists (
      select 1 from public.applications a
      where a.id = application_id and a.student_id = student_id and a.status = 'approved'
    )
  );

drop policy if exists "ogrenci kendi gununu duzeltir" on public.staj_entries;
create policy "ogrenci kendi gununu duzeltir"
  on public.staj_entries for update to authenticated
  using (student_id in (select id from public.student_profiles where profile_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where profile_id = auth.uid()));

drop policy if exists "ogrenci kendi gununu siler" on public.staj_entries;
create policy "ogrenci kendi gununu siler"
  on public.staj_entries for delete to authenticated
  using (student_id in (select id from public.student_profiles where profile_id = auth.uid()));

-- İşveren, kendi işletmesindeki onaylı stajların defterini OKUR (yazamaz)
drop policy if exists "isveren staj defterini okur" on public.staj_entries;
create policy "isveren staj defterini okur"
  on public.staj_entries for select to authenticated
  using (exists (
    select 1
    from public.applications a
    join public.job_posts j on j.id = a.job_id
    join public.company_details cd on cd.id = j.company_id
    where a.id = application_id and cd.profile_id = auth.uid()
  ));

-- 4) Stajyeri+ Premium (admin manuel verir; iyzico entegrasyonu sonraki aşama)
alter table public.profiles
  add column if not exists premium_until timestamptz;
comment on column public.profiles.premium_until is
  'Stajyeri+ premium bitiş zamanı; null = ücretsiz hesap';

create or replace function public.admin_set_premium(p_profile uuid, p_days int)
returns json
language plpgsql security definer set search_path = public as $$
declare v_new timestamptz;
begin
  if not coalesce(public.is_admin(), false) then
    return json_build_object('ok', false, 'err', 'not_admin');
  end if;
  if p_days is null or p_days <= 0 then
    update public.profiles set premium_until = null where id = p_profile;
    v_new := null;
  else
    v_new := greatest(
      coalesce((select premium_until from public.profiles where id = p_profile), now()),
      now()
    ) + make_interval(days => p_days);
    update public.profiles set premium_until = v_new where id = p_profile;
  end if;
  return json_build_object('ok', true, 'premium_until', v_new);
end;
$$;
grant execute on function public.admin_set_premium(uuid, int) to authenticated;

-- 5) E-bülten abonelikleri (herkes abone olur; listeyi yalnızca admin görür)
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint newsletter_email_unique unique (email)
);
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "herkes buletene abone olur" on public.newsletter_subscribers;
create policy "herkes buletene abone olur"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);

drop policy if exists "admin buleten listesini gorur" on public.newsletter_subscribers;
create policy "admin buleten listesini gorur"
  on public.newsletter_subscribers for select to authenticated
  using (coalesce(public.is_admin(), false));

-- 6) Yanıt hızı: işletmenin ortalama ilk yanıt süresi (saat)
create or replace function public.get_company_response_time(p_company_id uuid)
returns table (avg_hours numeric, sample_count bigint)
language sql security definer set search_path = public as $$
  select
    round(avg(extract(epoch from (a.responded_at - a.created_at)) / 3600.0)::numeric, 1),
    count(*)
  from public.applications a
  join public.job_posts j on j.id = a.job_id
  where j.company_id = p_company_id
    and a.responded_at is not null
    and a.responded_at >= a.created_at;
$$;
grant execute on function public.get_company_response_time(uuid) to authenticated;

-- 7) Yeni başvuru → işverene bildirim (başvuru insert'ından sonra çağrılır)
create or replace function public.notify_employer_new_application(p_job_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_employer uuid;
  v_title text;
begin
  select cd.profile_id, jp.title
    into v_employer, v_title
  from public.job_posts jp
  join public.company_details cd on cd.id = jp.company_id
  where jp.id = p_job_id;
  if v_employer is not null then
    perform public.create_notification(
      v_employer, 'application',
      'Yeni staj başvurusu aldınız',
      v_title || ' ilanınıza yeni bir başvuru geldi. İşveren panelinden inceleyin.',
      '/isveren/panel'
    );
  end if;
end;
$$;
grant execute on function public.notify_employer_new_application(uuid) to authenticated;

-- 8) Veli onay kararı → öğrenciye bildirim (RPC güncellendi)
create or replace function public.approve_guardian_consent(p_token text, p_decision text)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid; v_app uuid; v_expires timestamptz; v_new text; v_student_profile uuid;
begin
  if p_decision not in ('approve', 'reject') then
    return json_build_object('ok', false, 'err', 'invalid_decision');
  end if;
  select gc.id, gc.application_id, gc.expires_at into v_id, v_app, v_expires
  from public.guardian_consents gc
  where gc.consent_token = p_token and gc.status = 'pending';
  if v_id is null then
    return json_build_object('ok', false, 'err', 'already_done');
  end if;
  if v_expires < now() then
    update public.guardian_consents set status = 'expired' where id = v_id and status = 'pending';
    return json_build_object('ok', false, 'err', 'expired');
  end if;
  v_new := case when p_decision = 'approve' then 'approved' else 'rejected' end;
  update public.guardian_consents
    set status = v_new, approved_at = now(),
        approver_ip = coalesce(inet_client_addr()::text, 'kayitli-degil')
    where id = v_id and status = 'pending';
  update public.applications set guardian_status = v_new where id = v_app;
  select sp.profile_id into v_student_profile
  from public.applications a
  join public.student_profiles sp on sp.id = a.student_id
  where a.id = v_app;
  perform public.create_notification(
    v_student_profile, 'guardian',
    case when v_new = 'approved' then 'Veliniz başvurunuzu onayladı ✓' else 'Veliniz başvurunuzu onaylamadı' end,
    case when v_new = 'approved' then 'Başvurunuz işveren değerlendirmesine açıldı.'
      else 'Yeni bir veli onayı isteği oluşturabilirsiniz.' end,
    '/basvurularim'
  );
  return json_build_object('ok', true, 'status', v_new);
end;
$$;

-- 9) İşveren durumu değiştirdiğinde: responded_at + öğrenciye bildirim (trigger)
create or replace function public.notify_application_status()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_student_profile uuid;
  v_title text;
begin
  if new.status is distinct from old.status and new.status <> 'pending' then
    if new.responded_at is null then
      new.responded_at := now();
    end if;
    select sp.profile_id, jp.title into v_student_profile, v_title
    from public.applications a
    join public.student_profiles sp on sp.id = a.student_id
    join public.job_posts jp on jp.id = a.job_id
    where a.id = new.id;
    perform public.create_notification(
      v_student_profile, 'application',
      case new.status
        when 'approved' then 'Başvurun kabul edildi! 🎉'
        when 'rejected' then 'Başvurun hakkında güncelleme'
        else 'Başvurun güncellendi' end,
      v_title || ' ilanına yaptığın başvuru: ' || new.status,
      '/basvurularim'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_app_status_notify on public.applications;
create trigger trg_app_status_notify
  before update of status on public.applications
  for each row execute function public.notify_application_status();

-- 10) Admin: premium listesi (admin harici boş döner)
create or replace function public.admin_list_premium()
returns table (profile_id uuid, premium_until timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not coalesce(public.is_admin(), false) then
    return;
  end if;
  return query
    select p.id, p.premium_until
    from public.profiles p
    where p.premium_until is not null;
end;
$$;
grant execute on function public.admin_list_premium() to authenticated;

-- DOĞRULAMA
select to_regclass('public.notifications') as notifications,
       to_regclass('public.staj_entries') as staj_entries,
       to_regclass('public.newsletter_subscribers') as newsletter;

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: havuz_kredi.sql
-- ════════════════════════════════════════════════════════════

-- ============================================================
-- STAJYERI.NET | Stajyer Özgeçmiş Havuzu + Kredi (Kontör) Sistemi
-- İçerik:
--   1. employer_credits         -> işveren kontör bakiyesi
--   2. pool_access_permissions  -> havuz erişim yetkisi (admin manuel tanımlar)
--   3. credit_transactions      -> kontör hareketleri (denetim izi)
--   4. pool_unlocks             -> açılan adaylar (tekrar görüntüleme ücretsiz)
--   5. RPC'ler:
--      - is_admin()                 -> çağıran admin mi?
--      - mask_name()                -> "Ahmet Y." maskesi
--      - search_student_pool()      -> MASKELİ havuz araması (gizli veri tarayıcıya ASLA gitmez)
--      - unlock_pool_student()      -> atomik: 1 kontör düş + profil aç
--      - admin_add_credits()        -> admin kontör yükler
--      - admin_set_pool_access()    -> admin havuz yetkisi verir/kaldırır
--      - admin_list_employers()     -> admin: işveren listesi (bakiye + yetki)
--      - admin_credit_history()     -> admin: son kontör hareketleri
--
-- KENDİ HESABINIZI ADMİN YAPMAK İÇİN (en sonda hazır ifade var)
-- ============================================================

-- 0) profiles tablosuna YÖNETİCİ BAYRAĞI (is_admin)
--    user_type DOKUNULMAZ: hesabınız 'employer'/'student' olarak kalır,
--    üstüne ayrıcalıklı yönetici yetkisi biner (panel/menü bozulmaz).
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 1) İşveren kontör bakiyesi (her işveren için tek satır)
create table if not exists public.employer_credits (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null unique references public.profiles(id) on delete cascade,
  balance     integer not null default 0 check (balance >= 0),
  updated_at  timestamptz not null default now()
);

-- 2) Havuz erişim izni (admin panelinden manuel verilir)
create table if not exists public.pool_access_permissions (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null unique references public.profiles(id) on delete cascade,
  granted     boolean not null default false,
  granted_at  timestamptz,
  granted_by  uuid references public.profiles(id),
  note        text
);

-- 3) Kontör hareketleri (denetim izi; pozitif=yükleme, negatif=harcama)
create table if not exists public.credit_transactions (
  id              uuid primary key default gen_random_uuid(),
  employer_id     uuid not null references public.profiles(id) on delete cascade,
  amount          integer not null,
  kind            text not null check (kind in ('admin_grant', 'pool_unlock')),
  related_student uuid references public.profiles(id),
  note            text,
  created_at      timestamptz not null default now()
);

-- 4) Açılan adaylar (işveren x aday tekil; ikinci görüntüleme ücretsiz)
create table if not exists public.pool_unlocks (
  id          uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  cv_id       uuid references public.student_cvs(id) on delete set null,
  unlocked_at timestamptz not null default now(),
  unique (employer_id, student_id)
);

-- ------------------------------------------------------------
-- RLS: işveren yalnızca KENDİ kayıtlarını okur; yazma yalnızca
-- SECURITY DEFINER RPC'ler üzerinden (admin işlemleri + unlock)
-- ------------------------------------------------------------
alter table public.employer_credits enable row level security;
drop policy if exists "isveren kendi kontorunu gorur" on public.employer_credits;
create policy "isveren kendi kontorunu gorur"
  on public.employer_credits for select to authenticated
  using (profile_id = auth.uid());

alter table public.pool_access_permissions enable row level security;
drop policy if exists "isveren havuz iznini gorur" on public.pool_access_permissions;
create policy "isveren havuz iznini gorur"
  on public.pool_access_permissions for select to authenticated
  using (profile_id = auth.uid());

alter table public.credit_transactions enable row level security;
drop policy if exists "isveren islem gecmisini gorur" on public.credit_transactions;
create policy "isveren islem gecmisini gorur"
  on public.credit_transactions for select to authenticated
  using (employer_id = auth.uid());

alter table public.pool_unlocks enable row level security;
drop policy if exists "isveren actigi adaylari gorur" on public.pool_unlocks;
create policy "isveren actigi adaylari gorur"
  on public.pool_unlocks for select to authenticated
  using (employer_id = auth.uid());

-- == TABLOLAR SONU ==

-- ------------------------------------------------------------
-- YARDIMCI FONKSİYONLAR
-- ------------------------------------------------------------

-- Çağıran kullanıcı admin mi? (tüm admin RPC'lerin yetki kapısı)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin is true
  );
$$;

-- "Ahmet Yılmaz" -> "Ahmet Y." | "Ayşe" -> "A***"
create or replace function public.mask_name(p_name text)
returns text
language sql
immutable
as $$
  select case
    when p_name is null or btrim(p_name) = '' then 'Öğrenci'
    when array_length(string_to_array(btrim(p_name), ' '), 1) >= 2
      then split_part(p_name, ' ', 1) || ' ' || left(split_part(p_name, ' ', 2), 1) || '.'
    else left(p_name, 1) || '***'
  end;
$$;

-- ------------------------------------------------------------
-- HAVUZ ARAMASI (maskeli)
-- Gizlilik: ad/telefon/e-posta/foto, yalnızca pool_unlocks'ta açılmış
-- adaylarda döner; maskeli satırlarda bu alanlar NULL gelir.
-- Erişim izni yoksa HAVUZ_ERISIM_YOK hatası fırlar.
-- ------------------------------------------------------------
create or replace function public.search_student_pool(
  p_field  text default null,
  p_city   text default null,
  p_edu    text default null,
  p_skill  text default null,
  p_limit  integer default 24,
  p_offset integer default 0
)
returns table (
  student_id      uuid,
  display_name    text,
  unlocked        boolean,
  full_name       text,
  phone           text,
  email           text,
  city            text,
  education_level text,
  field_name      text,
  school_name     text,
  about           text,
  skills          jsonb,
  photo_url       text,
  cv_updated_at   timestamptz,
  total_count     bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_emp uuid := auth.uid();
  v_total bigint;
begin
  -- Yetki kapısı: admin onayı olmadan havuz görünmez
  if not exists (
    select 1 from public.pool_access_permissions
    where profile_id = v_emp and granted is true
  ) then
    raise exception 'HAVUZ_ERISIM_YOK';
  end if;

  select count(*) into v_total
  from public.student_cvs sc
  where (p_field is null or sc.field_name = p_field)
    and (p_city is null or sc.city = p_city)
    and (p_edu is null or sc.education_level = p_edu)
    and (p_skill is null or btrim(p_skill) = '' or sc.skills::text ilike '%' || btrim(p_skill) || '%');

  return query
  select
    sc.profile_id,
    case when pu.id is not null then sc.full_name else public.mask_name(sc.full_name) end,
    pu.id is not null,
    case when pu.id is not null then sc.full_name else null end,
    case when pu.id is not null then sc.phone else null end,
    case when pu.id is not null then sc.email else null end,
    sc.city,
    sc.education_level,
    sc.field_name,
    sc.school_name,
    case when pu.id is not null then sc.about else left(coalesce(sc.about, ''), 140) end,
    case when pu.id is not null then sc.skills else '[]'::jsonb end,
    case when pu.id is not null then sc.photo_url else null end,
    sc.updated_at,
    v_total
  from public.student_cvs sc
  left join public.pool_unlocks pu
    on pu.student_id = sc.profile_id and pu.employer_id = v_emp
  where (p_field is null or sc.field_name = p_field)
    and (p_city is null or sc.city = p_city)
    and (p_edu is null or sc.education_level = p_edu)
    and (p_skill is null or btrim(p_skill) = '' or sc.skills::text ilike '%' || btrim(p_skill) || '%')
  order by sc.updated_at desc
  limit least(coalesce(p_limit, 24), 60)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

-- == ARAMA RPC SONU ==

-- ------------------------------------------------------------
-- ADAY AÇMA (atomik): erişim + bakiye kontrolü, 1 kontör düşme,
-- hareket kaydı ve unlock tek transaction'da. Hata olursa bakiye geri döner.
-- Aynı aday ikinci kez ÜCRETSİZ görüntülenebilir (pool_unlocks tekil).
-- ------------------------------------------------------------
create or replace function public.unlock_pool_student(p_student uuid)
returns table (ok boolean, message text, remaining integer, student jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_emp uuid := auth.uid();
  v_bal integer;
  v_cv public.student_cvs%rowtype;
begin
  -- Yetki kapısı
  if not exists (
    select 1 from public.pool_access_permissions
    where profile_id = v_emp and granted is true
  ) then
    return query select false, 'Havuz erişim yetkiniz yok.', 0, null::jsonb;
    return;
  end if;

  -- Zaten açılmışsa ücretsiz
  if exists (
    select 1 from public.pool_unlocks
    where employer_id = v_emp and student_id = p_student
  ) then
    select * into v_cv from public.student_cvs where profile_id = p_student;
    select balance into v_bal from public.employer_credits where profile_id = v_emp;
    return query select true, 'Bu adayı daha önce açtınız — görüntüleme ücretsiz.',
                     coalesce(v_bal, 0), to_jsonb(v_cv);
    return;
  end if;

  -- Bakiye kilitle (for update) ve kontrol et
  select balance into v_bal
  from public.employer_credits
  where profile_id = v_emp
  for update;

  if v_bal is null then
    return query select false, 'Kontör kaydınız bulunmuyor. Yöneticinizle iletişime geçin.', 0, null::jsonb;
    return;
  elsif v_bal < 1 then
    return query select false, 'Kontörünüz yetersiz. Yöneticinizden kontör yüklemesini isteyin.', v_bal, null::jsonb;
    return;
  end if;

  -- 1 kontör düş + hareketi yaz + adayı aç (hepsi bu transaction içinde)
  update public.employer_credits
    set balance = balance - 1, updated_at = now()
    where profile_id = v_emp;

  insert into public.credit_transactions (employer_id, amount, kind, related_student, note)
    values (v_emp, -1, 'pool_unlock', p_student, 'Havuzdan aday profili açıldı');

  insert into public.pool_unlocks (employer_id, student_id, cv_id)
    values (v_emp, p_student, (select id from public.student_cvs where profile_id = p_student));

  select * into v_cv from public.student_cvs where profile_id = p_student;
  return query select true, 'Aday profili açıldı (1 kontör harcandı).', v_bal - 1, to_jsonb(v_cv);
end;
$$;

-- == UNLOCK RPC SONU ==

-- ============================================================
-- ADMIN RPC'leri — hepsi is_admin() kapısıyla korunur.
-- (SECURITY DEFINER RLS bypass eder; admin kontrolü ŞART)
-- ============================================================

-- Admin: işverene kontör yükle (pozitif) / düş (negatif)
create or replace function public.admin_add_credits(
  p_employer uuid,
  p_amount   integer,
  p_note     text default null
)
returns table (ok boolean, message text, new_balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bal integer;
begin
  if not public.is_admin() then
    return query select false, 'Bu işlem için yönetici yetkiniz yok.', 0;
    return;
  end if;

  if p_amount = 0 then
    return query select false, 'Kontör miktarı sıfır olamaz.', 0;
    return;
  end if;

  if not exists (select 1 from public.profiles where id = p_employer) then
    return query select false, 'İşveren bulunamadı.', 0;
    return;
  end if;

  -- Bakiye satırı yoksa oluştur
  insert into public.employer_credits (profile_id, balance)
  values (p_employer, 0)
  on conflict (profile_id) do nothing;

  select balance into v_bal
  from public.employer_credits
  where profile_id = p_employer
  for update;

  if v_bal + p_amount < 0 then
    return query select false, 'Bakiye eksiye düşemez (mevcut: ' || v_bal || ').', v_bal;
    return;
  end if;

  update public.employer_credits
    set balance = balance + p_amount, updated_at = now()
    where profile_id = p_employer;

  insert into public.credit_transactions (employer_id, amount, kind, note)
    values (p_employer, p_amount, 'admin_grant', coalesce(p_note, 'Yönetici yüklemesi'));

  return query select true, 'Kontör işlemi tamamlandı.', v_bal + p_amount;
end;
$$;

-- Admin: işverene havuz erişim yetkisi ver / kaldır
create or replace function public.admin_set_pool_access(
  p_employer uuid,
  p_granted  boolean,
  p_note     text default null
)
returns table (ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return query select false, 'Bu işlem için yönetici yetkiniz yok.';
    return;
  end if;

  if not exists (select 1 from public.profiles where id = p_employer) then
    return query select false, 'İşveren bulunamadı.';
    return;
  end if;

  insert into public.pool_access_permissions (profile_id, granted, granted_at, granted_by, note)
  values (p_employer, p_granted,
          case when p_granted then now() else null end,
          auth.uid(), p_note)
  on conflict (profile_id) do update
    set granted = excluded.granted,
        granted_at = excluded.granted_at,
        granted_by = excluded.granted_by,
        note = coalesce(excluded.note, public.pool_access_permissions.note);

  return query select true,
    case when p_granted then 'Havuz erişimi verildi.' else 'Havuz erişimi kaldırıldı.' end;
end;
$$;

-- == ADMIN RPC 1 SONU ==

-- Admin: işveren listesi (firma, bakiye, havuz yetkisi)
create or replace function public.admin_list_employers(p_search text default null)
returns table (
  profile_id   uuid,
  full_name    text,
  email        text,
  company_name text,
  city         text,
  balance      integer,
  pool_granted boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.full_name,
    u.email,
    cd.company_name,
    cd.city,
    coalesce(ec.balance, 0),
    coalesce(pap.granted, false)
  from public.profiles p
  left join auth.users u on u.id = p.id
  left join public.company_details cd on cd.profile_id = p.id
  left join public.employer_credits ec on ec.profile_id = p.id
  left join public.pool_access_permissions pap on pap.profile_id = p.id
  where public.is_admin()
    and p.user_type = 'employer'
    and (p_search is null or btrim(p_search) = ''
         or p.full_name ilike '%' || btrim(p_search) || '%'
         or coalesce(cd.company_name, '') ilike '%' || btrim(p_search) || '%'
         or coalesce(u.email, '') ilike '%' || btrim(p_search) || '%')
  order by coalesce(pap.granted, false) desc,
           coalesce(ec.balance, 0) desc,
           coalesce(cd.company_name, p.full_name) asc
  limit 200;
$$;

-- Admin: son kontör hareketleri
create or replace function public.admin_credit_history(p_limit integer default 50)
returns table (
  tx_id      uuid,
  employer   text,
  company    text,
  amount     integer,
  kind       text,
  note       text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ct.id,
    coalesce(p.full_name, ct.employer_id::text),
    coalesce(cd.company_name, ''),
    ct.amount,
    ct.kind,
    ct.note,
    ct.created_at
  from public.credit_transactions ct
  left join public.profiles p on p.id = ct.employer_id
  left join public.company_details cd on cd.profile_id = ct.employer_id
  where public.is_admin()
  order by ct.created_at desc
  limit greatest(coalesce(p_limit, 50), 1);
$$;

-- ============================================================
-- 5) ADMIN PANEL OKUMA/YAZMA İZİNLERİ — is_admin bayraklı hesap,
--    /admin panelinde tüm ilan/işletme/öğrenci/başvuru kayıtlarını
--    görür, ilanları aktif/pasif yapar ve silebilir.
--    (RLS "OR" mantığıyla çalışır — mevcut politikalara dokunmaz.)
-- ============================================================
alter table public.job_posts enable row level security;
drop policy if exists "admin ilanlari okur" on public.job_posts;
create policy "admin ilanlari okur"
  on public.job_posts for select to authenticated
  using (public.is_admin());

drop policy if exists "admin ilan gunceller" on public.job_posts;
create policy "admin ilan gunceller"
  on public.job_posts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin ilan siler" on public.job_posts;
create policy "admin ilan siler"
  on public.job_posts for delete to authenticated
  using (public.is_admin());

alter table public.company_details enable row level security;
drop policy if exists "admin isletmeleri okur" on public.company_details;
create policy "admin isletmeleri okur"
  on public.company_details for select to authenticated
  using (public.is_admin());

alter table public.student_profiles enable row level security;
drop policy if exists "admin ogrencileri okur" on public.student_profiles;
create policy "admin ogrencileri okur"
  on public.student_profiles for select to authenticated
  using (public.is_admin());

alter table public.applications enable row level security;
drop policy if exists "admin basvurulari okur" on public.applications;
create policy "admin basvurulari okur"
  on public.applications for select to authenticated
  using (public.is_admin());

-- ============================================================
-- ADMİN HESABI: enesg / Enes5050
-- 1) Supabase Dashboard → Authentication → Users → "Add user"
--    E-posta: enesg@stajyeri.net    Şifre: Enes5050    Auto Confirm: ✅
-- 2) Aşağıdaki update bloğu hesabı yönetici yapar. Kullanıcı henüz
--    oluşturulmadıysa 0 satır etkiler; kullanıcıyı oluşturduktan
--    sonra yalnızca bu bloğu tekrar çalıştırın.
-- ============================================================
update public.profiles
   set is_admin = true
 where id = (select id from auth.users where email = 'enesg@stajyeri.net');

-- Profil satırı hiç oluşmadıysa (girişte otomatik oluşmuyorsa) şunu da çalıştırın:
-- insert into public.profiles (id, user_type, full_name)
-- select u.id, 'employer', 'Yönetici'
--   from auth.users u
--  where u.email = 'enesg@stajyeri.net'
--    and not exists (select 1 from public.profiles p where p.id = u.id);

-- ============================================================
-- DOĞRULAMA — Run sonrası bu sorgu 8 satır dönmeli:
-- ============================================================
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'is_admin', 'mask_name', 'search_student_pool', 'unlock_pool_student',
    'admin_add_credits', 'admin_set_pool_access', 'admin_list_employers',
    'admin_credit_history'
  )
order by routine_name;

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: havuz_bildirim.sql
-- ════════════════════════════════════════════════════════════

-- ============================================================
-- STAJYERI.NET | HAVUZ & KONTÖR BİLDİRİM ENTEGRASYONU
-- Admin havuz yetkisi verince / kontör yükleyince işverene
-- bildirim düşer (bildirimler sekmesi + üst menü zili).
-- Gereklilik: create_notification (ileri_paket.sql) — çalıştırılmış olmalı.
-- Çalıştır: SQL Editor → tamamını yapıştır → Run (idempotent)
-- ============================================================

-- 1) Admin havuz yetkisi verir/kaldırır + işverene bildirim
create or replace function public.admin_set_pool_access(
  p_employer uuid,
  p_granted  boolean,
  p_note     text default null
)
returns table (ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return query select false, 'Bu işlem için yönetici yetkiniz yok.';
    return;
  end if;

  if not exists (select 1 from public.profiles where id = p_employer) then
    return query select false, 'İşveren bulunamadı.';
    return;
  end if;

  insert into public.pool_access_permissions (profile_id, granted, granted_at, granted_by, note)
  values (p_employer, p_granted,
          case when p_granted then now() else null end,
          auth.uid(), p_note)
  on conflict (profile_id) do update
    set granted = excluded.granted,
        granted_at = excluded.granted_at,
        granted_by = excluded.granted_by,
        note = coalesce(excluded.note, public.pool_access_permissions.note);

  perform public.create_notification(
    p_employer, 'pool',
    case when p_granted then 'Stajyer Havuzu erişiminiz açıldı 🎓' else 'Stajyer Havuzu erişiminiz kapatıldı' end,
    case when p_granted
      then 'İşveren panelinizden maskeli öğrenci profillerini inceleyebilir, beğendiğiniz adayı kontörle açabilirsiniz.'
      else 'Havuz erişiminiz yönetici tarafından kapatıldı. Detay için site yönetimiyle iletişime geçin.'
    end,
    '/isveren/panel'
  );

  return query select true,
    case when p_granted then 'Havuz erişimi verildi.' else 'Havuz erişimi kaldırıldı.' end;
end;
$$;

-- 2) Admin kontör yükler/düşer + yüklemede işverene bildirim
create or replace function public.admin_add_credits(
  p_employer uuid,
  p_amount   integer,
  p_note     text default null
)
returns table (ok boolean, message text, new_balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bal integer;
begin
  if not public.is_admin() then
    return query select false, 'Bu işlem için yönetici yetkiniz yok.', 0;
    return;
  end if;

  if p_amount = 0 then
    return query select false, 'Kontör miktarı sıfır olamaz.', 0;
    return;
  end if;

  if not exists (select 1 from public.profiles where id = p_employer) then
    return query select false, 'İşveren bulunamadı.', 0;
    return;
  end if;

  -- Bakiye satırı yoksa oluştur
  insert into public.employer_credits (profile_id, balance)
  values (p_employer, 0)
  on conflict (profile_id) do nothing;

  select balance into v_bal
  from public.employer_credits
  where profile_id = p_employer
  for update;

  if v_bal + p_amount < 0 then
    return query select false, 'Bakiye eksiye düşemez (mevcut: ' || v_bal || ').', v_bal;
    return;
  end if;

  update public.employer_credits
    set balance = balance + p_amount, updated_at = now()
    where profile_id = p_employer;

  insert into public.credit_transactions (employer_id, amount, kind, note)
    values (p_employer, p_amount, 'admin_grant', coalesce(p_note, 'Yönetici yüklemesi'));

  if p_amount > 0 then
    perform public.create_notification(
      p_employer, 'pool',
      'Hesabınıza ' || p_amount || ' kontör yüklendi 💰',
      'Yeni bakiyeniz: ' || (v_bal + p_amount) || ' kontör. İşveren panelinizden Stajyer Havuzu''nu kullanabilirsiniz.',
      '/isveren/panel'
    );
  end if;

  return query select true, 'Kontör işlemi tamamlandı.', v_bal + p_amount;
end;
$$;

-- DOĞRULAMA — 2 satır dönmeli
select routine_name from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('admin_set_pool_access', 'admin_add_credits')
order by routine_name;

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: vitrin_logo_cv_guncellemesi.sql
-- ════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════
-- ══ DOSYA: is_alarmi_tetik.sql
-- ════════════════════════════════════════════════════════════

-- ============================================================
-- STAJYERI.NET | İŞ ALARMI BİLDİRİM TETİKLEYİCİSİ
--
-- NASIL ÇALIŞTIRILIR:
--   1. https://supabase.com/dashboard adresine girin
--   2. Projeyi seçin -> sol menüden "SQL Editor" açın
--   3. Bu dosyanın tamamını yapıştırıp "Run" butonuna basın
--
-- NE YAPAR:
--   job_alerts tablosundaki kriterlere (alan + şehir) uyan tüm
--   öğrencilere, yeni ilan yayınlandığında bildirim düşürür.
--   İlan-ver sayfası yayın sonrası notify_job_alerts RPC'sini
--   çağırır; RPC henüz kurulmadıysa ilan akışı etkilenmez.
-- Idempotenttir.
-- ============================================================

create or replace function public.notify_job_alerts(
  p_job_id uuid,
  p_field text,
  p_city text,
  p_owner_profile uuid
) returns int
language plpgsql
security definer
set search_path = public as $$
declare
  v_title text;
  v_count int;
begin
  -- Yalnızca ilanın sahibi işletme (authenticated) çağırabilsin
  if not exists (
    select 1
    from public.job_posts j
    join public.company_details cd on cd.id = j.company_id
    where j.id = p_job_id
      and cd.profile_id = auth.uid()
  ) then
    return 0;
  end if;

  select j.title into v_title
  from public.job_posts j
  where j.id = p_job_id;

  insert into public.notifications (profile_id, type, title, body, link)
  select
    sp.profile_id,
    'alert',
    '🔔 Alarmlarında yeni ilan var',
    coalesce(v_title, 'Yeni ilan') || ' — ' || coalesce(p_field, 'Tüm alanlar')
      || coalesce(' • ' || p_city, ''),
    '/ilan/' || p_job_id
  from public.student_profiles sp
  join public.job_alerts ja on ja.student_id = sp.id
  where sp.profile_id <> coalesce(p_owner_profile, sp.profile_id)
    and (ja.field_name is null or ja.field_name = p_field)
    and (ja.city is null or ja.city = p_city)
    -- Aynı ilan için mükerrer bildirim atma
    and not exists (
      select 1 from public.notifications n
      where n.profile_id = sp.profile_id
        and n.link = '/ilan/' || p_job_id
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.notify_job_alerts(uuid, text, text, uuid) to authenticated;

comment on function public.notify_job_alerts(uuid, text, text, uuid) is
  'İş alarmı kriterlerine uyan öğrencilere yeni ilan bildirimi gönderir (security definer).';
