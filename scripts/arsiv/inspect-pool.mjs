// Havuz & Kontör sistemi için canlı şema probe'u (salt okuma)
// Yontem: tabloya "select=kolon" sorgusu; kolon yoksa PGRST204, varsa hata vermez
// Kullanim: node scripts/inspect-pool.mjs

const SUPABASE_URL = 'https://eftlmmunitzrnfenqlbv.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdGxtbXVuaXR6cm5mZW5xbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTUwODIsImV4cCI6MjEwMzIzMTA4Mn0.CNoopOgA0URXk8uWXdrWDVJJQQFjPcRuZImfingGFvc';

async function checkColumn(table, column) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${column}&limit=1`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    if (r.ok) return 'VAR';
    const body = await r.json().catch(() => ({}));
    if (/could not find the .*column|PGRST204/i.test(body.message || '')) return 'YOK';
    return `? ${r.status} ${(body.message || '').slice(0, 60)}`;
  } catch (e) {
    return `HATA: ${e.message}`;
  }
}

async function main() {
  const probes = [
    ['student_cvs', 'profile_id'],
    ['student_cvs', 'full_name'],
    ['student_cvs', 'phone'],
    ['student_cvs', 'email'],
    ['student_cvs', 'city'],
    ['student_cvs', 'education_level'],
    ['student_cvs', 'field_name'],
    ['student_cvs', 'school_name'],
    ['student_cvs', 'about'],
    ['student_cvs', 'skills'],
    ['student_cvs', 'experiences'],
    ['student_cvs', 'photo_url'],
    ['profiles', 'user_type'],
    ['profiles', 'full_name'],
    ['profiles', 'created_at'],
    ['student_profiles', 'field_name'],
    ['student_profiles', 'school_name'],
    ['student_profiles', 'city'],
    ['student_profiles', 'education_level'],
    ['student_profiles', 'birth_year'],
    ['company_details', 'profile_id'],
    ['company_details', 'company_name'],
  ];
  for (const [t, c] of probes) {
    console.log(`${t}.${c} : ${await checkColumn(t, c)}`);
  }
}

main();

