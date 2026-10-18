@AGENTS.md

## Telegram Is Akisi (Stajyeri)
- **Bekleyen gorevler:** `scripts/bekleyen-gorevler.txt` — Telegram'dan gelen gorevler buraya yazilir. Oturum baslangicinda bu dosyayi kontrol et; kayit varsa gorevleri uygula, bitince dosyayi sil ve her gorevin sonucunu `scripts/telegram-notify.ps1` ile Telegram'a bildir.
- **Bildirim politikasi:** Her ara adimda mesaj ATMA. Gorev basina tek ozet gonder + gunluk otomatik ozet (StajyeriTelegramOzet gorevi, her gun 09:00, `scripts/telegram-daily.ps1`).
- **Ajan:** `scripts/telegram-agent.ps1` (StajyeriTelegramAjan gorevi, her dakika tetiklenir) — komutlar: durum, yayinla, derle, test, log, ozet, gorevler, yardim. Komut olmayan 3+ kelimelik mesajlari gorev olarak kuyruga alir.
- Token/chat ID `.env.local` icinde (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) — asla repoya commit etme.
