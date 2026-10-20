// Mülakat soruları rehberi (/rehber/mulakat-sorulari) içerikleri
// Her sorunun altında "iyi cevap nasıl olur" ipucu vardır.

export interface InterviewQA {
  q: string;
  tip: string;
}

/** Tüm alanlar için geçerli genel sorular */
export const GENERAL_QUESTIONS: InterviewQA[] = [
  {
    q: 'Kendini kısaca tanıtır mısın?',
    tip: "Adın, okulun, alanın ve 1 güçlü özelliğin. 30 saniyede bitir; CV'ni kelime kelime tekrar etme.",
  },
  {
    q: 'Neden bizim işletmemizde staj yapmak istiyorsun?',
    tip: 'İlanı okuduğunu göster: işletmenin yaptığı işe, ekip büyüklüğüne ya da öğreneceğin tekniklere değin.',
  },
  {
    q: 'Bu meslek alanını neden seçtin?',
    tip: 'Kısa bir hikâye anlat: ne zaman ilgilendin, o zamandan beri ne yaptın.',
  },
  {
    q: 'Güçlü ve geliştirmen gereken yönlerin neler?',
    tip: 'Güçlü yönünü örnekle ("...bu yüzden hocam bana ... görevini verdi"). Gelişme alanını bir planla bağla.',
  },
  {
    q: 'Daha önce bir işletmede ya da atölyede bulundun mu?',
    tip: 'Okuldaki atölye saatleri, aile işi ya da kısa gönüllü işler bile sayılır; orada ne öğrendiğini söyle.',
  },
  {
    q: 'Haftada hangi günler ve saatlerde çalışabilirsin?',
    tip: '3308 kurallarına göre günlük çalışma süresini öğren; net ve gerçekçi bir program söyle.',
  },
  {
    q: 'Bize sormak istediğin bir soru var mı?',
    tip: 'Hazırlıklı git: "İlk aylarımda bana kim eşlik edecek?" gibi 1-2 soru sor; "yok" deme.',
  },
  {
    q: 'Sigorta ve staj sözleşmesi hakkında ne biliyorsun?',
    tip: '3308 kapsamında sigortanın işletme tarafından yapılacağını bildiğini göster; detayı bilmesen de açık konuş.',
  },
];

// Alan bazlı sorular (öğrencinin alanına göre sayfada ekstra gösterilir)
export const FIELD_QUESTIONS: Record<string, InterviewQA[]> = {
  'Elektrik-Elektronik Teknolojisi': [
    {
      q: 'Seri ve paralel bağlamanın farkını açıklayabilir misin?',
      tip: 'Okul atölyesinde yaptığın basit bir devre örneğiyle anlat; ezber tanım yerine örnek ver.',
    },
    {
      q: 'Elektrikte en önemli güvenlik kuralı nedir?',
      tip: 'Enerjiyi kesmeden çalışmamak, kaçak akım rölesi ve izole eldiven gibi somut kurallar say.',
    },
    {
      q: 'Bir priz çalışmıyor, nasıl bulursun sorunu?',
      tip: 'Adım adım mantık yürüttüğünü göster: önce test cihazıyla kontrol, sonra sigorta, sonra bağlantı.',
    },
  ],
  'Bilişim Teknolojileri': [
    {
      q: 'Bir bilgisayara Windows kurulumu nasıl yapılır?',
      tip: 'USB ile başlatma, disk bölümleme, kurulum sonrası sürücüler şeklinde adımları sıralayabilirsin.',
    },
    {
      q: 'İnterneti olmayan bir müşteri geldi, neyi kontrol edersin?',
      tip: 'Modem, kablo, ağ ayarları sırasını söyle; müşteri iletişimini de unutma.',
    },
    {
      q: 'Kendini geliştirmek için neler yapıyorsun?',
      tip: 'İzlediğin YouTube kanalları, denediğin küçük projeler ya da ücretsiz kurslar olsa da anlat.',
    },
  ],
  'Motorlu Araçlar Teknolojisi': [
    {
      q: 'Periyodik bakımda hangi kontroller yapılır?',
      tip: 'Yağ, filtre, fren, balata, soğutma sıvısı gibi kalemleri say; iş sırası bilmek puan kazandırır.',
    },
    {
      q: 'Araç marş basmıyorsa ilk ne kontrol edilir?',
      tip: 'Akü gerilimi ve terminallerle başlamak doğru cevap; sıralı düşünüyorsun.',
    },
    {
      q: 'Garajda en çok hangi işte yardımcı oldun / olmak istersin?',
      tip: 'Dürüst ol; henüz deneyimin yoksa "en çok fren sistemi öğrenmek isterim" gibi hedef söyle.',
    },
  ],
  'Gıda Teknolojisi': [
    {
      q: 'Gıda üretiminde hijyen neden kritiktir, nasıl sağlanır?',
      tip: 'El-kıyafet hijyeni, HACCP ve son kullanma takibi gibi somut kurallar söyle.',
    },
    {
      q: 'Son kullanma tarihi geçmiş bir ürünle ne yapılır?',
      tip: 'Tek cevap: ayrılır ve kaydı tutulur. "Değerlendiririm" demek yanlış cevaptır.',
    },
  ],
  'Yiyecek İçecek Hizmetleri': [
    {
      q: 'Mutfakta hijyene nasıl dikkat edersin?',
      tip: 'Bıçak/tahta ayırma, el yıkama sıklığı ve soğuk zincir gibi örnekler ver.',
    },
    {
      q: 'Misafirin siparişi yanlış geldiyse ne yaparsın?',
      tip: 'Özür dilere, hızla düzeltir ve mutfağa bilgi verirsin; soğukkanlılık vurgusu önemli.',
    },
  ],
  'Çocuk Gelişimi ve Eğitimi': [
    {
      q: 'Ağlayan bir çocuğu nasıl sakinleştirirsin?',
      tip: 'Dizine inip göz hizasıyla konuşmak, dikkatini oyunla dağıtmak gibi pratik yöntemler anlat.',
    },
    {
      q: '3 yaş grubuna uygun bir etkinlik örneği verir misin?',
      tip: 'Yaşa uygunluğu vurgula: küçük kas gelişimi için parmak boyaması gibi kısa bir örnek yeter.',
    },
  ],
  'Güzellik Hizmetleri': [
    {
      q: 'Kullanılan aletlerin temizliği ve sterilizasyonu nasıl yapılır?',
      tip: 'Araçların kişiye özel olduğu ve dezenfeksiyon adımlarını bildiğini göster.',
    },
    {
      q: 'Memnun olmayan bir müşteriyle nasıl iletişim kurarsın?',
      tip: 'Önce dinlemek, sonra düzeltme önerisi; güler yüzlü kalmanın önemini vurgula.',
    },
  ],
  'Muhasebe ve Finansman': [
    {
      q: 'Excel\'de bir sütunun toplamını nasıl alırsın?',
      tip: 'TOPLAM (SUM) formülü ve hücre aralığı seçimi; pratik yaptıysan örnekle destekle.',
    },
    {
      q: 'Fatura ile irsaliye arasındaki fark nedir?',
      tip: 'İrsaliye sevkiyatı, fatura bedeli belgelediğini kısaca söyleyebilsen yeterli.',
    },
  ],
  Adalet: [
    {
      q: 'Adalet alanında gizlilik neden bu kadar önemlidir?',
      tip: 'Dosyalardaki kişisel verilerin korunması ve yargı süreçlerinin güvenilirliğiyle bağla.',
    },
    {
      q: 'Gelen bir evrakı nasıl düzenli arşivlarsın?',
      tip: 'Tarih-no sıralaması ve defter kaydı gibi düzen alışkanlıklarından bahset.',
    },
  ],
};

// Liste dışındaki alanlar için genel alan soruları
export const GENERIC_FIELD_QUESTIONS: InterviewQA[] = [
  {
    q: 'Bu alanda en temel becerin ne?',
    tip: 'Okul atölyesinden somut bir beceri seç ve nasıl öğrendiğini kısaca anlat.',
  },
  {
    q: 'Atölye derslerinde en çok ne yaptın?',
    tip: 'Haftalık atölye saatlerinde ürettiğin bir işi anlatmak, çalışkan olduğunu gösterir.',
  },
  {
    q: 'İş güvenliği kurallarına nasıl uyarsın?',
    tip: 'Koruyucu ekipman ve yönergeye uymaktan 1-2 somut örnek ver.',
  },
];

/** Öğrencinin alanına göre ekstra mülakat soruları döner */
export function getInterviewQuestions(field: string): InterviewQA[] {
  return FIELD_QUESTIONS[field] ?? GENERIC_FIELD_QUESTIONS;
}
