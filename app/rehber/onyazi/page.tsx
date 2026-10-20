'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { ONYAZI_EXAMPLES } from '@/lib/onyaziExamples';
import {
  FileText,
  Check,
  Copy,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Wrench,
} from 'lucide-react';

const TIPS = [
  'Kısa tut: 6-8 satır yeter. İşverenin okuma zamanı azdır.',
  'Köşeli parantezli [kısımları] kendi bilgilerinle değiştirmeyi unutma.',
  'İlanda geçen işe (ör. "pano montajı") değinmek, ilanı okuduğunu gösterir.',
  'Yazım hataları ilk izlenimi bozar; göndermeden önce bir kez daha oku.',
  'Aynı metni her işletmeye kopyalamak yerine 1-2 cümleyi ilana göre değiştir.',
];

export default function OnyaziRehberPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyBody = async (id: string, body: string) => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // panoya erisilemediyse sessizce gec
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">

          {/* Başlık */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A8B5]/10 border border-[#00A8B5]/20 text-[#00A8B5] text-[11px] font-black mb-4">
              <Sparkles className="w-3.5 h-3.5" /> REHBER
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A1931]">
              Staj Başvurusunda Ön Yazı Nasıl Yazılır?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
              Ön yazı, başvuru formundaki "kendini tanıt" kutusuna yazacağın kısa mesajdır.
              Aşağıdaki hazır şablonlardan birini kopyala, köşeli parantezli yerleri kendine göre
              doldur ve başvurunu gönder.
            </p>
          </div>

          {/* İpuçları */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 mb-6">
            <h2 className="text-sm font-black text-[#0A1931] mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#FF6B00]" /> 5 Altın Kural
            </h2>
            <ul className="space-y-2">
              {TIPS.map((t, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Şablonlar */}
          <h2 className="text-sm font-black text-[#0A1931] mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00A8B5]" /> Hazır Şablonlar
          </h2>
          <div className="space-y-4">
            {ONYAZI_EXAMPLES.map((ex) => (
              <div key={ex.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <h3 className="text-sm font-black text-[#0A1931]">{ex.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ex.when}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyBody(ex.id, ex.body)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00A8B5] hover:bg-[#00929e] text-white rounded-full text-[11px] font-black transition cursor-pointer flex-shrink-0"
                  >
                    {copiedId === ex.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Şablonu Kopyala
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {ex.body}
                </pre>
              </div>
            ))}
          </div>

          {/* Çapraz linkler */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <Link
              href="/cv-olustur"
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#00A8B5] shadow-sm p-5 transition group"
            >
              <h3 className="text-xs font-black text-[#0A1931] group-hover:text-[#00A8B5] transition flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#00A8B5]" /> CV'ni de hazırla
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Ücretsiz CV oluşturucuyla ön yazını güçlendir.
              </p>
            </Link>
            <Link
              href="/#ilanlar"
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#00A8B5] shadow-sm p-5 transition group"
            >
              <h3 className="text-xs font-black text-[#0A1931] group-hover:text-[#00A8B5] transition flex items-center gap-2">
                Aktif ilanları gör <ChevronRight className="w-4 h-4 text-[#00A8B5]" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Hazırsan onaylı işletmelerin ilanlarına başvur.
              </p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Stajyeri.net &mdash; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}