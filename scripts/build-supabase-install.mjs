// ============================================================
// supabase/00_install_all.sql ÜRETİCİ
//   Sıralı modül listesindeki tüm SQL dosyalarını tek kurulum
//   script'inde birleştirir. Supabase SQL Editor'e 00_install_all
//   dosyasını yapıştırmak tüm modülleri sırayla kurar.
//
// Çalıştır:  node scripts/build-supabase-install.mjs
// Yeni modül eklerken ORDER listesine ekle ve yeniden üret.
// ============================================================

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPA_DIR = join(__dirname, '..', 'supabase');
const OUT_FILE = join(SUPA_DIR, '00_install_all.sql');

/** Kurulum sırası — bağımlılıkların önüne gelecek şekilde düzenlenmiştir. */
const ORDER = [
  'applications_table.sql',
  'favorites_table.sql',
  'student_cvs.sql',
  'guven_katmani.sql',
  'veli_onay_fix.sql',
  'okul_modulu.sql',
  'ileri_paket.sql',
  'havuz_kredi.sql',
  'havuz_bildirim.sql',
  'vitrin_logo_cv_guncellemesi.sql',
  'is_alarmi_tetik.sql',
];

const files = new Set(readdirSync(SUPA_DIR));
const missing = ORDER.filter((f) => !files.has(f));
if (missing.length > 0) {
  console.error('Eksik modül dosyaları:', missing.join(', '));
  process.exit(1);
}

const header = `-- ============================================================
-- STAJYERI.NET | TAM KURULUM (OTOMATİK ÜRETİLEN)
-- Üretim: node scripts/build-supabase-install.mjs — ELLE DÜZENLEME!
-- İçerik: ${ORDER.length} modül, aşağıdaki sırayla birleştirildi.
-- Tüm modüller idempotenttir; bu dosya tekrar çalıştırılabilir.
--
-- NOT: Temel tablolar (profiles, student_profiles, job_posts,
-- company_details) canlı projede mevcuttur; bu dosya modül
-- migration'larını kurar.
-- ============================================================

`;

const parts = [header];
for (const f of ORDER) {
  const sql = readFileSync(join(SUPA_DIR, f), 'utf8').trimEnd();
  parts.push(
    `-- ════════════════════════════════════════════════════════════\n` +
      `-- ══ DOSYA: ${f}\n` +
      `-- ════════════════════════════════════════════════════════════\n\n` +
      `${sql}\n`,
  );
}

writeFileSync(OUT_FILE, parts.join('\n'), 'utf8');
console.log(`✔ supabase/00_install_all.sql üretildi — ${ORDER.length} modül birleştirildi.`);
