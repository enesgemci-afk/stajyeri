'use client';

import { useEffect, useRef, useState } from 'react';
import { ADS_CONSENT_EVENT, readAdsConsent } from './AdSenseScript';

type AdFormat = 'horizontal' | 'rectangle' | 'vertical' | 'fluid';

type Props = {
  slot: string;
  format: AdFormat;
  layout?: 'in-article' | 'in-feed';
  label?: boolean;
};

const MIN_HEIGHT: Record<AdFormat, number> = {
  horizontal: 120,
  rectangle: 280,
  vertical: 600,
  fluid: 250,
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Tek reklam alanı: sabit yer rezervi, 3 sn zaman aşımı ve consent kontrolü. */
export default function AdSlot({ slot, format, layout, label = true }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [consentDenied, setConsentDenied] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  const enabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const minHeight = MIN_HEIGHT[format];

  useEffect(() => {
    setMounted(true);
    function syncConsent() {
      setConsentDenied(readAdsConsent() === 'denied');
    }
    syncConsent();
    window.addEventListener(ADS_CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(ADS_CONSENT_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!enabled || !client || !mounted || consentDenied || pushedRef.current) return;
    pushedRef.current = true;

    const timer = window.setTimeout(() => setTimedOut(true), 3000);
    let observer: MutationObserver | undefined;
    try {
      if (insRef.current) {
        observer = new MutationObserver(() => {
          const status = insRef.current?.getAttribute('data-ad-status');
          if (status === 'filled') {
            window.clearTimeout(timer);
            observer?.disconnect();
          } else if (status === 'unfilled') {
            window.clearTimeout(timer);
            setTimedOut(true);
            observer?.disconnect();
          }
        });
        observer.observe(insRef.current, { attributes: true, attributeFilter: ['data-ad-status'] });
      }
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      window.clearTimeout(timer);
      setTimedOut(true);
    }

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [client, consentDenied, enabled, mounted]);

  useEffect(() => {
    if (!timedOut) return;
    const unmountTimer = window.setTimeout(() => setVisible(false), 200);
    return () => window.clearTimeout(unmountTimer);
  }, [timedOut]);

  // Reddet seçilmişse reklam konteyneri de ağ isteği de oluşmaz.
  if (consentDenied) return null;

  if (!enabled) {
    return (
      <aside
        aria-label={`Reklam alanı: ${slot}`}
        className="my-6 flex items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-[11px] font-bold text-slate-400"
        style={{ minHeight }}
        data-ad-placeholder={slot}
      >
        Reklam alanı · {slot}
      </aside>
    );
  }

  if (!mounted || !visible || !client) return null;

  return (
    <aside
      aria-label="Reklam"
      className="my-6 overflow-hidden border-y border-slate-100 bg-[#F8FAFC] transition-all duration-200"
      style={{
        minHeight: timedOut ? 0 : minHeight,
        opacity: timedOut ? 0 : 1,
        marginTop: timedOut ? 0 : 24,
        marginBottom: timedOut ? 0 : 24,
      }}
      data-ad-slot={slot}
    >
      {label && (
        <p className="px-1 pt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Reklam
        </p>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: 'block', minHeight: timedOut ? 0 : minHeight }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
