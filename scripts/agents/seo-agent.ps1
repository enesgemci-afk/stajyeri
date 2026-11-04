# ============================================================
# SEO AJANI — haftalık site denetimi (LLM'siz, salt okuma)
#   1) sitemap.xml'deki URL'leri çek, her birinin HTTP durumuna bak
#   2) Ana sayfaların title/meta description varlığını kontrol et
#   3) Raporu Telegram'a gönder + drafts/seo/ altına yaz
# Kullanım: powershell -File scripts\agents\seo-agent.ps1
# Telegram: /seo
# ============================================================

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'
$root    = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$site    = 'https://stajyeri.vercel.app'
$draftDir = Join-Path $root 'drafts\seo'
New-Item -ItemType Directory -Force -Path $draftDir | Out-Null

$script:Token  = $null
$script:ChatId = $null
foreach ($line in Get-Content (Join-Path $root '.env.local')) {
  if ($line -match '^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$') { $script:Token  = $Matches[1] }
  if ($line -match '^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$')   { $script:ChatId = $Matches[1] }
}
function Send-Tg {
  param([string]$Text)
  try {
    Invoke-RestMethod -Uri "https://api.telegram.org/bot$($script:Token)/sendMessage" -Method Post -Body @{
      chat_id = $script:ChatId; text = $Text; disable_web_page_preview = 'true'
    } | Out-Null
  } catch { }
}

# --- 1) Sitemap URL'leri ---
$urls = @()
try {
  $sm = Invoke-WebRequest -Uri "$site/sitemap.xml" -UseBasicParsing -TimeoutSec 20
  [xml]$x = $sm.Content
  $urls = @($x.urlset.url | ForEach-Object { $_.loc })
} catch { }

$rapor = New-Object System.Collections.Generic.List[string]
$rapor.Add("🔍 SEO HAFTALIK DENETIM — $(Get-Date -Format 'dd.MM.yyyy')")
$rapor.Add("")
$rapor.Add("Sitemap URL sayısı: $($urls.Count)")

# --- 2) URL durum kontrolü (ilk 30) ---
$kirik = @()
$kontrol = @($urls | Select-Object -First 30)
foreach ($u in $kontrol) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 15
    if ($r.StatusCode -ne 200) { $kirik += "$u (HTTP $($r.StatusCode))" }
  } catch {
    $kod = try { [int]$_.Exception.Response.StatusCode } catch { 0 }
    if ($kod -ne 200) { $kirik += "$u (HTTP $kod)" }
  }
}
if ($kontrol.Count -gt 0) {
  $oran = [Math]::Round((($kontrol.Count - $kirik.Count) / $kontrol.Count) * 100)
  $rapor.Add("Örneklenen $($kontrol.Count) URL'de erişilebilirlik: %$oran")
}
if ($kirik.Count -gt 0) {
  $rapor.Add("")
  $rapor.Add("⚠ Kırık/sorunlu URL'ler:")
  $kirik | ForEach-Object { $rapor.Add("  - $_") }
} else {
  $rapor.Add("Kırık URL yok ✓")
}

# --- 3) Ana sayfaların meta kontrolü ---
$rapor.Add("")
$rapor.Add("Meta kontrolü:")
foreach ($path in @('/', '/ilanlar', '/meslek', '/blog')) {
  try {
    $r = Invoke-WebRequest -Uri "$site$path" -UseBasicParsing -TimeoutSec 15
    $t  = if ($r.Content -match '<title[^>]*>([^<]+)</title>') { $Matches[1].Trim() } else { '' }
    $d  = if ($r.Content -match 'name="description" content="([^"]*)"') { $Matches[1].Trim() } else { '' }
    $durum = if ($t -and $d) { 'OK' } elseif ($t) { 'DESCRIPTION EKSIK' } else { 'TITLE EKSIK' }
    $rapor.Add("  $path -> $durum")
  } catch {
    $rapor.Add("  $path -> ERISILEMEDI")
  }
}

# --- 4) Haftalık anahtar kelime önerisi (rotasyonlu) ---
$oneriler = @(
  'kalfalık belgesi nasıl alınır 2026',
  'MESEM kayıt tarihleri',
  'üniversite zorunlu stajı nasıl bulunur',
  'IMEP destek tutarı hesaplama',
  'meslek lisesi mezunu ne kadar maaş alır',
  'çıraklık sözleşmesi nasıl yapılır'
)
$sec = $oneriler[(Get-Date).DayOfYear % $oneriler.Count]
$rapor.Add("")
$rapor.Add("💡 Bu haftanın içerik önerisi: '$sec'")
$rapor.Add("   (blog ajanına aktarmak için Telegram'dan: /blog $sec)")

$out = ($rapor -join "`n")
$dosya = Join-Path $draftDir ("{0:yyyy-MM-dd}-seo-raporu.md" -f (Get-Date))
$out | Set-Content -Path $dosya -Encoding UTF8

Send-Tg $out
Write-Output "SEO raporu tamam: $dosya"
