#!/usr/bin/env node
// ============================================================
// SEO DENETİMİ — stajyeri.net
// Sitemap'teki tüm URL'leri gezer ve SEO değişmezlerini doğrular.
// Bağımlılık yok (yalnızca Node 18+ fetch).
//
// Kullanım:
//   node scripts/seo-audit.mjs                          # canlı site
//   node scripts/seo-audit.mjs --base http://localhost:3100
//   node scripts/seo-audit.mjs --limit 20 --strict      # ilk 20 URL, uyarılar da hata
//   node scripts/seo-audit.mjs --json drafts/seo/rapor.json
//
// Çıkış kodu: kritik bulgu varsa 1, yoksa 0.
// ============================================================

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const has = (name) => args.includes(name);

const BASE = (flag('--base', 'https://www.stajyeri.net')).replace(/\/+$/, '');
const LIMIT = Number(flag('--limit', '0')) || 0;
const STRICT = has('--strict');
const JSON_OUT = flag('--json', null);
const CONCURRENCY = 6;

// --- yardımcılar -------------------------------------------------

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};
const decode = (s) =>
  s == null
    ? s
    : s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');

const norm = (u) => u.replace(/\/+$/, '') || u;
const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');

async function get(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'StajyeriSEOAudit/1.0 (+https://www.stajyeri.net)' },
    cache: 'no-store',
  });
  return { res, text: await res.text() };
}

async function pool(items, size, worker) {
  const out = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      out[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return out;
}

// --- toplama -----------------------------------------------------

function analyze(path, res, html) {
  const head = html.split('</head>')[0];
  const bodyText = stripTags(html);

  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const ldTypes = [];
  let ldParseErrors = 0;
  for (const block of ldBlocks) {
    try {
      const parsed = JSON.parse(block[1]);
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        if (node && node['@type']) ldTypes.push(node['@type']);
      }
    } catch {
      ldParseErrors += 1;
    }
  }

  return {
    path,
    status: res.status,
    finalUrl: res.url,
    title: decode(pick(html, /<title[^>]*>([\s\S]*?)<\/title>/)),
    description: decode(pick(head, /<meta name="description" content="([^"]*)"/)),
    canonical: pick(head, /<link rel="canonical" href="([^"]*)"/),
    ogTitle: pick(head, /<meta property="og:title" content="([^"]*)"/),
    ogImage: pick(head, /<meta property="og:image" content="([^"]*)"/),
    ogUrl: pick(head, /<meta property="og:url" content="([^"]*)"/),
    robots: pick(head, /<meta name="robots" content="([^"]*)"/),
    lang: pick(html, /<html[^>]*lang="([^"]*)"/),
    h1Count: (html.match(/<h1[\s>]/g) || []).length,
    h1: decode(pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/))?.replace(/<[^>]+>/g, '').trim() ?? null,
    words: bodyText.split(/\s+/).filter(Boolean).length,
    ldTypes,
    ldParseErrors,
  };
}

// --- değerlendirme -----------------------------------------------

const critical = [];
const warnings = [];
const addCritical = (page, msg) => critical.push({ path: page.path, msg });
const addWarning = (page, msg) => warnings.push({ path: page.path, msg });

function evaluate(pages, site) {
  const titleMap = new Map();
  const descMap = new Map();

  for (const page of pages) {
    if (page.status !== 200) {
      addCritical(page, `HTTP ${page.status} döndü`);
      continue;
    }

    // Googlebot'a göre kanonik hedef: BASE + path
    const expected = norm(`${site.base}${page.path === '/' ? '/' : page.path}`);

    if (!page.canonical) {
      addCritical(page, 'canonical etiketi yok');
    } else if (!/^https?:\/\//i.test(page.canonical)) {
      addCritical(page, `canonical mutlak URL değil: ${page.canonical}`);
    } else if (norm(page.canonical) !== expected) {
      addCritical(page, `canonical sayfanın kendisini göstermiyor: ${page.canonical}`);
    }

    if (!page.ogImage) addWarning(page, 'og:image yok (paylaşımda görsel çıkmaz)');
    if (!page.ogTitle) addWarning(page, 'og:title yok');

    if (page.h1Count === 0) addCritical(page, 'H1 yok');
    if (page.h1Count > 1) addCritical(page, `birden fazla H1 (${page.h1Count})`);

    if (page.ldParseErrors > 0) addCritical(page, `${page.ldParseErrors} JSON-LD bloğu ayrıştırılamadı`);
    if (page.ldTypes.length === 0) addWarning(page, 'yapılandırılmış veri (JSON-LD) yok');

    if (page.lang && page.lang !== 'tr') addWarning(page, `<html lang="${page.lang}"> — tr beklenir`);

    if (page.robots && /noindex/i.test(page.robots)) {
      addCritical(page, 'sitemap\'te ama noindex');
    }

    if (page.title) {
      const lower = page.title.toLowerCase();
      titleMap.set(lower, [...(titleMap.get(lower) ?? []), page.path]);
      if (page.title.length > 65) addWarning(page, `title ${page.title.length} karakter (65 üstü kesilir)`);
      if (page.title.length < 20) addWarning(page, `title çok kısa (${page.title.length})`);
    } else {
      addCritical(page, 'title yok');
    }

    if (page.description) {
      const lower = page.description.toLowerCase();
      descMap.set(lower, [...(descMap.get(lower) ?? []), page.path]);
      if (page.description.length > 165) {
        addWarning(page, `description ${page.description.length} karakter (165 üstü kesilir)`);
      }
      if (page.description.length < 60) {
        addWarning(page, `description çok kısa (${page.description.length})`);
      }
    } else {
      addCritical(page, 'meta description yok');
    }

    if (page.words < 300) {
      addWarning(page, `ince içerik: ${page.words} kelime`);
    }
  }

  for (const [title, paths] of titleMap) {
    if (paths.length > 1) {
      for (const path of paths) {
        const page = pages.find((p) => p.path === path);
        addCritical(page, `yinelenen başlık (${paths.length} sayfa): "${title.slice(0, 70)}"`);
      }
    }
  }

  for (const [, paths] of descMap) {
    if (paths.length > 1) {
      for (const path of paths) {
        const page = pages.find((p) => p.path === path);
        addWarning(page, `yinelenen açıklama (${paths.length} sayfa)`);
      }
    }
  }
}

function evaluateRobots(robotsText, sitemapUrls, site) {
  const problems = [];
  if (!robotsText) {
    problems.push('robots.txt alınamadı');
    return problems;
  }
  if (!/^sitemap:/im.test(robotsText)) problems.push('robots.txt içinde Sitemap satırı yok');
  for (const required of ['/admin', '/panel']) {
    if (!new RegExp(`disallow:\\s*${required}`, 'i').test(robotsText)) {
      problems.push(`robots.txt ${required} yolunu kapatmıyor`);
    }
  }
  for (const required of ['/', '/okul/kayit']) {
    if (!new RegExp(`allow:\\s*${required}\\s*$`, 'im').test(robotsText)) {
      if (required !== '/') problems.push(`robots.txt ${required} için Allow satırı yok`);
    }
  }
  const disallows = [...robotsText.matchAll(/disallow:\s*(\S+)/gi)].map((m) => m[1]);
  const allows = [...robotsText.matchAll(/allow:\s*(\S+)/gi)].map((m) => m[1]);
  for (const url of sitemapUrls) {
    const path = url.replace(site.base, '') || '/';
    // Google robots.txt kuralı: en uzun eşleşen kural kazanır; eşitlikte Allow kazanır.
    const longest = (patterns) =>
      patterns
        .filter((p) => p !== '/' && path.startsWith(p))
        .reduce((max, p) => Math.max(max, p.length), -1);
    const disallowLen = longest(disallows);
    const allowLen = longest(allows);
    if (disallowLen > allowLen) {
      const blocked = disallows.find((d) => d.length === disallowLen);
      problems.push(`sitemap URL'si robots tarafından engelli: ${path} (${blocked})`);
    }
  }
  return problems;
}

// --- ana akış ----------------------------------------------------

async function main() {
  const started = Date.now();
  const site = { base: BASE };

  process.stdout.write(`\nSEO denetimi → ${BASE}\n`);

  // robots.txt
  let robotsText = null;
  try {
    robotsText = (await get(`${BASE}/robots.txt`)).text;
  } catch (error) {
    process.stdout.write(`  ! robots.txt alınamadı: ${error.message}\n`);
  }

  // sitemap.xml (sitemap index desteğiyle)
  const sitemapUrls = [];
  const sitemapLastmod = new Map();
  async function readSitemap(url) {
    const { text } = await get(url);
    if (/<sitemapindex/i.test(text)) {
      const children = [...text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
      for (const child of children) await readSitemap(child);
      return;
    }
    for (const block of text.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = pick(block[1], /<loc>(.*?)<\/loc>/);
      if (!loc) continue;
      sitemapUrls.push(loc.trim());
      const lastmod = pick(block[1], /<lastmod>(.*?)<\/lastmod>/);
      if (lastmod) sitemapLastmod.set(loc.trim(), lastmod);
    }
  }

  try {
    await readSitemap(`${BASE}/sitemap.xml`);
  } catch (error) {
    process.stdout.write(`  ! sitemap.xml okunamadı: ${error.message}\n`);
    process.exit(1);
  }

  if (sitemapUrls.length === 0) {
    process.stdout.write('  ! sitemap boş\n');
    process.exit(1);
  }

  const targets = LIMIT > 0 ? sitemapUrls.slice(0, LIMIT) : sitemapUrls;
  process.stdout.write(`  ${sitemapUrls.length} URL bulundu, ${targets.length} tanesi denetleniyor\n\n`);

  const pages = await pool(targets, CONCURRENCY, async (url) => {
    const path = url.startsWith(BASE) ? url.slice(BASE.length) || '/' : url;
    try {
      const { res, text } = await get(url);
      return analyze(path, res, text);
    } catch (error) {
      return { path, status: 0, error: error.message, words: 0, h1Count: 0, ldTypes: [] };
    }
  });

  for (const page of pages) {
    if (page.error) critical.push({ path: page.path, msg: `istek başarısız: ${page.error}` });
  }

  evaluate(pages, site);

  const robotsProblems = evaluateRobots(robotsText, sitemapUrls, site);
  for (const msg of robotsProblems) critical.push({ path: '/robots.txt', msg });

  // lastmod tutarlılığı: her istekte "şimdi" dönüyorsa Google sinyali yok sayar
  const now = Date.now();
  const freshLastmods = [...sitemapLastmod.values()].filter((value) => {
    const time = Date.parse(value);
    return Number.isFinite(time) && now - time < 5 * 60 * 1000;
  });
  if (sitemapLastmod.size > 0 && freshLastmods.length === sitemapLastmod.size) {
    warnings.push({
      path: '/sitemap.xml',
      msg: 'tüm lastmod değerleri şu ana çok yakın — içerik tarihine bağlanmalı',
    });
  }

  // --- rapor -----------------------------------------------------

  const totalWords = pages.reduce((sum, p) => sum + (p.words || 0), 0);
  const withLd = pages.filter((p) => p.ldTypes.length > 0).length;

  process.stdout.write('Özet\n');
  process.stdout.write(`  URL                : ${pages.length}\n`);
  process.stdout.write(`  Ortalama kelime    : ${Math.round(totalWords / pages.length)}\n`);
  process.stdout.write(`  JSON-LD kapsamı    : ${withLd}/${pages.length}\n`);
  process.stdout.write(`  Kritik bulgu       : ${critical.length}\n`);
  process.stdout.write(`  Uyarı              : ${warnings.length}\n`);

  if (critical.length > 0) {
    process.stdout.write('\nKRİTİK\n');
    for (const item of critical.sort((a, b) => a.path.localeCompare(b.path))) {
      process.stdout.write(`  ✗ ${item.path} — ${item.msg}\n`);
    }
  }

  if (warnings.length > 0) {
    process.stdout.write('\nUYARI\n');
    for (const item of warnings.sort((a, b) => a.path.localeCompare(b.path))) {
      process.stdout.write(`  · ${item.path} — ${item.msg}\n`);
    }
  }

  if (critical.length === 0 && warnings.length === 0) {
    process.stdout.write('\nTemiz: kritik bulgu ve uyarı yok.\n');
  }

  if (JSON_OUT) {
    const { writeFileSync, mkdirSync } = await import('node:fs');
    const { dirname } = await import('node:path');
    mkdirSync(dirname(JSON_OUT), { recursive: true });
    writeFileSync(
      JSON_OUT,
      JSON.stringify(
        {
          base: BASE,
          checkedAt: new Date().toISOString(),
          durationMs: Date.now() - started,
          pages,
          critical,
          warnings,
          robotsProblems,
        },
        null,
        2
      ),
      'utf8'
    );
    process.stdout.write(`\nRapor yazıldı: ${JSON_OUT}\n`);
  }

  const failed = critical.length > 0 || (STRICT && warnings.length > 0);
  process.stdout.write(`\n${failed ? 'BAŞARISIZ' : 'TAMAM'} (${((Date.now() - started) / 1000).toFixed(1)} sn)\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  process.stderr.write(`Denetim çöktü: ${error.stack || error.message}\n`);
  process.exit(1);
});
