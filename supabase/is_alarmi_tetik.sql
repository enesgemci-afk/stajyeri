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
