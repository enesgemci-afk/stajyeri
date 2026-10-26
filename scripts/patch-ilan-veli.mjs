// scripts/patch-ilan-veli.mjs
// Entegrasyon 1: ilan detay basvuru akisina "Veli Onay" katmani.
// Regex tabanli + atomik (bir patch bile tutmazsa dosya degismez) + idempotent.
// guardian_consents kolonlari supabase/guven_katmani.sql'den okunur; payload ona uyarlanir.
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'app/ilan/[id]/page.tsx';
const SQLF = 'supabase/guven_katmani.sql';
const SIG = 'VELI_ONAY_ENTEGRASYON';

let src = readFileSync(FILE, 'utf8');
const rep = [];
let allOk = true;

if (src.includes(SIG)) {
  console.log('Zaten uygulanmis. Cikiliyor.');
  process.exit(0);
}

// Isim cakismasi korumasi
const CY = src.includes('CURRENT_YEAR') ? 'VELI_CURRENT_YEAR' : 'CURRENT_YEAR';
const BY = src.includes('BIRTH_YEARS') ? 'VELI_BIRTH_YEARS' : 'BIRTH_YEARS';

// ---------- 0) SQL'den guardian_consents kolonlari ----------
const gcCols = new Set();
let gcNotNull = [];
try {
  const sql = readFileSync(SQLF, 'utf8');
  const gcm = sql.match(/create table[\s\S]*?guardian_consents\s*\(([\s\S]*?)\);/i);
  if (gcm) {
    for (const raw of gcm[1].split('\n')) {
      const line = raw.trim();
      const cm = line.match(/^([a-z_][a-z0-9_]*)\s/i);
      if (!cm) continue;
      const col = cm[1];
      if (['constraint', 'primary', 'foreign', 'unique', 'check'].includes(col)) continue;
      gcCols.add(col);
      if (/not null/i.test(line) && !/default/i.test(line)) gcNotNull.push(col);
    }
  }
} catch {
  rep.push('SQL okunamadi; payload tum bilinen alanlarla kurulacak.');
}
rep.push('SQL kolonlari : ' + (gcCols.size ? [...gcCols].join(', ') : '(bulunamadi)'));

// ---------- P2: modul kapsami sabitler ----------
{
  const re = /} from 'lucide-react';/;
  if (re.test(src)) {
    const add = `

// ${SIG} — modul kapsami sabitleri
const ${CY} = new Date().getFullYear();
const ${BY}: number[] = [];
for (let __y = ${CY} - 13; __y <= ${CY}; __y += 1) ${BY}.push(__y);`;
    src = src.replace(re, (m) => m + add);
    rep.push('P2 OK  : sabitler eklendi (' + CY + ', ' + BY + ')');
  } else { rep.push('P2 FAIL: lucide import bulunamadi'); allOk = false; }
}
// ---------- P1: state'ler ----------
{
  const re = /const \[message,[^\n]*\n/;
  if (re.test(src)) {
    const add = `  // ${SIG} — veli onay state'leri
  const [birthYear, setBirthYear] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Anne');
  const [guardianLink, setGuardianLink] = useState<string | null>(null);
  const [guardianFormError, setGuardianFormError] = useState<string | null>(null);
`;
    src = src.replace(re, (m) => m + add);
    rep.push('P1 OK  : veli state\'leri eklendi');
  } else { rep.push('P1 FAIL: message state satiri bulunamadi'); allOk = false; }
}
// ---------- P4: applications insert + guard + veli kaydi ----------
{
  const re = /const\s*\{([^}]*)\}\s*=\s*await\s+supabase\s*\.from\('applications'\)\s*\.insert\(\s*\{([\s\S]*?)\}\s*\)([^;]*);/;
  const m = src.match(re);
  if (!m) {
    rep.push('P4 FAIL: applications insert blogu bulunamadi');
    const i = src.indexOf(".from('applications')");
    if (i >= 0) rep.push('  ~ BAGLAM:\n' + src.slice(Math.max(0, i - 400), i + 600));
    allOk = false;
  } else {
    const destr = m[1].trim();
    const payload = m[2];
    const errM = destr.match(/\berror(?::\s*(\w+))?/);
    const dataM = destr.match(/\bdata(?::\s*(\w+))?/);
    const eVar = errM ? (errM[1] || 'error') : '__applyErr';
    const dataVar = dataM ? (dataM[1] || 'data') : '__appRow';
    const rest = destr.replace(/\bdata(?::\s*\w+)?/g, '').replace(/\berror(?::\s*\w+)?/g, '').replace(/[,\s]/g, '');
    const jobIdM = payload.match(/job_id\s*:\s*([^\n,}]+)/);
    const studentIdM = payload.match(/student_id\s*:\s*([^\n,}]+)/);
    if (rest) { rep.push('P4 FAIL: destructure bilinmeyen icerik [' + destr + ']'); allOk = false; }
    else if (!jobIdM || !studentIdM) { rep.push('P4 FAIL: payload icinde job_id/student_id yok. Payload:\n' + payload); allOk = false; }
    else {
      const jobIdExpr = jobIdM[1].trim();
      const studentIdExpr = studentIdM[1].trim();
      const gcMap = [
        ['student_id', studentIdExpr],
        ['application_id', dataVar + '?.id'],
        ['job_id', jobIdExpr],
        ['guardian_name', 'guardianName.trim()'],
        ['guardian_phone', 'guardianPhone.trim()'],
        ['relation', 'guardianRelation'],
        ['student_birth_year', 'Number(birthYear)'],
        ['consent_token', '__token'],
        ['provider', "'link'"],
        ['status', "'pending'"],
        ['consent_text_version', "'v1'"],
        ['expires_at', 'new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()'],
      ];
      const gcLines = gcMap
        .filter(([k]) => !gcCols.size || gcCols.has(k))
        .map(([k, v]) => '        ' + k + ': ' + v + ',')
        .join('\n');
      const replacement = `// ${SIG} — veli durumuyla birlikte (SQL kolonlari yoksa klasik insert'e duser)
const __isMinor = !!birthYear && ${CY} - Number(birthYear) < 18;
if (__isMinor && (!guardianName.trim() || !guardianPhone.trim())) {
  setGuardianFormError('18 yaşından küçük olduğun için veli onayı gerekiyor. Veli ad-soyad ve telefon bilgilerini doldur.');
  return;
}
setGuardianFormError(null);
const __baseAppPayload = {${payload}};
let { data: ${dataVar}, error: ${eVar} } = await supabase
  .from('applications')
  .insert({ ...__baseAppPayload, birth_year: birthYear ? Number(birthYear) : null, guardian_status: __isMinor ? 'pending' : 'not_required' })
  .select('id')
  .maybeSingle();
if (${eVar} && /guardian_status|birth_year/i.test(String(${eVar}.message ?? ''))) {
  ({ data: ${dataVar}, error: ${eVar} } = await supabase
    .from('applications')
    .insert(__baseAppPayload)
    .select('id')
    .maybeSingle());
}
// ${SIG} — veli onay kaydi + onay linki
try {
  if (!${eVar} && __isMinor && ${dataVar}?.id && guardianName.trim() && guardianPhone.trim()) {
    const __token = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, '');
    const { error: __gcErr } = await supabase
      .from('guardian_consents')
      .insert({
${gcLines}
      });
    if (!__gcErr) {
      const __origin = typeof window !== 'undefined' ? window.location.origin : 'https://stajyeri.vercel.app';
      setGuardianLink(__origin + '/veli-onay/' + __token);
    }
  }
} catch {
  /* guven_katmani.sql henuz calistirilmamis olabilir */
}`;
      const ln = src.slice(0, m.index).split('\n').length;
      src = src.slice(0, m.index) + replacement + src.slice(m.index + m[0].length);
      rep.push('P4 OK  : insert + guard + veli kaydi (satir ' + ln + ') | destr=[' + destr + '] | job_id=' + jobIdExpr + ' | student_id=' + studentIdExpr);
    }
  }
}
// ---------- P5: form JSX ----------
{
  const variants = [
    /<textarea[^>]*value=\{message\}[^>]*\/>/,
    /<textarea[^>]*value=\{message\}[^>]*>[\s\S]*?<\/textarea>/,
    /<textarea(?:(?!<\/textarea>)[\s\S])*?value=\{message\}(?:(?!<\/textarea>)[\s\S])*?\/>/,
  ];
  let m = null;
  for (const re of variants) { m = src.match(re); if (m) break; }
  if (!m) {
    const i = src.indexOf('message');
    if (i >= 0) rep.push('P5 FAIL: textarea bulunamadi ~ BAGLAM:\n' + src.slice(Math.max(0, i - 300), i + 300));
    else rep.push('P5 FAIL: message hic gecmiyor');
    allOk = false;
  } else {
    const add = `
              {/* ${SIG} — veli onay alani */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Doğum Yılı</label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition cursor-pointer"
                >
                  <option value="">Seçiniz</option>
                  {${BY}.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
                {!!birthYear && ${CY} - Number(birthYear) < 18 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <p className="text-[11px] font-black text-amber-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> 18 yaş altı başvuru — veli onayı gerekir
                    </p>
                    <p className="text-[10px] text-amber-700">
                      Başvurun velinin onayına sunulacak; onay linkini başvurduktan sonra WhatsApp ile veline gönderebilirsin.
                    </p>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Veli Ad Soyad"
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="Veli Telefon (05xx xxx xx xx)"
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-400"
                    />
                    <select
                      value={guardianRelation}
                      onChange={(e) => setGuardianRelation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {['Anne', 'Baba', 'Vasi/Veli'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}
                {guardianFormError && (
                  <p className="mt-2 text-[11px] font-bold text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {guardianFormError}
                  </p>
                )}
                {guardianLink && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-[11px] font-black text-emerald-800">Veli onay linkin hazır</p>
                    <p className="text-[10px] text-emerald-700 mt-1">
                      Linki veline gönder; onayladığında başvurun işletmeye otomatik açılır.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => { if (guardianLink) navigator.clipboard?.writeText(guardianLink); }}
                        className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Linki Kopyala
                      </button>
                      <a
                        href={'https://wa.me/?text=' + encodeURIComponent('Stajyeri.net veli onay linki: ' + guardianLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                      >
                        WhatsApp'tan Gönder
                      </a>
                    </div>
                  </div>
                )}
              </div>`;
    const ln = src.slice(0, m.index).split('\n').length;
    src = src.slice(0, m.index + m[0].length) + '\n' + add + src.slice(m.index + m[0].length);
    rep.push('P5 OK  : form JSX eklendi (textarea sonrasi, satir ' + ln + ')');
  }
}

// ---------- yaz ----------
if (!allOk) {
  console.log(rep.join('\n'));
  console.log('\nSONUC: eksik patch var -> dosya DEGISTIRILMEDI (atomik).');
  process.exit(1);
}
writeFileSync(FILE, src, 'utf8');
console.log(rep.join('\n'));
console.log('\nSONUC: tum patchler uygulandi, dosya yazildi: ' + FILE);




