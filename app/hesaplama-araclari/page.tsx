'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import {
  Calculator,
  Wallet,
  Clock,
  Calendar,
  DoorOpen,
  Sparkles,
} from 'lucide-react';

// ------------------------------------------------------------
// 2026 yaklaşık parametreler — bilgilendirme amaçlıdır.
// Yıllık gelir vergisi dilimleri (kümülatif matrah).
// ------------------------------------------------------------
const TAX_BRACKETS: { limit: number; rate: number }[] = [
  { limit: 158000, rate: 0.15 },
  { limit: 330000, rate: 0.2 },
  { limit: 800000, rate: 0.27 },
  { limit: 4300000, rate: 0.35 },
  { limit: Infinity, rate: 0.4 },
];

const SGK = 0.14;
const UNEMPLOYMENT = 0.01;
const STAMP = 0.00759;

const fmt = (n: number) =>
  n.toLocaleString('tr-TR', { maximumFractionDigits: 0, minimumFractionDigits: 0 });

function annualIncomeTax(annualBase: number): number {
  let remaining = annualBase;
  let prev = 0;
  let tax = 0;
  for (const b of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const span = Math.min(remaining, b.limit - prev);
    tax += span * b.rate;
    remaining -= span;
    prev = b.limit;
  }
  return tax;
}

const TABS = [
  { id: 'brutnet', label: 'Brüt-Net Maaş', icon: Wallet, color: '#00A8B5' },
  { id: 'mesai', label: 'Fazla Mesai', icon: Clock, color: '#FF6B00' },
  { id: 'izin', label: 'Yıllık İzin', icon: Calendar, color: '#6366F1' },
  { id: 'ayrilik', label: 'Kıdem & İhbar', icon: DoorOpen, color: '#0EA5E9' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function HesaplamaAraclariPage() {
  const [tab, setTab] = useState<TabId>('brutnet');

  // Ortak girdiler
  const [brut, setBrut] = useState('26000');

  // Mesai
  const [mesaiSaat, setMesaiSaat] = useState('20');
  const [mesaiTip, setMesaiTip] = useState<'normal' | 'tatil'>('normal');

  // İzin
  const [kidemYil, setKidemYil] = useState('3');

  const b = Number(brut.replace(/\./g, '').replace(',', '.')) || 0;

  // 1) Brüt → Net
  const sgkK = b * SGK;
  const issizlik = b * UNEMPLOYMENT;
  const tax = b > 0 ? annualIncomeTax((b - sgkK - issizlik) * 12) / 12 : 0;
  const damga = b * STAMP;
  const net = b - sgkK - issizlik - tax - damga;

  // 2) Fazla mesai
  const saatBaz = b / 225;
  const mesaiTutar = saatBaz * (mesaiTip === 'normal' ? 1.5 : 2) * (Number(mesaiSaat) || 0);

  // 3) Yıllık izin
  const yil = Number(kidemYil) || 0;
  const izinGun = yil >= 15 ? 26 : yil >= 5 ? 20 : yil >= 1 ? 14 : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <Calculator className="w-4 h-4" /> {TABS.length} araç · ücretsiz · kayıt yok
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
            Hesaplama Araçları
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Maaşından mesai ücretine, izin gününden tazminata kadar çalışma hayatının
            hesaplarını saniyeler içinde yap. Verileriniz tarayıcınızda kalır.
          </p>
        </div>
      </section>

      {/* Sekmeler */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {TABS.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-2xl border p-3.5 text-center transition cursor-pointer ${
                tab === id
                  ? 'border-[#00A8B5] bg-white shadow-md shadow-[#00A8B5]/10'
                  : 'border-slate-200 bg-white/60 hover:border-slate-300'
              }`}
            >
              <Icon
                className="w-5 h-5 mx-auto"
                style={{ color: tab === id ? color : '#94a3b8' }}
              />
              <span
                className={`block text-[10px] font-black mt-1.5 ${
                  tab === id ? 'text-[#0A1931]' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Ortak brüt ücret girdisi (brutnet, mesai, ayrilik kullanır) */}
        {tab !== 'izin' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-4">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Aylık brüt ücretin (₺)
            </label>
            <input
              inputMode="numeric"
              value={brut}
              onChange={(e) => setBrut(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-[#0A1931] focus:outline-none focus:border-[#00A8B5]"
            />
          </div>
        )}

        {/* 1) BRÜT-NET */}
        {tab === 'brutnet' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h2 className="text-sm font-black text-[#0A1931] mb-4">Brütten Nete</h2>
            <div className="space-y-2 text-xs">
              {[
                ['Brüt ücret', b],
                ['SGK işçi payı (%14)', -sgkK],
                ['İşsizlik sigortası (%1)', -issizlik],
                ['Gelir vergisi (yıllık dilim bazlı)', -tax],
                ['Damga vergisi (%0,759)', -damga],
              ].map(([l, v]) => (
                <div
                  key={l as string}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100"
                >
                  <span className="text-slate-500 font-medium">{l as string}</span>
                  <span
                    className={`font-black ${(v as number) < 0 ? 'text-red-500' : 'text-[#0A1931]'}`}
                  >
                    {(v as number) < 0 ? '−' : ''}
                    {fmt(Math.abs(v as number))} ₺
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#00A8B5]/10 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-black text-[#0A1931]">Eline geçen (net)</span>
              <span className="text-lg font-black text-[#00A8B5]">{fmt(net)} ₺</span>
            </div>
          </div>
        )}

        {/* 2) FAZLA MESAI */}
        {tab === 'mesai' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h2 className="text-sm font-black text-[#0A1931] mb-4">Fazla Mesai Ücreti</h2>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Saat ücreti, aylık brütin 225’e bölünmesiyle bulunur (4857). Hafta içi mesai %50
              zamlı, ulusal bayram ve genel tatillerde %100 zamlı ödenir.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mesai saati (aylık)
                </label>
                <input
                  inputMode="numeric"
                  value={mesaiSaat}
                  onChange={(e) => setMesaiSaat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-[#0A1931] focus:outline-none focus:border-[#00A8B5]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mesai tipi
                </label>
                <select
                  value={mesaiTip}
                  onChange={(e) => setMesaiTip(e.target.value as 'normal' | 'tatil')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5]"
                >
                  <option value="normal">Hafta içi (%50 zam)</option>
                  <option value="tatil">Resmî tatil (%100 zam)</option>
                </select>
              </div>
            </div>
            <div className="bg-[#FF6B00]/10 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-black text-[#0A1931]">Mesai ücreti (aylık)</span>
              <span className="text-lg font-black text-[#FF6B00]">{fmt(mesaiTutar)} ₺</span>
            </div>
          </div>
        )}

        {/* 3) YILLIK IZIN */}
        {tab === 'izin' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h2 className="text-sm font-black text-[#0A1931] mb-4">
              Yıllık Ücretli İzin (4857 md. 53)
            </h2>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Kıdem yılın
            </label>
            <input
              inputMode="numeric"
              value={kidemYil}
              onChange={(e) => setKidemYil(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-[#0A1931] focus:outline-none focus:border-[#00A8B5] mb-4"
            />
            <div className="bg-[#6366F1]/10 rounded-2xl p-4 flex items-center justify-between mb-4">
              <span className="text-xs font-black text-[#0A1931]">Hak ettiğin izin</span>
              <span className="text-lg font-black text-[#6366F1]">
                {yil < 1 ? '1 yıl dolmadan hak doğmaz' : `${izinGun} gün`}
              </span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1.5">
              <li>• 1-5 yıl: 14 gün · 5-15 yıl: 20 gün · 15+ yıl: 26 gün</li>
              <li>• 18 yaş altı ve 50 yaş üstü çalışanlarda ücretli izin en az 20 gündür.</li>
              <li>• 1 yılı doldurmadan ayrılırsan orantılı izin ücreti alırsın.</li>
            </ul>
          </div>
        )}

        {/* 4) KIDEM & IHBAR */}
        {tab === 'ayrilik' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h2 className="text-sm font-black text-[#0A1931] mb-1">
              İşten Ayrılık: Kıdem & İhbar
            </h2>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Kıdem: her tam yıl için 30 günlük brüt (yıllık kıdem tavanını aşan kısım ödenmez;
              güncel tavanı kontrol et). İhbar: bildirim süresi kıdem yılınla belirlenir.
            </p>
            <div className="space-y-3">
              <div className="bg-[#0EA5E9]/10 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-black text-[#0A1931]">
                  Kıdem tazminatı ({yil} yıl)
                </span>
                <span className="text-lg font-black text-[#0EA5E9]">{fmt(b * 30 * yil)} ₺</span>
              </div>
              <div className="bg-[#0EA5E9]/10 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-black text-[#0A1931]">
                  İhbar tazminatı (
                  {yil < 0.5 ? '2 hafta' : yil < 1.5 ? '4 hafta' : yil < 3 ? '6 hafta' : '8 hafta'})
                </span>
                <span className="text-lg font-black text-[#0EA5E9]">
                  {fmt(b * ((yil < 0.5 ? 2 : yil < 1.5 ? 4 : yil < 3 ? 6 : 8) / 4.33))} ₺
                </span>
              </div>
            </div>
            <div className="mt-4 bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-2xl p-3.5 text-[10px] text-slate-600 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
              Bu haklar mezuniyet sonrası çalışma hayatında devreye girer; staj ve çıraklık
              dönemi hakları için “Staj Ücretleri” sayfasına bak.
            </div>
          </div>
        )}

        {/* Çapraz bağlantılar */}
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <Link
            href="/staj-ucretleri"
            className="bg-[#0A1931] text-white rounded-3xl p-5 flex items-center gap-4 hover:bg-[#10294d] transition"
          >
            <span className="text-3xl">🎓</span>
            <span>
              <span className="block text-sm font-black">Staj / çıraklık ücretleri</span>
              <span className="block text-[11px] text-slate-300 mt-0.5">
                3308 tabanları: çırak %30, kalfa %50.
              </span>
            </span>
          </Link>
          <Link
            href="/tesvik-simulasyon"
            className="bg-[#FF6B00] text-white rounded-3xl p-5 flex items-center gap-4 hover:bg-[#e05f00] transition"
          >
            <span className="text-3xl">🏛️</span>
            <span>
              <span className="block text-sm font-black">İşveren teşvik simülasyonu</span>
              <span className="block text-[11px] text-white/80 mt-0.5">
                Çırak alırsan devlet desteğini hesapla.
              </span>
            </span>
          </Link>
        </div>
      </main>

      <footer>
        <SiteFooter note="Hesaplamalar bilgilendirme amaçlıdır; resmî tutarlar için SGK / Gelir İdaresi duyurularını takip edin." />
      </footer>
    </div>
  );
}
