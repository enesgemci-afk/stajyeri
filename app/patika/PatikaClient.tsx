'use client';

import { useMemo, useState } from 'react';
import { MESEM_FIELDS } from '@/lib/constants';
import { FIELD_BY_SLUG, slugifyTr } from '@/lib/meslekRehberi';
import {
  DURUMS,
  HEDEFS,
  buildPatika,
  buildPatikaSummary,
  type Durum,
  type Hedef,
} from '@/lib/stajPatikasi';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import {
  Sparkles,
  ChevronRight,
  RotateCcw,
  Check,
  MessageCircle,
  Share2,
  ArrowRight,
  Wallet,
  Flag,
  Compass,
} from 'lucide-react';

const STEP_COUNT = 3;

/** Adım başlığı: 1-2-3 noktaları + soru */
function StepHeader({
  current,
  title,
  desc,
}: {
  current: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 mb-3" aria-label={`Adım ${current} / ${STEP_COUNT}`}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < current ? 'bg-[#00A8B5]' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-[#0A1931]">{title}</h2>
      <p className="text-[11px] text-slate-500 mt-1.5 max-w-md mx-auto">{desc}</p>
    </div>
  );
}

export default function PatikaClient() {
  // step: 0 = tanıtım, 1 = durum, 2 = hedef+alan, 3 = patika sonucu
  const [step, setStep] = useState(0);
  const [durum, setDurum] = useState<Durum | null>(null);
  const [hedef, setHedef] = useState<Hedef | null>(null);
  const [alan, setAlan] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => (durum && hedef ? buildPatika(durum, hedef) : null),
    [durum, hedef],
  );

  const fieldGuide = alan ? FIELD_BY_SLUG[slugifyTr(alan)] : undefined;
  const summary = result
    ? buildPatikaSummary(
        result.durum.label,
        result.hedef.label,
        result.stages.map((s) => s.title),
      )
    : '';
  const waUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // panoya erisilemediyse sessizce gec
    }
  };

  const restart = () => {
    setDurum(null);
    setHedef(null);
    setAlan('');
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader backHref="/" backLabel="Ana Sayfa" />

      <main className="flex-1 px-4 py-10 sm:py-14 w-full">
        {/* 0. TANITIM EKRANI */}
        {step === 0 && (
          <section className="max-w-3xl mx-auto">
            <div className="bg-[#0A1931] rounded-3xl p-8 sm:p-12 text-white text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A8B5]/15 border border-[#00A8B5]/30 text-[#00E5FF] text-[11px] font-bold mb-6">
                <Flag className="w-3.5 h-3.5" /> Çıraktan Ustaya Yol Haritası
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                Staj <span className="text-[#00A8B5]">Patikanı</span> Oluştur
              </h1>
              <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                Nerede olduğunu ve nereye gitmek istediğini söyle; çıraklıktan ustalığa,
                üniversiteye veya kendi işyerine uzanan yol haritanı aşama aşama çıkaralım.
                Ücret hakların ve gereken belgeler dahil — ücretsiz.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 text-left">
                {[
                  { n: 1, t: 'Durumunu seç', d: '8. sınıf mı, çırak mı, kalfa mı, mezun mu?' },
                  { n: 2, t: 'Hedefini gir', d: 'Usta belgesi, işyeri, üniversite veya maaşlı iş.' },
                  { n: 3, t: 'Patikan hazır', d: 'Aşamalar, belgeler ve ücret hakların listeli.' },
                ].map((s) => (
                  <div key={s.n} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-[#00A8B5] text-[#0A1931] text-[11px] font-black">
                      {s.n}
                    </span>
                    <p className="text-xs font-black mt-2">{s.t}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{s.d}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-xs transition shadow-lg shadow-[#00A8B5]/30 cursor-pointer"
              >
                Patikamı Oluştur <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400 mt-4">
                Alanını henüz seçmediysen önce{' '}
                <Link href="/alan-secim" className="text-[#00E5FF] font-bold hover:underline">
                  Alan Seçim Testini
                </Link>{' '}
                çözebilirsin.
              </p>
            </div>
          </section>
        )}

        {/* 1. DURUM SEÇİMİ */}
        {step === 1 && (
          <section className="max-w-3xl mx-auto">
            <StepHeader
              current={1}
              title="Şu an neredesin?"
              desc="Durumunu seç — patikan tam buradan başlayacak, gerisi gelmeyecek."
            />
            <div className="grid gap-3 mt-6">
              {DURUMS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDurum(d.id);
                    setTimeout(() => setStep(2), 250);
                  }}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-[#00A8B5] hover:shadow-md transition-all p-4 flex items-center gap-4 text-left cursor-pointer"
                >
                  <span className="text-2xl flex-shrink-0">{d.emoji}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-black text-[#0A1931] group-hover:text-[#00A8B5] transition">
                      {d.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{d.desc}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#00A8B5] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-600 rounded-full text-[11px] font-bold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Geri
            </button>
          </section>
        )}

        {/* 2. HEDEF SEÇİMİ + İSTEĞE BAĞLI ALAN */}
        {step === 2 && (
          <section className="max-w-3xl mx-auto">
            <StepHeader
              current={2}
              title="Hedefin ne?"
              desc="Bir hedef seç; alan bilgisi opsiyonel ama seçersen patikan alanına özel çıkar."
            />
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              {HEDEFS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHedef(h.id)}
                  className={`group rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    hedef === h.id
                      ? 'border-[#00A8B5] bg-[#00A8B5]/5 shadow-md shadow-[#00A8B5]/10'
                      : 'border-slate-200 bg-white hover:border-[#00A8B5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-xs font-black text-[#0A1931] group-hover:text-[#00A8B5] transition">
                      {h.label}
                    </span>
                    {hedef === h.id && <Check className="w-4 h-4 text-[#00A8B5] ml-auto" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{h.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Meslek Alanın <span className="text-slate-300 font-medium normal-case">(opsiyonel)</span>
              </label>
              <select
                value={alan}
                onChange={(e) => setAlan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-[#00A8B5] focus:ring-2 focus:ring-[#00A8B5]/20"
              >
                <option value="">Şimdilik belirsiz — genel patika çıkarılsın</option>
                {MESEM_FIELDS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-6">
              <button
                type="button"
                disabled={!hedef}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00A8B5] hover:bg-[#00929e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-full text-xs transition cursor-pointer"
              >
                Patikamı Göster <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-600 rounded-full text-[11px] font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Geri
              </button>
            </div>
          </section>
        )}

        {/* 3. PATİKA SONUCU */}
        {step === 3 && result && (
          <section className="max-w-3xl mx-auto">
            {/* Özet başlık */}
            <div className="bg-[#0A1931] rounded-3xl p-6 sm:p-8 text-white">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200">
                  {result.durum.emoji} {result.durum.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00A8B5]" />
                <span className="px-3 py-1 rounded-full bg-[#00A8B5]/20 border border-[#00A8B5]/30 text-[#00E5FF]">
                  Hedef: {result.hedef.emoji} {result.hedef.label}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black mt-4 leading-tight">
                Senin Staj Patikan <span className="text-[#00A8B5]">hazır</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-2">
                {result.track === 'MTAL'
                  ? 'Meslek lisesi (3+2) rotası — 3308 kapsamında'
                  : 'MESEM çıraklık rotası — 3308 kapsamında'}
                {' '}· {result.stages.length} aşama
              </p>
            </div>

            {/* Zaman çizelgesi */}
            <div className="mt-8 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200" aria-hidden />
              <div className="space-y-5">
                {result.stages.map((s, i) => (
                  <div key={s.ord} className="relative pl-12">
                    <span className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm">
                      {s.emoji}
                    </span>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-[#0A1931]">
                          {i + 1}. {s.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-extrabold uppercase tracking-wide">
                          {s.period}
                        </span>
                        {s.ucret && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-[9px] font-extrabold">
                            💰 {s.ucret}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-2">{s.desc}</p>

                      {s.belgeler.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {s.belgeler.map((b, bi) => (
                            <li key={bi} className="text-[10px] text-slate-600 flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}

                      {s.ipuclari.length > 0 && (
                        <div className="mt-3 bg-[#F8FAFC] rounded-xl p-3">
                          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                            İpuçları
                          </p>
                          <ul className="space-y-1">
                            {s.ipuclari.map((ip, ipi) => (
                              <li key={ipi} className="text-[10px] text-slate-600 flex items-start gap-1.5">
                                <Sparkles className="w-3 h-3 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                                {ip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {s.link && (
                        <Link
                          href={s.link.href}
                          className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-[#00A8B5] hover:gap-2 transition-all"
                        >
                          {s.link.label} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ücret hakları yol haritası */}
            <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6">
              <h3 className="text-sm font-black text-[#0A1931] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#FF6B00]" /> Yol boyunca ücret hakların
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {result.ucretMilestones.map((m) => (
                  <div key={m.label} className="bg-[#F8FAFC] rounded-2xl p-3.5 text-center">
                    <p className="text-[10px] font-bold text-slate-500">{m.label}</p>
                    <p className="text-[11px] font-black text-[#FF6B00] mt-1">{m.badge}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-sky-50 border border-sky-100 rounded-2xl p-3.5 text-[10px] text-slate-600 leading-relaxed">
                {result.destekNotu}{' '}
                <Link href="/imep" className="font-black text-sky-600 hover:underline">
                  İMEP nedir? →
                </Link>
              </div>
            </div>

            {/* Seçilen alan bilgisi */}
            {alan && (
              <div className="mt-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-sm font-black text-[#0A1931] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#00A8B5]" />
                  {fieldGuide ? fieldGuide.name : alan}
                </h3>
                {fieldGuide ? (
                  <>
                    <p className="text-[11px] text-slate-500 mt-1.5 italic">
                      &ldquo;{fieldGuide.tagline}&rdquo;
                    </p>
                    <div className="mt-3">
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Bu alanın çıkış kapıları
                      </p>
                      <ul className="space-y-1">
                        {fieldGuide.cikisKapilari.map((c, ci) => (
                          <li key={ci} className="text-[10px] text-slate-600 flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href={`/meslek/${fieldGuide.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-[#00A8B5] hover:gap-2 transition-all"
                    >
                      Alan rehberini oku <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-2">
                    Bu alanın detaylı rehberi hazırlanıyor; ilanlara şimdiden göz atabilirsin.
                  </p>
                )}
              </div>
            )}

            {/* CTA: ilanlara git */}
            <div className="mt-8 bg-[#0A1931] rounded-3xl p-6 sm:p-8 text-center">
              <h3 className="text-sm font-black text-white">
                Patikan ilk aşamasına hazır mısın?
              </h3>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {alan
                  ? `${alan} alanındaki aktif staj ve çıraklık ilanlarını incele.`
                  : 'Aktif staj ve çıraklık ilanlarını incele, ilk adımı at.'}
              </p>
              <Link
                href={alan ? `/?alan=${encodeURIComponent(alan)}#ilanlar` : '/ilanlar'}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-xs transition shadow-lg shadow-[#00A8B5]/30"
              >
                İlanları Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Paylaş + Yeniden */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold transition"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Patikamı Paylaş
              </a>
              <button
                type="button"
                onClick={copySummary}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-bold transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Kopyalandı
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" /> Patikayı Kopyala
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 rounded-full text-[11px] font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Patikayı Yeniden Kur
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-8">
              Bu patika 3308 sayılı Meslekî Eğitim Kanunu ve MEB uygulamalarına göre bilgi amaçlı hazırlanmıştır;
              nihai kararlarda okulunun müdürlüğü ve MEB mesleki eğitim biriminden teyit al.
            </p>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[11px] text-slate-400">
        &copy; 2026 Stajyeri.net &mdash; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}