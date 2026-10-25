'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { supabase } from '@/lib/supabaseClient';
import {
  simulateIncentives,
  INTERN_TYPE_META,
  GROSS_MIN_WAGE,
  WAGE_YEAR,
  type InternType,
} from '@/lib/incentiveEngine';
import {
  Sparkles,
  Users,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  Clock,
  Calendar,
  ArrowRight,
  Phone,
  User,
  Send,
  AlertCircle,
} from 'lucide-react';

const INTERN_TYPES = Object.keys(INTERN_TYPE_META) as InternType[];
const fmt = (n: number) => n.toLocaleString('tr-TR');

export default function TesvikSimulasyonPage() {
  const [internType, setInternType] = useState<InternType>('cirak');
  const [employeeCount, setEmployeeCount] = useState(10);
  const [inOsb, setInOsb] = useState(true);
  const [extraWagePct, setExtraWagePct] = useState(30);

  const result = useMemo(
    () => simulateIncentives({ internType, employeeCount, inOsb, extraWagePct }),
    [internType, employeeCount, inOsb, extraWagePct],
  );

  // Lead formu — "Ücretsiz İMEP danışmanlığı" (girişsiz işveren de bırakabilir)
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [leadMsg, setLeadMsg] = useState('');

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim() || !phone.trim()) {
      setLeadState('err');
      setLeadMsg('Lütfen ad soyad ve telefon alanlarını doldurun.');
      return;
    }
    setLeadState('sending');
    setLeadMsg('');
    try {
      const { error } = await supabase.from('simulator_leads').insert({
        company_name: companyName.trim() || null,
        contact_name: contactName.trim(),
        phone: phone.trim(),
        employee_count: employeeCount,
        intern_type: internType,
        in_osb: inOsb,
        estimated_support: `Aylık ${fmt(result.imepSupport)} TL/öğrenci · yıllık en fazla ${fmt(result.yearlySupportMax)} TL`,
      });
      if (error) throw new Error(error.message);
      setLeadState('ok');
    } catch (err: unknown) {
      setLeadState('err');
      setLeadMsg(err instanceof Error ? err.message : 'Gönderim sırasında bir sorun oluştu.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <SiteHeader />
      <main className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] text-[11px] font-black mb-4">
              <Sparkles className="w-3.5 h-3.5" /> İŞVEREN ARACI — 3308 / İMEP
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A1931]">
              Akıllı Stajyer Teşvik ve Maliyet Simülatörü
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
              Stajyer alırsanız devletten ne kadar İMEP desteği alacağınızı ve size ne kadara mal
              olacağını saniyeler içinde görün. {WAGE_YEAR} brüt asgari ücret ({fmt(GROSS_MIN_WAGE)} TL) baz alınmıştır.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* SOL: Girdiler */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-sm font-black text-[#0A1931]">1. Stajyer türünüzü seçin</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {INTERN_TYPES.map((t) => {
                    const meta = INTERN_TYPE_META[t];
                    const selected = internType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setInternType(t)}
                        className={`text-left p-3 rounded-xl border transition cursor-pointer ${
                          selected
                            ? 'border-[#00A8B5] bg-[#00A8B5]/5 ring-1 ring-[#00A8B5]/30'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className={`block text-[11px] font-black ${selected ? 'text-[#00A8B5]' : 'text-[#0A1931]'}`}>
                          {meta.label}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-1 leading-snug">{meta.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-black text-[#0A1931]">2. Toplam çalışan sayınız</h2>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                  className="mt-3 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0A1931] focus:outline-none focus:border-[#00A8B5]"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Mevzuat gereği çalışan sayınızın %5–%10’u kadar MESEM öğrencisi alabilirsiniz.
                </p>
              </div>

              <div>
                <h2 className="text-sm font-black text-[#0A1931]">3. İşletmeniz OSB içinde mi?</h2>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setInOsb(true)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                      inOsb
                        ? 'border-[#00A8B5] bg-[#00A8B5]/5 text-[#00A8B5]'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> OSB içindeyim
                  </button>
                  <button
                    type="button"
                    onClick={() => setInOsb(false)}
                    className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                      !inOsb
                        ? 'border-[#00A8B5] bg-[#00A8B5]/5 text-[#00A8B5]'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    Değilim
                  </button>
                </div>
              </div>

              {(internType === 'mtal' || internType === 'summer') && (
                <div>
                  <h2 className="text-sm font-black text-[#0A1931]">4. Ödemek istediğiniz ücret (opsiyonel)</h2>
                  <p className="text-[11px] font-bold text-[#00A8B5] mt-2">
                    Asgari ücretin %{extraWagePct}’i — {fmt(Math.round((GROSS_MIN_WAGE * extraWagePct) / 100))} TL/ay
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={extraWagePct}
                    onChange={(e) => setExtraWagePct(Number(e.target.value))}
                    className="w-full mt-2 accent-[#00A8B5] cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Bu staj türlerinde ücret zorunlu değildir; 0’da bırakırsanız hiç ücret ödemezsiniz.
                  </p>
                </div>
              )}
            </div>
            {/* SAĞ: Sonuçlar */}
            <div className="lg:col-span-3 space-y-4">
              {/* Sıfır-maliyet şok kartı */}
              <div className="bg-[#0A1931] rounded-3xl p-6 sm:p-8 text-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Öğrenci başına aylık net maliyetiniz
                </p>
                <div className="flex items-end gap-3 mt-2 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-black text-[#00E5FF] leading-none">
                    {fmt(result.employerCost)} TL
                  </span>
                  {result.wagePerIntern > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold text-slate-200 mb-1">
                      ücretin %{result.employerCostPct}’i
                    </span>
                  )}
                </div>
                {result.wagePerIntern === 0 ? (
                  <p className="mt-4 flex items-center gap-2 text-[12px] font-black text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Bu staj türünde ücret zorunlu değil — hiç ücret ödemeden de stajyer alabilirsiniz.
                  </p>
                ) : result.employerCost === 0 ? (
                  <p className="mt-4 flex items-center gap-2 text-[12px] font-black text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    SIFIR MALİYET — öğrenci ücretini İMEP desteği tamamen karşılıyor.
                  </p>
                ) : (
                  <p className="mt-4 flex items-center gap-2 text-[12px] font-black text-[#FF6B00]">
                    <Lightbulb className="w-4 h-4 flex-shrink-0" />
                    İMEP desteği, maliyetinizi ücretin yalnızca %{result.employerCostPct}’ine indiriyor.
                  </p>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px] text-slate-300">
                  <span>
                    Öğrenciye ödenecek brüt ücret: <b className="text-white">{fmt(result.wagePerIntern)} TL</b>
                  </span>
                  <span>
                    İMEP’ten karşılanan: <b className="text-[#00E5FF]">{fmt(result.imepSupport)} TL</b>
                  </span>
                </div>
              </div>

              {/* Mini istatistikler */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                    <Users className="w-3 h-3" /> Kontenjanınız
                  </p>
                  <p className="text-lg font-black text-[#0A1931] mt-1">{result.quotaMin}–{result.quotaMax}</p>
                  <p className="text-[10px] text-slate-400">öğrenci alabilirsiniz</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                    <ShieldCheck className="w-3 h-3" /> SGK Priminiz
                  </p>
                  <p className="text-lg font-black text-emerald-600 mt-1">{result.sgkCovered ? '0 TL' : '—'}</p>
                  <p className="text-[10px] text-slate-400">devletçe karşılanıyor</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                    <Sparkles className="w-3 h-3" /> Aylık toplam destek
                  </p>
                  <p className="text-lg font-black text-[#00A8B5] mt-1">{fmt(result.monthlySupportMax)} TL</p>
                  <p className="text-[10px] text-slate-400">tüm kontenjan dolarsa</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                    <Calendar className="w-3 h-3" /> Yıllık toplam
                  </p>
                  <p className="text-lg font-black text-[#0A1931] mt-1">{fmt(result.yearlySupportMax)} TL</p>
                  <p className="text-[10px] text-slate-400">12 ay × maks. kontenjan</p>
                </div>
              </div>

              {/* Ayrıntı notları */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-xs font-black text-[#0A1931] mb-3">Hesaplamanın ayrıntıları</h3>
                <ul className="space-y-2">
                  {result.notes.map((n, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                      <Lightbulb className="w-3.5 h-3.5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA bandı + Ücretsiz İMEP danışmanlığı formu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-gradient-to-r from-[#0A1931] to-[#00A8B5] rounded-3xl p-6 sm:p-8 flex flex-col justify-center min-h-[220px]">
              <h3 className="text-lg font-black text-white leading-snug">
                Stajyeriniz size{' '}
                <span className="text-[#FF6B00]">{result.employerCost === 0 ? 'SIFIR' : `%${result.employerCostPct}`}</span>{' '}
                maliyetle geliyor.
              </h3>
              <p className="text-[11px] text-white/75 mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                İMEP kontenjanları dönem başlarında hızla dolar — ilanınızı bugün yayınlayın, öğrenciler bu hafta başvursun.
              </p>
              <Link
                href="/ilan-ver"
                className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl text-sm font-black transition cursor-pointer w-fit"
              >
                Ücretsiz İlan Ver <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-sm font-black text-[#0A1931] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00A8B5]" /> Ücretsiz İMEP danışmanlığı isteyin
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Hesabınızı uzmanımız teyit etsin; 1 iş günü içinde sizi arayalım. Ücretsizdir, taahhüt yoktur.
              </p>

              {leadState === 'ok' ? (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-[12px] font-bold text-emerald-700">
                    Talebiniz alındı! İMEP danışmanımız en kısa sürede sizi arayacak.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitLead} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">İşletme adı (opsiyonel)</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Örn: Eren Otomotiv Ltd. Şti."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> Ad Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> Telefon *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={leadState === 'sending'}
                    className="w-full py-3 bg-[#0A1931] hover:bg-[#13294b] text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {leadState === 'sending' ? 'Gönderiliyor…' : 'Beni Arayın — Ücretsiz'}
                  </button>
                  {leadState === 'err' && leadMsg && (
                    <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {leadMsg}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Bilgileriniz yalnızca danışmanlık talebiniz için kullanılır, KVKK kapsamında korunur.
                  </p>
                </form>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-8 max-w-2xl mx-auto leading-relaxed">
            Bu hesaplama {WAGE_YEAR} yılı brüt asgari ücreti ({fmt(GROSS_MIN_WAGE)} TL) baz alarak
            bilgilendirme amaçlı yapılmıştır; kesin tutarlar için MEB mesleki eğitim biriminizden ve
            SGK’dan teyit alınız.
          </p>
        </div>
      </main>
    </div>
  );
}