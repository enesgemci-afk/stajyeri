// ============================================================
// KARİYER BLOGU — /blog içerik kütüphanesi
// SEO odaklı, 3308/İMEP sayfalarıyla tutarlı bilgi. Statik
// Next.js sayfaları olarak derlenir; sitemap'e otomatik düşer.
// ============================================================

export interface BlogBlock {
  type: 'p' | 'h2' | 'li' | 'note';
  text: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  emoji: string;
  readMin: number;
  blocks: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'imep-maasi-ne-kadar',
    title: 'İMEP maaşı ne kadar? Çırak ve kalfa ücretleri (2026)',
    description:
      'İşletmelerde Mesleki Eğitim Programı kapsamında çırak öğrenci ne kadar kazanır? %30 ve %50 kurallarını, SGK ve devlet desteğini sade dille anlattık.',
    date: '2026-01-15',
    category: 'Ücret & Haklar',
    emoji: '💰',
    readMin: 4,
    blocks: [
      { type: 'p', text: 'MESEM’de okurken çalışırken maaş alırsın — bu bir iyilik değil, kanuni hakkın. 3308 sayılı Meslekî Eğitim Kanunu ve İMEP (İşletmelerde Mesleki Eğitim Programı) kapsamında alacağın asgari tutarlar bellidir.' },
      { type: 'h2', text: 'Çıraklık (9-11. sınıf): asgari ücretin en az %30’u' },
      { type: 'p', text: 'Haftada 4 gün işletmede çalışıp 1 gün okula giden çırak öğrenciler, net asgari ücretin en az %30’unu alır. İşletme daha yüksek ödeyebilir; altına inemez.' },
      { type: 'h2', text: 'Kalfa eğitimi (12. sınıf): en az %50' },
      { type: 'p', text: '12. sınıfta kalfa eğitimine geçtiğinde taban oranın %50’ye yükselir. Yani aynı işletmede sınıf atladıkça cebine giren para belirgin biçimde artar.' },
      { type: 'h2', text: 'Devlet desteği: senin ücretini düşürmüyor' },
      { type: 'note', text: 'İMEP kapsamında işletme, çırak öğrenci başına brüt asgari ücretin %30’u tutarında destek alır; SGK primleri Hazine tarafından karşılanır. Yani işverenin maliyeti azalır, senin ücretin değişmez.' },
      { type: 'li', text: 'İş kazası ve meslek hastalıkları sigortan zorunludur — primini devlet öder.' },
      { type: 'li', text: 'Ücret ay sonunda, eğitim sözleşmen uyarınca işletmece ödenir.' },
      { type: 'p', text: 'Güncel tutarları hesaplamak için sitemizdeki staj ücretleri sayfasındaki anlık hesaplayıcıyı kullan; rakamlar asgari ücret güncellemeleriyle birlikte değişir.' },
    ],
  },
  {
    slug: 'kalfalik-belgesi-nasil-alinir',
    title: 'Kalfalık belgesi nasıl alınır? Adım adım rehber',
    description:
      'Kalfalık belgesi mesleği tek başına yapma yetkisi verir. Başvuru şartları, sınav süreci ve belgeyle gelen hakları adım adım anlattık.',
    date: '2026-01-22',
    category: 'Belgeler & Sınavlar',
    emoji: '⚙️',
    readMin: 5,
    blocks: [
      { type: 'p', text: 'Kalfalık belgesi, bir mesleği tek başına yapabileceğini resmî olarak belgeleyen yetki belgesidir. İşe alımda, maaş pazarlığında ve ileride usta belgesi yolunda en güçlü belgendir.' },
      { type: 'h2', text: 'Kimler girebilir?' },
      { type: 'li', text: 'MESEM’de 12. sınıf kalfa eğitimindeki öğrenciler (eğitim tamamlanınca sınav hakkı doğar).' },
      { type: 'li', text: 'Meslek lisesi mezunları, alanıyla ilgili çalışarak da kalfalık sınavına hazırlanabilir.' },
      { type: 'h2', text: 'Süreç nasıl işler?' },
      { type: 'li', text: '1) Okulundaki mesleki eğitim birimine kayıt yaptır — sınav başvurusu okul üzerinden yürür.' },
      { type: 'li', text: '2) Teorik modüllerini tamamla; eksik derslerin varsa tamamlama eğitimine katıl.' },
      { type: 'li', text: '3) Pratikini usta öğreticinle tekrar et: sınavda hem teori hem beceri ölçülür.' },
      { type: 'note', text: 'Kalfalık belgesi yurt genelinde geçerlidir ve kalfalıktan sonra 3 yıl çalışma + ustalık eğitimi ile ustalık sınavına giriş hakkı kazandırır.' },
      { type: 'p', text: 'Sınava hazırlanırken alanındaki ders listesini Meslek Rehberi sayfamızdan kontrol edebilirsin; her alanın temel modülleri orada listelenir.' },
    ],
  },
  {
    slug: 'mesem-mi-meslek-lisesi-mi',
    title: 'MESEM mi meslek lisesi mi? Hangisi sana uygun?',
    description:
      '8. sınıf sonrası iki güçlü yol: MESEM’in 4+1 modeli mi, meslek lisesinin 3+2 modeli mi? Farkları, ücret haklarını ve üniversite yollarını karşılaştırdık.',
    date: '2026-02-03',
    category: 'Yol Seçimi',
    emoji: '🧭',
    readMin: 6,
    blocks: [
      { type: 'p', text: 'İki model de 3308 güvencesinde, ikisinde de maaşlı ve sigortalı çalışıyorsun. Fark; zaman bölenişinde, ödeme tabanında ve okul ritminde.' },
      { type: 'h2', text: 'MESEM: 4 gün işletme + 1 gün okul' },
      { type: 'li', text: '9. sınıftan itibaren yılın 12 ayı işletmedesin; okul 1 gün.' },
      { type: 'li', text: 'Çıraklıkta net asgari ücretin en az %30’u; 12. sınıf kalfa eğitiminde %50.' },
      { type: 'li', text: 'İş yapmayı, atölyeyi, sahayı seviyorsan en hızlı gerçek deneyim bu modelde.' },
      { type: 'h2', text: 'Meslek lisesi (MTAL): 3 gün işletme + 2 gün okul' },
      { type: 'li', text: '12. sınıfta beceri eğitimine geçersin; ücret tabanı net asgari ücretin en az %30’u.' },
      { type: 'li', text: 'SGK primini devlet karşılar; okul-gün sayısı daha fazla, ders ritmi güçlüdür.' },
      { type: 'li', text: 'Mezuniyet sonrası MYO’lara ayrılmış kontenjanlardan yararlanabilirsin.' },
      { type: 'h2', text: 'Karar için 3 soru' },
      { type: 'note', text: '1) Ellerinle mi yoksa ekranda mı çalışmak istiyorsun? 2) Hangi sektörde iş bulma potansiyeli yüksek? 3) Ailen hangi modelin günlük ritmini daha uygun görüyor? Bu üçünü birlikte düşün, rehber öğretmeninle netleştir.' },
      { type: 'p', text: 'Kararsızsan 6 soruluk Alan Seçim Testimizi çöz, sonra Staj Patikası ile iki yolun da haritasını çıkarabilirsin. Kimseyi etiketlemiyoruz — sadece seçimini netleştiriyoruz.' },
    ],
  },
  {
    slug: 'usta-belgesi-ile-isyeri-acma',
    title: 'Usta belgesi ile kendi işyerini açmak: bilmen gerekenler',
    description:
      'Usta belgesi bazı mesleklerde işyeri açma şartı. Ruhsat, esnaf odası, vergi kaydı ve çırak alarak devlet desteğinden yararlanma yollarını anlattık.',
    date: '2026-02-14',
    category: 'Girişimcilik',
    emoji: '🏪',
    readMin: 5,
    blocks: [
      { type: 'p', text: 'Kendi işinin patronu olmak çoğu teknisyenin ve zanaatkârın hayali. İlk durak: ustalık belgesi. Kimi mesleklerde kalfalıktan sonra 3 yıl çalışma + ustalık eğitimiyle sınavı geçmek şart; bazı mesleklerde belge işyeri açmanın yasal ön koşuludur.' },
      { type: 'h2', text: 'Yol haritası' },
      { type: 'li', text: 'Kalfalık belgesini al → 3 yıl mesleğinde çalış (çalışma kaydın biriksin).' },
      { type: 'li', text: 'Ustalık eğitimini tamamla ve ustalık sınavına gir.' },
      { type: 'li', text: 'Belge elinde: vergi kaydı + esnaf odası tescili + işyeri açma ve çalışma ruhsatı.' },
      { type: 'h2', text: 'Belge seni güçlendirir' },
      { type: 'note', text: 'Ustalık belgesi yurt genelinde geçerlidir; bazı mesleklerde işyeri açma şartıdır ve usta öğreticilik eğitimine giriş sağlar. Yani sadece kendi işin için değil, öğrenci eğiterek İMEP desteği almak için de kapı açar.' },
      { type: 'li', text: 'Çırak kabul edersen işletme başına devlet desteği alırsın — detaylar Teşvik Rehberi sayfamızda.' },
      { type: 'li', text: 'Halk eğitim merkezlerinin girişimcilik ve işletme yönetimi kursları maliyetleri düşürür.' },
      { type: 'p', text: 'Staj Patikası aracımızda “Kendi işyerimi açmak” hedefini seçersen tüm bu aşamalar kişisel haritan olarak listelenir.' },
    ],
  },
  {
    slug: 'meslek-lisesi-mezunu-universiteye-gecis',
    title: 'Meslek lisesi / kalfa mezunu üniversiteye nasıl geçer?',
    description:
      'MYO’larda ayrılmış kontenjanlar, açık öğretim lisans yolu ve alan-uyum avantajları: mezuniyet sonrası üniversite seçeneklerini derledik.',
    date: '2026-02-25',
    category: 'Eğitim Yolu',
    emoji: '🎓',
    readMin: 4,
    blocks: [
      { type: 'p', text: 'Mesleki eğitimden üniversiteye geçiş kapanmış bir kapı değil; tam tersine ayrıcalıklı bir yol. Diploma + alan deneyimi ikilisi, hem kontenjan hem iş güvencesi açısından avantaj sağlar.' },
      { type: 'h2', text: '1) Önlisans (MYO) — ayrılmış kontenjanlar' },
      { type: 'li', text: 'Meslek liseleri ve alanlarıyla uyumlu bölümler için ÖSYM tercih döneminde ayrılmış kontenjanlar bulunur.' },
      { type: 'li', text: 'Alanınla uyumlu bölümü seçmek hem şansını artırır hem ders muafiyeti getirebilir.' },
      { type: 'h2', text: '2) Açık öğretim ile lisans' },
      { type: 'li', text: 'Çalışırken devam etmek isteyenler için AÖF/AÖL programları uygun ritim sunar.' },
      { type: 'li', text: 'Kalfalık belgen ve işletme deneyimin CV’nde güçlü referans olur.' },
      { type: 'note', text: 'MESEM’de kalfa belgesi alan öğrenci, mezuniyetiyle birlikte hem iş gücünde hem üniversite tercihinde iki kapıyı da açık tutar.' },
      { type: 'h2', text: 'Tercih zamanlaması' },
      { type: 'p', text: 'ÖSYM takvimini kaçırmamak için 12. sınıfın baharında tercih takvimiğini okul rehber öğretmeninle birlikte işaretleyin. Staj Patikası’nda “Üniversiteye geçmek” hedefi, bu adımları sırayla listeler.' },
    ],
  },
  {
    slug: 'ilk-staj-mulakati-sorulari',
    title: 'İlk staj mülakatında ne sorulur? 7 soru ve cevap ipuçları',
    description:
      'Çıraklık ve beceri eğitimi başvurularında en sık sorulan sorular; “kendini tanıt” cevabından güvenlik sorularına hazır cevap kalıpları.',
    date: '2026-03-05',
    category: 'Başvuru & Mülakat',
    emoji: '💬',
    readMin: 5,
    blocks: [
      { type: 'p', text: 'İşletme seni alırken yeteneğini değil, güvenilirliğini arar. Doğru cevap; kısa, dürüst ve örnekli olur. İşte en sık gelen 7 soru.' },
      { type: 'h2', text: 'Sorular ve ipuçları' },
      { type: 'li', text: '“Kendini tanıt.” — 3 cümle: adın, alanın, neden bu iş. Cv’ndeki en güçlü bir beceriyi ekle.' },
      { type: 'li', text: '“Neden bu işletme?” — ilanındaki bir detayı geç: “Sizinle mesleği üretimde öğrenmek istiyorum.”' },
      { type: 'li', text: '“Bu alanda ne bildiğini nereden öğrendin?” — okul atölyesi, hobi, düzelttiğin cihaz; somut örnek ver.' },
      { type: 'li', text: '“İş güvenliği nedir?” — kurallara uymak, uyarıyı ciddiye almak, soru sormaktan çekinmemek.' },
      { type: 'li', text: '“Sabahta gecikirsen ne yaparsın?” — erken haber verir, sorumluluğu alırım; bahane aramam.' },
      { type: 'li', text: '“Hangi haftalık programla çalışabilirsin?” — MESEM modelini net söyle; 4+1 ya da 3+2.' },
      { type: 'li', text: '“Sormak istediğin şey var mı?” — Evet de: “Usta öğreticim kim olacak? İlk ay ne öğrenmemi beklersiniz?”' },
      { type: 'note', text: 'Altın kural: bilmediğini bilmemek yapmak yok. “Henüz bilmiyorum ama hemen öğrenirim” mülakatta en güçlü cevaplardan biridir.' },
      { type: 'p', text: 'Alanına özel soruları Mülakat Soruları sayfamızdan çalış, sonra Mulakat Provası ile kronometreli pratik yap — kendi hızında, kimseye göstermeden.' },
    ],
  },
];

/** slug → yazı hızlı erişim */
export const BLOG_BY_SLUG: Record<string, BlogPost> = Object.fromEntries(
  BLOG_POSTS.map((p) => [p.slug, p]),
);

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_BY_SLUG[slug];
}

/** Yazının yayın tarihini tr-TR biçiminde döndürür */
export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
