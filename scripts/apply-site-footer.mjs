// ============================================================
// SITEFOOTER + HERO POLISH TOPLU UYGULAYICI
//   1) Eski <footer className="..."> bloklarını <SiteFooter /> ile değiştirir
//   2) SiteFooter importu yoksa SiteHeader importunun altına ekler
//   3) Belirtilen sayfalarda koyu hero'lara gradient şerit + orb ekler
// Kullanım: node scripts/apply-site-footer.mjs   (idempotenttir)
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const FILES = [
  'app/admin/page.tsx',
  'app/basvurularim/page.tsx',
  'app/bildirimler/page.tsx',
  'app/cv-olustur/page.tsx',
  'app/favorilerim/page.tsx',
  'app/giris/page.tsx',
  'app/ilan/[id]/page.tsx',
  'app/imep/page.tsx',
  'app/isveren/basvurular/page.tsx',
  'app/isveren/giris/page.tsx',
  'app/isveren/kayit/page.tsx',
  'app/isveren/panel/page.tsx',
  'app/kayit/page.tsx',
  'app/kvkk/page.tsx',
  'app/meslek-rehberi/page.tsx',
  'app/ogrenci/giris/page.tsx',
  'app/panel/page.tsx',
  'app/rehber/mulakat-provasi/page.tsx',
  'app/rehber/mulakat-sorulari/page.tsx',
  'app/rehber/onyazi/page.tsx',
  'app/sozlesme/[id]/page.tsx',
  'app/staj-ucretleri/page.tsx',
  'app/tesvik-rehberi/page.tsx',
];

const HERO_FILES = [
  'app/blog/page.tsx',
  'app/cv-ornekleri/page.tsx',
  'app/hesaplama-araclari/page.tsx',
  'app/meslek/page.tsx',
  'app/meslek-rehberi/page.tsx',
  'app/staj-ucretleri/page.tsx',
];

const HERO_OLD =
  '<section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center">';
const HERO_NEW = [
  '<section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center relative overflow-hidden">',
  '        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />',
  '        <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />',
  '        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />',
].join('\n');

let changed = 0;
for (const rel of FILES) {
  const p = join(ROOT, rel);
  let src = readFileSync(p, 'utf8');
  const orig = src;

  if (!src.includes("SiteFooter from '@/components/SiteFooter'")) {
    if (src.includes("import SiteHeader from '@/components/SiteHeader';")) {
      src = src.replace(
        "import SiteHeader from '@/components/SiteHeader';",
        "import SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';",
      );
    } else if (src.includes("'use client';")) {
      src = src.replace("'use client';", "'use client';\n\nimport SiteFooter from '@/components/SiteFooter';");
    } else {
      src = `import SiteFooter from '@/components/SiteFooter';\n${src}`;
    }
  }

  src = src.replace(
    /<footer className="([^"]*)">[\s\S]*?<\/footer>/,
    (m, cls) => {
      const keep = cls.includes('no-print') ? ' className="no-print"' : '';
      return `<footer${keep}>\n        <SiteFooter />\n      </footer>`;
    },
  );

  if (HERO_FILES.includes(rel)) src = src.split(HERO_OLD).join(HERO_NEW);

  if (src !== orig) {
    writeFileSync(p, src);
    changed++;
    console.log('✔', rel);
  } else {
    console.log('· atlandı', rel);
  }
}
console.log(`\n${changed} dosya güncellendi.`);
