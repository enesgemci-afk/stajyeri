# ============================================================
# STAJYERI.NET | Telegram Bildirim Scripti
# Kullanim:  .\scripts\telegram-notify.ps1 -Text "Deploy tamamlandi"
# Token ve Chat ID, .env.local dosyasindan okunur:
#   TELEGRAM_BOT_TOKEN=...
#   TELEGRAM_CHAT_ID=...
# ============================================================
param(
  [Parameter(Mandatory = $true)]
  [string]$Text,

  # HTML veya Markdown (Telegram parse_mode). Duz metin icin '' birakin.
  [string]$ParseMode = 'HTML'
)

$ErrorActionPreference = 'Stop'

# 1. .env.local dosyasindan token ve chat id oku
$script:Token = $null
$script:ChatId = $null

$envFile = Join-Path $PSScriptRoot '..\.env.local'
if (Test-Path $envFile) {
  foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$') { $script:Token = $Matches[1] }
    if ($line -match '^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$')  { $script:ChatId = $Matches[1] }
  }
}

if (-not $script:Token -or -not $script:ChatId) {
  Write-Warning 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID .env.local icinde bulunamadi. Bildirim gonderilmedi.'
  exit 1
}

# 2. Telegram Bot API'ye mesaj gonder
$uri = "https://api.telegram.org/bot$($script:Token)/sendMessage"
$body = @{
  chat_id                  = $script:ChatId
  text                     = $Text
  disable_web_page_preview = 'true'
}
if ($ParseMode -ne '') { $body['parse_mode'] = $ParseMode }

try {
  $resp = Invoke-RestMethod -Uri $uri -Method Post -Body $body -TimeoutSec 20
  if ($resp.ok) {
    Write-Host 'Telegram bildirimi gonderildi.'
    exit 0
  } else {
    Write-Warning "Telegram API hata dondurdu: $($resp.description)"
    exit 1
  }
} catch {
  Write-Warning "Telegram gonderimi basarisiz: $($_.Exception.Message)"
  exit 1
}
