'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export const ADS_CONSENT_EVENT = 'stajyeri:consent';
export const ADS_CONSENT_KEY = 'stajyeri_ads_consent';

export function readAdsConsent(): 'granted' | 'denied' | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(ADS_CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Reklam scriptini yalnızca açık ayar ve reddedilmemiş izinle bir kez yükler. */
export default function AdSenseScript() {
  const [canLoad, setCanLoad] = useState(false);
  const enabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    function syncConsent() {
      setCanLoad(enabled && Boolean(client) && readAdsConsent() !== 'denied');
    }
    syncConsent();
    window.addEventListener(ADS_CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(ADS_CONSENT_EVENT, syncConsent);
  }, [enabled, client]);

  if (!enabled || !client || !canLoad) return null;

  return (
    <Script
      id="stajyeri-adsense"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}
