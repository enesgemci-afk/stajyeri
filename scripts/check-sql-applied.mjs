// ============================================================
// SQL UYGULAMA KONTROLÜ — supabase/*.sql dosyalarının canlı
// veritabanında kurulu olup olmadığını (salt okuma) denetler.
// Yöntem: PostgREST OpenAPI şeması (/rest/v1/) tüm tabloları ve
// RPC fonksiyonlarını listeler — tek istekle tam resim.
// Kullanım: node scripts/check-sql-applied.mjs
// ============================================================

const SUPABASE_URL = 'https://eftlmmunitzrnfenqlbv.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdGxtbXVuaXR6cm5mZW5xbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTUwODIsImV4cCI6MjEwMzIzMTA4Mn0.CNoopOgA0URXk8uWXdrWDVJJQQFjPcRuZImfingGFvc';

/** Her migration dosyasının oluşturduğu ana artefaktlar */
const MIGRATIONS = [
  { file: 'applications_table.sql', tables: ['applications'], rpcs: [] },
  { file: 'favorites_table.sql', tables: ['favorites', 'job_alerts'], rpcs: [] },
  { file: 'student_cvs.sql', tables: ['student_cvs'], rpcs: [] },
  {
    file: 'guven_katmani.sql',
    tables: ['guardian_consents', 'trainer_ratings', 'simulator_leads'],
    rpcs: ['get_guardian_consent', 'approve_guardian_consent', 'get_company_trust_scores'],
  },
  { file: 'veli_onay_fix.sql', tables: [], rpcs: ['get_guardian_consent'] },
  {
    file: 'okul_modulu.sql',
    tables: ['school_profiles'],
    rpcs: ['public_school_list', 'school_panel_data', 'admin_list_schools', 'admin_set_school_verified'],
  },
  {
    file: 'ileri_paket.sql',
    tables: ['notifications', 'staj_entries', 'newsletter_subscribers'],
    rpcs: [
      'create_notification',
      'admin_set_premium',
      'get_company_response_time',
      'notify_employer_new_application',
      'notify_application_status',
      'admin_list_premium',
    ],
  },
  {
    file: 'havuz_kredi.sql',
    tables: ['employer_credits', 'pool_access_permissions', 'credit_transactions', 'pool_unlocks'],
    rpcs: [
      'is_admin',
      'mask_name',
      'search_student_pool',
      'unlock_pool_student',
      'admin_add_credits',
      'admin_set_pool_access',
      'admin_list_employers',
      'admin_credit_history',
    ],
  },
  { file: 'havuz_bildirim.sql', tables: [], rpcs: ['admin_set_pool_access', 'admin_add_credits'] },
  { file: 'vitrin_logo_cv_guncellemesi.sql', tables: [], rpcs: [], columns: { company_details: ['logo_url', 'logo_color'] } },
  { file: 'is_alarmi_tetik.sql', tables: [], rpcs: ['notify_job_alerts'] },
];

async function main() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!r.ok) {
    console.error('Şema alınamadı:', r.status);
    process.exit(1);
  }
  const spec = await r.json();
  const paths = Object.keys(spec.paths || {});
  const tables = new Set(paths.filter((p) => p.startsWith('/') && !p.startsWith('/rpc/')).map((p) => p.slice(1)));
  const rpcs = new Set(paths.filter((p) => p.startsWith('/rpc/')).map((p) => p.slice(5)));

  console.log(`Canlı DB: ${tables.size} tablo, ${rpcs.size} RPC fonksiyonu görünüyor.\n`);

  let anyMissing = false;
  for (const m of MIGRATIONS) {
    const missingT = m.tables.filter((t) => !tables.has(t));
    const missingR = m.rpcs.filter((f) => !rpcs.has(f));

    let missingC = [];
    for (const [tbl, cols] of Object.entries(m.columns || {})) {
      if (!tables.has(tbl)) { missingC.push(`${tbl}.?`); continue; }
      for (const c of cols) {
        try {
          const cr = await fetch(`${SUPABASE_URL}/rest/v1/${tbl}?select=${c}&limit=1`, {
            headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
          });
          if (!cr.ok) missingC.push(`${tbl}.${c}`);
        } catch {
          missingC.push(`${tbl}.${c}`);
        }
      }
    }

    const ok = missingT.length === 0 && missingR.length === 0 && missingC.length === 0;
    const state = ok ? '✔ KURULU' : '✘ EKSİK';
    if (!ok) anyMissing = true;

    console.log(`${state}  ${m.file}`);
    if (missingT.length) console.log(`     eksik tablolar : ${missingT.join(', ')}`);
    if (missingR.length) console.log(`     eksik fonksiyon: ${missingR.join(', ')}`);
    if (missingC.length) console.log(`     eksik kolonlar : ${missingC.join(', ')}`);
  }

  console.log('');
  console.log(anyMissing ? '>>> EKSİK migration var — yukarıdaki dosyaları Supabase SQL Editor ile çalıştır.' : '>>> Tüm migration dosyaları canlı veritabanında kurulu görünüyor.');
}

main();
