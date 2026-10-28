'use client';

// Stajyer Özgeçmiş Havuzu — maskeli arama + kontör (kredi) ile profil açma.
// Gizlilik modeli: kimlik alanları (ad/telefon/e-posta/foto) yalnızca
// search_student_pool RPC'sinden, açılmış adaylarda döner; maskeli satırda NULL.
// unlock_pool_student: atomik 1 kontör düş + pool_unlocks'a yazar (tekrar ücretsiz).

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MESEM_FIELDS, TURKEY_CITIES } from '@/lib/constants';
import {
  Search, Users, Lock, Phone, Mail, MessageCircle, X, ShieldCheck,
  Loader2, RefreshCw, Check, AlertCircle, Sparkles,
} from 'lucide-react';

const EDU_LEVELS = [
  'MESEM (Çırak - 9, 10, 11. Sınıf)',
  'MESEM (Kalfa - 12. Sınıf)',
  'Meslek Lisesi (12. Sınıf Stajyeri)',
  'Üniversite / Önlisans Stajyeri',
];

const PAGE_SIZE = 24;

interface PoolRow {
  student_id: string;
  display_name: string;
  unlocked: boolean;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  education_level: string | null;
  field_name: string | null;
  school_name: string | null;
  about: string | null;
  skills: string[] | null;
  photo_url: string | null;
  cv_updated_at: string | null;
  total_count: number;
}

interface FilterParams {
  field: string;
  city: string;
  edu: string;
  skill: string;
}

interface UnlockResult {
  ok: boolean;
  message: string;
  remaining: number;
  student: Record<string, unknown> | null;
}

export default function StudentPool() {
  const [access, setAccess] = useState<'checking' | 'denied' | 'granted'>('checking');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PoolRow[]>([]);
  const [total, setTotal] = useState(0);
  const [shown, setShown] = useState(0);
  const [field, setField] = useState('');
  const [city, setCity] = useState('');
  const [edu, setEdu] = useState('');
  const [skill, setSkill] = useState('');
  const [confirmRow, setConfirmRow] = useState<PoolRow | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Erişim izni + bakiye (RLS: işveren yalnızca kendi satırlarını görür)
  useEffect(() => {
    (async () => {
      const [permRes, credRes] = await Promise.all([
        supabase.from('pool_access_permissions').select('granted').maybeSingle(),
        supabase.from('employer_credits').select('balance').maybeSingle(),
      ]);
      setBalance(credRes.data?.balance ?? 0);
      if (permRes.data?.granted) setAccess('granted');
      else setAccess('denied');
    })();
  }, []);

  // Havuz araması — filtreler her değiştiğinde offset 0'dan yeniden çalışır
  const doSearch = useCallback(async (params: FilterParams, off: number) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('search_student_pool', {
      p_field: params.field || null,
      p_city: params.city || null,
      p_edu: params.edu || null,
      p_skill: params.skill || null,
      p_limit: PAGE_SIZE,
      p_offset: off,
    });
    if (error) {
      if (error.message.includes('HAVUZ_ERISIM_YOK')) {
        setAccess('denied');
      } else {
        setToast({ type: 'err', text: `Arama yapılamadı: ${error.message}` });
      }
      setLoading(false);
      return;
    }
    const list = (data ?? []) as PoolRow[];
    setTotal(list.length > 0 ? Number(list[0].total_count) : 0);
    setShown(off + list.length);
    setRows((prev) => (off === 0 ? list : [...prev, ...list]));
    setLoading(false);
  }, []);

  // Erişim onaylandığında ilk listeyi çek
  useEffect(() => {
    if (access !== 'granted') return;
    const t = setTimeout(() => {
      void doSearch({ field: '', city: '', edu: '', skill: '' }, 0);
    }, 0);
    return () => clearTimeout(t);
  }, [access, doSearch]);

  // Bilgi mesajı 4 saniyede kendiliğinden kaybolur
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const applyFilter = (patch: Partial<FilterParams>) => {
    const next: FilterParams = { field, city, edu, skill, ...patch };
    setField(next.field);
    setCity(next.city);
    setEdu(next.edu);
    setSkill(next.skill);
    setRows([]);
    setTotal(0);
    setShown(0);
    void doSearch(next, 0);
  };

  // 1 kontör ile adayı aç (önceden açılmışsa RPC ücretsiz döner)
  const handleUnlock = async (row: PoolRow) => {
    setUnlocking(true);
    const { data, error } = await supabase.rpc('unlock_pool_student', {
      p_student: row.student_id,
    });
    setUnlocking(false);
    if (error) {
      setToast({ type: 'err', text: `Aday açılamadı: ${error.message}` });
      return;
    }
    const res = ((data ?? []) as UnlockResult[])[0];
    if (!res?.ok) {
      setToast({ type: 'err', text: res?.message ?? 'Aday açılamadı.' });
      return;
    }
    setBalance(res.remaining);
    const stu = res.student ?? {};
    const fullName = typeof stu.full_name === 'string' ? stu.full_name : null;
    const phone = typeof stu.phone === 'string' ? stu.phone : null;
    const email = typeof stu.email === 'string' ? stu.email : null;
    const photo = typeof stu.photo_url === 'string' ? stu.photo_url : null;
    setRows((prev) =>
      prev.map((r) =>
        r.student_id === row.student_id
          ? { ...r, unlocked: true, full_name: fullName, phone, email, photo_url: photo }
          : r
      )
    );
    setConfirmRow(null);
    setToast({ type: 'ok', text: res.message });
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // WhatsApp bağlantısı için telefonu wa.me biçimine çevirir (05XX… → 905XX…)
  const waDigits = (raw: string) => {
    const d = raw.replace(/\D/g, '');
    if (d.startsWith('90')) return d;
    if (d.startsWith('0')) return `9${d}`;
    if (d.startsWith('5')) return `90${d}`;
    return d;
  };

  const content = (
    <div className="space-y-5">
      {/* Erişim denetimi sürüyor */}
      {access === 'checking' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-7 h-7 text-[#00A8B5] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 mt-3">Havuz erişim izinleri kontrol ediliyor…</p>
        </div>
      )}

      {/* Erişim yok — teaser ekranı */}
      {access === 'denied' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-[#0A1931] to-[#0D2244] p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-[#FF6B00]" />
            </div>
            <h2 className="text-lg font-black text-white">Stajyer Özgeçmiş Havuzu</h2>
            <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
              Platformdaki öğrenci adaylarını niteliklerine göre filtreleyip inceleyebileceğiniz özel
              havuz, aday gizliliği gereği yalnızca yönetici onayıyla açılan işletmelere sunulur.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-xs font-black text-[#0A1931]">Maskeli Ön İzleme</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Adaylar listelerde kimlikleri gizli görünür; KVKK uyumludur.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-xs font-black text-[#0A1931]">Kontör ile Açma</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  İlgilendiğiniz adayı 1 kontör karşılığında tam profilinizde açarsınız.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-xs font-black text-[#0A1931]">Gelişmiş Filtreler</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Meslek alanı, şehir, eğitim seviyesi ve yetkinliğe göre arama.
                </p>
              </div>
            </div>
            <div className="mt-5 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <span className="font-black">Havuz erişimi nasıl alınır?</span> Kayıtlı işletme hesabınızla
                site yönetimine başvurmanız yeterlidir. Onay sonrasında bu ekrandan kontör yükleyerek
                aday incelemeye başlayabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Erişim var — havuz ekranı */}
      {access === 'granted' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00A8B5]/10 text-[#00A8B5] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#0A1931]">Stajyer Özgeçmiş Havuzu</h2>
                <p className="text-[11px] text-slate-500">
                  Adaylar kimlikleri maskeli listelenir; iletişim bilgileri kontörle açılır.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-orange-500 text-white font-black text-xs shadow-lg shadow-[#FF6B00]/25">
                <Sparkles className="w-4 h-4" /> {balance} Kontör
              </div>
              <button
                type="button"
                onClick={() => void doSearch({ field, city, edu, skill }, 0)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-500 flex items-center justify-center transition cursor-pointer"
                aria-label="Listeyi yenile"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filtre paneli */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={field}
                onChange={(e) => applyFilter({ field: e.target.value })}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition cursor-pointer"
              >
                <option value="">Tüm Meslek Alanları</option>
                {MESEM_FIELDS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <select
                value={city}
                onChange={(e) => applyFilter({ city: e.target.value })}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition cursor-pointer"
              >
                <option value="">Tüm Şehirler</option>
                {TURKEY_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={edu}
                onChange={(e) => applyFilter({ edu: e.target.value })}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition cursor-pointer"
              >
                <option value="">Tüm Eğitim Seviyeleri</option>
                {EDU_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyFilter({});
                  }}
                  placeholder="Yetkinlik ara…"
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A8B5] transition"
                />
                <button
                  type="button"
                  onClick={() => applyFilter({})}
                  className="px-3.5 py-2.5 bg-[#0A1931] hover:bg-[#0D2244] text-white rounded-xl transition cursor-pointer flex items-center"
                  aria-label="Ara"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-500">
                {total > 0 ? `${total} aday bulundu` : loading ? 'Aranıyor…' : ''}
              </p>
              {(field || city || edu || skill) && (
                <button
                  type="button"
                  onClick={() => applyFilter({ field: '', city: '', edu: '', skill: '' })}
                  className="text-[11px] font-black text-[#00A8B5] hover:underline cursor-pointer"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </div>

          {/* Aday kartları */}
          {loading && rows.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Loader2 className="w-7 h-7 text-[#00A8B5] animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500 mt-3">Adaylar yükleniyor…</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-bold">Bu filtrelerle aday bulunamadı.</p>
              <p className="text-[11px] text-slate-400 mt-1">Filtreleri gevşetmeyi veya temizlemeyi deneyin.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {rows.map((r) => (
                  <div key={r.student_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="flex items-start gap-3 p-4">
                      {r.unlocked && r.photo_url ? (
                        <img src={r.photo_url} alt="Aday fotoğrafı" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${r.unlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {r.unlocked ? <Check className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-[#0A1931] truncate">
                          {r.unlocked && r.full_name ? r.full_name : r.display_name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{r.field_name ?? 'Alan belirtilmemiş'}</p>
                      </div>
                    </div>
                    <div className="px-4 pb-3 space-y-1.5 text-[11px] text-slate-500">
                      <p className="font-bold">{[r.city, r.education_level].filter(Boolean).join(' · ') || '—'}</p>
                      {r.school_name && <p>{r.school_name}</p>}
                      {r.about && <p className="text-slate-600 leading-relaxed line-clamp-2">{r.about}</p>}
                      {r.skills && r.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {r.skills.slice(0, 4).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{s}</span>
                          ))}
                        </div>
                      )}
                      {r.cv_updated_at && <p className="text-slate-400">CV güncellenmiş: {fmtDate(r.cv_updated_at)}</p>}
                    </div>
                    <div className="mt-auto p-3 border-t border-slate-100">
                      {r.unlocked ? (
                        <div className="space-y-1.5">
                          {r.phone && (
                            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700">
                              <Phone className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" /> {r.phone}
                            </p>
                          )}
                          {r.email && (
                            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700 truncate">
                              <Mail className="w-3.5 h-3.5 text-[#00A8B5] flex-shrink-0" /> {r.email}
                            </p>
                          )}
                          {r.phone && (
                            <a
                              href={`https://wa.me/${waDigits(r.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black rounded-xl transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp ile Ulaş
                            </a>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRow(r)}
                          className="w-full py-2.5 bg-[#0A1931] hover:bg-[#0D2244] text-white text-[11px] font-black rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" /> Kontör ile Aç (1)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {shown < total && (
                <div className="text-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void doSearch({ field, city, edu, skill }, shown)}
                    className="px-6 py-3 bg-white border border-slate-200 hover:border-[#00A8B5] text-slate-700 text-xs font-extrabold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Yükleniyor…' : `Daha Fazla Göster (${Math.max(total - shown, 0)} aday)`}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Onay penceresi — 1 kontör */}
          {confirmRow && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center relative">
                <button
                  type="button"
                  onClick={() => setConfirmRow(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-[#0A1931]">Adayı Aç ve İletişime Geç</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  <span className="font-black text-[#0A1931]">{confirmRow.display_name}</span> adayının tam
                  adı, telefonu ve e-postası görüntülenecek. Bu işlem{' '}
                  <span className="font-black text-[#FF6B00]">1 kontör</span> harcar. Bir kez açtığınız
                  adayı sonradan dilediğiniz kadar ücretsiz görüntüleyebilirsiniz.
                </p>
                <div className="mt-4 bg-slate-50 rounded-2xl p-3 text-[11px] font-extrabold text-slate-600 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" /> Mevcut bakiyeniz: {balance} kontör
                </div>
                {balance < 1 ? (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3 text-[11px] text-red-700 font-bold leading-relaxed">
                    Kontör bakiyeniz yetersiz. Yüklemek için site yönetimiyle iletişime geçin.
                  </div>
                ) : (
                  <div className="mt-5 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setConfirmRow(null)}
                      disabled={unlocking}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-extrabold rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleUnlock(confirmRow)}
                      disabled={unlocking}
                      className="flex-1 py-3 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      1 Kontör Harca ve Aç
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bilgi mesajı */}
          {toast && (
            <div
              className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-2xl shadow-xl text-xs font-extrabold flex items-center gap-2 ${
                toast.type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'
              } text-white`}
            >
              {toast.type === 'ok' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {toast.text}
            </div>
          )}

        </>
      )}
    </div>
  );

  return content;
}
