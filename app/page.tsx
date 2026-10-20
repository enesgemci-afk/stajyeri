'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, PROGRAM_TYPES, TURKEY_CITIES } from '@/lib/constants';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

import { 
  Wrench, 
  Calendar, 
  MapPin, 
  Search, 
  PlusCircle, 
  Building2, 
  Briefcase, 
  Utensils, 
  Bus, 
  Sparkles, 
  ChevronRight, 
  RotateCcw,
  Heart,
  ArrowUpDown,
} from 'lucide-react';

interface JobPost {
  id: string;
  title: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  quota?: number;
  created_at?: string;
  has_lunch?: boolean;
  has_shuttle?: boolean;
  description?: string;
  company_details?: {
    company_name?: string;
    has_master_trainer?: boolean;
  };
}

export default function HomePage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtreleme Durumları (State)
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Tarih filtresi (Kariyer.net tarzı)
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7' | '30'>('all');

  // Anahtar kelime araması (Paket 2: kariyer.net tarzı metin arama)
  const [searchQuery, setSearchQuery] = useState('');

  // Sıralama (Paket 2: en yeni / en eski)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // İlçe filtresi (Paket 3: seçilen şehre göre ilanlardan türetilir)
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Alan seçim asistanından gelen çoklu alan filtresi (/?alan=A&alan=B#ilanlar)
  const [paramFields, setParamFields] = useState<string[]>([]);

  // Favoriler (kalp) durumu
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [favBusyId, setFavBusyId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Alan seçim asistanı ?alan=A&alan=B#ilanlar ile yönlendirdiğinde filtreleri uygula
    if (typeof window !== 'undefined') {
      const fromUrl = new URLSearchParams(window.location.search)
        .getAll('alan')
        .filter((f) => MESEM_FIELDS.includes(f));
      if (fromUrl.length > 0) setParamFields(fromUrl);
    }

    async function fetchJobs() {
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          company_details (
            company_name,
            has_master_trainer
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setJobs(data as JobPost[]);
      }
      setLoading(false);
    }

    fetchJobs();
    loadFavorites();
  }, []);

  // Oturum açmış öğrencinin favori ilanlarını yükle
  async function loadFavorites() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    setIsLoggedIn(true);

    const { data: sp } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', session.user.id)
      .maybeSingle();
    if (!sp) return;
    setStudentId(sp.id);

    const { data: favs } = await supabase
      .from('favorites')
      .select('job_id')
      .eq('student_id', sp.id);
    if (favs) setFavIds(new Set((favs as { job_id: string }[]).map((f) => f.job_id)));
  }

  // Kalp butonu: favori ekle/çıkar (oturum yoksa öğrenci girişine yönlendir)
  const toggleFav = async (jobId: string) => {
    if (!isLoggedIn || !studentId) {
      window.location.href = '/ogrenci/giris';
      return;
    }
    if (favBusyId) return;
    setFavBusyId(jobId);
    try {
      if (favIds.has(jobId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('student_id', studentId)
          .eq('job_id', jobId);
        if (!error) {
          const next = new Set(favIds);
          next.delete(jobId);
          setFavIds(next);
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ job_id: jobId, student_id: studentId });
        if (!error) setFavIds(new Set(favIds).add(jobId));
      }
    } finally {
      setFavBusyId(null);
    }
  };

  // Dropdown + anahtar kelime filtreleme mantığı (Paket 2)
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase('tr-TR');
  const filteredJobs = jobs.filter((job) => {
    const matchesField = selectedField === '' || job.field_name === selectedField;
    const matchesProgram = selectedProgram === '' || job.program_type === selectedProgram;
    const matchesCity = selectedCity === '' || (job.city && job.city.toLowerCase() === selectedCity.toLowerCase());
    const ageMs = job.created_at ? Date.now() - new Date(job.created_at).getTime() : Infinity;
    const matchesDate =
      dateRange === 'all' ||
      (dateRange === 'today'
        ? ageMs <= 24 * 60 * 60 * 1000
        : ageMs <= Number(dateRange) * 24 * 60 * 60 * 1000);
    // Metin araması: pozisyon, işletme adı, açıklama, alan ve konum üzerinde
    const matchesQuery =
      normalizedQuery === '' ||
      [
        job.title,
        job.description,
        job.field_name,
        job.city,
        job.district,
        job.company_details?.company_name,
      ].some((v) => !!v && v.toLocaleLowerCase('tr-TR').includes(normalizedQuery));
    const matchesDistrict =
      selectedDistrict === '' ||
      (!!job.district && job.district.toLowerCase() === selectedDistrict.toLowerCase());
    const matchesParamFields = paramFields.length === 0 || paramFields.includes(job.field_name);
    return (
      matchesField &&
      matchesProgram &&
      matchesCity &&
      matchesDate &&
      matchesDistrict &&
      matchesParamFields &&
      matchesQuery
    );
  });

  // Sıralama (Paket 2: en yeni / en eski)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return sortBy === 'newest' ? tb - ta : ta - tb;
  });

  // İlçe listesi: seçilen şehre göre ilanlardan türetilir (Paket 3)
  const availableDistricts = Array.from(
    new Set(
      jobs
        .filter((j) =>
          selectedCity === '' ? true : (j.city ?? '').toLowerCase() === selectedCity.toLowerCase()
        )
        .map((j) => j.district)
        .filter((d): d is string => !!d)
    )
  ).sort((a, b) => a.localeCompare(b, 'tr-TR'));

  const featuredJobs = sortedJobs.slice(0, 6);

  const handleResetFilters = () => {
    setSelectedField('');
    setSelectedProgram('');
    setSelectedCity('');
    setSelectedDistrict('');
    setDateRange('all');
    setSearchQuery('');
    setParamFields([]);
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      
      {/* 1. Header — tüm sayfalarda ortak tek stil (SiteHeader) */}
      <SiteHeader
        right={
          <>
            {/* Öğrenci Girişi */}
            <Link
              href="/ogrenci/giris"
              className="text-xs font-bold text-slate-700 hover:text-[#00A8B5] px-3 py-2 rounded-lg hover:bg-slate-50 transition"
            >
              Öğrenci Girişi
            </Link>

            {/* İşveren Girişi */}
            <Link
              href="/isveren/giris"
              className="text-xs font-bold text-[#FF6B00] border border-[#FF6B00]/40 hover:bg-[#FF6B00]/5 px-3 py-2 rounded-xl transition"
            >
              İşveren Girişi
            </Link>

            {/* İlan Ver (İşveren Doğrudan Kayıt/İlan) */}
            <Link
              href="/isveren/kayit"
              className="px-4 py-2 text-xs font-black text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl transition shadow-md shadow-[#FF6B00]/20 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> İlan Ver
            </Link>
          </>
        }
      />

      {/* 2. Hero Bölümü */}
      <section className="bg-[#0A1931] text-white pt-20 pb-28 px-4 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A8B5]/15 border border-[#00A8B5]/30 text-[#00E5FF] text-[11px] font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> MESEM ve Meslek Lisesi Öğrencilerine Özel Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Geleceğin Mesleğini Sahada Öğren, <br />
            <span className="text-[#00A8B5]">Doğru Staj Yerini Keşfet</span>
          </h1>

          <p className="mt-5 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto font-normal leading-relaxed">
            3308 sayılı Meslekî Eğitim Kanunu güvencesiyle MESEM çıraklığı ve meslek lisesi stajı arayan öğrencileri onaylı işletmelerle anında eşleştiriyoruz.
          </p>

          <Link
            href="/imep"
            className="inline-flex items-center gap-1 mt-4 text-[11px] font-bold text-[#00E5FF] hover:text-white transition"
          >
            İMEP (İşletmelerde Mesleki Eğitim Programı) nedir? <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {/* 3. Standart Dropdown Arama Çubuğu (Paket 2: anahtar kelime araması eklendi) */}
          <div className="mt-10 bg-white p-3 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto text-left">

            {/* Anahtar Kelime Araması */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 mb-2">
              <Search className="w-4 h-4 text-[#00A8B5] flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pozisyon, işletme adı veya anahtar kelime ara..."
                className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none placeholder:text-slate-400 placeholder:font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Aramayı temizle"
                  className="p-1 text-slate-400 hover:text-slate-600 transition flex-shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              
              {/* Meslek Alanı — MESEM alanları (lib/constants.ts) */}
              <div className="md:col-span-3 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 flex items-center gap-3">
                <Wrench className="w-4 h-4 text-[#00A8B5] flex-shrink-0" />
                <div className="w-full">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">MESLEK ALANI (MESEM)</label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="">Tüm Meslek Alanları ({MESEM_FIELDS.length})</option>
                    {MESEM_FIELDS.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staj Modeli */}
              <div className="md:col-span-2 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#00A8B5] flex-shrink-0" />
                <div className="w-full">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">STAJ MODELİ</label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="">Tüm Programlar</option>
                    {PROGRAM_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Şehir (81 İl) */}
              <div className="md:col-span-3 px-4 py-2 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#00A8B5] flex-shrink-0" />
                <div className="w-full">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">ŞEHİR</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="">Tüm Şehirler (81 İl)</option>
                    {TURKEY_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* İlçe — seçilen şehre göre ilanlardan türetilir (Paket 3) */}
              <div className="md:col-span-2 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#00A8B5] flex-shrink-0" />
                <div className="w-full">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">İLÇE / BÖLGE</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={availableDistricts.length === 0}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    <option value="">{availableDistricts.length === 0 ? 'Önce Şehir Seçin' : 'Tüm İlçeler'}</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tarih (Kariyer.net tarzı yayın zamanı filtresi — "Bugün" dahil) */}
              <div className="md:col-span-2 px-4 py-2 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#00A8B5] flex-shrink-0" />
                <div className="w-full">
                  <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">YAYIN TARİHİ</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as 'all' | 'today' | '7' | '30')}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="all">Tüm İlanlar</option>
                    <option value="today">Bugün</option>
                    <option value="7">Son 7 Gün</option>
                    <option value="30">Son 30 Gün</option>
                  </select>
                </div>
              </div>

              {/* Arama / Sıfırla Butonları */}
              <div className="md:col-span-2 flex items-center gap-1">
                {(selectedField || selectedProgram || selectedCity || selectedDistrict || dateRange !== 'all' || searchQuery || paramFields.length > 0) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    title="Filtreleri Sıfırla"
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => document.getElementById('ilanlar')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full py-3 bg-[#00A8B5] hover:bg-[#00929e] text-white font-extrabold rounded-xl sm:rounded-full text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-[#00A8B5]/25 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" /> Staj Bul
                </button>
              </div>

            </div>
          </div>

          {/* 4. İstatistik Sayaçları */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 max-w-4xl mx-auto pt-8 border-t border-white/10">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">{MESEM_FIELDS.length}+</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Resmi Meslek Alanı</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#00E5FF]">544B+</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">MEB MESEM Öğrencisi</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#FF6B00]">{TURKEY_CITIES.length}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">İlde Staj İmkânı</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">%30-%50</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Garantili Öğrenci Ücreti</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Canlı İlanlar Bölümü */}
      <main id="ilanlar" className="max-w-6xl mx-auto px-4 py-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A1931]">
              {selectedField || selectedCity || selectedProgram || selectedDistrict || dateRange !== 'all' || searchQuery || paramFields.length > 0 ? 'Filtrelenen İlanlar' : 'Öne Çıkan İlanlar'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {filteredJobs.length} ilan bulundu; vitrinde en güncel {featuredJobs.length} tanesi listeleniyor.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Sıralama (Paket 2: kariyer.net tarzı) */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00A8B5]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                title="Sıralama"
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
              </select>
            </div>
            <Link
                href="/ilanlar"
                className="text-xs font-extrabold text-white bg-[#0A1931] hover:bg-[#00A8B5] px-3 py-2 rounded-xl transition"
              >
                Tüm İlanları Gör
              </Link>
              <Link
              href="/favorilerim"
              className="text-xs font-bold text-slate-600 hover:text-[#00A8B5] flex items-center gap-1.5 transition"
            >
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Favorilerim
            </Link>
            {(selectedField || selectedProgram || selectedCity || selectedDistrict || dateRange !== 'all' || searchQuery || paramFields.length > 0) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Filtreleri Temizle
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-40"></div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">Seçtiğiniz kriterlere uygun ilan bulunamadı.</p>
            <p className="text-xs text-slate-400 mt-1">Farklı bir meslek alanı veya şehir seçerek tekrar deneyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#00A8B5] transition-all flex flex-col justify-between gap-5 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#00A8B5]/10 text-[#00A8B5] text-[11px] font-extrabold rounded-full">
                        {job.program_type === 'MESEM_4_1' ? 'MESEM (4 Gün İşletme)' : job.program_type}
                      </span>
                      {job.created_at &&
                        Date.now() - new Date(job.created_at).getTime() < 3 * 24 * 60 * 60 * 1000 && (
                          <span className="px-2 py-1 bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-black rounded-full">
                            YENİ
                          </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[11px] font-bold text-slate-400">
                        Kontenjan: <strong className="text-slate-700">{job.quota || 1}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFav(job.id)}
                        disabled={favBusyId === job.id}
                        title={favIds.has(job.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                        className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 ${
                          favIds.has(job.id)
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favIds.has(job.id) ? 'fill-red-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#0A1931] group-hover:text-[#00A8B5] transition line-clamp-1">
                    {job.title}
                  </h3>

                  <p className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {job.company_details?.company_name || 'Onaylı İşletme'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Briefcase className="w-3.5 h-3.5 text-[#00A8B5]" /> {job.field_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.city} / {job.district}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                    {job.has_lunch && (
                      <span className="flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-[#FF6B00]" /> Yemek
                      </span>
                    )}
                    {job.has_shuttle && (
                      <span className="flex items-center gap-1">
                        <Bus className="w-3 h-3 text-[#00A8B5]" /> Servis
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/ilan/${job.id}`}
                    className="px-4 py-2 bg-[#0A1931] hover:bg-[#FF6B00] text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    Başvur <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="Stajyeri.net" 
              style={{ height: '32px', width: 'auto', display: 'block' }}
              className="mx-auto sm:mx-0 opacity-90 hover:opacity-100 transition cursor-pointer" 
            />
          </Link>
          <p className="text-slate-400">&copy; 2026 Tüm Hakları Saklıdır.</p>
        </div>
      </footer>

    </div>
  );
}