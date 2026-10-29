import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import WageCalculator from '@/components/WageCalculator';
import {
  Wallet,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Award,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Staj ve Çıraklık Ücretleri (3308) — Ne Kadar Kazanırım? | Stajyeri.net',
  description:
    'MESEM çırağı, kalfa ve meslek lisesi stajyeri ne kadar ücret alır? 3308 Sayılı Kanun ücret hakları, İMEP desteği, sigorta güvencesi ve anlık hesaplayıcı.',
  keywords: [
    'staj ücreti',
    'çıraklık ücreti',
    'MESEM maaş',
    '3308 ücret',
    'stajyer ne kadar alır',
    'kalfa ücreti',
  ],
};

const MODELS = [
  {
    icon: GraduationCap,
    title: 'MESEM Çırağı',
    tag: '9-11. Sınıf',
    pct: 30,
    color: 'text-[#00A8B5]',
    badge: 'bg-[#00A8B5]/10 text-[#00A8B5]',
    points: [
      'Net asgari ücretin en az %30u aylık ücret olarak ödenir.',
      'İMEP desteği bu ücreti işletmeye sıfır maliyet yapar.',
      'Yılın 12 ayı ödenir — yaz tatili dahil.',
      'İş kazası ve meslek hastalığı sigortası devletçe karşılanır.',
    ],
  },
  {
    icon: Award,
    title: 'MESEM Kalfası',
    tag: '12. Sınıf',
    pct: 50,
    color: 'text-[#FF6B00]',
    badge: 'bg-[#FF6B00]/10 text-[#FF6B00]',
    points: [
      'Kalfa eğitimine geçen öğrenciye net asgari ücretin en az %50si ödenir.',
      'Ücretin %30unu İMEP, %20sini işletme karşılar.',
      'Kalfalık sınavı sonunda resmî kalfalık belgesi alınır.',
      'Belge; mesleği tek başına yapma yetkisi verir.',
    ],
  },
  {
    icon: Briefcase,
    title: 'Meslek Lisesi Stajyeri',
    tag: 'İşletmelerde Eğitim',
    pct: 30,
    color: 'text-sky-600',
    badge: 'bg-sky-100 text-sky-700',
    points: [
      '12. sınıf öğrencisi haftada 3 gün işletmede eğitim görür.',
      'Net asgari ücretin en az %30u tutarında ücret ödenir.',
      'Ücretin bir bölümü devletçe karşılanır (2/3 veya 1/3).',
      'Usta öğretici gözetiminde, sigortalı olarak çalışır.',
    ],
  },
];

const FAQS = [
  {
    q: 'Staj ücretini kim öder, devlet karşılıyor mu?',
    a: 'Ücreti işletme öder. Ödenen ücretin bir bölümü (işletmedeki sigortalı çalışan sayısına göre 2/3 veya 1/3) devletçe karşılanır. MESEM çırağında İMEP desteği ücretin tamamını karşılar; işletmenin cebinden çıkmaz.',
  },
  {
    q: 'Ücret ödenmezse ne yapmalıyım?',
    a: '3308 Sayılı Kanun çırak ve işletmelerde eğitilen öğrencilere ücret hakkını garanti eder. Ödeme yapılmıyorsa okulun MESEM koordinatörlüğüne ve İl Millî Eğitim Müdürlüğüne başvurabilirsin.',
  },
  {
    q: 'Yaz tatilinde de ücret alır mıyım?',
    a: 'Evet. MESEM eğitimi yılın 12 ayı sürer; öğrenci yaz aylarında da işletmede eğitimine devam eder ve ücreti kesintisiz ödenir.',
  },
  {
    q: 'Sigortam kim tarafından karşılanır?',
    a: 'İş kazası ve meslek hastalıkları sigorta primleri MEB (Hazine) bütçesinden karşılanır. Öğrenciden sigorta primi talep edilemez.',
  },
  {
    q: 'Ücrete zam talep edebilir miyim?',
    a: 'Kanuni taban "en az" değerdir; işletme daha yüksek ödeyebilir. Kalfalık belgesi almak en somut zam aracıdır — belge ile ücret tabanı %30dan %50ye çıkar.',
  },
];

export default function StajUcretleriPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/20 text-[#FFB380] text-xs font-bold mb-4">
            <Wallet className="w-4 h-4" /> 3308 Sayılı Kanun Garantisi
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
            Staj ve Çıraklık Ücretleri Rehberi
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            MESEM çırağı, kalfa ve meslek lisesi stajyerinin ücret hakları, devlet desteği ve sigorta
            güvencesi — hepsi tek sayfada, hesaplayıcıyla birlikte.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10 pt-6 border-t border-white/10">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#00E5FF]">%30+</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Çırak Ücreti</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#FF6B00]">%50+</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Kalfa Ücreti</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">0 TL</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">İşletme Maliyeti (çırakta)</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Net asgari ücret üzerinden kanuni taban oranlar</p>
        </div>
      </section>

      {/* Model kartları */}
      <section className="max-w-6xl w-full mx-auto px-4 py-14">
        <h2 className="text-xl sm:text-2xl font-black text-[#0A1931] text-center">
          Üç Eğitim Modeli, Üç Ücret Tabanı
        </h2>
        <p className="text-xs text-slate-500 text-center mt-2 max-w-2xl mx-auto">
          3308 Sayılı Meslekî Eğitim Kanunu, her eğitim modeli için asgari ücret üzerinden kanuni ücret tabanı belirler.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {MODELS.map((m) => (
            <div key={m.title} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${m.badge}`}>{m.tag}</span>
              </div>
              <p className={`text-3xl font-black ${m.color}`}>%{m.pct}</p>
              <p className="text-[10px] text-slate-400 font-medium">net asgari ücretin en azı</p>
              <h3 className="text-sm font-black text-[#0A1931] mt-3">{m.title}</h3>
              <ul className="space-y-2 mt-4">
                {m.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Hesaplayıcı */}
      <section className="max-w-6xl w-full mx-auto px-4 pb-14">
        <WageCalculator />
      </section>

      {/* SSS */}
      <section className="max-w-3xl w-full mx-auto px-4 pb-14">
        <h2 className="text-xl sm:text-2xl font-black text-[#0A1931] text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#00A8B5]" /> Sık Sorulan Sorular
        </h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <summary className="cursor-pointer list-none px-5 py-4 text-xs font-black text-[#0A1931] flex items-center justify-between gap-3">
                {f.q}
                <span className="text-[#00A8B5] group-open:rotate-45 transition-transform text-lg leading-none">+</span>
              </summary>
              <p className="px-5 pb-4 text-xs text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA şeridi */}
      <section className="max-w-6xl w-full mx-auto px-4 pb-16 grid sm:grid-cols-2 gap-4">
        <div className="bg-[#0A1931] rounded-3xl p-6">
          <p className="text-sm font-black text-white">🧭 Mesleğini mi keşfediyorsun?</p>
          <p className="text-[11px] text-slate-300 mt-1.5">
            41 MESEM alanının rehberine göz at — hangi meslek sana uygun, ne iş yapar, nereye gider.
          </p>
          <Link
            href="/meslek"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00A8B5] text-white text-xs font-black hover:bg-[#008f9a] transition"
          >
            Meslek Rehberi <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-3xl p-6">
          <p className="text-sm font-black text-[#0A1931] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00]" /> İşletme misin?
          </p>
          <p className="text-[11px] text-slate-600 mt-1.5">
            Çırak ücreti İMEP desteğiyle cebinden çıkmıyor. Kişisel teşvik hesabın için simülatörü kullan.
          </p>
          <Link
            href="/tesvik-simulasyon"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF6B00] text-white text-xs font-black hover:bg-[#e05f00] transition"
          >
            Teşvik Simülatörü <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Stajyeri.net — Staj ve Çıraklık Ücretleri Rehberi</p>
      </footer>
    </div>
  );
}