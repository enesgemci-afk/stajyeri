import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import type { LucideIcon } from 'lucide-react';
import {
  ShieldCheck,
  GraduationCap,
  Award,
  Briefcase,
  CheckCircle2,
  Users,
  BookOpen,
  Wallet,
  HeartPulse,
  Calendar,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface ScopeCard {
  icon: LucideIcon;
  title: string;
  tag: string;
  iconColor: string;
  badgeClass: string;
  points: string[];
}

const SCOPE_CARDS: ScopeCard[] = [
  {
    icon: GraduationCap,
    title: "MESEM Çıraklık (9-11. Sınıf)",
    tag: "Çırak Adayı → Çırak",
    iconColor: "text-[#00A8B5]",
    badgeClass: "bg-[#00A8B5]/10 text-[#00A8B5]",
    points: [
      "8. sınıfı tamamlamış gençler 9. sınıftan itibaren Mesleki Eğitim Merkezleri'nde (MESEM) eğitime başlar.",
      "Haftada 4 gün işletmede pratik, 1 gün okulda teorik eğitim; yılın 12 ayı boyunca.",
      "Aylık ücret: net asgari ücretin en az %30'u.",
      "İş kazası ve meslek hastalıklarına karşı sigorta.",
    ],
  },
  {
    icon: Wallet,
    title: "Kalfa Eğitimi (MESEM 12. Sınıf)",
    tag: "Kalfalık Yolu",
    iconColor: "text-[#FF6B00]",
    badgeClass: "bg-[#FF6B00]/10 text-[#FF6B00]",
    points: [
      "12. sınıfta kalfa eğitimine geçen öğrenciye net asgari ücretin en az %50'si ödenir.",
      "Kalfa eğitimi sonunda kalfalık sınavına girilir.",
      "Kalfalık belgesi, mesleği tek başına yapma yetkisi verir.",
      "Kalfalık sonrası 3 yıl çalışma ve ustalık eğitimiyle ustalık sınavına girilebilir.",
    ],
  },
  {
    icon: Briefcase,
    title: "İşletmelerde Eğitim (Meslek Lisesi 12. Sınıf)",
    tag: "Beceri Eğitimi / Staj",
    iconColor: "text-sky-500",
    badgeClass: "bg-sky-100 text-sky-700",
    points: [
      "12. sınıf meslek lisesi öğrencileri haftada 3 gün işletmede, 2 gün okulda eğitim görür.",
      "Staj süresince net asgari ücretin en az %30'u tutarında ücret ödenir.",
      "Öğrenciler gerçek üretim ortamında, sigortalı olarak deneyim kazanır.",
      "Eğitim, alanındaki onaylı işletmelerde usta öğretici gözetiminde yürür.",
    ],
  },
  {
    icon: Award,
    title: "Kalfalık & Ustalık Belgeleri",
    tag: "Resmî Meslek Belgeleri",
    iconColor: "text-[#0A1931]",
    badgeClass: "bg-slate-100 text-slate-700",
    points: [
      "Kalfalık ve ustalık belgeleri yurt genelinde geçerli resmî meslek belgeleridir.",
      "Ustalık belgesi, bazı mesleklerde iş yeri açma şartıdır ve usta öğreticilik eğitimine giriş sağlar.",
      "Belgeler, mesleki ilerlemenin ve ücret artışının temelini oluşturur.",
      "e-MESEM verilerine göre bugüne kadar 2,6 milyondan fazla ustalık belgesi verildi.",
    ],
  },
];

const STEPS: { title: string; desc: string }[] = [
  {
    title: "Başvuru & Yönlendirme",
    desc: "8. sınıfı tamamlamış gençler MESEM'lere çırak adayı olarak başvurur; meslek lisesi öğrencileri okulları aracılığıyla işletmelerde eğitimine alınır.",
  },
  {
    title: "İşletme & Usta Öğretici Eşleşmesi",
    desc: "Öğrencinin eğitileceği işletmede ustalık/kalfalık belgesine sahip ve usta öğreticilik belgesi almış bir personel bulunması esastır.",
  },
  {
    title: "Eğitim Sözleşmesi & Sigorta",
    desc: "Öğrenci veli onayıyla eğitim sözleşmesi imzalar; süreç boyunca iş kazası ve meslek hastalıklarına karşı sigortalıdır.",
  },
  {
    title: "4+1 Eğitim Modeli",
    desc: "Haftada 4 gün işletmede pratik eğitim, 1 gün okulda teorik eğitim. MESEM'de bu model yılın 12 ayı boyunca uygulanır.",
  },
  {
    title: "Belgelendirme & İstihdam",
    desc: "Kalfalık sınavı ve sonrasında ustalık yolu; belgeli gençler sektörde istihdama hazır hale gelir.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "İMEP'e kimler katılabilir?",
    a: "8. sınıfı tamamlamış gençler MESEM çıraklığına başvurabilir; meslek lisesi öğrencileri ise okullarındaki işletmelerde eğitim (beceri eğitimi) sürecine katılır. Temel şart, ilköğretimin tamamlanmış olmasıdır.",
  },
  {
    q: "Öğrenciye ödenen maaş nasıl hesaplanır, kim öder?",
    a: "Ücreti işletme öder. MESEM çırakları ve meslek lisesi 12. sınıf öğrencilerine net asgari ücretin en az %30'u, MESEM kalfa (12. sınıf) öğrencilerine en az %50'si ödenir. Ödenen ücretin bir bölümü (işletmedeki sigortalı çalışan sayısına göre 2/3 veya 1/3) Devletçe karşılanır.",
  },
  {
    q: "Sigorta işlemleri nasıl yürütülüyor?",
    a: "Eğitim gören her öğrenci sigortalıdır. İş kazası ve meslek hastalıklarına karşı sigorta sağlanır ve ilgili primler Devlet (MEB) tarafından karşılanır.",
  },
  {
    q: "İşletmenin sağlaması gereken şartlar nelerdir?",
    a: "İşletme, ilgili meslek alanında eğitim verebilecek donanıma sahip olmalı ve öğrenciye usta öğreticilik belgesine sahip bir kişi eşlik etmelidir. stajyeri.net üzerinden işveren kaydı oluşturup usta öğretici bilgisiyle ilan yayınlayabilirsiniz.",
  },
  {
    q: "Eğitim sonunda hangi belgeler kazanılır?",
    a: "Kalfa eğitimini bitirenler kalfalık belgesi alır. Kalfalık sonrasında 3 yıl çalışma ve ustalık eğitimini tamamlayanlar ustalık sınavına girer; başarılı olanlara ustalık belgesi verilir.",
  },
];

export default function ImepPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-[#0A1931] text-white pt-14 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4" /> 3308 Sayılı Meslekî Eğitim Kanunu Kapsamında
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight">
            İMEP — İşletmelerde Mesleki Eğitim Programı
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Teori okulda, pratik işletmede: maaş, sigorta ve devlet desteğiyle çıraklıktan ustalığa uzanan resmî eğitim modelinin tüm kapsamı.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-6 border-t border-white/10">
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#00E5FF]">544.453</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">MESEM Öğrencisi</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">2,6M+</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ustalık Belgesi</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#FF6B00]">2,1M+</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Kalfalık Belgesi</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">1,2M+</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Usta Öğreticilik Belgesi</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Kaynak: MEB e-MESEM resmî verileri</p>
        </div>
      </section>

      {/* Kapsam Kartları */}
      <section className="max-w-6xl w-full mx-auto px-4 py-14">
        <h2 className="text-xl sm:text-2xl font-black text-[#0A1931] text-center">İMEP Kapsamında Eğitim Modelleri</h2>
        <p className="text-xs text-slate-500 text-center mt-2 max-w-2xl mx-auto">
          Program; MESEM çıraklığı, kalfa eğitimi, meslek liselerinde işletmelerde eğitim ve kalfalık-ustalık belgelendirmesini kapsar.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-10">
          {SCOPE_CARDS.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${card.iconColor}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-[#0A1931]">{card.title}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap ${card.badgeClass}`}>
                  {card.tag}
                </span>
              </div>
              <ul className="space-y-2">
                {card.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Eğitim Süreci */}
      <section className="bg-white border-y border-slate-200 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-[#0A1931] text-center">Eğitim Süreci Nasıl İşler?</h2>
          <ol className="mt-10 space-y-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-[#0A1931] text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-black text-[#0A1931]">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bilgi Kutuları */}
      <section className="max-w-6xl w-full mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-[#00A8B5]/10 rounded-2xl border border-[#00A8B5]/20 text-xs text-slate-700 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#00A8B5] flex-shrink-0 mt-0.5" />
          <p><strong className="block text-[#0A1931] mb-1">Devlet Desteği</strong>İşletmenin ödediği ücretin 2/3'ü (20'den az sigortalı çalışanı olan işletmelerde) Devletçe karşılanır.</p>
        </div>
        <div className="p-5 bg-red-50 rounded-2xl border border-red-100 text-xs text-slate-700 flex items-start gap-3">
          <HeartPulse className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p><strong className="block text-[#0A1931] mb-1">Sigorta Güvencesi</strong>Çırak ve öğrencilerin iş kazası ve meslek hastalığı sigorta primleri Devlet (MEB) tarafından ödenir.</p>
        </div>
        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-slate-700 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p><strong className="block text-[#0A1931] mb-1">Yılın 12 Ayı Eğitim</strong>MESEM'de 4+1 modeli tatillerde de devam eder; öğrenci yıl boyunca işletmededir.</p>
        </div>
        <div className="p-5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
          <Users className="w-5 h-5 text-[#0A1931] flex-shrink-0 mt-0.5" />
          <p><strong className="block text-[#0A1931] mb-1">Usta Öğretici Zorunluluğu</strong>Öğrenci eğitilen işletmelerde, belgeli usta öğretici görevlendirilmesi esastır.</p>
        </div>
        <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-slate-700 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
          <p><strong className="block text-[#0A1931] mb-1">Geniş Alan Ağı</strong>Bilişim, tekstil, mobilya, makine, elektrik ve daha yüzlerce meslek dalında eğitim verilmektedir.</p>
        </div>
        <div className="p-5 bg-[#FF6B00]/10 rounded-2xl border border-[#FF6B00]/20 text-xs text-slate-700 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
          <p><strong className="block text-[#0A1931] mb-1">Sektörle İç İçe</strong>Öğrenciler, gerçek üretim ortamında öğrenerek mezuniyetten önce iş hayatına hazır hale gelir.</p>
        </div>
      </section>

      {/* SSS */}
      <section className="bg-white border-t border-slate-200 py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-[#0A1931] text-center">Sıkça Sorulan Sorular</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group bg-[#F8FAFC] rounded-2xl border border-slate-200 p-4">
                <summary className="flex items-center justify-between gap-3 cursor-pointer text-xs font-black text-[#0A1931] list-none">
                  {faq.q}
                  <AlertCircle className="w-4 h-4 text-slate-400 group-open:text-[#00A8B5] flex-shrink-0" />
                </summary>
                <p className="text-xs text-slate-600 leading-relaxed mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl w-full mx-auto px-4 py-14">
        <div className="bg-[#0A1931] rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-xl sm:text-2xl font-black">İMEP ile İlan Verin veya Staj Arayın</h2>
          <p className="text-xs text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
            İşletmeler İMEP kapsamında öğrenci eğiterek devlet desteğinden yararlanır; öğrenciler maaşlı ve sigortalı olarak meslek sahibi olur.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/isveren/kayit" className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#FF6B00] hover:bg-[#e66100] text-white font-extrabold rounded-full text-xs transition">
              İşveren Ol, Öğrenci Eğit <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/kayit" className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white font-extrabold rounded-full text-xs transition">
              Öğrenci Ol, Staj Bul <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        stajyeri.net &bull; İMEP Bilgi Rehberi &bull; Kaynak: MEB / 3308 sayılı Meslekî Eğitim Kanunu
      </footer>
    </div>
  );
}
