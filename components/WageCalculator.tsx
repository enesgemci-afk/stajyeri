'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

/**
 * 3308 ücret hesaplayıcı — /staj-ucretleri sayfası.
 * Kullanıcı güncel net asgari ücreti girer; üç eğitim modelinin
 * asgari ücret tutarları ve işverenin cebinden çıkacak kısım gösterilir.
 * Tutarlar "en az" (kanuni taban) olarak verilir.
 */
export default function WageCalculator() {
  const [wage, setWage] = useState('22104');

  const base = Math.max(0, parseFloat(wage.replace(/\./g, '').replace(',', '.')) || 0);
  const rows = [
    {
      label: 'MESEM Çırağı (9-11. Sınıf)',
      pct: 30,
      imepPct: 30,
      desc: 'İMEP desteği ücretin tamamını karşılar',
      employerPct: 0,
    },
    {
      label: 'MESEM Kalfası (12. Sınıf)',
      pct: 50,
      imepPct: 30,
      desc: 'İMEP %30u karşılar, %20 işverende kalır',
      employerPct: 20,
    },
    {
      label: 'Meslek Lisesi Stajyeri (12. Sınıf)',
      pct: 30,
      imepPct: 0,
      desc: 'Ücretin devlet desteğiyle karşılanma oranı işletmeye göre değişir',
      employerPct: 30,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
      <h2 className="text-lg font-black text-[#0A1931] flex items-center gap-2">
        <Calculator className="w-5 h-5 text-[#00A8B5]" /> Staj Ücreti Hesaplayıcı
      </h2>
      <p className="text-xs text-slate-500 mt-1.5">
        Güncel net asgari ücreti gir — üç eğitim modelinin kanuni taban ücretini anında gör.
      </p>

      <div className="mt-5">
        <label htmlFor="wage-input" className="text-xs font-bold text-slate-700 block mb-1.5">
          Net Asgari Ücret (TL/ay)
        </label>
        <input
          id="wage-input"
          type="text"
          inputMode="numeric"
          value={wage}
          onChange={(e) => setWage(e.target.value.replace(/[^0-9.,]/g, ''))}
          placeholder="Örn. 22104"
          className="w-full max-w-xs px-4 py-3 rounded-2xl border border-slate-300 text-sm font-black text-[#0A1931] focus:border-[#00A8B5] focus:ring-2 focus:ring-[#00A8B5]/20 outline-none"
        />
        {base > 0 && (
          <p className="text-[11px] text-slate-400 mt-1.5">
            Hesaplanan taban: <b className="text-slate-600">{fmt(base)} TL</b> net asgari ücret üzerinden
          </p>
        )}
      </div>

      {base > 0 && (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-black text-[#0A1931]">{r.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#00A8B5]">≥ {fmt((base * r.pct) / 100)} TL</p>
                  <p className="text-[10px] text-slate-400">net asgari ücretin %{r.pct}’i</p>
                </div>
              </div>
              {r.employerPct > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">İşverenin cebinden (İMEP sonrası):</span>
                  <span className="text-xs font-black text-[#FF6B00]">~ {fmt((base * r.employerPct) / 100)} TL/ay</span>
                </div>
              )}
              {r.employerPct === 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">İşverenin cebinden:</span>
                  <span className="text-xs font-black text-emerald-600">0 TL — İMEP karşılar ✅</span>
                </div>
              )}
            </div>
          ))}
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Tutarlar 3308 Sayılı Kanun’un kanuni taban (“en az”) değerleridir; işletme daha yüksek ödeyebilir.
            İşveren tarafı için kesin hesap: <b>Teşvik Simülatörü</b>’ni kullanın. Sigorta primleri (iş kazası ve
            meslek hastalığı) MEB/Hazine tarafından karşılanır.
          </p>
        </div>
      )}
    </div>
  );
}
