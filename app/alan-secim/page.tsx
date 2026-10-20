'use client';

import { useState } from 'react';
import { MESEM_FIELDS } from '@/lib/constants';
import {
  FIELD_GROUPS,
  QUIZ_QUESTIONS,
  recommendFields,
  buildResultSummary,
} from '@/lib/fieldQuiz';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import {
  Sparkles,
  ChevronRight,
  RotateCcw,
  Check,
  MessageCircle,
  Share2,
  ArrowUpDown,
  Wrench,
  ClipboardList,
} from 'lucide-react';

const QUESTION_COUNT = QUIZ_QUESTIONS.length;

export default function AlanSecimPage() {
  // step: 0 = tanıtım, 1..N = sorular, N+1 = sonuç
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const top = answeredCount === QUESTION_COUNT ? recommendFields(answers) : [];
  const pickedFields = picked.length ? picked : top.slice(0, 2).flatMap((t) => t.fields).slice(0, 6);

  const summary = buildResultSummary(top.slice(0, 3), pickedFields);
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

  const choose = (qid: number, optIdx: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: optIdx };
      if (Object.keys(next).length === QUESTION_COUNT) {
        setTimeout(() => setStep(QUESTION_COUNT + 1), 450);
      }
      return next;
    });
    setTimeout(() => setStep((s) => (s < QUESTION_COUNT ? s + 1 : s)), 400);
  };

  const restart = () => {
    setAnswers({});
    setPicked([]);
    setStep(0);
  };

  const togglePick = (f: string) => {
    setPicked((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const currentQ = step >= 1 && step <= QUESTION_COUNT ? QUIZ_QUESTIONS[step - 1] : null;
  const progress = Math.round((answeredCount / QUESTION_COUNT) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader backHref="/" backLabel="Ana Sayfa" />

      <main className="flex-1 px-4 py-10 sm:py-14 w-full">
        {/* 1. TANITIM EKRANI */}
        {step === 0 && (
          <section className="max-w-3xl mx-auto">
            <div className="bg-[#0A1931] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A8B5]/15 border border-[#00A8B5]/30 text-[#00E5FF] text-[11px] font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5" /> 9. Sınıfa Başlayacaklara Özel
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                Hangi Meslek Alanı <span className="text-[#00A8B5]">Sana Göre?</span>
              </h1>
              <p className="mt-4 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                {QUESTION_COUNT} kısa soruyu cevapla; ilgi ve çalışma tarzına en uygun
                {' '}{FIELD_GROUPS.length} meslek grubunu ve MESEM alanlarını senin için sıralayalım.
                Kimseyi etiketlemiyoruz — sadece seçim yaparken aklındaki tabloyu netleştiriyoruz.
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-sm transition shadow-lg shadow-[#00A8B5]/30 cursor-pointer"
                >
                  Teste Başla <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: <ClipboardList className="w-5 h-5" />, title: `${QUESTION_COUNT} Soru`, text: 'Her biri 15 saniye — düşünmeden, içinden geleni seç.' },
                { icon: <Wrench className="w-5 h-5" />, title: 'Alan Bazlı Sonuç', text: `${MESEM_FIELDS.length} MESEM alanını ilgi gruplarına göre sıralarız.` },
                { icon: <ArrowUpDown className="w-5 h-5" />, title: 'Paylaşabilirsin', text: 'Sonucunu arkadaşına, öğretmenine ya da ailenle paylaş.' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center mx-auto mb-3">
                    {c.icon}
                  </div>
                  <h3 className="text-sm font-black text-[#0A1931]">{c.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-8">
              Not: Bu test bir yönlendirme aracıdır; nihai karar ailen ve okul rehber öğretmeninle birlikte verilmelidir.
            </p>
          </section>
        )}

        {/* 2. SORU EKRANI */}
        {currentQ && (
          <section className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Soru {step} / {QUESTION_COUNT}
              </span>
              <button
                type="button"
                onClick={restart}
                className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Baştan Başla
              </button>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-[#00A8B5] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-black text-[#0A1931] leading-snug mb-6">
                {currentQ.text}
              </h2>
              <div className="space-y-2.5">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => choose(currentQ.id, i)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border text-xs font-bold transition cursor-pointer flex items-center gap-3 ${
                      answers[currentQ.id] === i
                        ? 'border-[#00A8B5] bg-[#00A8B5]/5 text-[#0A1931]'
                        : 'border-slate-200 text-slate-700 hover:border-[#00A8B5]/50 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{opt.emoji}</span>
                    <span className="flex-1">{opt.label}</span>
                    {answers[currentQ.id] === i && (
                      <Check className="w-4 h-4 text-[#00A8B5] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-5">
              Doğru cevap yok — aklına ilk geleni seç, test öyle çalışır.
            </p>
          </section>
        )}

        {/* 3. SONUÇ EKRANI */}
        {step > QUESTION_COUNT && (
          <section className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A8B5]/10 border border-[#00A8B5]/25 text-[#00A8B5] text-[11px] font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Testin Tamamlandı
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0A1931]">
                Sana En Uygun Meslek Grupları
              </h1>
              <p className="text-xs text-slate-500 mt-2">
                İlgilerini ve çalışma tarzını 6 soruda özetledik. İlk 3 grubu senin için sıraladık;
                beğendiğin alanları seçip ilanlara gidebilirsin.
              </p>
            </div>

            <div className="space-y-4">
              {top.slice(0, 3).map((g, idx) => (
                <div
                  key={g.id}
                  className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-sm ${
                    idx === 0 ? 'border-[#00A8B5]' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full text-[10px] font-black text-white flex items-center justify-center flex-shrink-0 ${
                            idx === 0 ? 'bg-[#00A8B5]' : 'bg-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <h2 className="text-base font-black text-[#0A1931]">{g.name}</h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">{g.blurb}</p>
                    </div>
                    {idx === 0 && (
                      <span className="px-2.5 py-1 bg-[#00A8B5]/10 text-[#00A8B5] text-[10px] font-black rounded-full whitespace-nowrap flex-shrink-0">
                        EN UYGUN
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Bu gruptaki MESEM alanları
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {g.fields.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => togglePick(f)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                          picked.includes(f)
                            ? 'bg-[#0A1931] border-[#0A1931] text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-[#00A8B5]/50'
                        }`}
                      >
                        {picked.includes(f) && <Check className="w-3 h-3" />}
                        {f}
                      </button>
                    ))}
                  </div>

                  <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                    {g.lifeLines.map((l, i) => (
                      <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Seçilen alanlarla ilanlara git */}
            <div className="mt-8 bg-[#0A1931] rounded-3xl p-6 sm:p-8 text-center">
              <h3 className="text-sm font-black text-white">
                {pickedFields.length > 0
                  ? `${pickedFields.length} alan seçtin — şimdi bu alanlarda staj bulalım`
                  : 'Beğendiğin alanları seç, uygun ilanları bulalım'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {pickedFields.length > 0 ? pickedFields.join(' • ') : 'Yukarıdaki alan kartlarından seçim yapabilirsin.'}
              </p>
              <Link
                href={`/?${pickedFields
                  .slice(0, 2)
                  .map((f) => `alan=${encodeURIComponent(f)}`)
                  .join('&')}#ilanlar`}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-xs transition shadow-lg shadow-[#00A8B5]/30"
              >
                Bu Alanlarda İlanları Gör <ChevronRight className="w-4 h-4" />
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
                <MessageCircle className="w-3.5 h-3.5" /> Sonucumu Paylaş
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
                    <Share2 className="w-3.5 h-3.5" /> Sonucu Kopyala
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 rounded-full text-[11px] font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Testi Tekrar Çöz
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-8">
              Bu sonuç bir öneridir; nihai alan seçimini ailen ve rehber öğretmeninle birlikte yapmalısın.
            </p>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Stajyeri.net &mdash; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
