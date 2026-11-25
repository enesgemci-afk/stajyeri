import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Role = 'student' | 'employer' | 'school';
type Payload = {
  userId?: string;
  role?: Role;
  fullName?: string;
  email?: string;
  accessToken?: string;
  field?: string;
  educationLevel?: string;
  companyName?: string;
  city?: string;
  district?: string;
  schoolName?: string;
  coordinatorTitle?: string;
};

const ROLE_LABELS: Record<Role, string> = {
  student: 'Öğrenci',
  employer: 'İşveren',
  school: 'Okul koordinatörü',
};

const SUPABASE_URL = 'https://eftlmmunitzrnfenqlbv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdGxtbXVuaXR6cm5mZW5xbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTUwODIsImV4cCI6MjEwMzIzMTA4Mn0.CNoopOgA0URXk8uWXdrWDVJJQQFjPcRuZImfingGFvc';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function row(label: string, value: unknown) {
  if (!value) return '';
  return `<tr><td style="padding:6px 14px 6px 0;color:#64748B">${label}</td><td style="padding:6px 0;font-weight:600;color:#0A1931">${escapeHtml(value)}</td></tr>`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const { userId, role, fullName, email, accessToken } = body;

    if (!userId || !role || !email || !accessToken || !ROLE_LABELS[role]) {
      return NextResponse.json({ ok: false, error: 'Eksik veya geçersiz kayıt bilgisi.' }, { status: 400 });
    }

    // Kayıt sahibinin token'ını Supabase ile doğrula (sahte bildirimleri engeller).
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
    });
    if (!authResponse.ok) {
      return NextResponse.json({ ok: false, error: 'Oturum doğrulanamadı.' }, { status: 401 });
    }
    const authUser = (await authResponse.json()) as { id?: string; email?: string };
    if (authUser.id !== userId || authUser.email?.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ ok: false, error: 'Kullanıcı eşleşmiyor.' }, { status: 403 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'RESEND_API_KEY yapılandırılmadı.' }, { status: 503 });
    }

    const roleLabel = ROLE_LABELS[role];
    const safeName = fullName?.trim() || 'Yeni kullanıcı';
    const subject = `Stajyeri.net — Yeni ${roleLabel} kaydı: ${safeName}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0A1931">
        <h2 style="margin-bottom:8px">Yeni üye kaydı</h2>
        <p style="color:#475569">Stajyeri.net'e yeni bir kullanıcı katıldı.</p>
        <table style="border-collapse:collapse;margin-top:16px;font-size:14px">
          ${row('Ad Soyad', safeName)}
          ${row('Rol', roleLabel)}
          ${row('E-posta', email)}
          ${row('Meslek alanı', body.field)}
          ${row('Eğitim seviyesi', body.educationLevel)}
          ${row('İşletme', body.companyName)}
          ${row('Okul', body.schoolName)}
          ${row('Koordinatör unvanı', body.coordinatorTitle)}
          ${row('Şehir / İlçe', [body.city, body.district].filter(Boolean).join(' / '))}
          ${row('Kullanıcı ID', userId)}
          ${row('Zaman', new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }))}
        </table>
        <p style="margin-top:20px;font-size:12px;color:#94A3B8">Bu e-posta, kayıt tamamlama API'si tarafından otomatik gönderilmiştir.</p>
      </div>`;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Stajyeri.net <onboarding@resend.dev>',
        to: ['enesgemci@gmail.com'],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error('Resend error:', resendResponse.status, detail);
      return NextResponse.json({ ok: false, error: 'E-posta gönderilemedi.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('notify-signup error:', error);
    return NextResponse.json({ ok: false, error: 'Beklenmeyen hata.' }, { status: 500 });
  }
}
