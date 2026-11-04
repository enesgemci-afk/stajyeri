# ============================================================
# CLAY MIGRATE — eski kart stillerini clay sistemine toplu çevirir
#   1) Tasarım ajanı paletini genişletir (hover tonları + accent)
#   2) app/ public sayfalarında: bg-white + border border-slate-200
#      (gölgesiz) satırlarını clay karta çevirir
#      Korunanlar: img/input/select/textarea/chip satırları ve
#      panel|admin|okul|sozlesme|cv-olustur|veli-onay klasörleri
#   3) SiteFooter'ı olmayan 3 sayfaya footer ekler
# Idempotenttir. Kullanım: powershell -File scripts\agents\clay-migrate.ps1
# ============================================================

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# --- 1) Tasarım ajanı paletini genişlet ---
$tp  = Join-Path $root 'scripts\agents\tasarim-agent.ps1'
$tpc = [IO.File]::ReadAllText($tp, [Text.Encoding]::UTF8)
$eskiPalet = "'F0FBFC','EBFAFC','F8FAFC','FFFFFF'"
$yeniPalet = "'F0FBFC','EBFAFC','F8FAFC','FFFFFF','00929E','008F9A','E05F00','0EA5E9','6366F1','94A3B8','F59E0B','EC4899','10B981','8B5CF6','13294B'"
if ($tpc.Contains($eskiPalet)) {
  $tpc = $tpc.Replace($eskiPalet, $yeniPalet)
  [IO.File]::WriteAllText($tp, $tpc, [Text.UTF8Encoding]::new($true))
  Write-Output '1) Tasarim ajani paleti genisletildi (hover tonlari + tailwind accent + avatar renkleri)'
} else {
  Write-Output '1) Palet zaten genisletilmis'
}

# --- 2) Clay transform (public sayfalar) ---
$exclude = '\\(panel|admin|okul|sozlesme|cv-olustur|veli-onay)\\'
$files = Get-ChildItem -LiteralPath (Join-Path $root 'app') -Recurse -Filter '*.tsx' | Where-Object {
  $_.FullName -notmatch $exclude
}
$degisenSatir = 0
$degisenDosya = 0
foreach ($f in $files) {
  $lines = [System.Collections.Generic.List[string]]([IO.File]::ReadAllLines($f.FullName, [Text.Encoding]::UTF8))
  $degisti = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $l = $lines[$i]
    if ($l -match 'bg-white' -and
        $l -match 'border border-slate-200' -and
        $l -notmatch 'shadow-\[' -and
        $l -notmatch '<img' -and
        $l -notmatch '<input' -and
        $l -notmatch '<select' -and
        $l -notmatch '<textarea' -and
        $l -notmatch 'placeholder' -and
        $l -notmatch 'type=' -and
        $l -notmatch 'rounded-full') {
      $n = $l -replace '\s?border border-slate-200(/\d+)?', ' shadow-[0_10px_40px_rgba(10,25,49,0.07)]'
      $n = $n -replace 'rounded-2xl', 'rounded-3xl'
      $n = $n -replace ' rounded-xl ', ' rounded-3xl '
      $n = $n -replace ' hover:border-\[#00A8B5\]', ''
      if ($n -ne $l) { $lines[$i] = $n; $degisti = $true; $degisenSatir++ }
    }
  }
  if ($degisti) {
    [IO.File]::WriteAllLines($f.FullName, $lines, [Text.UTF8Encoding]::new($true))
    $degisenDosya++
  }
}
Write-Output "2) $degisenSatir satir, $degisenDosya dosya clay'e cevrildi"

# --- 3) SiteFooter eksik 3 sayfa ---
foreach ($rel in @('app\isletmeler\page.tsx', 'app\ogrenci\kayit\page.tsx', 'app\tesvik-simulasyon\page.tsx')) {
  $p = Join-Path $root $rel
  $c = [IO.File]::ReadAllText($p, [Text.Encoding]::UTF8)
  if (-not $c.Contains('SiteFooter')) {
    $c = $c.Replace("import SiteHeader from '@/components/SiteHeader';", "import SiteHeader from '@/components/SiteHeader';`nimport SiteFooter from '@/components/SiteFooter';")
    $c = $c -replace '(\s*</main>)', "`$1`n`n      <footer>`n        <SiteFooter />`n      </footer>"
    [IO.File]::WriteAllText($p, $c, [Text.UTF8Encoding]::new($true))
    Write-Output "3) SiteFooter eklendi: $rel"
  } else {
    Write-Output "3) Zaten var: $rel"
  }
}
