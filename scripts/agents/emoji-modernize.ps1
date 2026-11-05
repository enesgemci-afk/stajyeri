# ============================================================
# EMOJI MODERNIZE v2 — UI emojilerini lucide ikonlarına çevirir
#   Not: JSX attribute'lari tek tirnak ile yazilir; PS string'leri
#   cift tirnak ile. Böylece quote cakismasi imkansizlasir.
#   Idempotenttir. Kullanim: powershell -File scripts\agents\emoji-modernize.ps1
# ============================================================

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Emoji sabitleri (ConvertFromUtf32 — astral kod noktaları doğru çevrilir)
$EM_ZAP      = [System.Char]::ConvertFromUtf32(0x26A1)   # ⚡
$EM_SPARK    = [System.Char]::ConvertFromUtf32(0x2728)   # ✨
$EM_MORTAR   = [System.Char]::ConvertFromUtf32(0x1F393)  # 🎓
$EM_MAIL     = [System.Char]::ConvertFromUtf32(0x1F4EC)  # 📬
$EM_MAP      = [System.Char]::ConvertFromUtf32(0x1F5FA)  # 🗺️
$EM_COMPASS  = [System.Char]::ConvertFromUtf32(0x1F9ED)  # 🧭
$EM_PAGE     = [System.Char]::ConvertFromUtf32(0x1F4C4)  # 📄
$EM_LANDMARK = [System.Char]::ConvertFromUtf32(0x1F3DB)  # 🏛️
$EM_BOOKS    = [System.Char]::ConvertFromUtf32(0x1F4DA)  # 📚
$EM_WALLET   = [System.Char]::ConvertFromUtf32(0x1F4B0)  # 💰
$EM_NEWS     = [System.Char]::ConvertFromUtf32(0x1F4F0)  # 📰

function Update-FileText {
  param([string]$Path, [string]$Eski, [string]$Yeni)
  if ([string]::IsNullOrEmpty($Eski)) { Write-Output '  · bos eski deger, atlandi'; return }
  $c = [IO.File]::ReadAllText($Path, [Text.Encoding]::UTF8)
  if ($c.Contains($Eski)) {
    $c = $c.Replace($Eski, $Yeni)
    [IO.File]::WriteAllText($Path, $c, [Text.UTF8Encoding]::new($true))
    Write-Output '  ✔ degisti'
  } else {
    Write-Output '  · bulunamadi (zaten yapilmis olabilir)'
  }
}

Write-Output '1) isveren/panel — Zap...'
$ip = Join-Path $root 'app\isveren\panel\page.tsx'
Update-FileText $ip ($EM_ZAP + ' Ort.') ("<Zap className='w-3.5 h-3.5 inline' /> Ort.")
Update-FileText $ip ("  Building2,", "  Building2,`n  Zap,")

Write-Output '2) panel — Sparkles + GraduationCap...'
$pp = Join-Path $root 'app\panel\page.tsx'
Update-FileText $pp ($EM_SPARK + ' {skills.length} beceri') ("<Sparkles className='w-3 h-3 inline' /> {skills.length} beceri")
Update-FileText $pp ($EM_MORTAR + ' Okulum') ("<GraduationCap className='w-3.5 h-3.5 inline' /> Okulum")

Write-Output '3) anasayfa — Mail...'
$hp = Join-Path $root 'app\page.tsx'
Update-FileText $hp ($EM_MAIL + ' Haftalık staj bülteni') ("<Mail className='w-3.5 h-3.5 inline' /> Haftalık staj bülteni")
Update-FileText $hp ("  Landmark,", "  Landmark,`n  Mail,")

Write-Output '4) StudentSidebar — kaynak ikonlari...'
$ss = Join-Path $root 'app\panel\StudentSidebar.tsx'
Update-FileText $ss ($EM_MAP) ('ICON_MAP_PLACEHOLDER_1')
Update-FileText $ss ($EM_COMPASS) ('ICON_MAP_PLACEHOLDER_2')
Update-FileText $ss ($EM_PAGE) ('ICON_MAP_PLACEHOLDER_3')
Update-FileText $ss ($EM_WALLET) ('ICON_MAP_PLACEHOLDER_4')
Update-FileText $ss ($EM_NEWS) ('ICON_MAP_PLACEHOLDER_5')
Update-FileText $ss ("icon: 'ICON_MAP_PLACEHOLDER_1'", 'icon: Route')
Update-FileText $ss ("icon: 'ICON_MAP_PLACEHOLDER_2'", 'icon: Compass')
Update-FileText $ss ("icon: 'ICON_MAP_PLACEHOLDER_3'", 'icon: FileText')
Update-FileText $ss ("icon: 'ICON_MAP_PLACEHOLDER_4'", 'icon: Wallet')
Update-FileText $ss ("icon: 'ICON_MAP_PLACEHOLDER_5'", 'icon: Newspaper')
Update-FileText $ss ('<span>{s.icon}</span> {s.label}', "<s.icon className='w-3.5 h-3.5 flex-shrink-0' /> {s.label}")
Update-FileText $ss ('  Sparkles, User }', '  Sparkles, User, Route, Compass, FileText, Wallet, Newspaper }')

Write-Output '5) isveren Sidebar — kaynak ikonlari...'
$es = Join-Path $root 'app\isveren\panel\Sidebar.tsx'
Update-FileText $es ($EM_LANDMARK) ('ICON_MAP_PLACEHOLDER_1')
Update-FileText $es ($EM_BOOKS) ('ICON_MAP_PLACEHOLDER_2')
Update-FileText $es ($EM_WALLET) ('ICON_MAP_PLACEHOLDER_3')
Update-FileText $es ($EM_NEWS) ('ICON_MAP_PLACEHOLDER_4')
Update-FileText $es ("icon: 'ICON_MAP_PLACEHOLDER_1'", 'icon: Landmark')
Update-FileText $es ("icon: 'ICON_MAP_PLACEHOLDER_2'", 'icon: BookOpen')
Update-FileText $es ("icon: 'ICON_MAP_PLACEHOLDER_3'", 'icon: Wallet')
Update-FileText $es ("icon: 'ICON_MAP_PLACEHOLDER_4'", 'icon: Newspaper')
Update-FileText $es ('<span>{s.icon}</span> {s.label}', "<s.icon className='w-3.5 h-3.5 flex-shrink-0' /> {s.label}")
Update-FileText $es ('  Users, MapPin }', '  Users, MapPin, Landmark, BookOpen, Wallet, Newspaper }')

Write-Output ''
Write-Output 'Emoji modernizasyon v2 tamam.'

