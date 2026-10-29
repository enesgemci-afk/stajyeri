// STAJYERI.NET — Canlı yayın & veritabanı sağlık kontrolü
// Kullanım: node scripts/verify-live.mjs
// Ne yapar:
//   1) Önemli sayfaların HTTP durumunu kontrol eder
//   2) Son özelliklerin (havuz-kredi, veli onayı, güven skoru RPC, admin eşleme)
//      canlı JS chunk'larında fiziksel olarak var olduğunu doğrular
//   3) Supabase tablo ve RPC'lerinin canlıda ayakta olduğunu doğrular
//      (SQL'ler çalıştırılmamışsa "YOK!" der)

const SITE = 'https://stajyeri.vercel.app';
const SB = 'https://eftlmmunitzrnfenqlbv.supabase.co';
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdGxtbXVuaXR6cm5mZW5xbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTUwODIsImV4cCI6MjEwMzIzMTA4Mn0.CNoopOgA0URXk8uWXdrWDVJJQQFjPcRuZImfingGFvc';

const ok = (s) => console.log('  OK   ' + s);
const bad = (s) => console.log('  YOK! ' + s);

async function status(url) {
  try {
    const r = await fetch(url, { redirect: 'manual' });
    return r.status;
  } catch {
    return 0;
  }
}

async function pageChunks(path) {
  try {
    const html = await (await fetch(SITE + path)).text();
    return [...new Set([...html.matchAll(/src="(\/_next\/[^"]+\.js)"/g)].map((m) => m[1]))];
  } catch {
    return [];
  }
}

async function chunkHas(path, needles) {
  const chunks = await pageChunks(path);
  const state = Object.fromEntries(needles.map((n) => [n, false]));
  for (const c of chunks) {
    try {
      const js = await (await fetch(SITE + c)).text();
      for (const n of needles) if (!state[n] && js.includes(n)) state[n] = true;
    } catch {}
  }
  return state;
}

async function tableExists(t) {
  try {
    const r = await fetch(`${SB}/rest/v1/${t}?select=*&limit=1`, {
      headers: { apikey: ANON, Authorization: 'Bearer ' + ANON },
    });
    if (r.status === 200) return true; // RLS açik, boş döndü
    const body = await r.text();
    if (r.status === 401 || r.status === 403 || r.status === 42501) return true; // RLS engelledi
    if (body.includes('PGRST205') || body.includes('does not exist')) return false;
    return r.status < 500;
  } catch {
    return false;
  }
}

async function rpcExists(name, args) {
  try {
    const r = await fetch(`${SB}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify(args ?? {}),
    });
    return r.status === 200 || r.status === 204;
  } catch {
    return false;
  }
}

console.log('=== 1) SAYFALAR ===');
for (const p of [
  '/',
  '/ilanlar',
  '/alan-secim',
  '/cv-olustur',
  '/rehber/mulakat-sorulari',
  '/rehber/onyazi',
  '/tesvik-simulasyon',
  '/veli-onay/test-token',
  '/admin',
  '/admin/havuz',
  '/isveren/panel',
  '/ilan-ver',
  '/imep',
  '/tesvik-rehberi',
]) {
  const s = await status(SITE + p);
  s === 200 ? ok(s + '  ' + p) : bad(s + '  ' + p);
}

console.log('=== 2) CANLI KOD (chunk taraması) ===');
let t = await chunkHas('/isveren/panel', ['search_student_pool', 'unlock_pool_student']);
for (const [k, v] of Object.entries(t)) v ? ok(`isveren/panel → ${k}`) : bad(`isveren/panel → ${k}`);
t = await chunkHas('/admin', ['@stajyeri.net', 'is_admin']);
for (const [k, v] of Object.entries(t)) v ? ok(`admin → ${k}`) : bad(`admin → ${k}`);

// Güven skoru RPC'si ilan DETAY sayfasında — canlıdan gerçek ilan id al
let detailOk = false;
try {
  const r = await fetch(`${SB}/rest/v1/job_posts?select=id&limit=1`, {
    headers: { apikey: ANON, Authorization: 'Bearer ' + ANON },
  });
  const rows = await r.json();
  if (Array.isArray(rows) && rows[0]?.id) {
    const res = await chunkHas(`/ilan/${rows[0].id}`, ['get_company_trust_scores']);
    detailOk = res['get_company_trust_scores'];
  }
} catch {}
detailOk ? ok('ilan detay → get_company_trust_scores') : bad('ilan detay → get_company_trust_scores');

console.log('=== 3) SUPABASE TABLOLARI ===');
for (const tb of [
  'employer_credits',
  'pool_access_permissions',
  'credit_transactions',
  'pool_unlocks',
  'guardian_consents',
  'trainer_ratings',
  'simulator_leads',
  'student_cvs',
]) {
  (await tableExists(tb)) ? ok(tb) : bad(tb + ' (SQL çalıştırılmamış)');
}

console.log('=== 4) SUPABASE RPC ===');
(await rpcExists('get_company_trust_scores')) ? ok('get_company_trust_scores') : bad('get_company_trust_scores');
(await rpcExists('get_guardian_consent', { p_token: 'test-token' }))
  ? ok('get_guardian_consent')
  : bad('get_guardian_consent');
(await rpcExists('approve_guardian_consent', { p_token: 'x', p_decision: 'approve' }))
  ? ok('approve_guardian_consent')
  : bad('approve_guardian_consent');

console.log('=== BITTI ===');
