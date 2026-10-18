# ============================================================
# STAJYERI.NET | Gunluk Telegram Ozeti
# Zamanlanmis gorev ile her gun 09:00'da calisir; site, deploy,
# veritabani ve git durumunu ozet mesaj olarak gonderir.
# Ayrica ajanin /ozet komutu tarafindan da cagrilabilir.
# ============================================================

$ErrorActionPreference = 'Continue'

$root = Split-Path -Parent $PSScriptRoot

# --- .env.local oku ---
$script:Token  = $null
$script:ChatId = $null
$script:AnonKey = $null
foreach ($line in Get-Content (Join-Path $root '.env.local')) {
  if ($line -match '^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$')        { $script:Token   = $Matches[1] }
  if ($line -match '^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$')          { $script:ChatId  = $Matches[1] }
  if ($line -match '^\s*NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+?)\s*$') { $script:AnonKey = $Matches[1] }
}
if (-not $script:Token -or -not $script:ChatId) { exit 0 }

$base = 'https://eftlmmunitzrnfenqlbv.supabase.co/rest/v1'

# --- Tablo satir sayisi (Content-Range uzerinden) ---
function Get-Count {
  param([string]$Table, [string]$Filter)
  try {
    $h = @{
      apikey        = $script:AnonKey
      Authorization = "Bearer $($script:AnonKey)"
      Prefer        = 'count=exact'
      Range         = '0-0'
    }
    $url = "$base/$Table`?select=id"
    if ($Filter) { $url += "&$Filter" }
    $r  = Invoke-WebRequest -Uri $url -Headers $h -UseBasicParsing -TimeoutSec 15
    $cr = [string]$r.Headers['Content-Range']
    if ($cr -match '/(\d+)\s*$') { return [int]$Matches[1] }
  } catch { }
  return -1
}

# --- Ozet metnini olustur ---
$satirlar = @()
$satirlar += "STAJYERI.NET GUNLUK OZET - $(Get-Date -Format 'dd.MM.yyyy')"

# 1. Canli site
try {
  $r = Invoke-WebRequest -Uri 'https://stajyeri.vercel.app' -UseBasicParsing -TimeoutSec 15
  $satirlar += "Canli site: OK (HTTP $($r.StatusCode))"
} catch {
  $satirlar += 'Canli site: ERISILEMIYOR'
}

# 2. Vercel deploy durumu (son commitin GitHub statusu)
try {
  $sha = (git -C $root rev-parse HEAD 2>$null)
  if ($sha) {
    $st = Invoke-RestMethod -Uri "https://api.github.com/repos/enesgemci-afk/stajyeri/commits/$sha/status" -Headers @{ 'User-Agent' = 'cli' } -TimeoutSec 15
    if ($st.statuses -and $st.statuses.Count -gt 0) {
      $satirlar += "Vercel deploy: $($st.state)"
    } else {
      $satirlar += 'Vercel deploy: GitHub baglantisi yok'
    }
  }
} catch {
  $satirlar += 'Vercel deploy: durum alinamadi'
}

# 3. Supabase saglik
if ($script:AnonKey) {
  try {
    $null = Invoke-WebRequest -Uri 'https://eftlmmunitzrnfenqlbv.supabase.co/auth/v1/health' -Headers @{ apikey = $script:AnonKey } -UseBasicParsing -TimeoutSec 15
    $satirlar += 'Supabase: OK'
  } catch {
    $satirlar += 'Supabase: ERISILEMIYOR (proje duraklatilmis olabilir)'
  }
}

# 4. Veritabani sayilari
$aktifIlan  = Get-Count -Table 'job_posts'     -Filter 'is_active=eq.true'
$toplamBas  = Get-Count -Table 'applications'  -Filter $null
$son24      = Get-Count -Table 'applications'  -Filter ("created_at=gte." + (Get-Date).ToUniversalTime().AddHours(-24).ToString('yyyy-MM-ddTHH:mm:ss.fffZ'))
$bekleyen   = Get-Count -Table 'applications'  -Filter 'status=eq.pending'

if ($aktifIlan -ge 0) { $satirlar += "Aktif ilan: $aktifIlan" }
if ($toplamBas -ge 0) {
  $satirlar += "Toplam basvuru: $toplamBas"
  if ($son24 -ge 0)    { $satirlar += "Son 24 saatte gelen basvuru: $son24" }
  if ($bekleyen -ge 0) { $satirlar += "Incelemede bekleyen: $bekleyen" }
}

# 5. Git durumu
try {
  $last = git -C $root log -1 --format='%h %s' 2>$null
  if ($last) {
    if ($last.Length -gt 70) { $last = $last.Substring(0, 70) + '...' }
    $satirlar += "Son commit: $last"
  }
  $degisen = git -C $root status --porcelain 2>$null
  if ($degisen) { $satirlar += "Commit edilmemis degisiklik: $($degisen.Count) dosya" }
} catch { }

$metin = $satirlar -join "`n"

# --- Gonder ---
try {
  Invoke-RestMethod -Uri "https://api.telegram.org/bot$($script:Token)/sendMessage" -Method Post -Body @{
    chat_id = $script:ChatId; text = $metin; disable_web_page_preview = 'true'
  } | Out-Null
  Write-Output $metin
  exit 0
} catch {
  Write-Warning "Gunluk ozet gonderilemedi: $($_.Exception.Message)"
  exit 1
}
