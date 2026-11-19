// Beyaz zeminli logoyu, içteki beyaz şekilleri koruyarak şeffaf PNG'ye çevirir.
// Çalıştırma: node scripts/make-logo-transparent.mjs
import sharp from 'sharp';
import fs from 'node:fs';

const ORIGINAL = 'public/logo-original.png';
const OUTPUT = 'public/logo.png';
const TEMP = 'public/logo-transparent.tmp.png';
const TRIMMED = 'public/logo-trimmed.tmp.png';

if (!fs.existsSync(ORIGINAL)) fs.copyFileSync(OUTPUT, ORIGINAL);

const { data, info } = await sharp(ORIGINAL).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const seen = new Uint8Array(w * h);
const queue = new Int32Array(w * h);
let head = 0;
let tail = 0;

// Beyazdan renk uzaklığı: yalnızca açık zemin ve antialias kenarları kapsanır.
function whiteDistance(i) {
  const p = i * 4;
  const dr = 255 - data[p];
  const dg = 255 - data[p + 1];
  const db = 255 - data[p + 2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function enqueue(i) {
  if (seen[i] || whiteDistance(i) > 70) return;
  seen[i] = 1;
  queue[tail++] = i;
}

// Dış arka plan yalnızca görüntü sınırından başlatılır; iç beyaz halkalara ulaşılmaz.
for (let x = 0; x < w; x++) {
  enqueue(x);
  enqueue((h - 1) * w + x);
}
for (let y = 0; y < h; y++) {
  enqueue(y * w);
  enqueue(y * w + w - 1);
}

while (head < tail) {
  const i = queue[head++];
  const x = i % w;
  if (x > 0) enqueue(i - 1);
  if (x < w - 1) enqueue(i + 1);
  if (i >= w) enqueue(i - w);
  if (i < w * (h - 1)) enqueue(i + w);
}

let transparent = 0;
for (let i = 0; i < w * h; i++) {
  if (!seen[i]) continue;
  const d = whiteDistance(i);
  // Tam beyazda alfa 0; antialias bölgede yumuşak alfa geçişi.
  const alpha = d <= 8 ? 0 : Math.min(255, Math.round(((d - 8) / 62) * 255));
  data[i * 4 + 3] = alpha;
  if (alpha === 0) transparent++;
}

let minX = w;
let minY = h;
let maxX = -1;
let maxY = -1;
for (let i = 0; i < w * h; i++) {
  if (data[i * 4 + 3] <= 12) continue;
  const x = i % w;
  const y = Math.floor(i / w);
  minX = Math.min(minX, x);
  minY = Math.min(minY, y);
  maxX = Math.max(maxX, x);
  maxY = Math.max(maxY, y);
}
if (maxX < minX || maxY < minY) throw new Error('Logo içeriği bulunamadı; kırpma iptal edildi.');

// Alfa kanalına göre kırp; logonun nefes alması için 24px şeffaf kenar payı ekle.
await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .extend({ top: 24, right: 24, bottom: 24, left: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(TRIMMED);
fs.renameSync(TRIMMED, OUTPUT);

const meta = await sharp(OUTPUT).metadata();
console.log(`OK: ${w}x${h} -> ${meta.width}x${meta.height}`);
console.log(`Tam şeffaf piksel: ${transparent}`);
console.log(`Yedek: ${ORIGINAL}`);
