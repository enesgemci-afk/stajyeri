// Ön yazı örnekleri (/rehber/onyazi + başvuru formu çipleri)
// Öğrenci bir şablonu tıklayıp kendi bilgileriyle kişiselleştirir.

export interface OnyaziExample {
  id: string;
  title: string;
  /** Hangi durumda işe yarar */
  when: string;
  /** Başvuru formuna tek tıkla eklenebilir şablon metni (köşeli parantezli kısımlar öğrenci tarafından doldurulur) */
  body: string;
}

export const ONYAZI_EXAMPLES: OnyaziExample[] = [
  {
    id: 'hevesli',
    title: 'İlk Stajım — Hevesli Başlangıç',
    when: 'Henüz deneyimin yoksa; öğrenme isteğini ve disiplinini öne çıkarır.',
    body: 'Merhaba,\n\nBen [Ad Soyad], [Okul Adı] [Sınıf]. sınıf [Alan] öğrencisiyim. Bu alana ilgi duyar bir şekilde kendimi geliştirmek istediğim için staj arıyorum. İşletmenizde çalışma disiplinini, mesleğimi ve iş etiğini öğrenmek istiyorum.\n\nKendimi işletmenize faydalı görebileceğimi düşündüğüm noktalar: [beceri 1] ve [beceri 2]. Öğrenmeye açığım ve verilen işi baştan sona tamamlamak istiyorum.\n\nBana bu fırsatı verirseniz memnuniyet duyarım. İyi çalışmalar dilerim.',
  },
  {
    id: 'deneyim',
    title: 'Deneyim Vurgulu',
    when: 'Atölye dersi, deneyim ya da küçük projelerin varsa; somut işler öne çıkar.',
    body: 'Merhaba,\n\nBen [Ad Soyad], [Okul Adı] [Alan] alanı öğrencisiyim. Okulumda geçirdiğim atölye derslerinde ve [proje/deneyim] çalışmalarda pratik deneyim kazandım.\n\nİşletmenizin ilanında belirttiğiniz [ilan ile ilgili detay] beni özellikle ilgilendirdi; bu alanda öğrenmek ve katkı sağlamak istiyorum. Usta öğreticili bir ortamda mesleğimi geliştirmek en büyük hedefim.\n\nUygun görürseniz sizinle görüşmekten memnuniyet duyarım. İyi çalışmalar dilerim.',
  },
  {
    id: 'usta-ogretici',
    title: 'Usta Öğreticiye Hitap Eden',
    when: 'İlanda "usta öğretici mevcut" yazıyorsa; öğrenme isteğini ve saygıyı vurgular.',
    body: 'Merhaba,\n\nBen [Ad Soyad], [Okul Adı] [Sınıf]. sınıf [Alan] öğrencisiyim. İlanınızda usta öğreticiniz olduğu belirtildiği için özellikle başvurmak istedim; mesleği gerçek bir ustadan öğrenmek istiyorum.\n\nÇalışmaya başlarsam işletmenizin düzenine ve ustalarımın yönlendirmesine uyacağım. Verilen işi dikkatli ve zamanında yapmaya özen gösteririm.\n\nUygun görürseniz görüşmek isterim. İyi çalışmalar dilerim.',
  },
  {
    id: 'yakin',
    title: 'Yakın Konum / Ulaşım Vurgulu',
    when: 'Ev adresin işletmeye yakınsa; ulaşım güvenilirliğini öne çıkarır.',
    body: 'Merhaba,\n\nBen [Ad Soyad], [Okul Adı] [Alan] öğrencisiyim. [İlçe]\'de ikamet ediyorum ve işletmenize ulaşımım çok kolaydır. Bu yüzden düzenli olarak her iş günü zamanında gelebilirim.\n\n[Alan] alanında kendimi geliştirmek ve gerçek iş ortamında deneyim kazanmak istiyorum. Verilen görevleri titizlikle tamamlarım.\n\nİlginiz için şimdiden teşekkür ederim. İyi çalışmalar dilerim.',
  },
];
