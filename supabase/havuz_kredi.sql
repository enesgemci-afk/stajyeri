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