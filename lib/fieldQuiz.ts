// Alan seçim asistanı (/alan-secim) motoru
// 9. sınıfa başlayacak öğrencilerin MESEM alanı seçimine yardımcı olur:
// 6 soru × 6 seçenek; her seçenek gruplara ağırlık verir, en yüksek skorlu
// gruplar ve MESEM alanları önerilir.

export interface FieldGroup {
  id: string;
  name: string;
  blurb: string;
  fields: string[];
  lifeLines: string[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    id: 'teknik',
    name: 'Teknik ve Tamir',
    blurb: 'Ellerini kullanarak, makinelere yakın çalışarak öğrenmeyi seviyorsun.',
    fields: [
      'Elektrik-Elektronik Teknolojisi',
      'Makine ve Tasarım Teknolojisi',
      'Motorlu Araçlar Teknolojisi',
      'Metal Teknolojisi',
      'Endüstriyel Otomasyon Teknolojileri',
      'Uçak Bakım',
      'Tesisat Teknolojisi ve İklimlendirme',
      'Yenilenebilir Enerji Teknolojileri',
    ],
    lifeLines: [
      'Sabah işe ilk ben varım; makinelerin sesi beni uyandırıyor.',
      'Bir arızayı el yordamıyla bulup dakikalar içinde çözerim.',
      'Yaptığım işte "sağlam" kelimesinin arkasında dururum.',
    ],
  },
  {
    id: 'dijital',
    name: 'Bilişim ve Tasarım',
    blurb: 'Ekranda tasarım, kod ve görsel üretim seni heyecanlandırıyor.',
    fields: [
      'Bilişim Teknolojileri',
      'Grafik ve Fotoğraf',
      'Mobilya ve İç Mekan Tasarımı',
      'Moda Tasarım Teknolojileri',
      'Matbaa Teknolojisi',
      'Kuyumculuk Teknolojisi',
      'El Sanatları Teknolojisi',
    ],
    lifeLines: [
      'Gün boyu ekranda yeni bir tasarım ya da kod üstünde çalışırım.',
      'Yaptığım işi sosyal medyada sergilerim.',
      'Yeni bir programı saatler içinde öğrenirim.',
    ],
  },
  {
    id: 'ofis',
    name: 'Ofis ve İdari İşler',
    blurb: 'Düzen, planlama, evrak takibi ve iletişim senin gücün.',
    fields: [
      'Adalet',
      'Muhasebe ve Finansman',
      'Büro Yönetimi ve Yönetici Asistanlığı',
      'Halkla İlişkiler',
      'Aile ve Tüketici Hizmetleri',
    ],
    lifeLines: [
      'Günüm takvim ve dosyalarla planlı ilerler.',
      'Kimse evrak kaybetmez, çünkü ben kontrol ederim.',
      'Telefonu kaldırır, doğru kişiye en kısa yoldan ulaştırırım.',
    ],
  },
  {
    id: 'saglik',
    name: 'Sağlık, Bakım ve Eğitim',
    blurb: 'İnsanlara — özellikle çocuklara — yardım etmek seni mutlu ediyor.',
    fields: [
      'Çocuk Gelişimi ve Eğitimi',
      'Hasta ve Yaşlı Hizmetleri',
      'Güzellik Hizmetleri',
      'Aile ve Tüketici Hizmetleri',
    ],
    lifeLines: [
      'Günüm insanların yüzündeki tebessümle biter.',
      'Zor bir günün ardından "iyi ki varsın" duyarım.',
      'Kiminle konuşsa rahatlar; herkes bana anlatır.',
    ],
  },
  {
    id: 'uretim',
    name: 'Üretim, Gıda ve Tarım',
    blurb: 'Somut bir şeyler üretmek — yemek, ürün, deney — sana göre.',
    fields: [
      'Gıda Teknolojisi',
      'Yiyecek İçecek Hizmetleri',
      'Tarım',
      'Hayvan Yetiştiriciliği ve Sağlığı',
      'Kimya Teknolojisi',
      'Laboratuvar Hizmetleri',
      'Plastik Teknolojisi',
      'Tekstil Teknolojisi',
      'Seramik ve Cam Teknolojisi',
      'Ayakkabı ve Saraciye Teknolojisi',
      'Müzik Aletleri Yapımı',
    ],
    lifeLines: [
      'Günün sonunda elimde somut bir ürün olur.',
      'Mutfakta ya da atölyede kokular ve sesler beni çalıştırır.',
      'Ürettiğim şeyin satıldığını görmek en büyük gururum.',
    ],
  },
  {
    id: 'dismekan',
    name: 'Açık Alan ve Ulaştırma',
    blurb: 'Ofise değil; sahaya, denize, şantiyeye ve açık alana uygunsun.',
    fields: [
      'Denizcilik',
      'Gemi Yapımı',
      'Ulaştırma Hizmetleri',
      'Harita-Tapu-Kadastro',
      'İnşaat Teknolojisi',
    ],
    lifeLines: [
      'Ofis koltuğunda değil; sahada ve açık havada çalışırım.',
      'Harita, rota ve mesafe benim günlük işimdir.',
      'Hava soğuk ya da sıcak olsun, işim açık havada.',
    ],
  },
];
// ------------------------------------------------------------
// QUIZ — 6 soru × 6 seçenek
// Her seçenek birincil gruba (+2) ve en yakın ikincil gruba (+1) puan verir.
// Sayfa yalnızca id/text/emoji/label alanlarını kullanır; weights motor içindir.
// ------------------------------------------------------------
export interface QuizOption {
  emoji: string;
  label: string;
  weights: Partial<Record<string, number>>;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Boş bir cumartesi gününde seni en çok mutlu eden şey hangisi?',
    options: [
      { emoji: '🔧', label: 'Bozuk bir şeyi söküp tamir etmek', weights: { teknik: 2, uretim: 1 } },
      { emoji: '💻', label: 'Bilgisayarda bir şeyler tasarlamak ya da denemek', weights: { dijital: 2, teknik: 1 } },
      { emoji: '🍳', label: 'Yemek yapmak ya da ellerimle bir şey üretmek', weights: { uretim: 2, dijital: 1 } },
      { emoji: '🧮', label: 'Eşyaları düzenlemek, liste ve plan yapmak', weights: { ofis: 2, saglik: 1 } },
      { emoji: '🌳', label: 'Dışarı çıkmak, sahada bir işe yardım etmek', weights: { dismekan: 2, teknik: 1 } },
      { emoji: '🤝', label: 'Aileme ya da küçük kardeşime yardım etmek', weights: { saglik: 2, ofis: 1 } },
    ],
  },
  {
    id: 2,
    text: 'Bir iş/proje aldığında nasıl ilerlersin?',
    options: [
      { emoji: '🛠️', label: 'Hemen elle işe koyulur, deneye deneye çözerim', weights: { teknik: 2, uretim: 1 } },
      { emoji: '🔍', label: 'İnternetten araştırır, ekranda örnekler bulurum', weights: { dijital: 2, ofis: 1 } },
      { emoji: '📋', label: 'Önce plan yapar, adım adım not alırım', weights: { ofis: 2, dijital: 1 } },
      { emoji: '👥', label: 'Kimseyi yalnız bırakmam, ekiple paylaşırım', weights: { saglik: 2, ofis: 1 } },
      { emoji: '🧪', label: 'Malzemeyi hazırlar, pratik yaparak geliştiririm', weights: { uretim: 2, saglik: 1 } },
      { emoji: '🗺️', label: 'Yerini görür, dışarıda yerinde incelerim', weights: { dismekan: 2, teknik: 1 } },
    ],
  },
  {
    id: 3,
    text: 'Hangi çalışma ortamı sana daha çok uygun?',
    options: [
      { emoji: '🏭', label: 'Atölye / servis — makine ve aletlerin olduğu yer', weights: { teknik: 2, dismekan: 1 } },
      { emoji: '🖥️', label: 'Ekran başı — bilgisayar ve tasarım programları', weights: { dijital: 2, ofis: 1 } },
      { emoji: '🏢', label: 'Ofis — sessiz, düzenli, evraklı bir masa', weights: { ofis: 2, saglik: 1 } },
      { emoji: '🧒', label: 'İnsanların olduğu yer — çocuklar, misafirler, hastalar', weights: { saglik: 2, uretim: 1 } },
      { emoji: '👨‍🍳', label: 'Mutfak / üretim hattı — gürültülü ama verimli', weights: { uretim: 2, teknik: 1 } },
      { emoji: '🏗️', label: 'Açık hava — şantiye, deniz, tarla, saha', weights: { dismekan: 2, uretim: 1 } },
    ],
  },
  {
    id: 4,
    text: 'Öğretmenin seni bir görevle görevlendirse hangisini seçerdin?',
    options: [
      { emoji: '⚡', label: 'Okulun elektrik/teknik düzeneğini kontrol etmek', weights: { teknik: 2, dismekan: 1 } },
      { emoji: '🎨', label: 'Okulun afişlerini ve sosyal medyasını tasarlamak', weights: { dijital: 2, uretim: 1 } },
      { emoji: '🗄️', label: 'Kütüphaneyi kayıt ve düzenle yönetmek', weights: { ofis: 2, dijital: 1 } },
      { emoji: '❤️', label: 'Yeni gelen öğrencilere eşlik edip uyum sağlamak', weights: { saglik: 2, ofis: 1 } },
      { emoji: '🥘', label: 'Okul bahçesine kermes için ürün hazırlamak', weights: { uretim: 2, saglik: 1 } },
      { emoji: '🧭', label: 'Gezi için rota belirleyip yer tespiti yapmak', weights: { dismekan: 2, teknik: 1 } },
    ],
  },
  {
    id: 5,
    text: 'Çevrendeki insanların sana en sık söylediği cümle hangisi?',
    options: [
      { emoji: '💪', label: '"Senin ellerin sağlam, her şeyi tamir edersin"', weights: { teknik: 2, uretim: 1 } },
      { emoji: '🖱️', label: '"Bilgisayarda ne ararsan sen bulursun"', weights: { dijital: 2, ofis: 1 } },
      { emoji: '✅', label: '"Çok düzenlisin, işini planlı yaparsın"', weights: { ofis: 2, saglik: 1 } },
      { emoji: '😊', label: '"Çok iyi anlaşırsın, herkes seni sever"', weights: { saglik: 2, uretim: 1 } },
      { emoji: '🍰', label: '"Yaptığın şeyler çok lezzetli / güzel oluyor"', weights: { uretim: 2, dijital: 1 } },
      { emoji: '🚀', label: '"Çok enerjiksin, hiç oturup duramazsın"', weights: { dismekan: 2, teknik: 1 } },
    ],
  },
  {
    id: 6,
    text: 'Beş yıl sonra hangi hedef seni daha çok heyecanlandırır?',
    options: [
      { emoji: '🔧', label: 'Kalfalığımı alıp usta olma yolunda ilerlemek', weights: { teknik: 2, dismekan: 1 } },
      { emoji: '🖼️', label: 'Kendi tasarımlarımı insanlara satmak', weights: { dijital: 2, uretim: 1 } },
      { emoji: '💼', label: 'Düzenli bir ofiste uzman olarak çalışmak', weights: { ofis: 2, dijital: 1 } },
      { emoji: '🌟', label: 'İnsanlara iyi gelen bir işte çalışmak', weights: { saglik: 2, ofis: 1 } },
      { emoji: '🏪', label: 'Kendi ürünümü üretip satan bir işletme kurmak', weights: { uretim: 2, teknik: 1 } },
      { emoji: '⚓', label: 'Denizde, şantiyede ya da yollarda büyük işlerde olmak', weights: { dismekan: 2, teknik: 1 } },
    ],
  },
];

// ------------------------------------------------------------
// MOTOR — cevaplardan grup puanları hesaplar, ilk 3 grubu döner
// ------------------------------------------------------------

/**
 * answers: { [soruId]: seçilen seçeneğin dizideki sırası }
 * Her seçeneğin weights'ları toplanır; skor sırasına göre 3 grup döner.
 */
export function recommendFields(answers: Record<number, number>): FieldGroup[] {
  const scores: Record<string, number> = {};
  for (const q of QUIZ_QUESTIONS) {
    const optIndex = answers[q.id];
    if (optIndex === undefined || optIndex === null) continue;
    const opt = q.options[optIndex];
    if (!opt) continue;
    for (const [gid, w] of Object.entries(opt.weights)) {
      scores[gid] = (scores[gid] ?? 0) + (w ?? 0);
    }
  }
  return [...FIELD_GROUPS]
    .map((group) => ({ group, score: scores[group.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ group }) => group);
}

/** Sonuç ekranındaki WhatsApp / kopyala paylaşım metni */
export function buildResultSummary(top3: FieldGroup[], pickedFields: string[]): string {
  const chosen =
    pickedFields.length > 0
      ? pickedFields.join(', ')
      : top3
          .flatMap((g) => g.fields)
          .slice(0, 3)
          .join(', ');
  const groupLine = top3.map((g) => g.name).join(' → ');
  return (
    'Stajyeri.net Alan Seçim Asistanı sonucum:\n' +
    `Uyum sırası: ${groupLine}\n` +
    `Öne çıkan MESEM alanlarım: ${chosen}\n` +
    'Sen de dene: https://www.stajyeri.net/alan-secim'
  );
}
