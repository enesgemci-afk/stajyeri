// MEB 3308 Sayılı Kanun Kapsamındaki Resmi MESEM Alanları
export const MESEM_FIELDS: string[] = [
  'Adalet',
  'Aile ve Tüketici Hizmetleri',
  'Ayakkabı ve Saraciye Teknolojisi',
  'Bilişim Teknolojileri',
  'Biyomedikal Cihaz Teknolojileri',
  'Büro Yönetimi ve Yönetici Asistanlığı',
  'Çocuk Gelişimi ve Eğitimi',
  'Denizcilik',
  'El Sanatları Teknolojisi',
  'Elektrik-Elektronik Teknolojisi',
  'Endüstriyel Otomasyon Teknolojileri',
  'Gemi Yapımı',
  'Gıda Teknolojisi',
  'Grafik ve Fotoğraf',
  'Güzellik Hizmetleri',
  'Halkla İlişkiler',
  'Harita-Tapu-Kadastro',
  'Hasta ve Yaşlı Hizmetleri',
  'Hayvan Yetiştiriciliği ve Sağlığı',
  'İnşaat Teknolojisi',
  'Kimya Teknolojisi',
  'Konaklama ve Seyahat Hizmetleri',
  'Kuyumculuk Teknolojisi',
  'Laboratuvar Hizmetleri',
  'Makine ve Tasarım Teknolojisi',
  'Matbaa Teknolojisi',
  'Metal Teknolojisi',
  'Mobilya ve İç Mekan Tasarımı',
  'Moda Tasarım Teknolojileri',
  'Motorlu Araçlar Teknolojisi',
  'Muhasebe ve Finansman',
  'Müzik Aletleri Yapımı',
  'Plastik Teknolojisi',
  'Seramik ve Cam Teknolojisi',
  'Tarım',
  'Tekstil Teknolojisi',
  'Tesisat Teknolojisi ve İklimlendirme',
  'Uçak Bakım',
  'Ulaştırma Hizmetleri',
  'Yenilenebilir Enerji Teknolojileri',
  'Yiyecek İçecek Hizmetleri',
];

// ============================================================
// ÜNİVERSİTE STAJI — 3308 dışı kitle (MYO / Lisans)
// Zorunlu + gönüllü/yaz stajı; SGK primi Genç İstihdam Paketi
// kapsamında devletçe karşılanır. Alanlar MESEM_FIELDS ile
// kesişmez (filtrelerde ayrı sekmede listelenir).
// ============================================================
export const UNIVERSITY_FIELDS: string[] = [
  'Bilgisayar Mühendisliği', 'Yazılım Mühendisliği', 'Elektrik-Elektronik Mühendisliği',
  'Makine Mühendisliği', 'Endüstri Mühendisliği', 'İnşaat Mühendisliği',
  'Mimarlık', 'İç Mimarlık', 'İşletme', 'İktisat', 'Pazarlama',
  'İnsan Kaynakları Yönetimi', 'Uluslararası Ticaret ve Lojistik',
  'Bankacılık ve Finans', 'Grafik Tasarım', 'İletişim ve Medya', 'Dijital Pazarlama',
  'Psikoloji', 'Sosyal Hizmet', 'Turizm İşletmeciliği',
  'Gastronomi ve Mutfak Sanatları', 'Hemşirelik', 'Fizyoterapi ve Rehabilitasyon', 'Veri Bilimi',
];

/** MESEM + Üniversite alanlarının birleşimi — ilan formu ve genel aramalar için */
export const ALL_FIELDS: string[] = [...MESEM_FIELDS, ...UNIVERSITY_FIELDS];

// Staj & Çıraklık Program Modelleri
export const PROGRAM_TYPES = [
  { value: 'MESEM_4_1', label: 'MESEM (4 Gün İşletme + 1 Gün Okul)' },
  { value: 'MTAL_3_DAYS', label: 'MTAL 12. Sınıf (3 Gün Staj + 2 Gün Okul)' },
  { value: 'SUMMER_INTERN', label: 'Yaz Stajı / Beceri Eğitimi' },
  { value: 'UNIV_MANDATORY', label: 'Üniversite Zorunlu Stajı (MYO / Lisans)' },
  { value: 'UNIV_VOLUNTARY', label: 'Üniversite Gönüllü / Yaz Stajı' },
];

// Türkiye 81 İl Listesi
export const TURKEY_CITIES: string[] = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
  'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
  'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
  'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

// Öğrenci eğitim seviyeleri — panel + havuz + formlar tek kaynak
export const EDU_LEVELS: string[] = [
  'MESEM (Çırak - 9, 10, 11. Sınıf)',
  'MESEM (Kalfa - 12. Sınıf)',
  'Meslek Lisesi (12. Sınıf Stajyeri)',
  'Üniversite / Önlisans Stajyeri',
];

// Program tipi etiketleri — ilan kartları, formlar ve filtreler tek kaynak
export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  MESEM_4_1: 'MESEM (4 Gün İşletme)',
  MTAL_3_DAYS: 'MTAL 12. Sınıf (3 Gün Staj)',
  SUMMER_INTERN: 'Yaz Stajı / Beceri Eğitimi',
  UNIV_MANDATORY: 'Üniversite Zorunlu Stajı',
  UNIV_VOLUNTARY: 'Üniversite Gönüllü / Yaz Stajı',
};

/** Bilinmeyen/değer yoksa raw değeri veya nötr etiket döner */
export function programTypeLabel(programType?: string | null): string {
  if (!programType) return 'Bilinmiyor';
  return PROGRAM_TYPE_LABELS[programType] ?? programType;
}