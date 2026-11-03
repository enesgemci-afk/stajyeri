import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { FIELD_GROUPS } from '@/lib/fieldQuiz';
import { slugifyTr } from '@/lib/meslekRehberi';
import {
  REHBER_STEPS,
  GROUP_GUIDES,
  PARENT_TIPS,
  COMMON_MISTAKES,
  COMPARE_QUESTIONS,
} from '@/lib/meslekSecimRehberi';
import {
  Compass,
  ArrowRight,
  Check,
  XCircle,
  Users,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meslek Seçim Rehberi — 5 Adımda Doğru Mesleği Bul | Stajyeri.net',
  description:
    '8. sınıf sonrası meslek seçimi için kapsamlı rehber: kendini tanı, 6 ilgi grubunu tanı (günün akışı, iş bulma, dikkat edilmesi gerekenler), gerçeklerle karşılaştır, yol haritası çiz. Ebeveyn köşesi ve karar matrisi dahil.',
  keywords: [
    'meslek seçim rehberi',
    '8. sınıf meslek seçimi',
    'MESEM alan seçimi',
    'hangi mesleği seçmeliyim',
    'mesleki rehberlik',
  ],
};

export default function MeslekSecimRehberiPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <Compass className="w-4 h-4" /> 41 alan · 6 ilgi grubu · 5 adım
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
            Meslek Seçim <span className="text-[#00A8B5]">Rehberi</span>
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            “Hangi mesleği seçmeliyim?” sorusunun doğrusu şansla değil, yöntemle cevaplanır.
            Bu rehber, kararını 5 adımda bilinçli vermen için hazırlandı: önce kendini,
            sonra mesleği tanıyacaksın.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto pt-6 border-t border-white/10">
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#00E5FF]">5</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Adım</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">6</p>
              <p className="text-[10px] text-slate-400 mt-0.5">İlgi Grubu</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#FF6B00]">41</p>
              <p className="text-[10px] text-slate-400 mt-0.5">MESEM Alanı</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 ADIM */}
      <section className="max-w-3xl w-full mx-auto px-4 py-14">
        <h2 className="text-lg sm:text-2xl font-black text-[#0A1931] text-center">
          Karar 5 Adımda Verilir
        </h2>
        <p className="text-[11px] text-slate-500 text-center mt-2 max-w-xl mx-auto">
          Adımları sırayla izle; her adımın sonunda sana hazır bir araç önereceğiz.
        </p>

        <div className="mt-8 space-y-5">
          {REHBER_STEPS.map((s) => (
            <div key={s.n} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-9 h-9 rounded-2xl bg-[#00A8B5] text-white font-black text-sm flex items-center justify-center">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-[#0A1931]">{s.title}</h3>
                  <p className="text-[11px] text-[#00A8B5] font-bold italic mt-1">{s.question}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-2">{s.desc}</p>
                  {s.tool && (
                    <Link
                      href={s.tool.href}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00A8B5]/10 hover:bg-[#00A8B5]/20 text-[#00A8B5] text-[11px] font-black transition"
                    >
                      {s.tool.label} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 İLGİ GRUBU */}
      <section className="max-w-5xl w-full mx-auto px-4 pb-14">
        <h2 className="text-lg sm:text-2xl font-black text-[#0A1931] text-center">
          6 İlgi Grubunu Tanı
        </h2>
        <p className="text-[11px] text-slate-500 text-center mt-2 max-w-2xl mx-auto">
          Her grup, dünyada kabul gören ilgi tipleri (Holland RIASEC) ile hizalanmıştır.
          Kendini en çok tanıdığın grubu bul, grubun “günün akışı”nı hayal et.
        </p>

        <div className="mt-8 space-y-6">
          {GROUP_GUIDES.map((g) => {
            const fg = FIELD_GROUPS.find((f) => f.id === g.id);
            return (
              <div
                key={g.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden"
              >
                {/* Grup başlığı */}
                <div className="bg-[#0A1931] px-5 sm:px-6 py-4 flex flex-wrap items-center gap-3">
                  <span className="text-2xl">{g.emoji}</span>
                  <h3 className="text-sm font-black text-white flex-1 min-w-0">{g.name}</h3>
                  <span className="px-2.5 py-1 rounded-full bg-[#00A8B5]/20 border border-[#00A8B5]/30 text-[#00E5FF] text-[9px] font-extrabold uppercase tracking-wide">
                    {g.riasec}
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <strong className="text-[#0A1931] font-black">Kim uygun? </strong>
                    {g.kimUygun}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-[#F8FAFC] rounded-2xl p-4">
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Günün akışı (örnek)
                      </p>
                      <p className="text-[10px] text-slate-600 leading-relaxed">{g.gunAkisi}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-2xl p-4">
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Ortam & iş bulma
                      </p>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        <strong className="text-[#0A1931]">Ortam: </strong>
                        {g.ortam}
                      </p>
                      <p className="text-[10px] text-slate-600 leading-relaxed mt-1.5">
                        <strong className="text-[#0A1931]">Pazar: </strong>
                        {g.isBulma}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-2xl p-3.5 text-[10px] text-slate-700 leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#FF6B00] font-black">Dikkat: </strong>
                      {g.dikkat}
                    </span>
                  </div>

                  {/* Temsilci alanlar */}
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Öne çıkan 3 alan
                    </p>
                    <div className="space-y-2">
                      {g.temsilci.map((t) => (
                        <Link
                          key={t.name}
                          href={`/meslek/${slugifyTr(t.name)}`}
                          className="block bg-white border border-slate-200 hover:border-[#00A8B5] rounded-2xl px-4 py-2.5 transition group"
                        >
                          <span className="block text-[11px] font-black text-[#0A1931] group-hover:text-[#00A8B5] transition">
                            {t.name}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">{t.why}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Tüm alanlar */}
                  {fg && (
                    <details className="group bg-slate-50 rounded-2xl">
                      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-[11px] font-black text-[#0A1931]">
                        Bu gruptaki tüm alanlar ({fg.fields.length})
                        <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 flex flex-wrap gap-2">
                        {fg.fields.map((f) => (
                          <Link
                            key={f}
                            href={`/meslek/${slugifyTr(f)}`}
                            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#00A8B5] hover:text-[#00A8B5] text-[10px] font-bold text-slate-600 transition"
                          >
                            {f}
                          </Link>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* KARAR MATRİSİ */}
      <section className="max-w-3xl w-full mx-auto px-4 pb-14">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-lg font-black text-[#0A1931] text-center">
            İki Alan Arasında mı Kalıyorsun?
          </h2>
          <p className="text-[11px] text-slate-500 text-center mt-2">
            Karar matrisi: her soruyu yüksek sesle sor, iki alan için de cevap ver.
            Cevapların çoğu tek tarafa eğiliyorsa işaret netleşiyor demektir.
          </p>
          <ul className="mt-6 space-y-3">
            {COMPARE_QUESTIONS.map((q, i) => (
              <li key={i} className="flex items-start gap-3 text-[11px] text-slate-700 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-xl bg-[#00A8B5]/10 text-[#00A8B5] font-black text-[10px] flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SIK HATALAR */}
      <section className="max-w-4xl w-full mx-auto px-4 pb-14">
        <h2 className="text-lg sm:text-2xl font-black text-[#0A1931] text-center">
          5 Sık Yapılan Hata
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {COMMON_MISTAKES.map((m) => (
            <div key={m.title} className="bg-white rounded-2xl border border-red-100 p-5">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <h3 className="text-xs font-black text-[#0A1931]">{m.title}</h3>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed mt-2">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EBEVEYN KÖŞESİ */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-black text-white text-center flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-[#00E5FF]" /> Ebeveyn Köşesi
          </h2>
          <p className="text-[11px] text-slate-400 text-center mt-2 max-w-xl mx-auto">
            Alan seçimi aile kararıdır — ama imzanın altında çocuğunuzun hayatı vardır.
            Bu 5 ilke, yanında dururken işinizi kolaylaştırır.
          </p>
          <div className="mt-8 space-y-3">
            {PARENT_TIPS.map((t, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 flex items-start gap-3"
              >
                <Check className="w-4 h-4 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-200 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl w-full mx-auto px-4 py-14 text-center">
        <h2 className="text-lg sm:text-2xl font-black text-[#0A1931]">
          Rehberi okudun — şimdi sıra sende
        </h2>
        <p className="text-[11px] text-slate-500 mt-2 max-w-xl mx-auto">
          5. adımı unutma: karar deneyerek netleşir. Testini çöz, patikanı çiz, ilanları takip et.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Link
            href="/alan-secim"
            className="px-6 py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-xs transition shadow-lg shadow-[#00A8B5]/30"
          >
            🧭 Alan Seçim Testini Çöz
          </Link>
          <Link
            href="/patika"
            className="px-6 py-3 bg-[#0A1931] hover:bg-[#10294d] text-white font-black rounded-full text-xs transition"
          >
            🗺️ Staj Patikamı Oluştur
          </Link>
          <Link
            href="/ilanlar"
            className="px-6 py-3 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 font-black rounded-full text-xs transition"
          >
            İlanları Keşfet
          </Link>
        </div>

        <p className="text-[10px] text-slate-400 mt-10 max-w-2xl mx-auto leading-relaxed">
          Rehberin yaklaşımı MEB “Karar Anı” mesleki rehberlik adımları, Holland RIASEC ilgi
          tipolojisi ve İŞKUR meslek kartı şablonlarıyla uyumlu olarak hazırlanmıştır; ücret
          bilgileri 3308 sayılı Meslekî Eğitim Kanunu tabanlarıdır. Nihai karar için okulunuzun
          rehberlik servisiyle birlikte değerlendirin.
        </p>
      </section>

      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
