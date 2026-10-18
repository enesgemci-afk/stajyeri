# ============================================================
# STAJYERI.NET | Telegram Uzak Komut Ajani (v2)
#
# Zamanlanmis gorev ile her dakika baslatilir; tek ornek
# (mutex) ile calisir, Telegram'dan gelen komutlari okuyup
# uygular ve sonucu Telegram'a gonderir.
#
# DEGISIKLIKLER (v2):
#  - Komutlar "/komut" VEYA dogrudan "komut" yazilarak kullanilir
#  - Turkce es anlamlilar: durum/yayinla/derle/test/log/ozet
#  - Anlasilmayan mesajlara yol gosteren yanit doner
#  - Offset dosyada saklanir; ajan kapaliyken gonderilen
#    mesajlar kaybolmaz, tekrar baslayinca islenir
#  - Acilis duyurusu yok: yalnizca komut yanitlari
# ============================================================

$ErrorActionPreference = 'Continue'

# --- Ayni anda tek ornek (mutex) ---
$mutex = New-Object System.Threading.Mutex($false, 'Global\StajyeriTgAgent')
if (-not $mutex.WaitOne(0)) { exit 0 }

$root        = Split-Path -Parent $PSScriptRoot
$stateFile   = Join-Path $PSScriptRoot '.tg-state.json'
$dailyScript = Join-Path $PSScriptRoot 'telegram-daily.ps1'

# --- .env.local oku ---
$script:Token  = $null
$script:ChatId = $null
foreach ($line in Get-Content (Join-Path $root '.env.local')) {
  if ($line -match '^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$') { $script:Token  = $Matches[1] }
  if ($line -match '^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$')   { $script:ChatId = $Matches[1] }
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
    $r = Invoke-RestMethod -Uri "https://api.telegram.org/bot$($script:Token)/getUpdates?timeout=25&offset=$Offset"
    if ($r.ok) { return $r.result }
  } catch { }
  return @()
}

function Load-Offset {
  try {
    if (Test-Path $stateFile) {
      return [long]((Get-Content $stateFile -Raw | ConvertFrom-Json).offset)
    }
  } catch { }
  return 0
}

function Save-Offset {
  param([long]$Value)
  try {
    @{ offset = $Value } | ConvertTo-Json | Set-Content -Path $stateFile -Encoding ASCII
  } catch { }
}

# --- Komut cozumleyici: "/" olsun olmasin, Turkce es anlamlilar dahil ---
function Resolve-Command {
  param([string]$Text)
  $t = ([string]$Text).Trim().ToLower()
  # Turkce karakterleri ASCII eslenigine cevir (ö->o, ı->i, ş->s ...)
  $t = $t -replace [char]0x00E7, 'c'   # c-cedilla
  $t = $t -replace [char]0x011F, 'g'   # g-breve
  $t = $t -replace [char]0x0131, 'i'   # dotless i
  $t = $t -replace [char]0x00F6, 'o'   # o-umlaut
  $t = $t -replace [char]0x015F, 's'   # s-cedilla
  $t = $t -replace [char]0x00FC, 'u'   # u-umlaut
  if ($t.StartsWith('/')) { $t = $t.Substring(1) }
  $t = ($t -split '\s+')[0]

  if ($t -in @('help','yardim','komutlar','komut','komutlistesi')) { return 'help' }
  if ($t -in @('status','durum','durumu','sistem','rapor'))        { return 'status' }
  if ($t -in @('deploy','yayinla','gonder','push','yayinaal','yayinla ','yayin')) { return 'deploy' }
  if ($t -in @('build','derle','derleme','yapilandir'))            { return 'build' }
  if ($t -in @('test','kontrol','saglik','testet','kontrolet'))    { return 'test' }
  if ($t -in @('log','kayit','commit','commitler','gecmis'))       { return 'log' }
  if ($t -in @('ozet','gunluk','gunlukozet','summary','ozetal'))   { return 'ozet' }
  if ($t -in @('gorevler','bekleyengorevler','gorevlistesi'))      { return 'gorevler' }
  return $null
}

# --- Komut isleyici ---
function Invoke-AgentCommand {
  param([string]$Name)

  switch ($Name) {
    'help' {
      return (@"
Stajyeri Ajan - Komutlar ("/" ile veya direkt yazin):

  durum      - Sistem, git ve canli site durumu
  yayinla    - Commit + push (Vercel otomatik yayinlar)
  derle      - Production build testi
  test       - Canli site + Supabase saglik kontrolu
  log        - Son git commit'leri
  ozet       - Gunluk ozeti simdi gonder
  gorevler   - Bekleyen gorev listesi
  yardim     - Bu liste
"@)
    }
    'status' {
      $git    = git -C $root status --porcelain 2>$null
      $branch = git -C $root rev-parse --abbrev-ref HEAD 2>$null
      $last   = git -C $root log --oneline -1 2>$null
      try {
        $r = Invoke-WebRequest -Uri 'https://stajyeri.vercel.app' -UseBasicParsing -TimeoutSec 15
        $site = "Canli site: OK (HTTP $($r.StatusCode))"
      } catch { $site = 'Canli site: ERISILEMIYOR' }
      $temiz = if ($git) { "Commit edilmemis degisiklik: $($git.Count) dosya" } else { 'Calisma dizini temiz.' }
      return (@"
Sistem Durumu:
- Dal: $branch
- Son commit: $last
- $temiz
- $site
"@)
    }
    'deploy' {
      $degisen = git -C $root status --porcelain 2>$null
      if (-not $degisen) { return 'Yayinlanacak degisiklik yok (calisma dizini temiz).' }
      git -C $root add -A 2>$null
      git -C $root commit -m "Telegram ajan ile yayin: $(Get-Date -Format 'dd.MM.yyyy HH:mm')" 2>$null | Out-Null
      $push = git -C $root push origin main 2>&1 | Out-String
      if ($LASTEXITCODE -eq 0) {
        return 'Push basarili. Vercel otomatik deploy baslatti (~1-2 dk).'
      } else {
        return "Push HATASI:`n$push"
      }
    }
    'build' {
      $out = Set-Location $root; npm run build 2>&1 | Out-String
      if ($LASTEXITCODE -eq 0) { return 'Build BASARILI.' }
      else {
        $satirlar = ($out -split "`n") | Select-Object -Last 15
        return "Build HATASI:`n$($satirlar -join "`n")"
      }
    }
    'test' {
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
    'log' {
      $log = git -C $root log --oneline -7 2>$null | Out-String
      return "Son commit'ler:`n$log"
    }
    'ozet' {
      if (Test-Path $dailyScript) {
        & $dailyScript | Out-Null   # ozet scripti mesaji kendisi gonderir
        return 'Gunluk ozet gonderildi.'
      }
      return 'Ozet scripti bulunamadi (telegram-daily.ps1).'
    }
    'gorevler' {
      $kuyruk = Join-Path $root 'scripts\bekleyen-gorevler.txt'
      if (Test-Path $kuyruk) {
        $icerik = Get-Content $kuyruk -Raw
        if (-not [string]::IsNullOrWhiteSpace($icerik)) {
          return "Bekleyen gorevler:`n`n$icerik"
        }
      }
      return 'Bekleyen gorev yok.'
    }
  }
  return $null
}

# --- Anlasilmayan/komut olmayan mesajlar icin yol gosteren yanit ---
$ipucu = @"
Komut anlasilmadi.

Komutlar ("/" olsun olmasin):
  durum    - sistem durumu
  yayinla  - commit + push (yayin)
  derle    - build testi
  test     - site + veritabani saglik
  log      - son commit'ler
  ozet     - gunluk ozet
  gorevler - bekleyen gorev listesi
  yardim   - tum komutlar

Gorev vermek icin: dogrudan cumle olarak yazin
(3+ kelime otomatik gorev olarak kaydedilir).
Ornek: ilan sayfasina arama kutusu ekle
"@

# --- Ana dongu: uzun polling (25 dk sonra cikar; gorev yeniden baslatir) ---
$offset  = Load-Offset
$baslangic = Get-Date

while (((Get-Date) - $baslangic).TotalMinutes -lt 25) {
  $updates = Get-TgUpdates -Offset $offset
  $esik    = [DateTimeOffset]::UtcNow.AddHours(-24).ToUnixTimeSeconds()

  foreach ($u in $updates) {
    $offset = [Math]::Max($offset, [long]$u.update_id + 1)

    $msg = $u.message
    if (-not $msg) { continue }
    if ([string]$msg.chat.id -ne [string]$script:ChatId) { continue }   # Sadece sahip
    if ([long]$msg.date -lt $esik) { continue }                          # 24 saatten eski mesajlari atla

    $text = ([string]$msg.text).Trim()
    if (-not $text) { continue }

    $komut = Resolve-Command -Text $text
    if ($komut) {
      $yanit = Invoke-AgentCommand -Name $komut
    } else {
      # Komut olmayan 3+ kelimelik mesajlar gorev olarak kuyruga alinir
      $kelimeSayisi = ($text -split '\s+' | Where-Object { $_ }).Count
      if ($kelimeSayisi -ge 3) {
        $gorevMetni = $text
        if ($gorevMetni -match '^/?gorev\s+(.+)') { $gorevMetni = $Matches[1].Trim() }
        $kuyruk = Join-Path $root 'scripts\bekleyen-gorevler.txt'
        Add-Content -Path $kuyruk -Value ("[" + (Get-Date -Format 'dd.MM.yyyy HH:mm') + "] " + $gorevMetni) -Encoding UTF8
        $yanit = "Gorev kaydedildi:`n`"$gorevMetni`"`n`nVS Code oturumu acildiginda islenecek, sonucu bu kanaldan iletilecek. (Bekleyenleri gormek icin: gorevler)"
      } else {
        $yanit = $ipucu
      }
    }

    if ($yanit) { Send-Tg $yanit }
    Save-Offset -Value $offset
  }

  Start-Sleep -Seconds 2
}

try { $mutex.ReleaseMutex() } catch { }
