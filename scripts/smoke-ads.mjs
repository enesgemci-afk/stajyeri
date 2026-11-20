// Reklam altyapısı smoke testi — production server 3100 portunda çalışırken.
const paths = [
  '/ilanlar',
  '/',
  '/blog/imep-maasi-ne-kadar',
  '/staj-ucretleri',
  '/mesem',
  '/cv-olustur',
  '/hesaplama-araclari',
];

for (const path of paths) {
  try {
    const response = await fetch(`http://localhost:3100${path}`);
    const html = await response.text();
    const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? null;
    const placeholders = [...html.matchAll(/data-ad-placeholder="([^"]+)"/g)].map((m) => m[1]);
    const result = {
      path,
      status: response.status,
      robots,
      placeholders,
      adsenseScript: html.includes('pagead2.googlesyndication.com'),
    };
    console.log(JSON.stringify(result));
    if (path === '/ilanlar' && robots !== 'noindex, follow') throw new Error('/ilanlar noindex bekleniyor');
    if (path === '/' && !placeholders.includes('home-empty-horizontal')) throw new Error('Boş durum reklamı yok');
    if (path === '/blog/imep-maasi-ne-kadar' && !placeholders.includes('blog-sidebar-rectangle')) throw new Error('Blog sidebar yok');
    if (path === '/staj-ucretleri' && !placeholders.includes('wage-result-fluid')) throw new Error('Sonuç reklamı yok');
    if (path === '/cv-olustur' && placeholders.length) throw new Error('CV sayfasında reklam olmamalı');
    if (path === '/hesaplama-araclari' && response.status !== 404) throw new Error('Kaldırılan sayfa 404 değil');
  } catch (error) {
    console.error(path, error.message);
    process.exitCode = 1;
  }
}
