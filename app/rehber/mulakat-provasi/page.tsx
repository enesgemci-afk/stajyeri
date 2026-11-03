'use client';

import { useEffect, useMemo, useState } from 'react';
import { MESEM_FIELDS } from '@/lib/constants';
import {
  GENERAL_QUESTIONS,
  getInterviewQuestions,
} from '@/lib/interviewContent';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import {
  Sparkles,
  ChevronRight,
  RotateCcw,
  Check,
  Timer,
  MessageCircle,
  Star,
} from 'lucide-react';

const Q_COUNT = 6;
const TIME_PER_Q = 120;

interface Answer {
  text: string;
  score: number; // 1-5 öz değerlendirme
}

export default function MulakatProvasiPage() {
  // step: 0 = alan seçimi, 1..N = sorular, N+1 = sonuç
  const [step, setStep] = useState(0);
  const [field, setField] = useState('');
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [draft, setDraft] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(TIME_PER_Q);
  const [rated, setRated] = useState(false); // o soruda puan verildi mi

  const questions = useMemo(() => {
    const general = GENERAL_QUESTIONS.slice(0, 3).map((q) => q.q);
    const fieldQs = getInterviewQuestions(field)
      .slice(0, 3)
      .map((q) => q.q);
    return [...general, ...fieldQs];
  }, [field]);

  // Soru adımında geri sayım
  useEffect(() => {
    if (step < 1 || step > Q_COUNT) return;
    setSecondsLeft(TIME_PER_Q);
    setRated(false);
    setDraft(answers[step]?.text ?? '');
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
    // answers[] bağımlılığı koşullu — sadece adım/alan değişince sıfırlansın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, field]);

  const rate = (score: number) => {
    setAnswers((prev) => ({ ...prev, [step]: { text: draft.trim(), score } }));
    setRated(true);
  };

  const next = () => {
    if (!rated) rate(3); // puan verilmeden geçilirse nötr puan
    setStep((s) => (s <= Q_COUNT ? s + 1 : s));
  };

  const restart = () => {
    setAnswers({});
    setField('');
    setStep(0);
  };

  const scored = Object.values(answers);
  const avg = scored.length
    ? scored.reduce((a, b) => a + b.score, 0) / scored.length
    : 0;
  const verdict =
    avg >= 4.5
      ? 'Hazırsın! Bu ritmi koru — mülakatta kendine güvenin hissedilecek.'
      : avg >= 3.5
        ? 'İyi gidiyorsun. Düşük puanladığın sorulara bir daha göz at.'
        : 'Prova tekrarı öneriyoruz: cevaplarını kısaltıp örnek eklemek puanı hızlı yükseltir.';

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader backHref="/rehber/mulakat-sorulari" backLabel="Mülakat Soruları" />

      <main className="flex-1 px-4 py-10 sm:py-14 w-full">
        {/* 0. ALAN SEÇİMİ */}
        {step === 0 && (
          <section className="max-w-3xl mx-auto">
            <div className="bg-[#0A1931] rounded-3xl p-8 sm:p-12 text-white text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A8B5]/15 border border-[#00A8B5]/30 text-[#00E5FF] text-[11px] font-bold mb-6">
                <Timer className="w-3.5 h-3.5" /> Kronometreli Mülakat Provası
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                Gerçek mülakat gibi <span className="text-[#00A8B5]">pratik yap</span>
              </h1>
              <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                {Q_COUNT} soru, soru başına {TIME_PER_Q / 60} dakika. Cevabını yaz, kendini
                puanla, sonunda hazır olup olmadığını gör. Kimse kaydetmiyor — kendi hızında,
                kendi ortamında.
              </p>

              <div className="mt-8 text-left">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Meslek alanın (isteğe bağlı — alanına özel 3 soru eklenir)
                </label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00A8B5] [&>option]:text-slate-800"
                >
                  <option value="">Genel sorularla başla (tüm alanlar)</option>
                  {MESEM_FIELDS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-xs transition cursor-pointer"
                >
                  Provaya Başla <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-slate-400 mt-3 text-center">
                  Soru kalıplarını önce incelemek istersen{' '}
                  <Link href="/rehber/mulakat-sorulari" className="text-[#00E5FF] font-bold hover:underline">
                    Mülakat Soruları
                  </Link>{' '}
                  sayfasına göz at.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 1..N. SORU ADIMI */}
        {step >= 1 && step <= Q_COUNT && (
          <section className="max-w-3xl mx-auto">
            {/* İlerleme + süre */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-[11px] font-extrabold text-slate-500">
                Soru {step} / {Q_COUNT}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${
                  secondsLeft <= 15 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Timer className="w-3.5 h-3.5" /> {mm}:{ss}
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-[#00A8B5] transition-all"
                style={{ width: `${((step - 1) / Q_COUNT) * 100}%` }}
              />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-sm sm:text-base font-black text-[#0A1931] leading-snug">
                {questions[step - 1]}
              </h2>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                placeholder="Cevabını buraya yaz... (Kısa ve öz: 3-4 cümle yeterli)"
                className="mt-4 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] focus:ring-2 focus:ring-[#00A8B5]/20 resize-y"
              />

              {/* Öz değerlendirme */}
              <div className="mt-5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Bu cevabını kendine göre puanla
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => rate(n)}
                      className={`p-1 rounded-lg transition cursor-pointer ${
                        (answers[step]?.score ?? 0) >= n
                          ? 'text-[#FF6B00]'
                          : 'text-slate-300 hover:text-slate-400'
                      }`}
                      aria-label={`${n} puan`}
                    >
                      <Star className={`w-6 h-6 ${rated ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                  {rated && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-black text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> Kaydedildi
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={next}
                className="mt-6 w-full py-3.5 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-xs transition cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {step === Q_COUNT ? 'Sonucu Gör' : 'Sonraki Soru'}{' '}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* N+1. SONUÇ */}
        {step === Q_COUNT + 1 && (
          <section className="max-w-3xl mx-auto">
            <div className="bg-[#0A1931] rounded-3xl p-8 text-white text-center">
              <span className="text-4xl">{avg >= 4.5 ? '🏆' : avg >= 3.5 ? '💪' : '🔁'}</span>
              <h1 className="mt-4 text-2xl sm:text-3xl font-black">
                Ortalaman: <span className="text-[#00E5FF]">{avg.toFixed(1)} / 5</span>
              </h1>
              <p className="mt-3 text-slate-300 text-xs max-w-xl mx-auto leading-relaxed">
                {verdict}
              </p>
            </div>

            {/* Soru bazlı döküm */}
            <div className="mt-6 space-y-3">
              {questions.map((q, i) => {
                const a = answers[i + 1];
                return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-black text-[#0A1931]">{q}</p>
                      <span className="flex-shrink-0 inline-flex items-center gap-0.5 text-[#FF6B00]">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                              (a?.score ?? 0) >= n ? 'fill-current' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    {a?.text && (
                      <p className="mt-2 text-[11px] text-slate-500 leading-relaxed bg-slate-50 rounded-xl p-3">
                        {a.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* İpuçları */}
            <div className="mt-6 bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-2xl p-4 text-[11px] text-slate-700 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
              Altın kural: bilmediğini bilmemek yapmak yok. “Henüz bilmiyorum ama hemen öğrenirim”
              en güçlü cevaplardan biridir.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 rounded-full text-[11px] font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Provayı Tekrar Yap
              </button>
              <Link
                href="/rehber/mulakat-sorulari"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-bold transition"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Soru Bankasını İncele
              </Link>
              <Link
                href="/ilanlar"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00A8B5] hover:bg-[#00929e] text-white rounded-full text-[11px] font-black transition"
              >
                İlanlara Başvur <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
