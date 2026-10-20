// Ana sayfa vitrine donusum + alan-secim redirect guncellemesi + inceleme raporu
import fs from 'fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, s) => fs.writeFileSync(p, s, 'utf8');

function apply(path, edits, label) {
  let s = read(path);
  const lines = [];
  for (const [name, find, replace, flags = ''] of edits) {
    if (new RegExp(find, flags).test(s)) {
      s = s.replace(new RegExp(find, flags), replace);
      lines.push('OK   ' + name);
    } else {
      lines.push('MISS ' + name);
    }
  }
  write(path, s);
  console.log('=== ' + label + ' ===');
  lines.forEach((l) => console.log(l));
}

function show(path, anchor, before, after, label) {
  const all = read(path).split('\n');
  const idx = all.findIndex((l) => l.includes(anchor));
  console.log('--- ' + label + ' (satir ' + (idx + 1) + ') ---');
  if (idx === -1) {
    console.log('ANCHOR YOK');
    return;
  }
  console.log(all.slice(Math.max(0, idx - before), idx + after).join('\n'));
}

// 1) Ana sayfa -> vitrin (en yeni 6 ilan + "Tum Ilanlari Gor" linki)
apply('app/page.tsx', [
  [
    'featured-tanim',
    'const handleResetFilters = \\(\\) => \\{',
    'const featuredJobs = sortedJobs.slice(0, 6);\n\n  const handleResetFilters = () => {',
  ],
  ['featured-map', '\\{sortedJobs\\.map\\(\\(job\\) => \\(', '{featuredJobs.map((job) => ('],
  [
    'vitrin-baslik',
    "\\? 'Filtrelenen İlanlar' : 'Güncel Staj & Çıraklık İlanları'",
    "? 'Filtrelenen İlanlar' : 'Öne Çıkan İlanlar'",
  ],
  [
    'vitrin-sayim',
    '\\{filteredJobs\\.length\\} adet onaylı stajyer pozisyonu listeleniyor\\.',
    '{filteredJobs.length} ilan bulundu; vitrinde en güncel {featuredJobs.length} tanesi listeleniyor.',
  ],
  [
    'tum-ilanlar-linki',
    '(<Link\\s+href="/favorilerim")',
    '<Link\n                href="/ilanlar"\n                className="text-xs font-extrabold text-white bg-[#0A1931] hover:bg-[#00A8B5] px-3 py-2 rounded-xl transition"\n              >\n                Tüm İlanları Gör\n              </Link>\n              $1',
  ],
], 'page.tsx VITRIN');

// 2) alan-secim -> /ilanlar'a yonlendirme
apply('app/alan-secim/page.tsx', [
  ['redirect-ilanlar', '\\/\\?alan=', '/ilanlar?alan=', 'g'],
], 'alan-secim REDIRECT');

// 3) ilan-ver incelemesi (logo entegrasyonu icin cipalar)
show('app/ilan-ver/page.tsx', 'job_posts', 4, 32, 'ILAN-VER INSERT BOLGESI');
show('app/ilan-ver/page.tsx', 'has_shuttle', 10, 12, 'ILAN-VER CHECKBOX CIPASI');
show('app/ilan-ver/page.tsx', 'Tanımı', 4, 10, 'ILAN-VER TANIM UI');
show('app/ilan-ver/page.tsx', 'useState', 0, 2, 'ILAN-VER ILK STATE');

// 4) cv-olustur incelemesi (fotograf entegrasyonu icin cipalar)
show('app/cv-olustur/page.tsx', 'handleSave', 2, 42, 'CV SAVE FONKSIYONU');
show('app/cv-olustur/page.tsx', 'cv-print', 8, 24, 'CV PREVIEW BASLANGICI');

// 5) /ilanlar parametre destegi kontrolu
const ilanlar = read('app/ilanlar/page.tsx');
console.log('=== ILANLAR PARAM KONTROL ===');
console.log('useSearchParams:', ilanlar.includes('useSearchParams') ? 'VAR' : 'YOK');
console.log('alan param isleniyor:', /searchParams[\s\S]{0,400}alan/.test(ilanlar) ? 'OLABILIR' : 'YOK');

// 6) ilerleme notu (compaction'a dayanikli)
write(
  'scripts/paket-notu.md',
  `# Vitrin paketi ilerleme notu
Tarih: 20.10.2026

## TAMAM
- SiteHeader rol-bazli nav (ogrenci/isveren/guest)
- /ilanlar sayfasi + components/JobCard.tsx (logo_url destekli)
- supabase/vitrin_logo_cv_guncellemesi.sql (job_posts.logo_url + student_cvs.photo_url + storage bucket)
- page.tsx vitrine dondu: featuredJobs = sortedJobs.slice(0,6), baslik "Öne Çıkan İlanlar", "Tüm İlanları Gör" linki
- alan-secim redirect -> /ilanlar?alan=

## KALAN
1. ilan-ver: logo yukleme (Supabase Storage 'logolar' bucket'a upload -> job_posts.logo_url), logosuz icin bas-harf sablonlari; inceleme cikti bu script calisirken alindi
2. cv-olustur: fotograf yukleme (student_cvs.photo_url), onizlemede fotoraf
3. /ilanlar sayfasina ?alan= parametre destegi (yoksa ekle)
4. tsc + build + commit + push + canli dogrulama

## NOT
- Duzenleme yontemi: Node script (scripts/apply-*.mjs) ile regex-replace; PowerShell ile metin YAZMA yasak (mojibake).
- JobCard props API: job objesinde company_details.logo_url ve logo_uri bekliyor (dosyaya bak).
- Storage bucket adi SQL'de: 'logolar' ve 'cv-fotolar' (SQL dosyasindan teyit et).
`
);
console.log('=== NOT DOSYASI GUNCELLENDI ===');
