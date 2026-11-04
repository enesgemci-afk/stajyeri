# ============================================================
# SATIŞ AJANI — pasif işverenlere IMEP davet taslakları (LLM'siz)
#   Supabase'den işletmeleri + aktif ilan sayılarını çeker;
#   ilanı olmayan (pasif) işverenlere kişiselleştirilmiş IMEP
#   davet metinleri üretir → drafts/satis/ + Telegram özet.
#   Gönderim kararı ve kanalı SENİN (e-posta/DM manuel).
# Kullanım: powershell -File scripts\agents\satis-agent.ps1
# Telegram: /satis
# ============================================================

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'
$root     = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$draftDir = Join-Path $root 'drafts\satis'
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

$SB = 'https://eftlmmunitzrnfenqlbv.supabase.co'
$H  = @{ apikey = $AnonKey; Authorization = "Bearer $AnonKey" }

# --- İşletmeler + aktif ilan sayıları ---
$firma = @()
$aktifJobs = @()
try {
  $firma     = Invoke-RestMethod -Uri "$SB/rest/v1/company_details?select=id,company_name,city&order=created_at.desc&limit=50" -Headers $H -TimeoutSec 20
  $aktifJobs = Invoke-RestMethod -Uri "$SB/rest/v1/job_posts?select=company_id&is_active=eq.true" -Headers $H -TimeoutSec 20
} catch { }

if (-not $firma -or $firma.Count -eq 0) {
  Send-Tg "💼 Satış ajanı: işletme kaydı bulunamadı."
  Write-Output 'İşletme yok.'
  exit 0
}

$say = @{}
foreach ($j in $aktifJobs) { if ($j.company_id) { $say[$j.company_id] = 1 + ($say[$j.company_id] | ForEach-Object { $_ }) } }

$pasif = @($firma | Where-Object { -not $say[$_.id] } | Select-Object -First 5)

if ($pasif.Count -eq 0) {
  Send-Tg "💼 Satış ajanı: tüm işletmeler aktif ilan sahibi — davet gerekmiyor. 👏"
  Write-Output 'Pasif işveren yok.'
  exit 0
}

$ozet = New-Object System.Collections.Generic.List[string]
$ozet.Add("💼 SATIŞ AJANI — Pasif İşveren Davet Taslakları ($(Get-Date -Format 'dd.MM'))")
$ozet.Add("")

foreach ($f in $pasif) {
  $ad   = if ($f.company_name) { $f.company_name } else { 'İşletme' }
  $slug = ($ad.ToLower() -replace '[^a-z0-9çğıöşü ]','' -replace '\s+','-').Trim('-')
  $sehir = if ($f.city) { $f.city } else { '' }

  $metin = @"
Merhaba $ad ekibi,

Stajyeri.net'te sizi gördük ama henüz aktif bir staj ilanınız yok.

Küçük bir hatırlatma: İMEP kapsamında çırak öğrenci eğitirseniz
- öğrenci ücreti ve SGK primleri devlet desteğiyle karşılanır,
- işletmenize öğrenci başına brüt asgari ücretin %30'u tutarında destek ödenir,
- belgeli usta öğreticiniz varsa kayıt 1 dakika sürer.

İlanınızı 1 dakikada yayınlayın: https://stajyeri.vercel.app/ilan-ver
$(if ($sehir) { "Bölgenizdeki öğrenci talebini görmek için: https://stajyeri.vercel.app/ilanlar" })

İyi çalışmalar!
Stajyeri.net Ekibi
"@

  $dosya = Join-Path $draftDir ("{0:yyyy-MM-dd}-{1}.md" -f (Get-Date -Format 'yyyy-MM-dd'), $slug)
  $metin | Set-Content -Path $dosya -Encoding UTF8
  $ozet.Add("• $ad$(if ($sehir) { " ($sehir)" }) → $((Get-Date -Format 'yyyy-MM-dd'))-$slug.md")
}

$ozet.Add("")
$ozet.Add("Taslaklar: drafts\satis\ klasöründe. Gönderim kararı sende — e-posta/DM ile ilet.")

$out = $ozet -join "`n"
$out | Set-Content -Path (Join-Path $draftDir ("{0:yyyy-MM-dd}-ozet.md" -f (Get-Date -Format 'yyyy-MM-dd'))) -Encoding UTF8
Send-Tg $out
Write-Output "Satış davet taslakları hazır: $($pasif.Count) işveren."
