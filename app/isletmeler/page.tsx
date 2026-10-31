import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import SiteHeader from '@/components/SiteHeader';
import { CompanyAvatar } from '@/components/JobCard';

export const metadata: Metadata = {
  title: 'İşletmeler Rehberi — Stajyer Alan İşletmeler | Stajyeri.net',
  description:
    'MESEM ve meslek lisesi öğrencilerini stajyer alan işletmeleri keşfedin: aktif ilan sayıları, konumlar ve stajyer değerlendirmelerine dayalı Güvenli İşyeri rozetleri.',
  alternates: { canonical: '/isletmeler' },
};

interface CompanyRow {
  id: string;
  company_name: string | null;
  city: string | null;
  district: string | null;
  logo_url: string | null;
  logo_color: string | null;
}

interface JobMini {
  id: string;
  title: string;
  company_id: string;
}

interface TrustRow {
  company_id: string;
  trust_score: number;
  rating_count: number;
  badge: string;
}

const BADGE_STYLE: Record<string, string> = {
  gold: 'bg-amber-50 text-amber-700 border-amber-300',
  silver: 'bg-slate-100 text-slate-600 border-slate-300',
  bronze: 'bg-orange-50 text-orange-700 border-orange-300',
};
const BADGE_LABEL: Record<string, string> = { gold: '🏆 Altın', silver: '🥈 Gümüş', bronze: '🥉 Bronz' };

export default async function IsletmelerPage() {
  const [coRes, jobRes, trustRes] = await Promise.all([
    supabase
      .from('company_details')
      .select('id, company_name, city, district, logo_url, logo_color')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('job_posts')
      .select('id, title, company_id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase.rpc('get_company_trust_scores'),
  ]);

  const companies = (coRes.data ?? []) as unknown as CompanyRow[];
  const jobs = (jobRes.data ?? []) as unknown as JobMini[];
  const trustRows = ((trustRes.data ?? []) as unknown as TrustRow[]) ?? [];
  const trustMap = new Map(trustRows.map((t) => [t.company_id, t]));

  const activeJobsByCompany = new Map<string, JobMini[]>();
  for (const j of jobs) {
    const list = activeJobsByCompany.get(j.company_id) ?? [];
    list.push(j);
    activeJobsByCompany.set(j.company_id, list);
  }

  const cards = companies
    .map((c) => ({
      company: c,
      active: activeJobsByCompany.get(c.id) ?? [],
      trust: trustMap.get(c.id) ?? null,
    }))
    .sort((a, b) => b.active.length - a.active.length);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <section className="bg-gradient-to-br from-[#0A1931] via-[#0D2244] to-[#0A1931] text-white rounded-3xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold mb-4">
            🏢 İŞLETMELER REHBERİ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Stajyer Alan İşletmeler</h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {cards.length} işletme stajyer arıyor. Stajyer değerlendirmelerinden hesaplanan Güvenli İşyeri rozetleriyle güvenle seçim yapın, aktif ilanlara tek tıkla ulaşın.
          </p>
        </section>

        {cards.length === 0 ? (
          <div className="mt-6 bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <p className="text-sm font-black text-[#0A1931]">Henüz kayıtlı işletme yok</p>
            <p className="text-xs text-slate-500 mt-2">İşletmeniz stajyer aramaya başladıysa ilk ilanı siz verin.</p>
            <Link
              href="/ilan-ver"
              className="inline-block mt-5 px-6 py-3 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition"
            >
              Ücretsiz İlan Ver
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ company: c, active, trust }) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col hover:border-[#00A8B5] transition"
              >
                <div className="flex items-center gap-3">
                  <CompanyAvatar
                    job={{
                      id: c.id,
                      title: '',
                      field_name: '',
                      program_type: '',
                      city: c.city ?? '',
                      district: c.district ?? '',
                      company_details: {
                        company_name: c.company_name ?? undefined,
                        logo_url: c.logo_url,
                        logo_color: c.logo_color,
                      },
                    }}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#0A1931] truncate">{c.company_name || 'İşletme'}</p>
                    <p className="text-[11px] text-slate-500">
                      {[c.district, c.city].filter(Boolean).join(', ') || 'Konum belirtilmedi'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      active.length > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    {active.length > 0 ? `${active.length} aktif ilan` : 'Aktif ilan yok'}
                  </span>
                  {trust && trust.badge !== 'none' && (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${BADGE_STYLE[trust.badge] ?? ''}`}>
                      {BADGE_LABEL[trust.badge] ?? 'Güvenli İşyeri'}
                    </span>
                  )}
                  {trust && trust.badge === 'none' && trust.rating_count > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black border bg-slate-50 text-slate-500 border-slate-200">
                      ⭐ {Number(trust.trust_score).toFixed(1)} ({trust.rating_count} değerlendirme)
                    </span>
                  )}
                </div>

                {active.length > 0 ? (
                  <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                    {active.slice(0, 3).map((j) => (
                      <Link
                        key={j.id}
                        href={`/ilan/${j.id}`}
                        className="block text-[11px] font-bold text-[#0A1931] hover:text-[#00A8B5] transition truncate"
                      >
                        › {j.title}
                      </Link>
                    ))}
                    {active.length > 3 && <p className="text-[10px] text-slate-400">+{active.length - 3} ilan daha</p>}
                  </div>
                ) : (
                  <div className="mt-auto border-t border-slate-100 pt-3">
                    <p className="text-[10px] text-slate-400">Bu işletmenin şu anda aktif ilanı bulunmuyor.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
