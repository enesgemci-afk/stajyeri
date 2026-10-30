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
