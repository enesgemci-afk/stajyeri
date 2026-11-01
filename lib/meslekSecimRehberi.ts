// ============================================================
// MESLEK SEÇİM REHBERİ — /meslek-rehberi veri katmanı
// Yaklaşım: MEB "Karar Anı" adımları (kendini tanı → mesleği tanı →
// eşleştir → planla → kararı sahiplen) + Holland RIASEC ilgi tipleri
// + İŞKUR meslek kartı tarzı detaylar. 41 MESEM alanıyla (constants)
// ve alan rehberiyle (meslekRehberi) birlikte çalışır.
// ============================================================

export interface RehberStep {
  n: number;
  title: string;
  question: string;
  desc: string;
  tool?: { href: string; label: string };
}

export const REHBER_STEPS: RehberStep[] = [
  {
    n: 1,
    title: 'Kendini Tanı',
    question: '“Ben neyde iyiyim, ne yaparken zamanın nasıl geçtiğini anlamıyorum?”',
    desc: 'İlgi ve yetenek aynı şey değildir: sevdiğin ile iyi olduğunun kesiştiği yere bak. Hangi derslerde uğraşmak zor gelmiyor, boş zamanında ne yapıyorsun? Cevapların ilk sinyali orada gizli.',
    tool: { href: '/alan-secim', label: '6 soruluk Alan Seçim Testi' },
  },
  {
    n: 2,
    title: 'Meslekleri Tanı',
    question: '“Bu mesleği yapan kişi gününün 8 saatini aslında nasıl geçiriyor?”',
    desc: 'Meslek adları yanıltıcıdır. Önemli olan görevler ve çalışma ortamı: atölye mi, ofis mi, saha mı? Aşağıdaki 6 ilgi grubunda her grubun “günün akışı” bölümüne bak; 41 alanın rehberlerinde görev listeleri hazır.',
    tool: { href: '/meslek', label: '41 alanlık Meslek Rehberi' },
  },
  {
    n: 3,
    title: 'Gerçeklerle Karşılaştır',
    question: '“Kaç para, kaç yıl, iş bulma şansı ne kadar?”',
    desc: 'Çıraklıkta net asgari ücretin en az %30’u, kalfa eğitiminde %50 — ve yılın 12 ayı maaşlısın. İş bulma şansı alana göre değişir; her grubun perspektifini aşağıda dürüstçe yazdık.',
    tool: { href: '/staj-ucretleri', label: 'Ücret hesaplayıcı' },
  },
  {
    n: 4,
    title: 'Yol Haritası Çiz',
    question: '“9. sınıftan başlayıp nereye gidiyor bu yol?”',
    desc: 'Çırak → kalfa → usta → kendi işyeri ya da üniversite. Hedefini seç, aşama aşama gereken belgeler, sınavlar ve ücret haklarıyla kişisel patikanı çıkart.',
    tool: { href: '/patika', label: 'Staj Patikamı oluştur' },
  },
  {
    n: 5,
    title: 'Deneyerek Kararı Sahiplen',
    question: '“Kısa süre de olsa denedim mi?”',
    desc: 'Karar, yazıya değil deneyime dayanır: işletmeyi gez, usta öğreticiyle konuş, alandaki ilanları takip et, mülakat provasıyla kendini sına. İlk yıl içinde alan değiştirmek başarısızlık değildir — bilgiye yatırımdır.',
    tool: { href: '/ilanlar', label: 'İlanlara göz at' },
  },
];

export interface GroupGuide {
  id: string;
  emoji: string;
  name: string;
  riasec: string;
  kimUygun: string;
  gunAkisi: string;
  ortam: string;
  isBulma: string;
  dikkat: string;
  temsilci: { name: string; why: string }[];
}

export const GROUP_GUIDES: GroupGuide[] = [
  {
    id: 'teknik',
    emoji: '🔧',
    name: 'Teknik ve Tamir',
    riasec: 'R · Realistic — Pratikçi',
    kimUygun:
      'Ellerini kullanmayı seven, bozuk eşyayı söküp nasıl çalıştığını gören, netlik isteyen öğrenciler. “Nasıl oluyor bu?” sorusunun cevabını kranke ve avometreye bakarak arar.',
    gunAkisi:
      '08:00 iş talimatı ve günün planı · 09:00-16:00 montaj/bakım/arıza · 16:00 kayıt ve ertesi gün planı. Günün çoğu ayakta, aletle ve konuşarak geçer.',
    ortam: 'Atölye, servis aracı, işletme yürüyüşü; kapalı alan ağırlıklı ama hareketli.',
    isBulma:
      'Elektrik, makine ve otomasyon alanlarında kalifiye teknik eleman açığı uzun yıllardır yüksek. Elektrik-elektronik, motorlu araçlar ve endüstriyel otomasyon mezunları iş bulma şansı en yüksek kademede.',
    dikkat:
      'Yükseklik, elektrik ve kesici alet riskleri vardır; iş güvenliği ilk yıla oturmazsa meslek keyifli olmaktan çıkar. Kuralsız işletmeden uzak dur.',
    temsilci: [
      { name: 'Elektrik-Elektronik Teknolojisi', why: 'En geniş istihdam ağı: tesisattan otomasyona her sektörde ihtiyaç.' },
      { name: 'Motorlu Araçlar Teknolojisi', why: 'Elektrikli araç çağıyla yeni servis ve bakım kapıları açılıyor.' },
      { name: 'Endüstriyel Otomasyon Teknolojileri', why: 'Robotlu üretim arttıkça en hızlı aranan teknik kadro.' },
    ],
  },
  {
    id: 'dijital',
    emoji: '🖱️',
    name: 'Bilişim ve Tasarım',
    riasec: 'A + I · Yaratıcı + Soruşturucu',
    kimUygun:
      'Ekranda üreten, estetikle teknik arası öğrenciler. İçinden geçen fikri tasarıma veya koda dökebilen, yeni programı saatlerde öğrenen meraklılar.',
    gunAkisi:
      '09:00 brief ve üretim bloğu · 12:00 revizyon talebi · 14:00-17:00 tasarım/kod · 17:00 teslim. Günün kıyısı ekranda geçer.',
    ortam: 'Ofis veya uzaktan; masa başı, odak isteyen derin çalışma blokları.',
    isBulma:
      'Dijitalleşen her işletme müşteri: sosyal medya tasarımı, web sitesi ve bilgisayar servisi küçük işletmelerde bile standart. Freelance ve uzaktan çalışma bu grupta en erken başlar.',
    dikkat:
      'Sektör hızlı değişir; bugün öğrendiğin araç 2 yıl sonra yeterli olmayabilir. Ömür boyu öğrenmeye istekliysen bu grup seni çok ödüllendirir.',
    temsilci: [
      { name: 'Bilişim Teknolojileri', why: 'Donanımdan ağa, web tasarımından veriye en geniş çıkış kapısı.' },
      { name: 'Grafik ve Fotoğraf', why: 'Sosyal medya ekonomisiyle her markanın aradığı görsel üretim.' },
      { name: 'Kuyumculuk Teknolojisi', why: 'El işçiliği + CAD kombinasyonuyla e-ticarette güçlü niş.' },
    ],
  },
  {
    id: 'ofis',
    emoji: '💼',
    name: 'Ofis ve İdari İşler',
    riasec: 'C · Conventional — Düzenleyici',
    kimUygun:
      'Planı seven, evrak ve çizelgede huzur bulan, yazılı iletişimi güçlü öğrenciler. “Dağınık masada oturamam” diyenler bu grubun doğal üyesidir.',
    gunAkisi:
      '09:00 e-posta ve öncelik listesi · 10:00 evrak/fatura kaydı · 14:00 müşteri-banka görüşmeleri · 16:00 raporlama. Tempo düzenli, iş “hata yapmamak” ile ölçülür.',
    ortam: 'Kapalı ofis; bilgisayar ve doküman ağırlıklı, sabit saatler.',
    isBulma:
      'Ön muhasebe ve büro kadrosu her ölçekte firmada ihtiyaç. Adalet alanında adliye ve hukuk büroları düzenli eleman arar; kalfalık + pratik, hemen üretime hazır eleman yapar.',
    dikkat:
      'Mükerrer iş sıkıcı gelebilir, hata toleransı düşüktür. E-fatura ve ön muhasebe yazılımlarını erken öğrenmek seni 1 yıl öne geçirir.',
    temsilci: [
      { name: 'Muhasebe ve Finansman', why: 'Her işletmenin olmazsa olmazı; kendi büronu açma yolu açık.' },
      { name: 'Adalet', why: 'Adliye, icra, tapu ve hukuk bürolarında istikrarlı yol.' },
      { name: 'Büro Yönetimi ve Yönetici Asistanlığı', why: 'Tüm sektörlerde yöneticiye yakın, hızlı merdiven.' },
    ],
  },
  {
    id: 'saglik',
    emoji: '🩺',
    name: 'Sağlık, Bakım ve Eğitim',
    riasec: 'S · Social — Yardımsever',
    kimUygun:
      'İnsanla konuşmaktan keyif alan, sabırlı ve empatik öğrenciler. Birinin iyi gününe katkı yaptığını somut görmek en büyük motivasyonu.',
    gunAkisi:
      '08:00 el dezenfeksiyonu ve devir teslim · 09:00-16:00 bakım/etkinlik/hasta takip · 16:00 kayıt ve aile bilgilendirme. Gün, insan tepkilerine göre şekillenir.',
    ortam: 'Kreş, huzurevi, güzellik salonu; ayakta çalışma yoğun.',
    isBulma:
      'Nüfusun yaşlanmasıyla hasta ve yaşlı hizmetleri uzun vadeli talep artışında; kreş ve çocuk gelişimi her ilde açılır. Güzellik sektörü kendi işini kurmaya en elverişli gruplardan.',
    dikkat:
      'Duygusal olarak zor günler olur: sabırsızdan dayanış, kayıp ve ağlaman da mesleğin parçası. Hijyen disiplini ve fiziksel dayanıklılık şart.',
    temsilci: [
      { name: 'Çocuk Gelişimi ve Eğitimi', why: 'Kreş-anaokulu ağı geniş; Pedagoji ile üniversiteye uzanan yol.' },
      { name: 'Hasta ve Yaşlı Hizmetleri', why: 'Yaşlanan nüfusla uzun vadeli, garantili talep.' },
      { name: 'Güzellik Hizmetleri', why: 'Kendi salonunu açma yolu en net gruplardan.' },
    ],
  },
  {
    id: 'uretim',
    emoji: '🏭',
    name: 'Üretim, Gıda ve Tarım',
    riasec: 'R + I · Pratikçi + Soruşturucu',
    kimUygun:
      'Günün sonunda elinde somut bir ürünü görmek isteyen, süreç ve kaliteye dikkatli öğrenciler. “Yaptığım şey markete girdi” cümlesi onları doyurur.',
    gunAkisi:
      '07:30 vardiya teslimi · 08:00 hat hazırlık ve hijyen kontrolü · 09:00-16:00 üretim/kalite örnekleme · 16:00 rapor. Ritim hat hızına göre ayakta geçer.',
    ortam: 'Fabrika, atölye, laboratuvar veya tarla; hijyen kıyafeti standart.',
    isBulma:
      'Gıda ve kimyada ihracat her yıl büyüyor; HACCP eğitimi almış genç kadro her zaman aranan. Tarım ve hayvancılıkta bölgesel talep yüksek, kendi işini kurma şansı güçlü.',
    dikkat:
      'Vardiya düzeni (sabah-akşam-gece) sosyal hayatı etkiler; dozajda küçük hata büyük maliyet üretir. Detay disiplini şart.',
    temsilci: [
      { name: 'Gıda Teknolojisi', why: 'Her şehirde üretim tesisi; HACCP sertifikasıyla kapılar açık.' },
      { name: 'Kimya Teknolojisi', why: 'Laboratuvar→kalite kontrol→üretim yöneticiliği net merdiven.' },
      { name: 'Hayvan Yetiştiriciliği ve Sağlığı', why: 'Bölgesel talep yüksek, girişimcilik şansı somut.' },
    ],
  },
  {
    id: 'dismekan',
    emoji: '⚓',
    name: 'Açık Alan ve Ulaştırma',
    riasec: 'R + E · Pratikçi + Hareketçi',
    kimUygun:
      'Ofis koltuğuna oturmak istemeyen, hareket, rota ve büyük makineler seven öğrenciler. Gün sonu yorgun ama “bugün iş bitirdim” hissiyle dönenler.',
    gunAkisi:
      '07:00 saha çıkışı ve güvenlik kontrolü · 08:00-16:00 şantiye/yükleme/sevkiyat · 16:00 rapor ve kapanış. Hava durumu ve takvim her günü farklı yapar.',
    ortam: 'Şantiye, liman, depo, yol; açık hava ağırlıklı, mevsimlik koşullar.',
    isBulma:
      'Depo-sevkiyat ve lojistik, e-ticaret büyümesiyle her ilde istihdam üretiyor. İnşaat teknolojisi mega projelerle kadro arıyor; denizcilik uluslararası kariyer kapısı.',
    dikkat:
      'Mevsim koşulları zor olabilir (soğuk, sıcak, toz); kasksız çalışmaya tahammül etmez. Evden uzak dönemlere hazır olmak gerekir.',
    temsilci: [
      { name: 'Ulaştırma Hizmetleri', why: 'E-ticaret lojistiği her ilde sürekli eleman arıyor.' },
      { name: 'İnşaat Teknolojisi', why: 'Mega projeler + şantiyede usta yolu hızlı ilerler.' },
      { name: 'Denizcilik', why: 'Yurtdışı kazanç potansiyeli en yüksek teknik rotalardan.' },
    ],
  },
];

/** Ebeveyn köşesi — kararda çocuğun yanında durmak için 5 ilke */
export const PARENT_TIPS: string[] = [
  'Kararı çocuğa bırak, süreci ona aç: 14 yaşındaki çocuğunuz mesleğini 40 yıl yaşayacak; seçim onun olmalı.',
  '“Komşunun oğlu” değil, çocuğunuzun gündelik davranışı göstergedir: boş zamanında ne yapmayı seviyor?',
  'Maaş iyi kriter ama tek kriter değil: yüksek ücretli ama sevilmeyen meslek, iş değiştirme yolunun kısayoludur.',
  'Karar sonrası süreci takip edin: ilk 3 ayda işletmenin gerçek eğitim verip vermediğini, sigorta ve ücreti düzenli kontrol edin.',
  'Alan değiştirmeyi felaket değil, veri görün: yanlış deneme, neyi istemediğini öğretir — doğru denemeye giden yolda adımdır.',
];

/** Sık yapılan 5 hata */
export const COMMON_MISTAKES: { title: string; desc: string }[] = [
  {
    title: 'Sadece maaşa bakmak',
    desc: 'En yüksek maaşlı meslek, hiç ilgi duymadığın alanda uzun sürmez; ilgi, maaş artışını 10 yıl boyunca besleyen yakıttır.',
  },
  {
    title: 'Ailenin mesleğini otomatik devralmak',
    desc: 'Aile işletmesi avantajdır ama zorunluluk değildir; sevilmeyen alanda kalmak hem işe hem ilişkiye zarar verir.',
  },
  {
    title: 'Tek kaynakla karar vermek',
    desc: 'Tek kişinin veya tek videonun görüşüyle alan seçmek, 4 yıllık eğitim sürecini şansa bırakmaktır.',
  },
  {
    title: '“Okula gitmek istemiyorum” diye MESEM seçmek',
    desc: 'MESEM’de haftada 1 gün okul vardır ve modüller sınavla geçilir; okulu bırakma hayaliyle seçilen alan ilk sınavda hayal kırıklığına dönüşür.',
  },
  {
    title: 'Alanı tanımadan adına göre seçmek',
    desc: '“Bilişim = oyun oynamak”, “adalet = dava açmak” varsayımları genellikle yanlıştır; görev listesini okumadan seçim yapma.',
  },
];

/** İki alan arasında kalan öğrenciye karar matrisi soruları */
export const COMPARE_QUESTIONS: string[] = [
  'Hangi alanın “günün akışı”na kendini daha kolay hayal edebiliyorsun?',
  'Hangisinin çalışma ortamı seni daha çok heyecanlandırıyor: atölye, ofis, saha?',
  '4 yıl sonra ustalığa mı, üniversiteye mi gitmek senin planına daha uygun?',
  'Çevrendeki işletmeler hangi alanda sana daha kolay staj fırsatı bulabilir?',
  'İki alanı da yapan birinin 5 yıl sonraki hayatını hayal et: hangisi seni daha az yoruyor, daha çok geliştiriyor?',
];
