import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { ShieldCheck, Database, Share2, UserCheck, Clock, Scale } from 'lucide-react';

const SECTIONS: { icon: typeof Database; title: string; body: React.ReactNode }[] = [
  {
    icon: Database,
    title: '1. İşlenen Kişisel Veriler',
    body: (
      <ul className="list-disc pl-4 space-y-1">
        <li>Kimlik bilgileri: ad, soyad</li>
        <li>İletişim bilgileri: e-posta, telefon numarası</li>
        <li>Eğitim bilgileri: meslek alanı, eğitim seviyesi (MESEM sınıf düzeyi)</li>
        <li>Başvuru bilgileri: ön yazı, başvuru geçmişi ve başvuru durumu</li>
      </ul>
    ),
  },
  {
    icon: Scale,
    title: '2. Verilerin İşlenme Amacı ve Hukuki Sebebi',
    body: (
      <p>
        Verileriniz; 3308 sayılı Meslekî Eğitim Kanunu kapsamındaki çıraklık ve öğrencilik eğitimine yönelik
        ilanlarla eşleşmenizi sağlamak, başvurunuzu ilgili işletmeye iletmek ve başvuru durumunuzu takip
        edebileceğiniz paneli sunmak amacıyla işlenir. İşleme, 6698 sayılı KVKK'nın 5. maddesinde yer alan
        <strong> açık rızanız</strong> ve <strong>sözleşmenin kurulması/ifası</strong> hukuki sebeplerine dayanır.
      </p>
    ),
  },
  {
    icon: Share2,
    title: '3. Aktarım',
    body: (
      <p>
        Başvurduğunuz ilanın işletmesine (ad, meslek alanı, eğitim seviyesi, telefon ve ön yazı bilgileriniz)
        aktarılır. Verileriniz başka hiçbir üçüncü tarafla paylaşılmaz ve ticari amaçla kullanılmaz.
      </p>
    ),
  },
  {
    icon: Clock,
    title: '4. Saklama Süresi',
    body: (
      <p>
        Başvuru verileriniz, başvurunuz sonuçlanana ve mevzuattan doğan saklama yükümlülükleri sona erene kadar
        saklanır. Hesabınızı silmeniz durumunda ilgili veriler silinir veya anonim hale getirilir.
      </p>
    ),
  },
  {
    icon: UserCheck,
    title: '5. KVKK 11. Madde Kapsamındaki Haklarınız',
    body: (
      <ul className="list-disc pl-4 space-y-1">
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme ve erişim sağlama,</li>
        <li>Yanlış veya eksik işlenmişse düzeltilmesini isteme,</li>
        <li>Silinmesini veya yok edilmesini isteme,</li>
        <li>İşlemenin kanuna aykırılığı nedeniyle zararınızın giderilmesini talep etme.</li>
      </ul>
    ),
  },
];

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader />

      <main className="max-w-3xl w-full mx-auto px-4 py-12 flex-1">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-[#0A1931]">
              KVKK Aydınlatma Metni
            </h1>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-8">
            stajyeri.net olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ('KVKK') kapsamında veri
            sorumlusu sıfatıyla hareket etmekteyiz. Bu metin, platformumuzda staj/çıraklık başvurusu yaparken
            işlenen kişisel verilerinize ilişkin bilgilendirmeyi içerir.
          </p>

          <div className="space-y-6">
            {SECTIONS.map((s) => (
              <section key={s.title} className="border-t border-slate-100 pt-5">
                <h2 className="text-sm font-black text-[#0A1931] flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4 text-[#00A8B5]" /> {s.title}
                </h2>
                <div className="text-xs text-slate-600 leading-relaxed">{s.body}</div>
              </section>
            ))}
          </div>

          <div className="mt-8 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
            <strong>18 yaş altı öğrenciler hakkında:</strong> MESEM çırak adaylarının çoğu reşit değildir.
            Reşit olmayan öğrencilerin başvuru verileri, veli onayı olmaksızın işletmelere iletilmez; kanuni
            temsilcinin aydınlatılması ve onayı esastır.
          </div>

          <p className="text-[10px] text-slate-400 mt-6">
            Soru ve talepleriniz için site üzerindeki iletişim kanallarını kullanabilirsiniz. Bu metin
            bilgilendirme amaçlıdır ve güncel mevzuata göre güncellenebilir.
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-xs font-bold text-[#00A8B5] hover:underline">
            ← Ana Sayfaya Dön
          </Link>
        </p>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Stajyeri.net &mdash; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}