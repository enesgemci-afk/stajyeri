'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { 
  Calculator, 
  ShieldCheck, 
   
  AlertCircle
} from 'lucide-react';

export default function TesvikRehberiPage() {
  const [studentType, setStudentType] = useState<'cirak_9_11' | 'kalfa_12' | 'mtal_12'>('cirak_9_11');
  const [employeeCount, setEmployeeCount] = useState<number>(15);
  const [studentCount, setStudentCount] = useState<number>(2);

  // 2026 yılı net asgari ücreti (brüt 33.030 TL / net 28.075 TL)
  const netMinWage = 28075;

  let baseSalary = 0;
  let govContributionPerStudent = 0;

  if (studentType === 'cirak_9_11') {
    baseSalary = netMinWage * 0.30;
    govContributionPerStudent = employeeCount < 20 ? (baseSalary * 2) / 3 : (baseSalary * 1) / 3;
  } else if (studentType === 'kalfa_12') {
    baseSalary = netMinWage * 0.50;
    govContributionPerStudent = employeeCount < 20 ? (baseSalary * 2) / 3 : (baseSalary * 1) / 3;
  } else {
    baseSalary = netMinWage * 0.30;
    govContributionPerStudent = employeeCount < 20 ? (baseSalary * 2) / 3 : (baseSalary * 1) / 3;
  }

  const totalSalary = baseSalary * studentCount;
  const totalGovContribution = govContributionPerStudent * studentCount;
  const netEmployerCost = totalSalary - totalGovContribution;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      
      {/* Üst Bar — ortak SiteHeader */}
      <SiteHeader />

      {/* Hero Alanı */}
      <section className="bg-[#0A1931] text-white pt-12 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8B5]/20 text-[#00E5FF] text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4" /> 3308 Sayılı Kanun Kapsamında
          </span>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight">
            İşletme Teşvik & Maaş Hesaplama Rehberi
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            MESEM çırak ve stajyer istihdamında devlet katkısı, SGK muafiyeti ve işletmenize net maliyet avantajlarını anında hesaplayın.
          </p>
        </div>
      </section>

      {/* Ana Hesaplama Bölümü */}
      <main className="max-w-5xl mx-auto px-4 -mt-8 mb-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-black text-[#0A1931] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#00A8B5]" /> Hesaplama Parametreleri
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Hesaplamalar <strong className="text-slate-600">2026 yılı net asgari ücreti (28.075 TL)</strong> esas alınır.
              MESEM çırak ve meslek lisesi 12. sınıf stajyerlerine net asgari ücretin en az %30'u, MESEM kalfa
              (12. sınıf) öğrencisine en az %50'si ödenir (3308 sayılı Kanun).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Öğrenci Kademesi / Program</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStudentType('cirak_9_11')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                    studentType === 'cirak_9_11'
                      ? 'border-[#00A8B5] bg-[#00A8B5]/10 text-[#00A8B5]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-extrabold">MESEM Çırak</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">9, 10, 11. Sınıf (%30)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentType('kalfa_12')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                    studentType === 'kalfa_12'
                      ? 'border-[#00A8B5] bg-[#00A8B5]/10 text-[#00A8B5]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-extrabold">MESEM Kalfa</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">12. Sınıf (%50)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentType('mtal_12')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                    studentType === 'mtal_12'
                      ? 'border-[#00A8B5] bg-[#00A8B5]/10 text-[#00A8B5]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-extrabold">Meslek Lisesi</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">12. Sınıf Stajyeri (%30)</p>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">İşletmedeki Mevcut Personel Sayısı</label>
                <span className="text-xs font-extrabold text-[#00A8B5]">{employeeCount} Kişi</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Number(e.target.value))}
                className="w-full accent-[#00A8B5] cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {employeeCount < 20 ? '✨ 20 personelden az olduğu için 2/3 oranında devlet katkısı hakkı vardır.' : '20 ve üzeri personel için 1/3 oranında devlet katkısı uygulanır.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İstihdam Edilecek Öğrenci/Çırak Sayısı</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStudentCount(Math.max(1, studentCount - 1))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700 text-sm"
                >
                  -
                </button>
                <span className="text-base font-black text-[#0A1931] w-12 text-center">{studentCount}</span>
                <button
                  type="button"
                  onClick={() => setStudentCount(studentCount + 1)}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700 text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">SGK Primi MEB Tarafından Ödenir</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Öğrencilerin İş Kazası ve Meslek Hastalığı primleri tamamen Milli Eğitim Bakanlığı bütçesinden karşılanır; işletmeye SGK yükü yansımaz.
                </p>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0A1931] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10 space-y-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Aylık Maliyet Tablosu</h3>

              <div className="space-y-3 border-b border-white/10 pb-5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Öğrenci Başına Taban Ücret:</span>
                  <span className="font-bold text-white">{baseSalary.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Devlet Katkısı (Öğrenci Başı):</span>
                  <span className="font-bold text-[#00E5FF]">+ {govContributionPerStudent.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>SGK Primi Maliyeti:</span>
                  <span className="font-bold text-green-400">0 TL (MEB Karşılar)</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Toplam Devlet Desteği ({studentCount} Öğrenci):</span>
                  <span className="font-bold text-[#00E5FF]">{totalGovContribution.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL</span>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-3">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">İşletmeye Kalan Net Maliyet</p>
                  <p className="text-3xl font-black text-[#FF6B00] mt-1">
                    {netEmployerCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} <span className="text-lg">TL / ay</span>
                  </p>
                </div>
              </div>

              <Link
                href="/ilan-ver"
                className="w-full py-3.5 bg-[#00A8B5] hover:bg-[#008e9a] text-white font-black rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#00A8B5]/30 text-center"
              >
                Hemen Ücretsiz İlan Yayınla
              </Link>
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <Link href="/">
          <img src="/logo.png" alt="Stajyeri.net" className="h-6 w-auto object-contain mx-auto mb-2 opacity-80" />
        </Link>
        stajyeri.net &bull; 3308 Sayılı Kanun Uyumlu MESEM Platformu
      </footer>
    </div>
  );
}