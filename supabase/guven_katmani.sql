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
    coalesce(sp.full_name, 'Öğrenci') as student_name,
    jp.title as job_title,
    cd.company_name,
    jp.city as job_city
  into v_rec
  from public.guardian_consents gc
  join public.applications a on a.id = gc.application_id
  join public.student_profiles sp on sp.id = gc.student_id
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
-- MODÜL 2b: company_trust_scores — Güven Skoru görünümü
--   Ağırlıklar: %35 eğitim, %30 güvenlik, %25 saygı, %10 ücret düzeni
--   Rozet: >=3 puan & >=4.5 GOLD | >=4.0 SILVER | >=3.5 BRONZE
-- ------------------------------------------------------------
create or replace view public.company_trust_scores as
with agg as (
  select
    company_id,
    count(*) as rating_count,
    avg(0.35 * education_quality + 0.30 * safety + 0.25 * respect + 0.10 * wage_order) as raw_score
  from public.trainer_ratings
  group by company_id
)
select
  cd.id as company_id,
  round(coalesce(agg.raw_score, 0)::numeric, 2) as trust_score,
  coalesce(agg.rating_count, 0) as rating_count,
  case
    when coalesce(agg.rating_count, 0) >= 3 and coalesce(agg.raw_score, 0) >= 4.5 then 'gold'
    when coalesce(agg.rating_count, 0) >= 3 and coalesce(agg.raw_score, 0) >= 4.0 then 'silver'
    when coalesce(agg.rating_count, 0) >= 3 and coalesce(agg.raw_score, 0) >= 3.5 then 'bronze'
    else 'none'
  end as badge
from public.company_details cd
left join agg on agg.company_id = cd.id;

-- Toplu skor herkese açık (bireysel puanlar kapalı kalır)
grant select on public.company_trust_scores to anon, authenticated;

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
  to_regclass('public.simulator_leads')      as simulator_leads,
  to_regclass('public.company_trust_scores') as trust_scores_view;