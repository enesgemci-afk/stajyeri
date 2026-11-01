// ============================================================
// STAJ PATİKASI — /patika sayfasının veri motoru
// Kariyer.net "Kariyer Patikası"nın MESEM/MTAL gerçeklerine
// uyarlanmış hali: mevcut durum + hedef → aşamalı yol haritası.
// Ücret değerleri 3308 + /imep ve /staj-ucretleri ile tutarlıdır:
//   Çırak: net asgari ücretin ≥%30 · Kalfa eğitimi: ≥%50 ·
//   MTAL beceri eğitimi: ≥%30 (SGK primini devlet karşılar).
// ============================================================

export type Durum = '8_sinif' | 'cirak' | 'kalfa_12' | 'mtal_12' | 'mezun';
export type Hedef = 'usta' | 'isyeri' | 'universite' | 'is';
export type Track = 'MESEM' | 'MTAL';

export interface PatikaStage {
  ord: number;
  emoji: string;
  title: string;
  period: string;
  desc: string;
  /** Bu aşamadaki ücret hakkı (yoksa undefined) */
  ucret?: string;
  belgeler: string[];
  ipuclari: string[];
  link?: { href: string; label: string };
  /** Hangi hedeflerde gösterilir; 'all' hepsinde */
  hedefler: Hedef[] | 'all';
}

export interface DurumOption {
  id: Durum;
  emoji: string;
  label: string;
  desc: string;
}

export interface HedefOption {
  id: Hedef;
  emoji: string;
  label: string;
  desc: string;
}

export interface UcretMilestone {
  label: string;
  badge: string;
}

export interface PatikaResult {
  track: Track;
  durum: DurumOption;
  hedef: HedefOption;
  stages: PatikaStage[];
  ucretMilestones: UcretMilestone[];
  destekNotu: string;
}

export const DURUMS: DurumOption[] = [
  { id: '8_sinif', emoji: '🎒', label: '8. sınıfı bitirdim / 9. sınıfa hazırlanıyorum', desc: 'Alan seçimi ve MESEM kayıt süreci başlayacak.' },
  { id: 'cirak', emoji: '🔧', label: 'MESEM çırağıyım (9-11. sınıf)', desc: 'Haftada 4 gün işletmede pratik yapıyorum.' },
  { id: 'kalfa_12', emoji: '⚙️', label: 'MESEM kalfa eğitimindeyim (12. sınıf)', desc: 'Kalfalık sınavına hazırlanıyorum.' },
  { id: 'mtal_12', emoji: '🏫', label: 'Meslek lisesi 12. sınıftayım', desc: '3 gün işletme + 2 gün okul modelindeyim.' },
  { id: 'mezun', emoji: '🎓', label: 'Mezun oldum (kalfa / meslek lisesi)', desc: 'Sıradaki adımlarımı planlıyorum.' },
];

export const HEDEFS: HedefOption[] = [
  { id: 'usta', emoji: '🏅', label: 'Usta belgesi almak', desc: 'Mesleği tam yetkiyle, belgeyle yapmak.' },
  { id: 'isyeri', emoji: '🏪', label: 'Kendi işyerimi açmak', desc: 'Kendi işimin patronu olmak.' },
  { id: 'universite', emoji: '🎓', label: 'Üniversiteye geçmek', desc: 'MYO veya lisans eğitimine devam etmek.' },
  { id: 'is', emoji: '💼', label: 'Maaşlı olarak işe girmek', desc: 'Becerimi edinip düzenli işte çalışmak.' },
];

const MESEM_STAGES: PatikaStage[] = [
  {
    ord: 1,
    emoji: '🧭',
    title: 'Alanını Seç',
    period: '8. sınıf',
    desc: 'İlgi ve çalışma tarzına en uygun MESEM alanını belirle; kararında rehber öğretmenin ve ailenin görüşünü de al.',
    belgeler: ['Alan tercih formu (LGS sonrası yönlendirme)', 'Veli bilgilendirmesi'],
    ipuclari: [
      'Meslek rehberinde alanları gezip "ne iş yapar" sorusuna bak',
      'Alanı seçerken iş bulma potansiyelini de düşün',
    ],
    link: { href: '/alan-secim', label: 'Alan Seçim Testini Çöz' },
    hedefler: 'all',
  },
  {
    ord: 2,
    emoji: '🔧',
    title: 'Çıraklığa Başla',
    period: '9. sınıf',
    desc: 'Veli onayıyla MESEM kaydını yaptır; eğitim sözleşmesi imzalanır, haftada 4 gün işletmede 1 gün okulda öğrenirsin.',
    ucret: "Net asgari ücretin en az %30'u",
    belgeler: ['Veli onayı', 'Eğitim sözleşmesi', 'İş kazası ve meslek hastalıkları sigortası (zorunlu)'],
    ipuclari: [
      'İşletme seçerken usta öğreticilik belgesi olan işletmeleri tercih et',
      'İlk yılın hedefi: iş güvenliği ve meslek kültürü',
    ],
    link: { href: '/ilanlar', label: 'Çıraklık ilanlarına göz at' },
    hedefler: 'all',
  },
  {
    ord: 3,
    emoji: '🛠️',
    title: 'Çıraklığında Derinleş',
    period: '10-11. sınıf',
    desc: '4+1 modelle yılın 12 ayı işletmedesin; öğrendiğin becerileri CV’ne yaz, usta öğreticinden düzenli geri bildirim al.',
    ucret: "Net asgari ücretin en az %30'u — işletmeye ayrıca İMEP desteği ödenir",
    belgeler: [],
    ipuclari: [
      'CV’ni oluştur ve her yıl güncelle',
      'Sigorta primlerinin yatığını velinle birlikte kontrol et',
    ],
    link: { href: '/cv-olustur', label: 'Stajyer CV’si oluştur' },
    hedefler: 'all',
  },
  {
    ord: 4,
    emoji: '⚙️',
    title: 'Kalfa Eğitimi ve Sınavı',
    period: '12. sınıf',
    desc: '12. sınıfta kalfa eğitimine geçersin; okul modülleriyle kalfalık sınavına hazırlanırsın.',
    ucret: "Net asgari ücretin en az %50'si",
    belgeler: ['Kalfalık sınav başvurusu', 'Kalfalık belgesi (sınavı geçince)'],
    ipuclari: [
      'Sınav öncesi ustandan pratiği eksiksiz tekrar et',
      'Kalfalık belgesi mesleği tek başına yapma yetkisi verir',
    ],
    link: { href: '/staj-ucretleri', label: 'Ücret haklarını incele' },
    hedefler: 'all',
  },
  {
    ord: 5,
    emoji: '🧱',
    title: 'Ustalık Yolu',
    period: 'Kalfalıktan sonra 3 yıl',
    desc: 'Kalfalık sonrası 3 yıl mesleğinde çalışıp ustalık eğitimini tamamlayarak ustalık sınavına girersin.',
    ucret: 'Ücret işletmeyle serbestçe belirlenir — deneyiminle artar',
    belgeler: ['3 yıl çalışma kaydı', 'Ustalık eğitimi tamamlama', 'Ustalık sınavı'],
    ipuclari: [
      'Mümkünse farklı işletmelerde deneyim kazan',
      'Usta öğreticilik eğitimi alıp öğrenci eğitmeye başlayabilirsin',
    ],
    hedefler: ['usta', 'isyeri'],
  },
  {
    ord: 6,
    emoji: '🏅',
    title: 'Usta Belgesi',
    period: 'Belge aşaması',
    desc: 'Ustalık belgesi seni mesleğin tam yetkili ustası yapar; bazı mesleklerde işyeri açmanın şartıdır.',
    belgeler: ['Ustalık belgesi (yurt genelinde geçerli)'],
    ipuclari: [
      'Belge, maaş ve pozisyon pazarlığında en güçlü kozun',
      'Kendi atölyen için işyeri açma ruhsatına hazırlan',
    ],
    hedefler: ['usta', 'isyeri'],
  },
  {
    ord: 7,
    emoji: '🏪',
    title: 'Kendi İşyerini Aç',
    period: 'Girişim',
    desc: 'Ustalık belgenle işyeri açabilirsin; vergi, ruhsat ve SGK süreçleri için esnaf odanı ve destek programlarını araştır.',
    belgeler: [
      'Ustalık belgesi (şart olan mesleklerde zorunlu)',
      'Vergi kaydı ve esnaf odası tescili',
      'İşyeri açma ve çalışma ruhsatı',
    ],
    ipuclari: [
      'Halk eğitim merkezlerinin girişimcilik kurslarına bak',
      'Çırak alarak İMEP desteğinden yararlanabilirsin',
    ],
    link: { href: '/tesvik-rehberi', label: 'Çırak alırsan devlet desteği' },
    hedefler: ['isyeri'],
  },
  {
    ord: 8,
    emoji: '🎓',
    title: 'Üniversiteye Geçiş',
    period: 'Mezuniyet sonrası',
    desc: 'Kalfalık belgenle önlisans (MYO) programlarına geçebilir, açık öğretimle lisans hedefleyebilirsin; meslek liseliere MYO’larda ayrılmış kontenjanlar vardır.',
    belgeler: ['Kalfalık / mezuniyet belgesi', 'ÖSYM tercih başvurusu'],
    ipuclari: [
      'Alanınla uyumlu MYO bölümü avantaj sağlayabilir',
      'Açık öğretim, işiyle birlikte devam etmek için uygundur',
    ],
    hedefler: ['universite'],
  },
  {
    ord: 9,
    emoji: '💼',
    title: 'Maaşlı İşe Giriş',
    period: 'İstihdam',
    desc: 'CV’ni güncelle, alanındaki ilanlara başvur; kalfalık belgeni ve işletme deneyimini öne çıkar.',
    belgeler: ['Güncel CV', 'Kalfalık belgesi (varsa)', 'Referanslar (usta öğreticin)'],
    ipuclari: [
      'İşletme sayfasından stajyer alan firmaları takip et',
      'Mülakat sorularını alanına göre çalış',
    ],
    link: { href: '/ilanlar', label: 'Aktif ilanları gör' },
    hedefler: ['is'],
  },
];

const MTAL_STAGES: PatikaStage[] = [
  {
    ord: 1,
    emoji: '🏫',
    title: 'Beceri Eğitimine Başla',
    period: '12. sınıf',
    desc: 'Haftada 3 gün işletmede, 2 gün okulda eğitim görürsün; usta öğretici gözetiminde gerçek üretimde yer alırsın.',
    ucret: "Net asgari ücretin en az %30'u",
    belgeler: ['Eğitim sözleşmesi', 'SGK tescili (primi devlet karşılar)'],
    ipuclari: [
      'Becerilerini CV’ne işle',
      'Devamsızlık yapma; belge şartına takılma',
    ],
    link: { href: '/ilanlar', label: 'Beceri eğitimi ilanları' },
    hedefler: 'all',
  },
  {
    ord: 2,
    emoji: '🎓',
    title: 'Mezuniyet',
    period: 'Diploma',
    desc: 'Okulu bitirdiğinde meslek lisesi diplomanı alırsın; ustalık yoluna veya üniversiteye yönelebilirsin.',
    belgeler: ['Meslek lisesi diploması', 'Staj / beceri eğitimi sicili'],
    ipuclari: ['Diploma + alan deneyimi ikilisi işe alımda güçlüdür'],
    hedefler: 'all',
  },
  {
    ord: 3,
    emoji: '🧱',
    title: 'Ustalık Yolu',
    period: 'Mezuniyet + 3 yıl çalışma',
    desc: 'Mezuniyetten sonra mesleğinde 3 yıl çalışıp ustalık eğitimini tamamlayarak ustalık sınavına girebilirsin.',
    ucret: 'Ücret işletmeyle serbestçe belirlenir — deneyiminle artar',
    belgeler: ['3 yıl çalışma kaydı', 'Ustalık eğitimi tamamlama', 'Ustalık sınavı'],
    ipuclari: [
      'Farklı işletmelerde deneyim kazanmak pazarlığında güç katar',
      'Usta öğreticilik eğitimiyle öğrenci eğitebilirsin',
    ],
    hedefler: ['usta', 'isyeri'],
  },
  {
    ord: 4,
    emoji: '🏅',
    title: 'Usta Belgesi',
    period: 'Belge aşaması',
    desc: 'Ustalık belgesi seni mesleğin tam yetkili ustası yapar; bazı mesleklerde işyeri açmanın şartıdır.',
    belgeler: ['Ustalık belgesi (yurt genelinde geçerli)'],
    ipuclari: [
      'Belge, maaş ve pozisyon pazarlığında en güçlü kozun',
      'Kendi atölyen için işyeri açma ruhsatına hazırlan',
    ],
    hedefler: ['usta', 'isyeri'],
  },
  {
    ord: 5,
    emoji: '🏪',
    title: 'Kendi İşyerini Aç',
    period: 'Girişim',
    desc: 'Ustalık belgenle işyeri açabilirsin; vergi, ruhsat ve SGK süreçleri için esnaf odanı ve destek programlarını araştır.',
    belgeler: [
      'Ustalık belgesi (şart olan mesleklerde zorunlu)',
      'Vergi kaydı ve esnaf odası tescili',
      'İşyeri açma ve çalışma ruhsatı',
    ],
    ipuclari: [
      'Halk eğitim merkezlerinin girişimcilik kurslarına bak',
      'Çırak alarak İMEP desteğinden yararlanabilirsin',
    ],
    link: { href: '/tesvik-rehberi', label: 'Çırak alırsan devlet desteği' },
    hedefler: ['isyeri'],
  },
  {
    ord: 6,
    emoji: '🎓',
    title: 'Üniversiteye Geçiş',
    period: 'Mezuniyet sonrası',
    desc: 'Meslek lisesi diplomanla MYO’larda ayrılmış kontenjanlardan yararlanabilir, açık öğretimle lisans hedefleyebilirsin.',
    belgeler: ['Meslek lisesi diploması', 'ÖSYM tercih başvurusu'],
    ipuclari: [
      'Alanınla uyumlu MYO bölümü avantaj sağlayabilir',
      'Açık öğretim, işiyle birlikte devam etmek için uygundur',
    ],
    hedefler: ['universite'],
  },
  {
    ord: 7,
    emoji: '💼',
    title: 'Maaşlı İşe Giriş',
    period: 'İstihdam',
    desc: 'CV’ni güncelle, alanındaki ilanlara başvur; diploma ve beceri eğitimi sicilini öne çıkar.',
    belgeler: ['Güncel CV', 'Meslek lisesi diploması', 'Referanslar (usta öğreticin)'],
    ipuclari: [
      'İşletme sayfasından stajyer alan firmaları takip et',
      'Mülakat sorularını alanına göre çalış',
    ],
    link: { href: '/ilanlar', label: 'Aktif ilanları gör' },
    hedefler: ['is'],
  },
];

const START_ORD: Record<Durum, number> = {
  '8_sinif': 1,
  cirak: 2,
  kalfa_12: 3,
  mtal_12: 1,
  mezun: 4,
};

export function buildPatika(durum: Durum, hedef: Hedef): PatikaResult {
  const durumOpt = DURUMS.find((d) => d.id === durum) ?? DURUMS[0];
  const hedefOpt = HEDEFS.find((h) => h.id === hedef) ?? HEDEFS[0];
  const track: Track = durum === 'mtal_12' ? 'MTAL' : 'MESEM';
  const startOrd = START_ORD[durum];
  const ladder = track === 'MTAL' ? MTAL_STAGES : MESEM_STAGES;

  const stages = ladder.filter((s) => {
    if (s.ord < startOrd) return false;
    return s.hedefler === 'all' || s.hedefler.includes(hedef);
  });

  const ucretMilestones: UcretMilestone[] =
    track === 'MTAL'
      ? [
          { label: 'Beceri eğitimi (12)', badge: 'Net asgari %30+' },
          { label: 'SGK primi', badge: 'Devletçe karşılanır' },
          { label: 'Mezun', badge: 'Serbest pazarlık' },
        ]
      : [
          { label: 'Çırak (9-11)', badge: 'Net asgari %30+' },
          { label: 'Kalfa (12)', badge: 'Net asgari %50+' },
          { label: 'Usta', badge: 'Serbest pazarlık' },
        ];

  const destekNotu =
    'İMEP kapsamında işletme, çırak öğrenci başına brüt asgari ücretin %30’u tutarında destek alır; SGK primleri Hazine tarafından karşılanır. Senin ücretin düşmez, işverenin maliyeti azalır.';

  return { track, durum: durumOpt, hedef: hedefOpt, stages, ucretMilestones, destekNotu };
}

/** Sonuç ekranındaki WhatsApp / kopyala paylaşım metni */
export function buildPatikaSummary(
  durumLabel: string,
  hedefLabel: string,
  stageTitles: string[],
): string {
  return (
    'Stajyeri.net Staj Patikam:\n' +
    `Şu anki durumum: ${durumLabel}\n` +
    `Hedefim: ${hedefLabel}\n` +
    `Yol haritam: ${stageTitles.join(' → ')}\n` +
    'Sen de oluştur: https://www.stajyeri.net/patika'
  );
}