'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { MESEM_FIELDS } from '@/lib/constants';
import {
  GENERAL_QUESTIONS,
  getInterviewQuestions,
} from '@/lib/interviewContent';
import {
  MessageCircleQuestion,
  Lightbulb,
  Wrench,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function MulakatSorulariPage() {
  const [field, setField] = useState('');

  const fieldQuestions = field ? getInterviewQuestions(field) : [];

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
              Staj Mülakatında Sorulan Sorular
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
              İşletmeler stajyer ararken genelde aynı soruları sorar. Aşağıdaki soruları
              önceden yanıtlayıp provasını yaparsan mülakatta çok daha rahat olursun.
            </p>
          </div>

          {/* Genel sorular */}
          <h2 className="text-sm font-black text-[#0A1931] mb-3 flex items-center gap-2">
            <MessageCircleQuestion className="w-4 h-4 text-[#00A8B5]" /> Her Mülakatta Sorulan 8 Soru
          </h2>
          <div className="space-y-3 mb-8">
            {GENERAL_QUESTIONS.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-xs font-black text-[#0A1931] flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item.q}
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-2 pl-7 flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  {item.tip}
                </p>
              </div>
            ))}
          </div>

          {/* Alan bazlı sorular */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <h2 className="text-sm font-black text-[#0A1931] mb-1 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#00A8B5]" /> Alanına Özel Sorular
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">
              Meslek alanını seç; o alanda iş verenlerin merak ettiği soruları ve ipuçlarını gör.
            </p>

            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5] transition cursor-pointer mb-4"
            >
              <option value="">Meslek alanı seç...</option>
              {MESEM_FIELDS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {fieldQuestions.length > 0 ? (
              <div className="space-y-3">
                {fieldQuestions.map((item, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <h3 className="text-xs font-black text-[#0A1931] flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                      {item.q}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 pl-5">
                      💡 {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center py-4">
                Yukarıdan alan seçtiğinde burada sorular listelenecek.
              </p>
            )}
          </div>

          {/* Çapraz linkler */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <Link
              href="/alan-secim"
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#00A8B5] shadow-sm p-5 transition group"
            >
              <h3 className="text-xs font-black text-[#0A1931] group-hover:text-[#00A8B5] transition flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00A8B5]" /> Alanını seçemiyor musun?
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                6 soruluk testle sana uygun meslek alanlarını keşfet.
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
