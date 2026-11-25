export type NewUserNotification = {
  userId: string;
  role: 'student' | 'employer' | 'school';
  fullName: string;
  email: string;
  accessToken?: string;
  field?: string;
  educationLevel?: string;
  companyName?: string;
  city?: string;
  district?: string;
  schoolName?: string;
  coordinatorTitle?: string;
};

/** Kayıt sonrası yöneticiye e-posta bildirimi; hata olursa kaydı ENGELLEMEZ. */
export async function notifyNewUser(payload: NewUserNotification): Promise<void> {
  try {
    await fetch('/api/notify-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // E-posta bildirimi başarısızsa kullanıcının kaydı etkilenmez.
  }
}
