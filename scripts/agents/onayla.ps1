# ============================================================
# ONAYLA — draft onay akışı
#   /onayla blog       → en son drafts/blog/*.json taslağını
#                        lib/blogYazilari.ts'e merge eder + commit + push
#                        → Vercel otomatik deploy → BLOG CANLI
#   /onayla <dosya>    → drafts/ altındaki herhangi bir dosyayı
#                        commit + push eder (Cline görev notuyla)
# Kullanım: powershell -File scripts\agents\onayla.ps1 [-Target blog|<dosya>]
# Telegram: /onayla blog   (veya /onayla drafts/pazarlama/2026-xx.md)
# ============================================================

param([string]$Target = 'blog')

$ErrorActionPreference = 'Continue'
$root     = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$draftDir = Join-Path $root 'drafts'

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

function Git-Publish {
  param([string]$Message)
  git -C $root add -A 2>&1 | Out-Null
  git -C $root commit -m $Message 2>&1 | Out-Null
  $push = git -C $root push origin main 2>&1 | Out-String
  return ($push -match 'main')
}

# --- 1) BLOG ONAYI ---
if ($Target -eq '' -or $Target -eq 'blog') {
  $son = Get-ChildItem (Join-Path $draftDir 'blog') -Filter '*.json' -ErrorAction SilentlyContinue |
         Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $son) {
    Send-Tg "⚠ Onaylanacak blog taslağı bulunamadı. Önce /blog ile üret."
    Write-Output 'Taslak yok.'
    exit 0
  }

  $j = Get-Content $son.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  $tsPath = Join-Path $root 'lib\blogYazilari.ts'
  $src = Get-Content $tsPath -Raw -Encoding UTF8

  if ($src -match "slug: '$($j.slug)'") {
    Send-Tg "⚠ '$($j.slug)' zaten yayında — tekrar onaylanmadı."
    Write-Output 'Slug zaten mevcut.'
    exit 0
  }

  $esc = { param($s) ([string]$s).Replace("'", "\'") }
  $blockTs = ($j.blocks | ForEach-Object {
    "      { type: '$($_.type)', text: '$(& $esc $_.text)' }"
  }) -join ",`n"

  $obj = @(
    '  {',
    "    slug: '$(& $esc $j.slug)',",
    "    title: '$(& $esc $j.title)',",
    "    description: '$(& $esc $j.description)',",
    "    date: '$($j.date)',",
    "    category: '$(& $esc $j.category)',",
    "    emoji: '$($j.emoji)',",
    "    readMin: $($j.readMin),",
    '    blocks: [',
    $blockTs,
    '    ],',
    '  },'
  ) -join "`n"

  $marker = '/** slug → yazı hızlı erişim */'
  $idx    = $src.IndexOf($marker)
  $close  = $src.LastIndexOf('];', $idx)
  if ($idx -lt 0 -or $close -lt 0) {
    Send-Tg '⚠ blogYazilari.ts yapısı beklenmedik — merge yapılmadı. Cline oturumunda elle ekle.'
    Write-Output 'Merge noktası bulunamadı.'
    exit 0
  }
  $src = $src.Substring(0, $close) + $obj + ",`n];" + $src.Substring($close + 2)
  Set-Content -Path $tsPath -Value $src -Encoding UTF8

  $basarili = Git-Publish "Blog yayini: $($j.title) (ajant onayli)"
  if ($basarili) {
    Send-Tg "🚀 BLOG YAYINDA!`n`n$($j.emoji) $($j.title)`nhttps://stajyeri.vercel.app/blog/$($j.slug)`n`nDeploy 1-2 dk içinde tamamlanır."
    Write-Output "Yayınlandı: /blog/$($j.slug)"
  } else {
    Send-Tg '⚠ Merge yapıldı ama push başarısız — git durumunu kontrol et.'
    Write-Output 'Push hatası.'
  }
  exit 0
}

# --- 2) GENEL DOSYA ONAYI ---
$hedef = Join-Path $root $Target
if (Test-Path $hedef) {
  $basarili = Git-Publish "Draft onaylandi: $Target"
  if ($basarili) {
    Send-Tg "✅ Onaylandı ve push edildi: $Target`n(Cline görev kuyruğuna işlensin diye not düş: /gorev $Target taslağını siteye entegre et)"
    Write-Output "Push edildi: $Target"
  } else {
    Send-Tg "⚠ Push başarısız: $Target"
  }
} else {
  Send-Tg "⚠ Dosya bulunamadı: $Target"
  Write-Output "Bulunamadı: $Target"
}
