// Inceleme: ilan-ver + cv-olustur + ilanlar + SQL (salt okuma)
import fs from 'fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const show = (path, anchor, before, after, label) => {
  const all = read(path).split('\n');
  const idx = all.findIndex((l) => l.includes(anchor));
  console.log('--- ' + label + ' (satir ' + (idx + 1) + ') ---');
  if (idx === -1) { console.log('ANCHOR YOK: ' + anchor); return; }
  console.log(all.slice(Math.max(0, idx - before), idx + after).join('\n'));
};

// ilan-ver: state tanimlari, form UI (logo yeri), insert bolgesi
show('app/ilan-ver/page.tsx', "useState", 0, 2, 'ILANVER STATE BASLANGICI');
show('app/ilan-ver/page.tsx', "from('job_posts')", 30, 18, 'ILANVER INSERT');
show('app/ilan-ver/page.tsx', "İşin Tanımı", 2, 14, 'ILANVER TANIM UI');
show('app/ilan-ver/page.tsx', "has_shuttle", 12, 8, 'ILANVER CHECKBOX');
show('app/ilan-ver/page.tsx', "handleShowMore", 0, 14, 'ILANVER SHOWMORE');

// cv-olustur: state, handleSave, preview basi
show('app/cv-olustur/page.tsx', "interface", 0, 20, 'CV INTERFACE');
show('app/cv-olustur/page.tsx', "handleSave", 2, 40, 'CV SAVE');
show('app/cv-olustur/page.tsx', "cv-print", 4, 26, 'CV PREVIEW BASI');

// ilanlar: searchParams durumu
const ilanlar = read('app/ilanlar/page.tsx');
console.log('=== ILANLAR ===');
console.log('useSearchParams:', ilanlar.includes('useSearchParams') ? 'VAR' : 'YOK');
console.log('alan okuma:', /["'`]alan["'`]/.test(ilanlar) ? 'VAR' : 'YOK');

// SQL: bucket isimleri
const sql = read('supabase/vitrin_logo_cv_guncellemesi.sql');
console.log('=== SQL BUCKETS ===');
const bucketMatches = sql.match(/'[^']*bucket[^']*'/gi) || sql.match(/insert into storage[^\n]*/gi) || [];
console.log(bucketMatches.join('\n') || '(bucket insert gormedi)');
console.log('bucket id satirlari:', (sql.match(/id\s*,\s*name|values\s*\(/gi) || []).length);
console.log(sql.split('\n').filter(l => /bucket|values|logolar|cv-foto|photo_url|logo_url/.test(l)).slice(0, 20).join('\n'));

// JobCard: logo props
const jc = read('components/JobCard.tsx');
console.log('=== JOBCARD LOGO ===');
console.log(jc.split('\n').filter(l => /logo|img|initial|company_name/.test(l)).slice(0, 12).join('\n'));
