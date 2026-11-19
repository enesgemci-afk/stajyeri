import { ImageResponse } from 'next/og';

// Site geneli Open Graph görseli (1200x630).
// Alt segmentler kendi opengraph-image dosyasını tanımlamadıkça bu görsel kullanılır.
export const alt = 'Stajyeri.net — MESEM, meslek lisesi ve üniversite staj ilanları';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0A1931 0%, #10294d 55%, #0d3d4a 100%)',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* Dekoratif ışık halkaları */}
        <div
          style={{
            position: 'absolute',
            top: -140,
            right: -100,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: 'rgba(0,168,181,0.28)',
            filter: 'blur(90px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            left: -80,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: 'rgba(255,107,0,0.22)',
            filter: 'blur(90px)',
            display: 'flex',
          }}
        />

        {/* Üst: marka */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 18,
              background: '#00A8B5',
              color: '#0A1931',
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            S
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: '#ffffff', letterSpacing: -0.5 }}>
            Stajyeri<span style={{ color: '#00E5FF' }}>.net</span>
          </div>
        </div>

        {/* Orta: başlık */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 940 }}>
          <div style={{ display: 'flex', fontSize: 62, fontWeight: 900, color: '#ffffff', lineHeight: 1.1, letterSpacing: -1.5 }}>
            MESEM ve Meslek Lisesi
          </div>
          <div style={{ display: 'flex', fontSize: 62, fontWeight: 900, color: '#00E5FF', lineHeight: 1.1, letterSpacing: -1.5 }}>
            Staj İlanları
          </div>
          <div style={{ display: 'flex', fontSize: 27, color: '#cbd5e1', lineHeight: 1.4, marginTop: 6 }}>
            41 meslek alanı rehberi · 3308 ücret hesaplayıcı · Ücretsiz CV ve mülakat hazırlığı
          </div>
        </div>

        {/* Alt: URL + rozet */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 22px',
              borderRadius: 999,
              background: 'rgba(0,168,181,0.16)',
              border: '1px solid rgba(0,229,255,0.4)',
              color: '#00E5FF',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            www.stajyeri.net
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#94a3b8', fontWeight: 600 }}>
            Öğrenciye her zaman ücretsiz
          </div>
        </div>
      </div>
    ),
    size
  );
}
