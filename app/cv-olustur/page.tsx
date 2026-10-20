'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS } from '@/lib/constants';
import { ABOUT_EXAMPLES } from '@/lib/cvContent';
import SiteHeader from '@/components/SiteHeader';
import Link from 'next/link';
import {
  FileText, Sparkles, User, Phone, Mail, GraduationCap, Wrench, Save,
  Printer, CheckCircle2, AlertCircle, Plus, X, Lightbulb, ArrowRight, MapPin,
} from 'lucide-react';

interface ExperienceItem {
  title: string;
  place: string;
  detail: string;
}

interface CVData {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  education: string;
  field: string;
  school: string;
  about: string;
  skills: string[];
  experiences: ExperienceItem[];
}

const EMPTY_CV: CVData = {
  fullName: '', phone: '', email: '', city: '', education: '', field: '', school: '',
  about: '', skills: [], experiences: [],
};

// MESEM alanına göre önerilen beceriler (kariyer.net "pozisyona özel şablon"
// yaklaşımının stajye uyarlanmış hali)
const SKILL_TEMPLATES: Record<string, string[]> = {
  'Elektrik-Elektronik Teknolojisi': ['Elektrik tesisatı', 'Pano montajı', 'Devre kurulumu', 'Ölçü aletleri kullanımı', 'İş güvenliği'],
  'Bilişim Teknolojileri': ['HTML / CSS', 'JavaScript', 'Donanım kurulumu', 'Ağ kablolama', 'Windows kurulumu'],
  'Motorlu Araçlar Teknolojisi': ['Periyodik bakım', 'Fren sistemi', 'Lastik değişimi', 'Yağ değişimi', 'Arıza tespiti'],
  'Makine ve Tasarım Teknolojisi': ['CNC', 'Torna', 'Freze', 'Teknik çizim okuma', 'Ölçü kontrolü'],
  'Gıda Teknolojisi': ['Gıda güvenliği', 'Hijyen kuralları', 'Üretim hattı', 'Kalite kontrol', 'Ambalajlama'],
  'Yiyecek İçecek Hizmetleri': ['Mutfak hijyeni', 'Temel pişirme', 'Sunum', 'Servis', 'HACCP'],
  'Çocuk Gelişimi ve Eğitimi': ['Çocuk iletişimi', 'Etkinlik hazırlama', 'Oyun yönetimi', 'Sabır ve dikkat'],
  'Güzellik Hizmetleri': ['Saç kesimi', 'Saç boyama', 'Cilt bakımı', 'Sterilizasyon', 'Müşteri iletişimi'],
  'Muhasebe ve Finansman': ['Temel muhasebe', 'Excel', 'Evrak takibi', 'E-fatura', 'Dikkat ve düzen'],
  'Adalet': ['Dosya takibi', 'Resmi yazışma', 'Gizlilik kuralları', 'Dikkat ve düzen'],
  'Mobilya ve İç Mekan Tasarımı': ['Ahşap işleme', 'Montaj', 'Zımpara', 'Ölçü alma', 'Çizim okuma'],
  'Tekstil Teknolojisi': ['Dikiş makinesi', 'Kesim', 'Ütü', 'Kalite kontrol'],
  'İnşaat Teknolojisi': ['Şantiye güvenliği', 'Kalonluk', 'Ölçü alma', 'Beton bilgisi'],
  'Kimya Teknolojisi': ['Laboratuvar güvenliği', 'Numune alma', 'Cihaz temizliği', 'Deney kaydı'],
};

function getSkillsFor(field: string): string[] {
  return SKILL_TEMPLATES[field] ?? ['Takım çalışması', 'İş güvenliği', 'Zaman yönetimi', 'Öğrenmeye açık'];
}

const GENERAL_SKILLS = ['İletişim', 'Takım çalışması', 'İş güvenliği', 'Zaman yönetimi'];

export default function CVOlusturPage() {
  const [data, setData] = useState<CVData>(EMPTY_CV);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  function set<K extends keyof CVData>(key: K, value: CVData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function toggleSkill(s: string) {
    setData((d) => {
      const has = d.skills.includes(s);
      return {
        ...d,
        skills: has ? d.skills.filter((x) => x !== s) : [...d.skills, s],
      };
    });
    setSaved(false);
  }

  function addExperience() {
    setData((d) => ({
      ...d,
      experiences: [...d.experiences, { title: '', place: '', detail: '' }],
    }));
    setSaved(false);
  }

  function updateExperience(i: number, key: keyof ExperienceItem, value: string) {
    setData((d) => {
      const list = [...d.experiences];
      list[i] = { ...list[i], [key]: value };
      return { ...d, experiences: list };
    });
    setSaved(false);
  }

  function removeExperience(i: number) {
    setData((d) => ({ ...d, experiences: d.experiences.filter((_, idx) => idx !== i) }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setSaveMsg({ type: 'err', text: 'Kaydetmek için giriş yapmalısın. CV\'n yine de yazdırılabilir.' });
        return;
      }

      // Mevcut CV'yi kontrol et (varsa güncelle)
      const { data: existing } = await supabase
        .from('student_cvs')
        .select('id')
        .eq('profile_id', session.user.id)
        .maybeSingle();

      const payload = {
        profile_id: session.user.id,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        city: data.city,
        education_level: data.education,
        field_name: data.field,
        school_name: data.school,
        about: data.about,
        skills: data.skills,
        experiences: data.experiences,
        updated_at: new Date().toISOString(),
      };

      const { error } = existing
        ? await supabase.from('student_cvs').update(payload).eq('id', existing.id)
        : await supabase.from('student_cvs').insert(payload);

      if (error) throw new Error(error.message);
      setSaved(true);
      setSaveMsg({ type: 'ok', text: 'CV\'nin hesabına kaydedildi. Bir dahaki sefere hazır gelir.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kaydetme sırasında bir sorun oluştu.';
      setSaveMsg({ type: 'err', text: msg });
    } finally {
      setSaving(false);
    }
  }

  // Girişli kullanıcının kayıtlı CV'sini forma yükle
  useEffect(() => {
    async function loadSaved() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: row } = await supabase
        .from('student_cvs')
        .select('*')
        .eq('profile_id', session.user.id)
        .maybeSingle();
      if (row) {
        setData({
          fullName: row.full_name ?? '',
          phone: row.phone ?? '',
          email: row.email ?? '',
          city: row.city ?? '',
          education: row.education_level ?? '',
          field: row.field_name ?? '',
          school: row.school_name ?? '',
          about: row.about ?? '',
          skills: Array.isArray(row.skills) ? row.skills : [],
          experiences: Array.isArray(row.experiences) ? row.experiences : [],
        });
      }
    }
    loadSaved();
  }, []);

  const suggested = data.field ? getSkillsFor(data.field) : GENERAL_SKILLS;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Başlık (yazdırılmaz) */}
          <div className="no-print text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A8B5]/10 border border-[#00A8B5]/20 text-[#00A8B5] text-[11px] font-black mb-4">
              <Sparkles className="w-3.5 h-3.5" /> ÜCRETSİZ ARAÇ
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A1931]">
              Stajyer CV Oluşturucu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
              Bilgilerini gir, CV'ni anında gör; yazdır butonuyla PDF olarak kaydet.
              Deneyimsiz öğrenciler için hazırlandı.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* SOL: Form (yazdırılmaz) */}
            <div className="no-print space-y-5">

              {/* Kişisel Bilgiler */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-black text-[#0A1931] mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00A8B5]" /> Kişisel Bilgiler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Ad Soyad *</label>
                    <input
                      type="text"
                      value={data.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
                      placeholder="Örn. Ahmet Yılmaz"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="05xx xxx xx xx"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">E-posta</label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="ornek@mail.com"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Yaşadığın Şehir</label>
                    <input
                      type="text"
                      value={data.city}
                      onChange={(e) => set('city', e.target.value)}
                      placeholder="Örn. İzmir"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                    />
                  </div>
                </div>
              </section>

              {/* Eğitim */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-black text-[#0A1931] mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#00A8B5]" /> Eğitim
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Eğitim Durumu *</label>
                    <select
                      value={data.education}
                      onChange={(e) => set('education', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5] transition cursor-pointer"
                    >
                      <option value="">Seçiniz</option>
                      <option>MESEM (Çırak - 9, 10, 11. Sınıf)</option>
                      <option>MESEM (Kalfa - 12. Sınıf)</option>
                      <option>Meslek Lisesi (12. Sınıf Stajyeri)</option>
                      <option>Üniversite / Önlisans Stajyeri</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Okulun</label>
                    <input
                      type="text"
                      value={data.school}
                      onChange={(e) => set('school', e.target.value)}
                      placeholder="Örn. Gürsu Mesleki ve Teknik Anadolu Lisesi"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Meslek Alanın *</label>
                    <select
                      value={data.field}
                      onChange={(e) => set('field', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5] transition cursor-pointer"
                    >
                      <option value="">Seçiniz</option>
                      {MESEM_FIELDS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Beceriler — alan bazlı hazır etiketler */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-black text-[#0A1931] mb-1 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#00A8B5]" /> Beceriler
                </h2>
                <p className="text-[11px] text-slate-400 mb-3">
                  {data.field
                    ? `${data.field} alanı için önerilenler:`
                    : 'Alanını seçersen sana özel beceri önerileri çıkar.'}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggested
                    .filter((s) => !data.skills.includes(s))
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00A8B5]/10 hover:bg-[#00A8B5]/20 text-[#00A8B5] rounded-full text-[11px] font-bold transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> {s}
                      </button>
                    ))}
                </div>
                {data.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                    {data.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A1931] text-white rounded-full text-[11px] font-bold"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className="cursor-pointer hover:text-slate-300 transition"
                          title="Kaldır"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Hakkımda */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-black text-[#0A1931] mb-1">Hakkımda</h2>
                <p className="text-[11px] text-slate-400 mb-3">50-100 kelime yeterli. Örneklerden başlayabilirsin:</p>
                <div className="space-y-2 mb-3">
                  {ABOUT_EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => set('about', ex.text)}
                      className="w-full text-left flex items-start gap-2 p-2.5 bg-slate-50 hover:bg-[#00A8B5]/10 border border-slate-100 hover:border-[#00A8B5]/40 rounded-xl transition cursor-pointer group"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600 group-hover:text-slate-800">
                        <span className="font-black text-[#0A1931] block mb-0.5">{ex.label}</span>
                        {ex.text}
                      </span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={data.about}
                  onChange={(e) => set('about', e.target.value)}
                  rows={4}
                  placeholder="Kendini kısaca tanıt..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition resize-none"
                />
              </section>

              {/* Deneyim / Projeler */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black text-[#0A1931]">Deneyim / Projeler</h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00A8B5]/10 hover:bg-[#00A8B5]/20 text-[#00A8B5] rounded-full text-[11px] font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Ekle
                  </button>
                </div>
                {data.experiences.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    Okul projesi, yardımcı olduğu iş, hobi bile sayılır — küçük de olsa yaz.
                  </p>
                )}
                <div className="space-y-3">
                  {data.experiences.map((exp, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Deneyim {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeExperience(i)}
                          className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                          title="Sil"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(i, 'title', e.target.value)}
                        placeholder="Ne yaptın? (Örn. Bisiklet tamiri)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                      />
                      <input
                        type="text"
                        value={exp.place}
                        onChange={(e) => updateExperience(i, 'place', e.target.value)}
                        placeholder="Nerede / ne zaman?"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                      />
                      <textarea
                        value={exp.detail}
                        onChange={(e) => updateExperience(i, 'detail', e.target.value)}
                        rows={2}
                        placeholder="Kısa detay..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition resize-none"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Kaydet + Yazdır */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
                {saveMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                      saveMsg.type === 'ok'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-600'
                    }`}
                  >
                    {saveMsg.type === 'ok' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{saveMsg.text}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="py-3 bg-[#0A1931] hover:bg-[#132a4d] disabled:opacity-60 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Kaydediliyor...' : 'Hesabıma Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#00A8B5]/30 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Yazdır / PDF İndir
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Yazdır penceresinde "PDF olarak kaydet" seçeneğini seçebilirsin.
                </p>
              </div>
            </div>

            {/* SAĞ: Canlı CV Önizleme (yazdırma hedefi: #cv-print) */}
            <div className="lg:sticky lg:top-20">
              <div className="no-print flex items-center gap-2 mb-3 text-[11px] font-bold text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-[#00A8B5]" />
                Canlı Önizleme — bilgileri doldurdukça CV'n burada oluşur
              </div>

              <div id="cv-print" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Üst bant */}
                <div className="bg-[#0A1931] px-7 py-6 text-white">
                  <h2 className="text-xl font-black leading-snug">
                    {data.fullName.trim() || 'Ad Soyad'}
                  </h2>
                  <p className="text-[11px] font-bold text-[#00E5FF] mt-1">
                    {[data.field, data.education].filter(Boolean).join(' · ') || 'Meslek Alanı · Eğitim Durumu'}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-300">
                    {data.phone.trim() && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {data.phone}
                      </span>
                    )}
                    {data.email.trim() && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {data.email}
                      </span>
                    )}
                    {data.city.trim() && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {data.city}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-7 py-6 space-y-5">
                  {/* Eğitim */}
                  {(data.education || data.school.trim()) && (
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-[#00A8B5] flex items-center gap-1.5 mb-2">
                        <GraduationCap className="w-3.5 h-3.5" /> Eğitim
                      </h3>
                      <p className="text-xs font-bold text-slate-800">{data.education || '—'}</p>
                      {data.school.trim() && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{data.school}</p>
                      )}
                    </div>
                  )}

                  {/* Hakkımda */}
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[#00A8B5] flex items-center gap-1.5 mb-2">
                      <User className="w-3.5 h-3.5" /> Hakkımda
                    </h3>
                    {data.about.trim() ? (
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{data.about}</p>
                    ) : (
                      <p className="text-xs text-slate-300 italic">
                        Kendini kısaca tanıtan 2-3 cümle yaz (soldaki örneklerden ekleyebilirsin).
                      </p>
                    )}
                  </div>

                  {/* Beceriler */}
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-[#00A8B5] flex items-center gap-1.5 mb-2">
                      <Wrench className="w-3.5 h-3.5" /> Beceriler
                    </h3>
                    {data.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300 italic">En az 3 beceri seç.</p>
                    )}
                  </div>

                  {/* Deneyim / Projeler */}
                  {data.experiences.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-[#00A8B5] flex items-center gap-1.5 mb-2">
                        <FileText className="w-3.5 h-3.5" /> Deneyim / Projeler
                      </h3>
                      <div className="space-y-3">
                        {data.experiences.map((exp, i) => (
                          <div key={i}>
                            <p className="text-xs font-bold text-slate-800">
                              {exp.title.trim() || 'Pozisyon / Proje'}
                              {exp.place.trim() && (
                                <span className="text-slate-500 font-medium"> — {exp.place}</span>
                              )}
                            </p>
                            {exp.detail.trim() && (
                              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{exp.detail}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="no-print text-[10px] text-slate-400 mt-3 text-center">
                "Yazdır / PDF İndir" butonu yalnızca bu CV bölgesini çıktı olarak verir.
              </p>
            </div>

          </div>
        </div>
      </main>

      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Stajyeri.net &mdash; Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
