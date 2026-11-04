# ============================================================
# TASARIMCı AJANI — tasarım tutarlılık denetimi (LLM'siz)
#   app/**/*.tsx dosyalarını tarar; anasayfa tasarım diline
#   (Claymorphism + Bento + logo paleti) uymayan noktaları bulur:
#     1) Eski kart stili: bg-white + border ama clay gölgesi yok
#     2) Palet dışı hex renkler (logo paleti + izinliler dışı)
#     3) SiteFooter'ı olmayan ana içerik sayfaları
#   Rapor → drafts/tasarim/ + Telegram; yüksek ihlal → görev kuyruğu
# Kullanım: powershell -File scripts\agents\tasarim-agent.ps1
# Telegram: /tasarim
# ============================================================

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'
$root     = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$draftDir = Join-Path $root 'drafts\tasarim'
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

# --- İzinli palet (logo + kullanılan gradient/ara tonlar) ---
$izinli = @(
  '0A1931','00A8B5','00E5FF','FF6B00','FF9E4D','FF8F3F','7DE3EE',
  '10294D','0D2244','0D3B4F','8B00FF','0080FF','22C55E',
  'F0FBFC','EBFAFC','F8FAFC','FFFFFF','00929E','008F9A','E05F00','0EA5E9','6366F1','94A3B8','F59E0B','EC4899','10B981','8B5CF6','13294B','00929E','008F9A','E05F00','0EA5E9','6366F1','94A3B8','F59E0B','EC4899','10B981','8B5CF6','13294B'
)

$dosyalar = Get-ChildItem -Path (Join-Path $root 'app') -Recurse -Filter '*.tsx'
$eskiKart = 0
$paletDisi = @{}
$footersiz = @()
$clayKart = 0
$chipSay = 0

foreach ($d in $dosyalar) {
  $rel = $d.FullName.Replace("$root\app\", '')
  $c = Get-Content $d.FullName -Raw -Encoding UTF8

  # 1) Eski kart stili: bg-white + border ama clay gölge yok
  $eski = ([regex]::Matches($c, 'bg-white [^\r\n"]*border border-slate-200(?!.*shadow-\[)')).Count
  if ($rel -notmatch 'panel|admin|okul|sozlesme|cv-olustur') { $eskiKart += $eski }

  # 2) Clay kart sayacı (pozitif metrik)
  $clayKart += ([regex]::Matches($c, 'shadow-\[0_10px_40px')).Count
  $chipSay  += ([regex]::Matches($c, 'rounded-full bg-\[#00A8B5\]/10 border border-\[#00A8B5\]/20')).Count

  # 3) Palet dışı hex renkler
  $hexler = [regex]::Matches($c, '#([0-9A-Fa-f]{6})\b') | ForEach-Object { $_.Groups[1].Value.ToUpper() }
  foreach ($h in ($hexler | Sort-Object -Unique)) {
    if ($izinli -notcontains $h) {
      if (-not $paletDisi.ContainsKey($h)) { $paletDisi[$h] = 0 }
      $paletDisi[$h]++
    }
  }

  # 4) SiteFooter'sız ana sayfa (footer'ı olan sayfalar için kontrol)
  if ($c -match '</main>' -and $c -notmatch '<SiteFooter' -and $rel -notmatch 'cv-olustur|sozlesme|veli-onay|admin|panel|okul|isveren') {
    $footersiz += $rel
  }
}

$ihlal = $eskiKart + $paletDisi.Count + $footersiz.Count

$rapor = New-Object System.Collections.Generic.List[string]
$rapor.Add("🎨 TASARIM TUTARLILIK DENETIMI — $(Get-Date -Format 'dd.MM.yyyy')")
$rapor.Add("")
$rapor.Add("✅ Clay kart sayısı: $clayKart")
$rapor.Add("✅ Eyebrow chip sayısı: $chipSay")
$rapor.Add("")
$rapor.Add("İhlal toplamı: $ihlal")
$rapor.Add("  • Eski kart stili (clay'e geçmemiş): $eskiKart")
$rapor.Add("  • Palet dışı renk çeşidi: $($paletDisi.Count)")
$rapor.Add("  • SiteFooter'sız sayfa: $($footersiz.Count)")

if ($paletDisi.Count -gt 0) {
  $rapor.Add("")
  $rapor.Add("Palet dışı renkler (dosya sayısı):")
  ($paletDisi.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 8) | ForEach-Object {
    $rapor.Add("  • #$($_.Key) — $($_.Value) dosya")
  }
}
if ($footersiz.Count -gt 0) {
  $rapor.Add("")
  $rapor.Add("SiteFooter eksik: " + (($footersiz | Select-Object -First 6) -join ', '))
}

$rapor.Add("")
if ($ihlal -eq 0) {
  $rapor.Add("🎉 Tasarım dili tamamen tutarlı — aksiyon gerekmiyor.")
} else {
  $rapor.Add("💡 Öneri: İhlalleri gidermek için Cline görevi aç:")
  $rapor.Add("   'tasarim denetimindeki $ihlal ihlali clay sistemine çevir'")
}

$out = $rapor -join "`n"
$dosya = Join-Path $draftDir ("{0:yyyy-MM-dd}-tasarim-raporu.md" -f (Get-Date))
$out | Set-Content -Path $dosya -Encoding UTF8
Send-Tg $out

# Yüksek ihlal varsa görev kuyruğuna otomatik düş
if ($ihlal -gt 10) {
  $kuyruk = Join-Path $root 'scripts\bekleyen-gorevler.txt'
  Add-Content -Path $kuyruk -Value ("[" + (Get-Date -Format 'dd.MM.yyyy HH:mm') + "] [tasarim-ajani] $ihlal tasarım ihlali clay sistemine çevrilmeli (rapor: drafts/tasarim)") -Encoding UTF8
  Send-Tg "📌 Görev kuyruğuna eklendi: tasarım ihlalleri düzeltilmeli."
}

Write-Output "Tasarım denetimi tamam: $ihlal ihlal, rapor: $dosya"
