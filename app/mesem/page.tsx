import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import AdPlacement from '@/components/ads/AdPlacement';
import { articleLd, breadcrumbLd, faqLd, pageOpenGraph } from '@/lib/seo';
import { FIELD_GUIDES } from '@/lib/meslekRehberi';
import {
  GraduationCap,
  Wallet,
  ShieldCheck,
  FileCheck2,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Users,
  CalendarDays,
  Building2,
  Award,
  Clock,
  BookOpen,
  Compass,
  Sparkles,
} from 'lucide-react';

const PAGE_TITLE = 'MESEM Nedir? Mesleki Eğitim Merkezi Rehberi (2026)';
const PAGE_DESC =
  "MESEM nedir, kimler başvurabilir, nasıl kayıt olunur? 4+1 model, çırak-kalfa ücretleri, sigorta, kalfalık ve ustalık belgeleri — sade dille.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  keywords: [
    'MESEM nedir',
    'mesleki eğitim merkezi',
    'MESEM başvuru',
    'MESEM kayıt',
    'MESEM yaş sınırı',
    'MESEM alanları',
    'MESEM ücret',
    'çıraklık eğitimi',
    'MESEM çırak',
    '3308 mesleki eğitim kanunu',
  ],
  alternates: { canonical: '/mesem' },
  openGraph: pageOpenGraph({ title: PAGE_TITLE, description: PAGE_DESC, path: '/mesem' }),
};

// SSS — hem ekranda görünür hem FAQPage şeması olarak gömülür.
const FAQS = [
  {
    q: 'MESEM nedir, kısaca ne demek?',
    a: 'MESEM, Mesleki Eğitim Merkezi’nin kısaltmasıdır. 3308 sayılı Meslekî Eğitim Kanunu kapsamında, öğrencinin haftada 4 gün işletmede çalışarak mesleği fiilen öğrendiği, 1 gün okulda teorik ders aldığı resmî mesleki eğitim modelidir. MESEM öğrencisi çırak olarak ücret alır ve sigortalıdır.',
  },
  {
    q: 'MESEM’e kimler başvurabilir, yaş sınırı var mı?',
    a: 'En az ortaokul (8. sınıf) mezunu olan herkes MESEM’e başvurabilir. Kanunen 14 yaşını doldurmamış öğrenciler çırak olarak çalıştırılamaz. Üst yaş sınırı yoktur: liseyi bırakmış, açık liseye geçmiş veya yıllar sonra meslek edinmek isteyen yetişkinler de kayıt olabilir.',
  },
  {
    q: 'MESEM’e nasıl başvurulur?',
    a: 'Başvuru, bulunduğunuz ilçedeki Mesleki Eğitim Merkezi müdürlüğüne doğrudan yapılır; e-Okul üzerinden yönlendirme de kullanılabilir. Gerekli belgeler genellikle kimlik, öğrenim belgesi/diploma ve veli muvafakatidir (18 yaş altı için). Kayıtlar eğitim yılı boyunca, kontenjan oldukça yapılabilir.',
  },
  {
    q: 'MESEM’de ücret ne kadar, kim öder?',
    a: 'Ücreti işletme öder. Çıraklık döneminde (9-11. sınıf) net asgari ücretin en az %30’u, kalfa eğitiminde (12. sınıf) en az %50’si ödenir. İMEP desteğiyle bu tutarın bir bölümü veya tamamı devlet tarafından karşılanır; öğrencinin hakkı değişmez.',
  },
  {
    q: 'MESEM’de sigorta var mı?',
    a: 'Evet. MESEM öğrencileri iş kazası ve meslek hastalıklarına karşı sigortalıdır. Sigorta primleri öğrenciden alınmaz; MEB bütçesinden karşılanır.',
  },
  {
    q: 'MESEM’i bitirince hangi belge alınır?',
    a: 'Kalfa eğitimini tamamlayanlar kalfalık belgesi alır. Kalfalık sonrası 3 yıl çalışma ve ustalık eğitimini tamamlayanlar ustalık sınavına girer; başarılı olanlara ustalık belgesi verilir. Ustalık belgesi, bazı mesleklerde işyeri açma ve usta öğretici olma hakkı sağlar.',
  },
  {
    q: 'MESEM diploması meslek lisesi diplomasına denk mi?',
    a: 'MEB mevzuatına göre MESEM’i tamamlayan öğrenciler mesleki eğitim merkezi diploması alır ve bu diploma meslek lisesi diplomasına denk kabul edilir. Mezunlar YKS’ye girme ve yükseköğretime devam etme hakkına sahiptir.',
  },
  {
    q: 'MESEM ile meslek lisesi arasındaki fark ne?',
    a: 'MESEM’de haftada 4 gün işletmede, 1 gün okulda eğitim vardır ve yılın 12 ayı devam eder. Meslek lisesinde (MTAL) 9-11. sınıflar okulda, 12. sınıfta haftada 3 gün işletmede geçer. İkisinde de ücret ve sigorta hakkı 3308 kapsamında korunur.',
  },
];

const ADIMLAR = [
  {
    n: '1',
    title: 'Meslek alanını seç',
    body: 'İlgi ve becerilerine uygun alanı belirle. Kararsızsan 6 soruluk alan seçim testini çöz, 41 alanın günlük iş akışını incele.',
    href: '/alan-secim',
    linkLabel: 'Alan Seçim Testi',
  },
  {
    n: '2',
    title: 'İlçendeki MESEM’i bul',
    body: 'Başvuru, ikamet ettiğin ilçedeki Mesleki Eğitim Merkezi müdürlüğüne yapılır. Aynı alanda eğitim veren merkezleri e-Okul ve MEB adres bilgilerinden kontrol edebilirsin.',
    href: '/meslek',
    linkLabel: '41 Alan Rehberi',
  },
  {
    n: '3',
    title: 'Belgeleri hazırla',
    body: 'Kimlik, öğrenim belgesi/diploma ve 18 yaş altı için veli muvafakati gerekir. Açık lise veya nakil durumunda ek dilekçe istenebilir.',
    href: '/kvkk',
    linkLabel: 'Veli onayı ve KVKK',
  },
  {
    n: '4',
    title: 'İşletme bul ve sözleşme imzala',
    body: 'MESEM’e kayıt, usta öğretici bulunan bir işletmeyle eşleşmeyi gerektirir. İlanları filtreleyip başvur; eğitim sözleşmesi ve veli onayı dijital olarak tamamlanır.',
    href: '/ilanlar',
    linkLabel: 'MESEM İlanları',
  },
];

const BELGELER = [
  { t: 'Çıraklık', d: '9-11. sınıf · 4 gün işletme + 1 gün okul · ücret en az %30', icon: Clock },
  { t: 'Kalfalık', d: '12. sınıf · ücret en az %50 · kalfalık belgesi', icon: FileCheck2 },
  { t: 'Ustalık', d: '3 yıl çalışma + ustalık eğitimi + sınav', icon: Award },
  { t: 'Usta Öğreticilik', d: 'Ustalık sonrası eğitimle çırak yetiştirme yetkisi', icon: Users },
];

export default function MesemPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <JsonLd
        data={[
          articleLd({
            title: PAGE_TITLE,
            description: PAGE_DESC,
            path: '/mesem',
            datePublished: '2026-11-19',
            section: 'Mesleki Eğitim',
          }),
          breadcrumbLd([
            { name: 'Ana Sayfa', path: '/' },
            { name: 'MESEM Rehberi', path: '/mesem' },
          ]),
          faqLd(FAQS),
        ]}
      />
      <SiteHeader />

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0A1931] to-[#10294d] pt-14 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00A8B5]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00A8B5] via-[#00E5FF] to-[#FF6B00]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <nav className="text-[11px] text-slate-400 mb-4 flex items-center justify-center gap-1.5" aria-label="Sayfa yolu">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-[#00E5FF] font-bold">MESEM Rehberi</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4" /> 3308 Sayılı Meslekî Eğitim Kanunu
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
            MESEM Nedir? Mesleki Eğitim Merkezi Rehberi
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            <strong className="text-white">MESEM (Mesleki Eğitim Merkezi)</strong>, öğrencinin haftada
            4 gün işletmede çalışarak mesleği fiilen öğrendiği, 1 gün okulda teorik ders aldığı
            resmî eğitim modelidir. Çırak ücret alır, sigortalıdır ve 12. sınıfta kalfa olur.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-9 pt-6 border-t border-white/10">
            {[
              { v: '41', l: 'Meslek Alanı', c: 'text-[#00E5FF]' },
              { v: '4+1', l: 'İşletme + Okul', c: 'text-white' },
              { v: '%30-%50', l: 'Asgari Ücret Tabanı', c: 'text-[#FF9E4D]' },
              { v: '12 Ay', l: 'Kesintisiz Eğitim', c: 'text-[#22C55E]' },
            ].map((s) => (
              <div key={s.l}>
                <p className={`text-xl sm:text-2xl font-black ${s.c}`}>{s.v}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <Link
              href="/ilanlar"
              className="px-5 py-2.5 rounded-full bg-[#00A8B5] hover:bg-[#008f9a] text-white text-xs font-black transition"
            >
              MESEM İlanlarını Gör
            </Link>
            <Link
              href="/staj-ucretleri"
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-black transition"
            >
              Ücretimi Hesapla
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-6">
        {/* İçindekiler — tarama kolaylığı + iç bağlantı */}
        <nav
          className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-5 sm:p-6"
          aria-label="İçindekiler"
        >
          <p className="text-xs font-black text-[#0A1931] mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#00A8B5]" /> Bu rehberde
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[11px] font-bold">
            {[
              ['#mesem-nedir', 'MESEM nedir, ne işe yarar?'],
              ['#kimler-basvurabilir', 'Kimler başvurabilir? Yaş şartı'],
              ['#nasil-basvurulur', 'MESEM’e nasıl başvurulur?'],
              ['#egitim-modeli', '4+1 eğitim modeli nasıl işler?'],
              ['#ucret-sigorta', 'Ücret ve sigorta hakları'],
              ['#belgeler', 'Kalfalık, ustalık, usta öğreticilik'],
              ['#alanlar', '41 MESEM meslek alanı'],
              ['#mesem-mi-meslek-lisesi', 'MESEM mi meslek lisesi mi?'],
              ['#sss', 'Sık sorulan sorular'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-slate-600 hover:text-[#00A8B5] transition">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* MESEM NEDİR */}
        <section id="mesem-nedir" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#00A8B5]" /> MESEM nedir, ne işe yarar?
          </h2>
          <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              <strong>MESEM</strong>, “Mesleki Eğitim Merkezi”nin kısaltmasıdır. Milli Eğitim
              Bakanlığı’na bağlı bu merkezler, <strong>3308 sayılı Meslekî Eğitim Kanunu</strong>{' '}
              kapsamında çıraklık, kalfalık ve ustalık eğitimi verir. Modelin özü şudur: öğrenci
              mesleği sınıfta değil, <strong>işin içinde</strong> öğrenir.
            </p>
            <p>
              MESEM öğrencisi haftanın 4 günü usta öğretici eşliğinde bir işletmede çalışır, 1 gün
              okulda teorik ders alır. Eğitim yılın 12 ayı sürer; yaz tatili diye bir kesinti yoktur.
              Buna karşılık öğrenci <strong>çırak olarak ücret alır</strong>, iş kazası ve meslek
              hastalıklarına karşı sigortalanır.
            </p>
            <p>
              Kısacası MESEM; lise diploması, meslek belgesi ve gerçek iş deneyimini aynı anda
              hedefleyen, devlet güvencesinde bir yol. Türkiye’de 500 binden fazla öğrenci bu
              modelde eğitim görüyor.
            </p>
          </div>

          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            {[
              { icon: Wallet, t: 'Maaşlı öğrencilik', d: 'Çırak ve kalfa ücreti kanunla garantili.' },
              { icon: ShieldCheck, t: 'Sigortalı çalışma', d: 'İş kazası ve meslek hastalığı sigortası.' },
              { icon: Award, t: 'Belgeli mezuniyet', d: 'Kalfalık → ustalık → usta öğreticilik.' },
            ].map((k) => (
              <div key={k.t} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
                <k.icon className="w-5 h-5 text-[#00A8B5]" />
                <p className="mt-2 text-xs font-black text-[#0A1931]">{k.t}</p>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{k.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* KİMLER BAŞVURABİLİR */}
        <section id="kimler-basvurabilir" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00A8B5]" /> MESEM’e kimler başvurabilir? Yaş şartı nedir?
          </h2>
          <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              MESEM’in temel şartı <strong>en az ortaokul (8. sınıf) mezunu olmaktır</strong>. Bunun
              dışında bir puan barajı, sınav veya bölüm kısıtı yoktur. Kanunen 14 yaşını doldurmamış
              öğrenciler çırak olarak çalıştırılamaz; bu nedenle MESEM’e genellikle 14-15 yaşında
              başlanır.
            </p>
            <p>
              En sık sorulan soru: <strong>“MESEM’in yaş sınırı var mı?”</strong> Hayır, üst yaş
              sınırı yoktur. Liseyi yarıda bırakmış, açık liseye geçmiş, askerlik sonrası meslek
              edinmek isteyen veya yıllar sonra yeni bir meslek öğrenmek isteyen yetişkinler de
              kayıt olabilir. Önemli olan, seçtiğin alanda eğitim verebilecek bir işletme bulmaktır.
            </p>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="bg-[#F0FBFC] border border-[#00A8B5]/20 rounded-2xl p-4">
              <p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00A8B5]" /> Başvurabilir
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                <li>8. sınıfı bitiren öğrenciler (9. sınıf yerine MESEM)</li>
                <li>Meslek lisesinden MESEM’e geçmek isteyenler</li>
                <li>Açık liseye geçip çıraklık yapmak isteyenler</li>
                <li>Meslek edinmek isteyen yetişkinler (üst yaş sınırı yok)</li>
              </ul>
            </div>
            <div className="bg-[#FFF7F0] border border-[#FF6B00]/20 rounded-2xl p-4">
              <p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#FF6B00]" /> Dikkat edilmesi gerekenler
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                <li>14 yaşını doldurmamış öğrenci çırak olamaz</li>
                <li>18 yaş altı için veli muvafakati zorunlu</li>
                <li>İşletmede usta öğretici bulunması gerekir</li>
                <li>Kayıt, ilçedeki MESEM müdürlüğü üzerinden yürür</li>
              </ul>
            </div>
          </div>
        </section>

        {/* NASIL BAŞVURULUR */}
        <section id="nasil-basvurulur" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00A8B5]" /> MESEM’e nasıl başvurulur? 4 adımda kayıt
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            MESEM kaydı, merkezî bir sınavla değil, doğrudan başvuru ve işletme eşleşmesiyle
            yapılır. Süreç ilçe millî eğitim müdürlüklerine bağlı MESEM müdürlüklerinde yürür ve
            eğitim yılı boyunca kontenjan oldukça kayıt alınabilir.
          </p>
          <ol className="mt-5 space-y-3">
            {ADIMLAR.map((a) => (
              <li key={a.n} className="flex items-start gap-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
                <span className="w-8 h-8 rounded-xl bg-[#0A1931] text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  {a.n}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#0A1931]">{a.title}</p>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{a.body}</p>
                  <Link
                    href={a.href}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-[#00A8B5] hover:gap-2 transition-all"
                  >
                    {a.linkLabel} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <AdPlacement route="/mesem" slot="mesem-mid-fluid" />
        {/* EĞİTİM MODELİ */}
        <section id="egitim-modeli" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00A8B5]" /> MESEM’de eğitim nasıl işler? 4+1 modeli
          </h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="bg-[#0A1931] text-white rounded-2xl p-5">
              <p className="text-2xl font-black text-[#00E5FF]">4 GÜN</p>
              <p className="text-xs font-black mt-1">İşletmede uygulamalı eğitim</p>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5">
                Usta öğretici eşliğinde gerçek işin içinde, gerçek müşteriyle çalışırsın.
              </p>
            </div>
            <div className="bg-[#FFF7F0] border border-[#FF6B00]/20 rounded-2xl p-5">
              <p className="text-2xl font-black text-[#FF6B00]">1 GÜN</p>
              <p className="text-xs font-black text-[#0A1931] mt-1">Okulda teorik eğitim</p>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5">
                Alan dersleri, meslek ahlakı, iş güvenliği ve genel kültür dersleri.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Eğitim <strong>12 ay</strong> sürer; yaz aylarında da işletmede devam edilir ve ücret
            kesintisiz ödenir. Sınıf ilerledikçe ücret tabanı yükselir:{' '}
            <strong>9-11. sınıfta %30, 12. sınıf kalfa eğitiminde %50</strong>. Modelin ayrıntıları
            ve resmî dayanakları için{' '}
            <Link href="/imep" className="text-[#00A8B5] font-bold hover:underline">
              İMEP rehberine
            </Link>{' '}
            göz atabilirsin.
          </p>
        </section>

        {/* ÜCRET & SİGORTA */}
        <section id="ucret-sigorta" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#00A8B5]" /> MESEM’de ücret ve sigorta hakları
          </h2>
          <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              MESEM öğrencisinin ücreti <strong>işletme tarafından</strong> ödenir ve kanuni bir
              tabanı vardır: çıraklıkta net asgari ücretin en az <strong>%30’u</strong>, kalfa
              eğitiminde en az <strong>%50’si</strong>. İşletme daha fazlasını ödeyebilir, altına
              inemez.
            </p>
            <p>
              İşletmenin bu yükü, <strong>İMEP desteği</strong> ve SGK prim teşvikleriyle büyük
              ölçüde devlet tarafından karşılanır — öğrencinin ücretinden kesinti yapılmaz. İş
              kazası ve meslek hastalıkları sigortasının primleri de MEB bütçesinden ödenir.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/staj-ucretleri"
              className="px-4 py-2.5 bg-[#00A8B5] hover:bg-[#00929e] text-white text-[11px] font-black rounded-full transition inline-flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" /> Güncel ücret tablosu ve hesaplayıcı
            </Link>
            <Link
              href="/tesvik-rehberi"
              className="px-4 py-2.5 bg-white border border-slate-200 hover:border-[#FF6B00] text-[#0A1931] text-[11px] font-black rounded-full transition inline-flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-[#FF6B00]" /> İşveren teşvikleri
            </Link>
          </div>
        </section>

        {/* BELGELER */}
        <section id="belgeler" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#00A8B5]" /> MESEM belgeleri: kalfalık, ustalık, usta öğreticilik
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            MESEM’in en büyük avantajı, mezuniyette belgeyle birlikte gelir. Yol haritası şöyle:
          </p>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            {BELGELER.map((b, i) => (
              <div key={b.t} className="relative bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center">
                    <b.icon className="w-4 h-4" />
                  </span>
                  <p className="text-xs font-black text-[#0A1931]">
                    {i + 1}. {b.t}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Kalfalık ve ustalık süreçlerini adım adım anlatan yazılarımız:{' '}
            <Link href="/blog/kalfalik-belgesi-nasil-alinir" className="text-[#00A8B5] font-bold hover:underline">
              kalfalık belgesi nasıl alınır
            </Link>{' '}
            ve{' '}
            <Link href="/blog/usta-belgesi-ile-isyeri-acma" className="text-[#00A8B5] font-bold hover:underline">
              usta belgesiyle işyeri açma
            </Link>
            .
          </p>
        </section>

        {/* ALANLAR */}
        <section id="alanlar" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#00A8B5]" /> 41 MESEM meslek alanı
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            MESEM’de bilişimden mobilyaya, güzellik hizmetlerinden uçak bakımına kadar{' '}
            <strong>{FIELD_GUIDES.length} resmî meslek alanı</strong> bulunur. Her alanın kendi
            dersleri, becerileri ve çıkış kapıları vardır. Sana uygun olanı görmek için alan
            rehberlerine göz at:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {FIELD_GUIDES.slice(0, 18).map((f) => (
              <Link
                key={f.slug}
                href={`/meslek/${f.slug}`}
                className="px-3 py-1.5 bg-[#F8FAFC] border border-slate-200 hover:border-[#00A8B5] hover:bg-[#00A8B5]/5 rounded-full text-[11px] font-bold text-slate-700 hover:text-[#00A8B5] transition"
              >
                {f.emoji} {f.name}
              </Link>
            ))}
            <Link
              href="/meslek"
              className="px-3 py-1.5 bg-[#0A1931] hover:bg-[#00A8B5] rounded-full text-[11px] font-bold text-white transition"
            >
              Tüm {FIELD_GUIDES.length} alan →
            </Link>
          </div>
        </section>

        {/* KARŞILAŞTIRMA */}
        <section id="mesem-mi-meslek-lisesi" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6B00]" /> MESEM mi meslek lisesi mi?
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[11px] sm:text-xs border-collapse">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="p-2.5 font-black">&nbsp;</th>
                  <th className="p-2.5 font-black text-[#00A8B5]">MESEM</th>
                  <th className="p-2.5 font-black text-[#0A1931]">Meslek lisesi (MTAL)</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {[
                  ['Haftalık düzen', '4 gün işletme + 1 gün okul', '9-11. sınıf okul, 12. sınıf 3 gün işletme'],
                  ['Ücret', 'Çırakta %30, kalfada %50', '12. sınıfta en az %30'],
                  ['Süre', 'Yılın 12 ayı', 'Eğitim yılı + yaz dönemi'],
                  ['Belge', 'Kalfalık + ustalık belgesi', 'Meslek lisesi diploması'],
                  ['Üniversite', 'YKS’ye girilebilir', 'YKS + MYO önceliği'],
                ].map(([k, a, b]) => (
                  <tr key={k} className="border-t border-slate-100">
                    <td className="p-2.5 font-black text-[#0A1931]">{k}</td>
                    <td className="p-2.5">{a}</td>
                    <td className="p-2.5">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link
            href="/blog/mesem-mi-meslek-lisesi-mi"
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black text-[#00A8B5] hover:gap-2.5 transition-all"
          >
            Detaylı karşılaştırmayı oku <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        {/* SSS */}
        <section id="sss" className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-6 sm:p-9">
          <h2 className="text-lg sm:text-xl font-black text-[#0A1931]">
            MESEM hakkında sık sorulan sorular
          </h2>
          <div className="mt-4 space-y-2.5">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-[#F8FAFC] rounded-2xl border border-slate-200 p-4">
                <summary className="text-xs font-black text-[#0A1931] cursor-pointer list-none flex items-start justify-between gap-3">
                  {f.q}
                  <span className="text-[#00A8B5] flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-slate-400 leading-relaxed">
            Bu rehberdeki bilgiler 3308 sayılı Meslekî Eğitim Kanunu ve MEB mevzuatı esas alınarak
            hazırlanmıştır. Ücret tutarları ve kayıt takvimi her yıl güncellenir; kesin bilgi için
            ilçendeki MESEM müdürlüğüne danış.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-[#0A1931] rounded-3xl p-6 sm:p-9 text-center text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#00A8B5]/25 blur-2xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-base sm:text-lg font-black">MESEM’de staj yerini Stajyeri.net’te bul</h2>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              Onaylı işletmelerin çıraklık ve kalfa ilanlarını şehrine ve alanına göre filtrele,
              tek tıkla başvur. Öğrenciye her zaman ücretsiz.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              <Link
                href="/ilanlar"
                className="px-5 py-2.5 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-full text-[11px] transition"
              >
                MESEM İlanları
              </Link>
              <Link
                href="/alan-secim"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-full text-[11px] transition"
              >
                Alan Seçim Testi
              </Link>
              <Link
                href="/patika"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-full text-[11px] transition"
              >
                Staj Patikam
              </Link>
            </div>
          </div>
        </section>
      </main>

      <AdPlacement route="/mesem" slot="mesem-end-horizontal" />
      <SiteFooter note={`Son güncelleme: 19 Kasım 2026 · Kaynak: 3308 sayılı Kanun, MEB mevzuatı`} />
    </div>
  );
}
