// vitrin_logo_cv_guncellemesi.sql'in canlı Supabase'e uygulandigini dogrular (salt okuma)
// Yontem:
//   - Kolonlar: tabloya "select=kolon" sorgusu atilir; kolon yoksa PostgREST PGRST204 verir,
//     kolon varsa (RLS satir filtrelese bile) hata vermez.
//   - Bucket'lar: public obje URL'sinde bucket yoksa "Bucket not found",
//     bucket var ama obje yoksa "Object not found" doner.
// Kullanim: node scripts/verify-sql.mjs

const SUPABASE_URL = 'https://eftlmmunitzrnfenqlbv.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdGxtbXVuaXR6cm5mZW5xbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTUwODIsImV4cCI6MjEwMzIzMTA4Mn0.CNoopOgA0URXk8uWXdrWDVJJQQFjPcRuZImfingGFvc';

async function checkColumn(table, column) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${column}&limit=1`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    if (r.ok) return 'VAR ✓ (200)';
    const body = await r.json().catch(() => ({}));
    if (/could not find the .*column|PGRST204/i.test(body.message || '')) return 'YOK ✗ (kolon bulunamadi)';
    return `SORGUSU: ${r.status} ${body.message || ''}`;
  } catch (e) {
    return `HATA: ${e.message}`;
  }
}

async function checkBucket(bucket) {
  try {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${bucket}/probe.png`);
    const body = await r.json().catch(() => ({}));
    const msg = body.message || String(r.status);
    if (/bucket not found/i.test(msg)) return `YOK ✗ (${msg})`;
    if (/object not found|not found/i.test(msg)) return 'VAR ✓ (bucket acik, obje yok — normal)';
    return `${r.status} ${msg}`;
  } catch (e) {
    return `HATA: ${e.message}`;
  }
}

// Guven skorunu get_company_trust_scores RPC'si uzerinden kontrol eder (view kaldirildi)
async function checkRpc(fn) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_company_id: null }),
    });
    if (r.ok) return 'VAR ✓ (200)';
    const body = await r.json().catch(() => ({}));
    if (r.status === 404 || /does not exist/i.test(body.message || ''))
      return 'YOK ✗ (fonksiyon bulunamadi)';
    return `SORGUSU: ${r.status} ${body.message || ''}`;
  } catch (e) {
    return `HATA: ${e.message}`;
  }
}

async function main() {
  console.log('=== KOLON KONTROLU (vitrin SQL) ===');
  console.log('company_details.logo_url  :', await checkColumn('company_details', 'logo_url'));
  console.log('company_details.logo_color:', await checkColumn('company_details', 'logo_color'));
  console.log('job_posts.wage_info       :', await checkColumn('job_posts', 'wage_info'));
  console.log('student_cvs.photo_url     :', await checkColumn('student_cvs', 'photo_url'));

  console.log('=== KOLON KONTROLU (guven katmani SQL) ===');
  console.log('applications.guardian_status:', await checkColumn('applications', 'guardian_status'));
  console.log('applications.birth_year     :', await checkColumn('applications', 'birth_year'));
  console.log('guardian_consents.guardian_name:', await checkColumn('guardian_consents', 'guardian_name'));
  console.log('trainer_ratings.education_quality:', await checkColumn('trainer_ratings', 'education_quality'));
  console.log('simulator_leads.company_name  :', await checkColumn('simulator_leads', 'company_name'));
  console.log('get_company_trust_scores RPC :', await checkRpc('get_company_trust_scores'));

  console.log('=== BUCKET KONTROLU ===');
  console.log('company-logos :', await checkBucket('company-logos'));
  console.log('cv-photos     :', await checkBucket('cv-photos'));
}

main();
