// Marka varlıkları: beyaz footer logosu + favicon/PWA ikonları.
// Kaynak: public/logo-transparent.png (zemin zaten şeffaf).
// Çalıştırma: node scripts/make-brand-assets.mjs
import sharp from 'sharp';

const SOURCE = 'public/logo-transparent.png';

// 1) Koyu footer için: lacivert metin ve çizgileri beyaza çevir,
// turkuaz/turuncu marka renklerini ve alfa kanalını koru.
const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (b - g > 18 && b - r > 20 && luminance < 125) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile('public/logo-white.png');

// 2) Logonun solundaki mezuniyet + konum simgesini kare ikonlara çıkar.
// 1200x301 kaynakta simge alanı x=0..260; yazı x≈280'den başlar.
async function makeIcon(path, size) {
  await sharp(SOURCE)
    .extract({ left: 0, top: 0, width: 260, height: info.height })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path);
}

await makeIcon('app/icon.png', 512);
await makeIcon('app/apple-icon.png', 180);
await makeIcon('public/icon-192.png', 192);
await makeIcon('public/icon-512.png', 512);

console.log('OK: public/logo-white.png');
console.log('OK: app/icon.png, app/apple-icon.png, public/icon-192.png, public/icon-512.png');
console.log('Not: eski app/favicon.ico kaldırılmalı.');
