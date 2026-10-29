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
