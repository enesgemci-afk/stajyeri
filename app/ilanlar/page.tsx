'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, TURKEY_CITIES, PROGRAM_TYPES } from '@/lib/constants';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import JobCard from '@/components/JobCard';
import {
  Search,
  Wrench,
  MapPin,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  Building2,
  Bell,
  Heart,
  Briefcase,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import JobRowCard from '@/components/JobRowCard';

interface JobPost {
  id: string;
  title: string;
  field_name: string;
  program_type: string;
  city: string;
  district: string;
  quota?: number | null;
  has_lunch?: boolean;
  has_shuttle?: boolean;
  created_at?: string;
  company_details?: {
    company_name?: string;
    logo_url?: string | null;
    logo_color?: string | null;
  } | null;
}

type DateRange = 'today' | '7' | '30' | 'all';

const DATE_LABELS: Record<DateRange, string> = {
  today: 'Bugün',
  '7': 'Son 7 Gün',
  '30': 'Son 30 Gün',
  all: 'Tüm İlanlar',
};

/** Kariyer.net tarzı akordeon filtre bölümü (sol sidebar) */
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-3.5 border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 text-[11px] font-black text-[#0A1931] uppercase tracking-wide cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5] rounded"
      >
        {title}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function IlanlarPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPost[]>([]);

  // Favoriler
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [favBusyId, setFavBusyId] = useState<string | null>(null);

  // Filtreler (alan çoklu seçilebilir — Alan Seçim Asistanı ?alan=A&alan=B gönderir)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    // Alan Seçim Asistanı yönlendirmesi: /ilanlar?alan=A&alan=B
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const alanlar = params.getAll('alan').filter(Boolean);
      if (alanlar.length > 0) setSelectedFields(alanlar);
    }

    // 1. Aktif ilanlar (logo + renk dahil)
    const { data } = await supabase
      .from('job_posts')
      .select(
        `id, title, field_name, program_type, city, district, quota, has_lunch, has_shuttle,
         wage_info, created_at,
         company_details ( company_name, logo_url, logo_color )`
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) setJobs(data as unknown as JobPost[]);
    setLoading(false);

    // 2. Oturum açmış öğrencinin favorileri (sessiz — tablo yoksa boş kalır)
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

  // Kalp butonu: favori ekle/çıkar
  const toggleFav = async (jobId: string) => {
    if (!isLoggedIn || !studentId) {
      router.push('/ogrenci/giris');
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

  // Seçilen şehirde geçen ilanlardan ilçe listesi türet
  const districts = Array.from(
    new Set(
      jobs
        .filter((j) => j.city && j.city.toLowerCase() === selectedCity.toLowerCase() && j.district)
        .map((j) => j.district)
    )
  ).sort((a, b) => a.localeCompare(b, 'tr'));

  const filteredJobs = jobs.filter((job) => {
    const matchesField = selectedFields.length === 0 || selectedFields.includes(job.field_name);
    const matchesProgram = selectedProgram === '' || job.program_type === selectedProgram;
    const matchesCity = selectedCity === '' || (job.city && job.city.toLowerCase() === selectedCity.toLowerCase());
    const matchesDistrict = selectedDistrict === '' || job.district === selectedDistrict;
    const matchesDate =
      dateRange === 'all' ||
      (job.created_at &&
        (dateRange === 'today'
          ? new Date(job.created_at).toDateString() === new Date().toDateString()
          : Date.now() - new Date(job.created_at).getTime() <= Number(dateRange) * 24 * 60 * 60 * 1000));
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    const matchesQuery =
      q === '' ||
      [
        job.title,
        job.field_name,
        job.city,
        job.district,
        job.company_details?.company_name,
      ].some((v) => !!v && v.toLocaleLowerCase('tr-TR').includes(q));
    return matchesField && matchesProgram && matchesCity && matchesDistrict && matchesDate && matchesQuery;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return sortBy === 'newest' ? tb - ta : ta - tb;
  });

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedFields.length > 0 ||
    selectedProgram !== '' ||
    selectedCity !== '' ||
    selectedDistrict !== '' ||
    dateRange !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFields([]);
    setSelectedProgram('');
    setSelectedCity('');
    setSelectedDistrict('');
    setDateRange('all');
  };

  const toggleField = (f: string) => {
    setSelectedFields((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        {/* Başlık */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A8B5]/10 border border-[#00A8B5]/20 text-[#00A8B5] text-[10px] font-black mb-2">
            <Briefcase className="w-3 h-3" /> CANLI İLAN AKIŞI
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0A1931]">Staj & Çıraklık İlanları</h1>
              <p className="text-xs text-slate-500 mt-1">
                {loading ? 'İlanlar yükleniyor...' : `${sortedJobs.length} aktif ilan listeleniyor.`}
              </p>
            </div>
            {/* Mobil filtre toggle — kariyer.net deseni */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0A1931] text-white text-xs font-black shadow-lg shadow-[#0A1931]/20 transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8B5]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtrele
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />}
            </button>
          </div>
        </div>

        {/* Filtre kartı — clay (mobilde açılır panel, desktop'ta sidebar var) */}
        <div className={`bg-white rounded-[1.75rem] shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-4 sm:p-5 mb-8 ${mobileFiltersOpen ? 'block' : 'hidden'} lg:hidden`}>
          {/* Anahtar kelime */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 mb-4">
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

          {/* Meslek alanları (çoklu seçim çipleri) */}
          <div className="mb-4">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-[#00A8B5]" /> Meslek Alanları
              {selectedFields.length > 0 && (
                <span className="text-[#00A8B5]">({selectedFields.length} seçili)</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {MESEM_FIELDS.map((f) => {
                const active = selectedFields.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleField(f)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                      active
                        ? 'bg-[#00A8B5] border-[#00A8B5] text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-[#00A8B5] hover:text-[#00A8B5]'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dropdown filtreler */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <Briefcase className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="">Tüm Modeller</option>
                {PROGRAM_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict('');
                }}
                className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="">Tüm Şehirler</option>
                {TURKEY_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <Building2 className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedCity}
                className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Tüm İlçeler</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {(Object.keys(DATE_LABELS) as DateRange[]).map((k) => (
                  <option key={k} value={k}>{DATE_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:items-start">
          {/* SOL SIDEBAR — kariyer.net filtre akordeonu (desktop) */}
          <aside className="hidden lg:block lg:sticky lg:top-20">
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] p-5">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <p className="text-xs font-black text-[#0A1931] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00A8B5]" /> Filtreler
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[10px] font-black text-[#FF6B00] hover:underline cursor-pointer"
                >
                  Temizle
                </button>
              )}
            </div>

            <FilterSection title="Anahtar Kelime">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                <Search className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ara..."
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
            </FilterSection>

            <FilterSection title={`Meslek Alanı${selectedFields.length ? ` (${selectedFields.length})` : ''}`}>
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
                {MESEM_FIELDS.map((f) => {
                  const active = selectedFields.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleField(f)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                        active
                          ? 'bg-[#00A8B5] border-[#00A8B5] text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-[#00A8B5] hover:text-[#00A8B5]'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Konum">
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedDistrict('');
                    }}
                    className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="">Tüm Şehirler</option>
                    {TURKEY_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <Building2 className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedCity}
                    className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Tüm İlçeler</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Program">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                <Briefcase className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" />
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="">Tüm Modeller</option>
                  {PROGRAM_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </FilterSection>

            <FilterSection title="Yayın Tarihi">
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(DATE_LABELS) as DateRange[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setDateRange(k)}
                    className={`px-2.5 py-2 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                      dateRange === k
                        ? 'bg-[#00A8B5] border-[#00A8B5] text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-[#00A8B5] hover:text-[#00A8B5]'
                    }`}
                  >
                    {DATE_LABELS[k]}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* SAĞ: sonuçlar — kariyer.net satır listesi */}
        <div className="min-w-0">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
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
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Sonuçlar — kariyer.net satır listesi */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.05)] animate-pulse h-28"></div>
            ))}
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-[0_10px_40px_rgba(10,25,49,0.07)] text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">Seçtiğiniz kriterlere uygun ilan bulunamadı.</p>
            <p className="text-xs text-slate-400 mt-1">
              Farklı bir meslek alanı veya şehir seçerek tekrar deneyebilirsiniz.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-[#0A1931] hover:bg-[#00A8B5] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedJobs.map((job) => (
              <JobRowCard
                key={job.id}
                job={job}
                isFav={isLoggedIn && favIds.has(job.id)}
                favBusy={favBusyId === job.id}
                onToggleFav={toggleFav}
              />
            ))}
          </div>
        )}
          </div>
        </div>
      </main>

      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
