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
