// CV oluşturucu ve başvuru formu için içerik önerileri

// Alan bazlı önerilen beceri etiketleri (tıkla → CV'ye ekle)
export const FIELD_SKILLS: Record<string, string[]> = {
  'Elektrik-Elektronik Teknolojisi': [
    'Elektrik Tesisatı', 'Pano Montajı', 'Ölçü Aletleri', 'Devre Okuma', 'Elektrik Bakımı', 'İş Güvenliği',
  ],
  'Bilişim Teknolojileri': [
    'HTML / CSS', 'JavaScript', 'Donanım Kurulumu', 'Ağ Kablolaması', 'Ofis Programları', 'Yazılım Kurulumu',
  ],
  'Motorlu Araçlar Teknolojisi': [
    'Motor Bakımı', 'Fren Sistemi', 'Elektrik Sistemi', 'Lastik Değişimi', 'Periyodik Bakım', 'Arıza Tespiti',
  ],
  'Makine ve Tasarım Teknolojisi': [
    'CNC Torna', 'CNC Freze', 'Teknik Çizim', 'Ölçü Kontrol', 'Kaynak', 'Makine Bakımı',
  ],
  'Metal Teknolojisi': [
    'Kaynak (MIG/MAG)', 'Kaynak (TIG)', 'Kesim', 'Büküm', 'Taşlama', 'Konstrüksiyon Montajı',
  ],
  'Gıda Teknolojisi': [
    'Gıda Hijyeni', 'Üretim Hattı', 'Kalite Kontrol', 'Ambalajlama', 'HACCP', 'Depo Düzeni',
  ],
  'Yiyecek İçecek Hizmetleri': [
    'Mutfak Hazırlık', 'Pişirme Teknikleri', 'Servis', 'Hijyen Kuralları', 'Masa Düzeni', 'Misafir Karşılama',
  ],
  'Güzellik Hizmetleri': [
    'Saç Kesimi', 'Saç Boyama', 'Manikür', 'Cilt Bakımı', 'Misafir Karşılama', 'Hijyen',
  ],
  'Çocuk Gelişimi ve Eğitimi': [
    'Çocuk Bakımı', 'Oyun Etkinlikleri', 'Masal Anlatımı', 'El Sanatları', 'İletişim', 'Sabır ve Empati',
  ],
  'Muhasebe ve Finansman': [
    'Ön Muhasebe', 'e-Fatura', 'Excel', 'Banka Mutabakatı', 'Evrak Kayıt', 'Gizlilik',
  ],
  'Adalet': [
    'Dosya Takibi', 'Büro Evrak İşleri', 'Resmi Yazışma', 'Word / Excel', 'Gizlilik', 'Düzen ve Takip',
  ],
  'İnşaat Teknolojisi': [
    'Kalıp', 'Demir Bağlama', 'Duvar Örgüsü', 'Ölçüm', 'Şantiye Güvenliği', 'Çizim Okuma',
  ],
  'Tekstil Teknolojisi': [
    'Dikiş Makinesi', 'Ütü / Pres', 'Kalite Kontrol', 'Kesim', 'Kumaş Bilgisi', 'Serim',
  ],
  'Mobilya ve İç Mekan Tasarımı': [
    'Ahşap İşleme', 'Montaj', 'Zımpara', 'Cila', 'Ölçü Alma', 'Çizim',
  ],
};

// Listedeki alan dışındakiler için genel öneriler
export const GENERIC_SKILLS: string[] = [
  'Dikkatli ve Titiz', 'Takım Çalışması', 'Zaman Yönetimi', 'İletişim', 'Öğrenmeye Açık', 'İş Güvenliği',
];

// "Hakkımda" kutusu için hazır örnek cümleler
export const ABOUT_EXAMPLES: { label: string; text: string }[] = [
  {
    label: 'MESEM öğrencisi',
    text: 'MESEM öğrencisiyim ve meslek alanımda sahada deneyim kazanmak istiyorum. Dikkatli, titiz ve öğrenmeye açığım; verilen işi planlı şekilde tamamlayan bir çalışma alışkanlığım var.',
  },
  {
    label: 'Deneyim vurgulu',
    text: 'Alanımla ilgili okul atölyesinde temel becerilerimi geliştirdim ve staj sırasında usta öğretici eşliğinde gerçek iş süreçlerinde yer almak istiyorum. Takım çalışmasına yatkın, iş güvenliğine önem veren bir öğrenciyim.',
  },
  {
    label: 'Kısa ve net',
    text: 'Meslek alanıma uygun işlerde deneyim kazanmak isteyen, güler yüzlü ve sorumluluk sahibi bir öğrenciyim.',
  },
];

// Başvuru formundaki "Ön Yazınız" kutusu için örnek parçalar
export const COVER_LETTER_SNIPPETS: { label: string; text: string }[] = [
  {
    label: 'Hevesli giriş',
    text: 'Sayın yetkililer, ilanınızı büyük bir heyecanla inceledim. Mesleğimi sahada öğrenmek ve işletmenize katkı sağlamak istiyorum.',
  },
  {
    label: 'Deneyim vurgulu',
    text: 'Okul atölyesinde alanımla ilgili temel becerilerimi geliştirdim. İşletmenizde bu becerilerimi gerçek iş süreçlerine dökme fırsatı arıyorum.',
  },
  {
    label: 'Usta öğreticiye hitap',
    text: 'Usta öğretici hocalarınızın gözetiminde çalışmaya ve öğrendiğim her tekniği uygulamaya hazırım.',
  },
];
