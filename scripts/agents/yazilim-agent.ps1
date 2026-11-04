# ============================================================
# YAZıLıMCı AJANI — kod sağlığı denetimi (LLM'siz)
#   1) TypeScript derleme kontrolü (npx tsc --noEmit)
#   2) TODO/FIXME sayımı (app + lib + components)
#   3) console.log sızıntısı (app/)
#   4) npm audit güvenlik özeti
#   5) Canlı site sağlık kontrolü
#   Rapor → drafts/yazilim/ + Telegram; tsc hatası varsa görev kuyruğu
# Kullanım: powershell -File scripts\agents\yazilim-agent.ps1
# Telegram: /yazilim
# ============================================================

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'
$root     = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$draftDir = Join-Path $root 'drafts\yazilim'
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

$rapor = New-Object System.Collections.Generic.List[string]
$rapor.Add("💻 KOD SAĞLIĞI DENETIMI — $(Get-Date -Format 'dd.MM.yyyy HH:mm')")
$rapor.Add("")

# --- 1) TypeScript ---
$tscOut = cmd /c "cd /d `"$root`" && npx tsc --noEmit 2>&1" | Out-String
$tsHata = ([regex]::Matches($tscOut, 'error TS\d+')).Count
$rapor.Add("1) TypeScript: $tsHata hata")
if ($tsHata -gt 0) {
  ($tscOut -split "`n" | Where-Object { $_ -match 'error TS' } | Select-Object -First 5) | ForEach-Object {
    $rapor.Add("   " + $_.Trim())
  }
}

# --- 2) TODO/FIXME ---
$todo = (Get-ChildItem -Path (Join-Path $root 'app'), (Join-Path $root 'lib'), (Join-Path $root 'components') -Recurse -Include '*.ts','*.tsx' |
         Select-String -Pattern 'TODO|FIXME').Count
$rapor.Add("2) TODO/FIXME işareti: $todo")

# --- 3) console.log sızıntısı ---
$log = (Get-ChildItem -Path (Join-Path $root 'app') -Recurse -Filter '*.tsx' |
        Select-String -Pattern 'console\.log\(').Count
$rapor.Add("3) app/ içinde console.log: $log")

# --- 4) npm audit ---
$auditOut = cmd /c "cd /d `"$root`" && npm audit --omit=dev 2>&1" | Out-String
$guvenlik = if ($auditOut -match '(\d+) vulnerabilities') { $Matches[1] } else { 'bilinmiyor' }
$rapor.Add("4) npm güvenlik açığı (prod): $guvenlik")

# --- 5) Canlı site ---
try {
  $r = Invoke-WebRequest -Uri 'https://stajyeri.vercel.app/' -UseBasicParsing -TimeoutSec 15
  $rapor.Add("5) Canlı site: HTTP $($r.StatusCode)")
} catch {
  $rapor.Add("5) Canlı site: ERİŞİLEMEDİ")
}

$rapor.Add("")
if ($tsHata -gt 0) {
  $rapor.Add("🔴 Aksiyon: $tsHata TS hatası düzeltilmeli — görev kuyruğuna eklendi.")
  $kuyruk = Join-Path $root 'scripts\bekleyen-gorevler.txt'
  Add-Content -Path $kuyruk -Value ("[" + (Get-Date -Format 'dd.MM.yyyy HH:mm') + "] [yazilim-ajani] $tsHata adet TypeScript hatası düzeltilmeli") -Encoding UTF8
} elseif ($log -gt 5) {
  $rapor.Add("🟡 Aksiyon önerisi: $log adet console.log temizlenmeli (Cline görevi).")
} else {
  $rapor.Add("🟢 Kod sağlığı iyi — aksiyon gerekmiyor.")
}

$out = $rapor -join "`n"
$dosya = Join-Path $draftDir ("{0:yyyy-MM-dd}-kod-sagligi.md" -f (Get-Date))
$out | Set-Content -Path $dosya -Encoding UTF8
Send-Tg $out
Write-Output "Kod sağlığı denetimi tamam: $tsHata TS hatası, $todo TODO, $log console.log — rapor: $dosya"
