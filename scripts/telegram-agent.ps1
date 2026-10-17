# ============================================================
# STAJYERI.NET | Telegram Uzak Komut Ajanı
# Zamanlanmış görev ile her dakika çalisir, Telegram'dan gelen
# komutlari okuyup beyaz liste dahilinde uygular ve sonucu
# Telegram'a geri gönderir.
#
# Desteklenen komutlar: /help /status /deploy /build /test /log
#
# Guvenlik: Sadece .env.local icindeki TELEGRAM_CHAT_ID sahibinin
# mesajlari islenir. Beyaz liste disinda komut calistirilmaz.
# ============================================================

$ErrorActionPreference = 'Continue'

# --- Ayni anda tek ornek (mutex) ---
$mutex = New-Object System.Threading.Mutex($false, 'Global\StajyeriTgAgent')
if (-not $mutex.WaitOne(0)) { exit 0 }

$root = Split-Path -Parent $PSScriptRoot

# --- .env.local oku ---
$script:Token = $null
$script:ChatId = $null
foreach ($line in Get-Content (Join-Path $root '.env.local')) {
  if ($line -match '^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$') { $script:Token = $Matches[1] }
  if ($line -match '^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$')  { $script:ChatId = $Matches[1] }
}
if (-not $script:Token -or -not $script:ChatId) { exit 0 }

# --- Telegram yardimcilari ---
function Send-Tg {
  param([string]$Text)
  try {
    Invoke-RestMethod -Uri "https://api.telegram.org/bot$($script:Token)/sendMessage" -Method Post -Body @{
      chat_id = $script:ChatId; text = $Text; disable_web_page_preview = 'true'
    } | Out-Null
  } catch { }
}

function Get-TgUpdates {
  param([long]$Offset)
  try {
    $r = Invoke-RestMethod -Uri "https://api.telegram.org/bot$($script:Token)/getUpdates?timeout=30&offset=$Offset"
    if ($r.ok) { return $r.result }
  } catch { }
  return @()
}

function EpochNow {
  return [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
}

# --- Komut isleyici ---
function Invoke-AgentCommand {
  param([string]$Cmd)

  switch -Regex ($Cmd) {
    '^/help$' {
      return (@"
Stajyeri Ajan Komutlari:

/status  - Sistem, git ve canli site durumu
/deploy  - Commit + push (Vercel otomatik yayinlar)
/build   - Production build testi (npm run build)
/test    - Canli site + Supabase saglik kontrolu
/log     - Son git commit'lerini listeler
"@)
    }
    '^/status$' {
      $git = git -C $root status --short 2>$null
      $branch = git -C $root rev-parse --abbrev-ref HEAD 2>$null
      $last = git -C $root log --oneline -1 2>$null
      try {
        $r = Invoke-WebRequest -Uri 'https://stajyeri.vercel.app' -UseBasicParsing -TimeoutSec 15
        $site = "Canli site: OK (HTTP $($r.StatusCode))"
      } catch { $site = "Canli site: ERISILEMIYOR" }
      $temiz = if ($git) { "Commit edilmemis degisiklik var:" } else { "Calisma dizini temiz." }
      return (@"
Sistem Durumu:
- Dal: $branch
- Son commit: $last
- $temiz
$($git | ForEach-Object { "  $_" })
- $site
"@)
    }
    '^/deploy$' {
      $degisen = git -C $root status --porcelain 2>$null
      if (-not $degisen) { return 'Yayinlanacak degisiklik yok (calisma dizini temiz).' }
      git -C $root add -A 2>$null
      git -C $root commit -m "Telegram ajan ile yayin: $(Get-Date -Format 'dd.MM.yyyy HH:mm')" 2>$null | Out-Null
      $push = git -C $root push origin main 2>&1 | Out-String
      if ($LASTEXITCODE -eq 0) {
        return "Push basarili. Vercel otomatik deploy baslatti (~1-2 dk).`n$push"
      } else {
        return "Push HATASI:`n$push"
      }
    }
    '^/build$' {
      $out = Set-Location $root; npm run build 2>&1 | Out-String
      if ($LASTEXITCODE -eq 0) { return "Build BASARILI.`n$((($out -split "`n") | Select-Object -Last 6) -join "`n")" }
      else { return "Build HATASI:`n$((($out -split "`n") | Select-Object -Last 20) -join "`n")" }
    }
    '^/test$' {
      try {
        $r = Invoke-WebRequest -Uri 'https://stajyeri.vercel.app' -UseBasicParsing -TimeoutSec 15
        $site = "Site OK (HTTP $($r.StatusCode))"
      } catch { $site = 'Site ERISILEMIYOR' }
      try {
        $k = (Get-Content (Join-Path $root '.env.local') | Where-Object { $_ -match 'ANON_KEY=' }) -replace '.*ANON_KEY=',''
        $s = Invoke-WebRequest -Uri 'https://eftlmmunitzrnfenqlbv.supabase.co/auth/v1/health' -Headers @{apikey=$k} -UseBasicParsing -TimeoutSec 15
        $sb = 'Supabase OK'
      } catch { $sb = 'Supabase ERISILEMIYOR' }
      return "Test sonucu:`n- $site`n- $sb"
    }
    '^/log$' {
      $log = git -C $root log --oneline -7 2>$null | Out-String
      return "Son commit'ler:`n$log"
    }
    default {
      return "Bilinmeyen komut: $Cmd`nKomut listesi icin /help yazin."
    }
  }
}

# --- Ana dongu: uzun polling ---
Send-Tg "Stajyeri ajan baglandi ve komut bekliyor. Komutlar icin /help yazin."

$offset = 0
$bosDeneme = 0
while ($true) {
  $updates = Get-TgUpdates -Offset $offset

  foreach ($u in $updates) {
    $offset = [Math]::Max($offset, $u.update_id + 1)

    $msg = $u.message
    if (-not $msg) { continue }
    if ([string]$msg.chat.id -ne [string]$script:ChatId) { continue }   # Sadece sahip
    if ($msg.date -lt (EpochNow - 60)) { continue }                      # Eski mesajlari atla

    $text = ([string]$msg.text).Trim()
    if (-not $text.StartsWith('/')) { continue }

    $yanit = Invoke-AgentCommand -Cmd $text
    if ($yanit) { Send-Tg $yanit }

    $bosDeneme = 0
  }

  if (-not $updates -or $updates.Count -eq 0) {
    $bosDeneme++
    if ($bosDeneme -ge 40) { break }   # ~20 dk kimse yoksa çık (görev tekrar başlatır)
    Start-Sleep -Seconds 2
  } else {
    $bosDeneme = 0
  }
}

$mutex.ReleaseMutex()
