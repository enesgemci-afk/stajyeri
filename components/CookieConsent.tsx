'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { ADS_CONSENT_EVENT, ADS_CONSENT_KEY, readAdsConsent } from '@/components/ads/AdSenseScript';

type Consent = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function signalConsent(value: Consent, update: boolean) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });
  window.gtag('consent', update ? 'update' : 'default', {
    ad_storage: value,
    analytics_storage: 'denied',
    ad_user_data: value,
    ad_personalization: value,
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = readAdsConsent();
    signalConsent(saved ?? 'denied', false);
    if (saved) signalConsent(saved, true);
    setVisible(saved === null);
  }, []);

  function choose(value: Consent) {
    try {
      window.localStorage.setItem(ADS_CONSENT_KEY, value);
    } catch {
      // Depolama kapalıysa da bu oturumdaki tercihi uygula.
    }
    signalConsent(value, true);
    setVisible(false);
    window.dispatchEvent(new CustomEvent(ADS_CONSENT_EVENT, { detail: value }));
  }

  if (!visible) return null;

  return (
    <section
      aria-label="Çerez tercihi"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-3xl border border-white/15 bg-[#0A1931] p-4 text-white shadow-[0_24px_70px_rgba(10,25,49,0.35)] sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00A8B5]/15 text-[#00E5FF]">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-sm font-black">Çerez tercihin</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
            Zorunlu çerezler siteyi çalıştırır. Reklam çerezlerini kabul edersen Google AdSense
            kullanılabilir; reddedersen reklam kodu ve reklam alanları yüklenmez. Detaylar{' '}
            <Link href="/kvkk" className="font-bold text-[#00E5FF] underline underline-offset-2">
              KVKK metninde
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => choose('denied')}
          className="min-h-11 rounded-xl border border-white/20 px-5 text-xs font-black text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]"
        >
          Reddet
        </button>
        <button
          type="button"
          onClick={() => choose('granted')}
          className="min-h-11 rounded-xl bg-[#00A8B5] px-5 text-xs font-black text-white transition hover:bg-[#00929E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
        >
          Kabul Et
        </button>
      </div>
    </section>
  );
}
