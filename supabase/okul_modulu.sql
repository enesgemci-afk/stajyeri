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


