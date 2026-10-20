// İşveren ilan formu için alan bazlı hazır şablonlar (kariyer.net "Akıllı İlan" ilhamı)
// Amaç: İşveren 1 dakikada alanına uygun ilan metnini doldurur, sonra işletmesine göre düzenler.

export interface JobTemplate {
  title: string;
  description: string;
}

export const JOB_TEMPLATES: Record<string, JobTemplate> = {
  'Elektrik-Elektronik Teknolojisi': {
    title: 'Elektrik Tesisat ve Bakım MESEM Çırağı',
    description:
      'Elektrik tesisatında usta öğretici eşliğinde kablo çekimi, priz/anahtar montajı ve pano montajına yardım edecek çırak arıyoruz. Ölçü aletleri kullanımı, devre takibi ve iş güvenliği kurallarına uygun çalışma öğretilecektir. Temel elektrik bilgisi olan, dikkatli ve öğrenmeye açık öğrenciler tercih edilir.',
  },
  'Bilişim Teknolojileri': {
    title: 'Bilgisayar Bakım ve Teknik Destek Stajyeri',
    description:
      'Donanım kurulumu, işletim sistemi ve ofis programları kurulumu, ağ kablolaması ve kullanıcı desteği konularında tecrübe kazandıracak stajyer arıyoruz. Format atma, yazılım kurulumu ve müşteri karşılama pratikleri öğretilecektir. Bilgisayara ilgisi olan, sorumlu öğrenciler bekliyoruz.',
  },
  'Motorlu Araçlar Teknolojisi': {
    title: 'Otomotiv Servis MESEM Çırağı',
    description:
      'Periyodik bakım, yağ ve filtre değişimi, fren sistemi kontrolü ve tekerlek değişimi işlerinde usta öğreticiye yardımcı olacak çırak arıyoruz. Arıza tespiti cihazlarının kullanımı ve servis süreçleri adım adım öğretilecektir. El becerisi yüksek, titiz öğrenciler tercih edilir.',
  },
  'Makine ve Tasarım Teknolojisi': {
    title: 'CNC Torna-Freze MESEM Çırağı',
    description:
      'Atölyemizde CNC torna ve freze tezgahlarında ölçü kontrol, parça montajı ve teknik çizim okuma becerileri kazandıracak çırak arıyoruz. Kalıp ve makine bakım süreçlerine de katılım sağlanacaktır. Teknik çizim dersi alan öğrenciler önceliklidir.',
  },
  'Metal Teknolojisi': {
    title: 'Kaynak ve Metal İşleme MESEM Çırağı',
    description:
      'Kaynak atölyemizde MIG/MAG ve TIG kaynak teknikleri, kesim ve büküm işlemleri konusunda eğitim verilecektir. Çelik konstrüksiyon montajına da destek verecek, iş güvenliği kurallarına uyan çıraklar arıyoruz.',
  },
  'Gıda Teknolojisi': {
    title: 'Gıda Üretim Hattı Stajyeri',
    description:
      'Üretim hattımızda hijyen kurallarına uygun çalışma, ambalajlama, kalite kontrol ve depo süreçlerinde stajyer arıyoruz. HACCP ve gıda güvenliği eğitimi verilecektir. Dikkatli, hijyen kurallarına özen gösteren öğrenciler tercih edilir.',
  },
  'Yiyecek İçecek Hizmetleri': {
    title: 'Mutfak ve Servis MESEM Çırağı',
    description:
      'Mutfağımızda hazırlık, pişirme ve servis süreçlerinde usta aşçı eşliğinde deneyim kazandıracak çırak arıyoruz. Mutfak hijyeni, masa düzeni ve misafir karşılama pratikleri öğretilecektir. Yemek yapmayı seven, dinamik öğrenciler bekliyoruz.',
  },
  'Güzellik Hizmetleri': {
    title: 'Kuaför ve Güzellik Salonu Çırağı',
    description:
      'Saç yıkama, kesim ve boya süreçlerinde usta kuaför eşliğinde eğitim verilecektir. Manikür, cilt bakımı ve misafir karşılama becerileri de kazandırılır. Hijyen kurallarına uyan, iletişimi güçlü öğrenciler tercih edilir.',
  },
  'Çocuk Gelişimi ve Eğitimi': {
    title: 'Anaokulu Stajyeri (Çocuk Gelişimi)',
    description:
      'Kreş/anaokulumuzda çocuk bakımı, oyun etkinlikleri düzenleme, masal anlatımı ve el sanatları etkinliklerinde öğretmenlere yardımcı stajyer arıyoruz. Çocuklarla iletişim ve sınıf yönetimi deneyimi kazandıracaktır. Sabırlı ve güler yüzlü öğrenciler bekliyoruz.',
  },
  'Muhasebe ve Finansman': {
    title: 'Ön Muhasebe Stajyeri',
    description:
      'Muhasebe büromuzda e-fatura, evrak kayıt, banka mutabakatı ve Excel tabloları üzerinde deneyim kazandıracak stajyer arıyoruz. Ön muhasebe programı kullanımı öğretilecektir. Excel bilgisi olan, titiz ve gizliliğe önem veren öğrenciler tercih edilir.',
  },
  'İnşaat Teknolojisi': {
    title: 'Şantiye MESEM Çırağı (İnşaat)',
    description:
      'Şantiyemizde kalıp, demir bağlama ve duvar örgüsü işlerinde usta eşliğinde çalışacak çırak arıyoruz. Ölçüm alımı ve şantiye güvenliği kuralları adım adım öğretilecektir. Dış mekanda çalışmaya uygun, dikkatli öğrenciler tercih edilir.',
  },
  'Tekstil Teknolojisi': {
    title: 'Dikiş Atölyesi MESEM Çırağı',
    description:
      'Dikiş atölyemizde dikim makinesi kullanımı, serim, kesim ve ütü süreçlerinde eğitim verilecektir. Kalite kontrol ve sevkiyat hazırlığına da katılım sağlanacaktır. El becerisi yüksek öğrenciler bekliyoruz.',
  },
};

// Liste dışındaki alanlar için genel şablon
export const GENERIC_JOB_TEMPLATE: JobTemplate = {
  title: 'MESEM Çırak / Stajyer',
  description:
    'İşletmemizde 3308 sayılı kanun kapsamında meslek alanına uygun işlerde usta öğretici eşliğinde çalışacak çırak/stajyer arıyoruz. Temel iş süreçleri, iş güvenliği kuralları ve mesleki beceriler adım adım öğretilecektir. Öğrenmeye açık ve sorumluluk sahibi öğrenciler bekliyoruz.',
};
