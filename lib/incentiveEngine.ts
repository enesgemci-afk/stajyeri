// ============================================================
// 3308 / İMEP Teşvik ve Maliyet Motoru (B2B Simülatör)
//
// Mevzuat temeli:
//  - 4857/3308 MD20: Çırak ücreti asgari ücretin %30'undan (işyerinde
//    eğitilenler için %50 - kalfa), az olamaz.
//  - İMEP (İşletmelerde Mesleki Eğitim Programı): çırak öğrenci başına
//    aylık brüt asgari ücretin %30'u kadar işletmeye destek ödemesi;
//    SGK primleri Hazine tarafından karşılanır.
//  - Mesleki Eğitim Yönetmeliği MD 17/E: işletme çalışan sayısının
//    en az %5'i, en fazla %10'u kadar MESEM öğrencisi alınabilir.
// Sabitler yıllık güncellenmelidir (asgari ücret zamları).
// ============================================================

// 2025 brüt asgari ücret (TL/ay)
export const GROSS_MIN_WAGE = 22_104;
export const WAGE_YEAR = 2025;

export type InternType = 'cirak' | 'kalfa' | 'mtal' | 'summer';

export const INTERN_TYPE_META: Record<
  InternType,
  { label: string; desc: string }
> = {
  cirak: {
    label: 'MESEM Çırağı (4+1 modeli)',
    desc: '3308 kapsamında çıraklık sözleşmeli öğrenci. Ücret asgari ücretin %30’u; İMEP desteği tamamen karşılar.',
  },
  kalfa: {
    label: 'MESEM Kalfası',
    desc: 'Kalfalık dönemi öğrencisi. Ücret asgari ücretin %50’si; %30’u İMEP’ten, %20’si işverenden.',
  },
  mtal: {
    label: 'MTAL 12. Sınıf Stajyeri',
    desc: 'Meslek lisesi 3 gün staj modeli. Ücret zorunlu değil (önerilir); SGK primi devletçe karşılanır.',
  },
  summer: {
    label: 'Yaz Stajı / Beceri Eğitimi',
    desc: 'Okul sigortalı yaz stajı. Ücret tamamen isteğe bağlı; SGK primi devletçe karşılanır.',
  },
};

export interface SimInput {
  internType: InternType;
  employeeCount: number;
  inOsb: boolean;
  /** İşverenin asgari üzerinde ödemek istediği oran (0-100). MTAL/yaz için opsiyonel ücret. */
  extraWagePct?: number;
}

export interface SimResult {
  /** Öğrenci başına aylık brüt ücret (TL) */
  wagePerIntern: number;
  /** Devletten aylık destek (İMEP) — öğrenci başına (TL) */
  imepSupport: number;
  /** İşverene kalan aylık net maliyet — öğrenci başına (TL) */
  employerCost: number;
  /** İşveren maliyetinin ücrete oranı (%) */
  employerCostPct: number;
  /** SGK primi devletçe karşılanıyor mu */
  sgkCovered: boolean;
  /** Alınabilecek öğrenci alt/üst sınırı */
  quotaMin: number;
  quotaMax: number;
  /** Önerilen öğrenci sayısı kadar toplam aylık devlet desteği */
  monthlySupportMax: number;
  /** Yıllık toplam devnet desteği (12 ay) */
  yearlySupportMax: number;
  /** Güncel maliyet-decompozisyon notları */
  notes: string[];
}

/** Kural motoru: girdiyi 3308/İMEP tablolarına göre hesaplar. */
export function simulateIncentives(input: SimInput): SimResult {
  const employees = Math.max(1, Math.floor(input.employeeCount || 1));
  const extra = Math.min(100, Math.max(0, input.extraWagePct ?? 0));

  // Çalışan sayısının %5 - %10’u arası öğrenci (Mesleki Eğitim Yönetmeliği 17/E)
  const quotaMin = Math.max(1, Math.floor(employees * 0.05));
  const quotaMax = Math.max(quotaMin, Math.floor(employees * 0.1));

  let wagePct = 0;        // asgari ücretin yüzde olarak ücreti
  let imepPct = 0;        // İMEP desteği (asgari ücretin %'si)
  let sgkCovered = true;
  let notes: string[] = [];

  switch (input.internType) {
    case 'cirak':
      wagePct = 30;
      imepPct = 30;
      notes.push(
        'Çırak ücreti (asgari ücretin %30’u) İMEP desteğiyle birebir karşılanır — işverene aylık maliyeti 0 TL.',
        'SGK prim, iş kazası ve meslek hastalığı primleri Hazine tarafından ödenir.'
      );
      break;
    case 'kalfa':
      wagePct = 50;
      imepPct = 30;
      notes.push(
        'Kalfa ücretinin %30’u İMEP’den karşılanır; kalan %20’lik kısım işverene aittir.',
        'SGK primleri devletçe karşılanır.'
      );
      break;
    case 'mtal':
      wagePct = extra; // ücret zorunlu değil; öderse asgari üzerinden yüzde belirler
      imepPct = 0;
      notes.push(
        'MTAL stajında ücret ödenmesi zorunlu değildir; öderseniz siz belirlersiniz.',
        'Öğrencünün SGK primi Mesleki ve Teknik Eğitimden Sorumlu Müsteşarlık bütçesinden karşılanır.'
      );
      break;
    case 'summer':
      wagePct = extra;
      imepPct = 0;
      notes.push(
        'Yaz stajı/beceri eğitiminde ücret tamamen isteğe bağlıdır.',
        'SGK primi devlet tarafından karşılanır — öğrenci sigortalı olarak çalışır.'
      );
      break;
  }

  const wagePerIntern = Math.round((GROSS_MIN_WAGE * wagePct) / 100);
  const imepSupport = Math.round((GROSS_MIN_WAGE * imepPct) / 100);
  const employerCost = Math.max(0, wagePerIntern - imepSupport);
  const employerCostPct = wagePerIntern > 0 ? Math.round((employerCost / wagePerIntern) * 100) : 0;

  if (input.inOsb) {
    notes.push(
      'OSB üyesi işletmeler MESEM işbirliği başvurularında öncelikli değerlendirilir; OSB yönetimleri ek destek programları yürütebilir.'
    );
  } else {
    notes.push(
      'OSB dışı işletmeler de İMEP’den eşit şartlarla yararlanır; OSB üyeliği avantajı değerlendirme önceliğidir.'
    );
  }
  notes.push(
    `${WAGE_YEAR} brüt asgari ücret baz alınmıştır: ${GROSS_MIN_WAGE.toLocaleString('tr-TR')} TL/ay.`,
    'Hesaplama bilgilendirme amaçlıdır; kesin tutar için SGK/MEB biriminizden teyit alın.'
  );

  return {
    wagePerIntern,
    imepSupport,
    employerCost,
    employerCostPct,
    sgkCovered,
    quotaMin,
    quotaMax,
    monthlySupportMax: imepSupport * quotaMax,
    yearlySupportMax: imepSupport * quotaMax * 12,
    notes,
  };
}
