# ============================================================
# PAZARLAMA AJANI — gerçek ilan verisinden sosyal medya paketi
#   Supabase'den aktif ilanları çeker; Instagram/X/LinkedIn
#   postlarını üretir → drafts/pazarlama/ + Telegram önizleme.
#   LLM gerektirmez — veri + şablon.
# Kullanım: powershell -File scripts\agents\pazarlama-agent.ps1
# Telegram: /pazarlama
# ============================================================

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'
$root     = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$draftDir = Join-Path $root 'drafts\pazarlama'
New-Item -ItemType Directory -Force -Path $draftDir | Out-Null

$script:Token  = $null
$script:ChatId = $null
$AnonKey       = $null
foreach ($line in Get-Content (Join-Path $root '.env.local')) {
  if ($line -match '^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$') { $script:Token  = $Matches[1] }
  if ($line -match '^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$')   { $script:ChatId = $Matches[1] }
  if ($line -match '^\s*ANON_KEY\s*=\s*(.+?)\s*$')           { $AnonKey       = $Matches[1] }
}
function Send-Tg {
  param([string]$Text)
  try {
    Invoke-RestMethod -Uri "https://api.telegram.org/bot$($script:Token)/sendMessage" -Method Post -Body @{
      chat_id = $script:ChatId; text = $Text; disable_web_page_preview = 'true'
    } | Out-Null
  } catch { }
}

# --- Gerçek ilan verisi ---
$SB  = 'https://eftlmmunitzrnfenqlbv.supabase.co'
$jobs = @()
try {
  $jobs = Invoke-RestMethod -Uri "$SB/rest/v1/job_posts?select=city,field_name,program_type&is_active=eq.true" -Headers @{
    apikey = $AnonKey; Authorization = "Bearer $AnonKey"
  } -TimeoutSec 20
} catch { }

if (-not $jobs -or $jobs.Count -eq 0) {
  Send-Tg "📣 Pazarlama ajanı: aktif ilan bulunamadı, paket üretilemedi. Önce ilan yayınlayın."
  Write-Output 'Aktif ilan yok.'
  exit 0
}

# --- Sayaçlar ---
$toplam   = $jobs.Count
$sehir    = @{}
$alan     = @{}
$univ     = 0
foreach ($j in $jobs) {
  if ($j.city)    { $sehir[$j.city]    = 1 + ($sehir[$j.city]    | ForEach-Object { $_ }) }
  if ($j.field_name) { $alan[$j.field_name] = 1 + ($alan[$j.field_name] | ForEach-Object { $_ }) }
  if ($j.program_type -like 'UNIV*') { $univ++ }
}
$topSehir = ($sehir.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 3)
$topAlan  = ($alan.GetEnumerator()  | Sort-Object Value -Descending | Select-Object -First 3)
$sehirTxt = ($topSehir | ForEach-Object { "$($_.Key) ($($_.Value))" }) -join ' · '
$alanTxt  = ($topAlan  | ForEach-Object { "$($_.Key) ($($_.Value))" }) -join ' · '

# --- Post paketi (marka dili: BRAND-VOICE.md) ---
$instagram = @"
📢 Bu hafta $toplam aktif staj ilanı yayında!

En çok fırsat:
$($topSehir | ForEach-Object { "📍 $($_.Key) — $($_.Value) ilan" } | Out-String).Trim()

Popüler alanlar:
$($topAlan | ForEach-Object { "🔧 $($_.Key) — $($_.Value) ilan" } | Out-String).Trim()

3308 güvencesiyle maaşlı ve sigortalı staj 👇
stajyeri.net/ilanlar

#staj #MESEM #mesleklisesi #çıraklık #kariyer
"@

$x = "Bu hafta $toplam aktif staj ilanı 🔧 Öne çıkan: $($topSehir[0].Key) ($($topSehir[0].Value) ilan) · $($topAlan[0].Key) ($($topAlan[0].Value))`n3308 güvencesiyle maaşlı + sigortalı staj: stajyeri.net/ilanlar #staj #MESEM"

$linkedin = @"
İşletmelere duyurulur: MESEM ve meslek lisesi öğrencileriyle üniversite stajyerlerini buluşturan platformumuzda şu an $toplam aktif ilan bulunuyor.

Öne çıkan bölgeler: $sehirTxt
Talep gören alanlar: $alanTxt
$(if ($univ -gt 0) { "Üniversite staj programı: $univ ilan`n" })
İMEP kapsamında çırak öğrenci eğitiminin işletmeye maliyeti 0 TL olabilir — öğrenci ücreti ve SGK primleri devlet desteğiyle karşılanır.

Ücretsiz ilan yayınlayın: stajyeri.net/ilan-ver
"@

$paket = @"
# PAZARLAMA PAKETİ — $(Get-Date -Format 'dd.MM.yyyy')

## 1) Instagram / Facebook
$instagram

---
## 2) X (Twitter)
$x

---
## 3) LinkedIn (işveren odaklı)
$linkedin

---
## Kaynak veri
Toplam: $toplam aktif ilan · Üniversite programlı: $univ · Şehir sayısı: $($sehir.Count) · Alan sayısı: $($alan.Count)
"@

$dosya = Join-Path $draftDir ("{0:yyyy-MM-dd}-paket.md" -f (Get-Date))
$paket | Set-Content -Path $dosya -Encoding UTF8

$onizleme = "📣 PAZARLAMA PAKETİ hazır ($(Get-Date -Format 'dd.MM'))`n`nInstagram postu:`n" + ($instagram.Substring(0, [Math]::Min(400, $instagram.Length))) + "`n...`n`nTam paket: drafts\pazarlama\$((Get-Date -Format 'yyyy-MM-dd'))-paket.md`nOnaylamak için: /onayla"
Send-Tg $onizleme
Write-Output "Pazarlama paketi hazır: $dosya"
