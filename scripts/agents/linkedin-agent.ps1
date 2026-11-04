# ============================================================
# LINKEDIN AJANI — haftalık içerik takvimi (LLM'siz, gerçek veri)
#   LinkedIn kitlesi: işverenler + veliler + eğitimciler (profesyonel).
#   Üretir:
#     1) 5 günlük içerik takvimi (Pzt-Cuma, 4 hafta rotasyonlu açılar)
#     2) Veriye dayalı istatistik postu (Supabase aktif ilanlar)
#     3) İşveren hedefli IMEP postu (B2B)
#     4) Alan spotlight'ı (en çok ilanlı alandan)
#     5) Hashtag seti + yayın saat önerileri
#   → drafts/linkedin/<tarih>-takvim.md + Telegram önizleme
#   Onay: /onayla <dosya>
# Kullanım: powershell -File scripts\agents\linkedin-agent.ps1
# Telegram: /linkedin
# NOT: LinkedIn tonu — profesyonel, "siz" dili, az emoji, paragraf uyumlu.
# ============================================================

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'
$root     = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$draftDir = Join-Path $root 'drafts\linkedin'
New-Item -ItemType Directory -Force -Path $draftDir | Out-Null

$script:Token  = $null
$script:ChatId = $null
$AnonKey       = $null
foreach ($line in Get-Content (Join-Path $root '.env.local')) {
  if ($line -match '^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$') { $script:Token  = $Matches[1] }
  if ($line -match '^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$')   { $script:ChatId = $Matches[1] }
  if ($line -match '^\s*ANON_KEY\s*=\s*(.+?)\s*$')           { $AnonKey       = $Matches[1] }
}
function Send-Tg {
  param([string]$Text)
  try {
    Invoke-RestMethod -Uri "https://api.telegram.org/bot$($script:Token)/sendMessage" -Method Post -Body @{
      chat_id = $script:ChatId; text = $Text; disable_web_page_preview = 'true'
    } | Out-Null
  } catch { }
}

# --- Gerçek veri ---
$SB  = 'https://eftlmmunitzrnfenqlbv.supabase.co'
$H   = @{ apikey = $AnonKey; Authorization = "Bearer $AnonKey" }
$jobs = @()
$firmaSay = 0
try {
  $jobs = Invoke-RestMethod -Uri "$SB/rest/v1/job_posts?select=city,field_name,program_type&is_active=eq.true" -Headers $H -TimeoutSec 20
  $cd   = Invoke-RestMethod -Uri "$SB/rest/v1/company_details?select=id&limit=200" -Headers $H -TimeoutSec 20
  $firmaSay = $cd.Count
} catch { }

$toplam = $jobs.Count
$sehir  = @{}
$alan   = @{}
$univ   = 0
foreach ($j in $jobs) {
  if ($j.city)       { $sehir[$j.city]       = 1 + ($sehir[$j.city]       | ForEach-Object { $_ }) }
  if ($j.field_name) { $alan[$j.field_name]  = 1 + ($alan[$j.field_name]  | ForEach-Object { $_ }) }
  if ($j.program_type -like 'UNIV*') { $univ++ }
}
$topSehir = @($sehir.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 3)
$topAlan  = @($alan.GetEnumerator()  | Sort-Object Value -Descending | Select-Object -First 3)
$spotAlan = if ($topAlan.Count -gt 0) { $topAlan[0].Key } else { 'Elektrik-Elektronik Teknolojisi' }

# --- 4 Hafta rotasyonlu açı seti (aynı post tekrar etmesin) ---
$haftaNo = [Math]::Ceiling(((Get-Date).DayOfYear) / 7) % 4

$acilar = @(
  @{ P1='Veriyle konuşalım'; P2='İşveren ekonomisi'; P3='Öğrenci hakları'; P4='Alan spotlight'; P5='Topluluk çağrısı' },
  @{ P1='Bölgesel fırsat haritası'; P2='Usta öğreticilik değeri'; P3='Ücret tabloları netleşti'; P4='Alan spotlight'; P5='Veliye mektup' },
  @{ P1='Sektör talebi'; P2='İşveren ekonomisi'; P3='Kalfalıktan üniversiteye'; P4='Alan spotlight'; P5='Mezun hikayesi çağrısı' },
  @{ P1='Veriyle konuşalım'; P2='Yeni işletmeler katılıyor'; P3='Öğrenci hakları'; P4='Alan spotlight'; P5='İşveren çağrısı' }
)
$aci = $acilar[$haftaNo]

$gunler = @('Pazartesi','Salı','Çarşamba','Perşembe','Cuma')
$saatler = @('08:30','12:15','09:00','17:45','10:30')

$hashtagUc = if ($topAlan.Count -gt 0) { '#' + ($topAlan[0].Key -replace '[^A-Za-zÇĞİÖŞÜüöşğıç ]','' -replace '\s+','') } else { '#staj' }

# --- TAKVİM ÜRETİMİ ---
$takvim = New-Object System.Collections.Generic.List[string]
$takvim.Add("# LINKEDIN HAFTALIK İÇERİK TAKVİMİ — $(Get-Date -Format 'dd.MM.yyyy') haftası")
$takvim.Add("")
$takvim.Add("Veri: $toplam aktif ilan · $firmaSay kayıtlı işletme · $univ üniversite stajı · En çok ilan: $spotAlan")
$takvim.Add("Ton: profesyonel, 'siz' dili, az emoji (BRAND-VOICE.md)")
$takvim.Add("")

# Pazartesi — Açı P1 (veri/istatistik)
$takvim.Add("## $($gunler[0]) · $saatler[0] · Açı: $($aci.P1)")
$takvim.Add('```')
$takvim.Add("$toplam aktif staj ilanı, $firmaSay kayıtlı işletme.")
$takvim.Add("")
$takvim.Add("Türkiye'de mesleki eğitimi dijitalleştirmek için yola çıktık — ve rakamlar konuşuyor:")
$takvim.Add(($topSehir | ForEach-Object { "• $($_.Key): $($_.Value) aktif ilan" }) -join "`n")
$takvim.Add("")
$takvim.Add("Öğrenci arayan her işletmeyi ücretsiz listeliyoruz: stajyeri.net/isletmeler")
$takvim.Add("#staj #MESEM #meslekieğitim #kariyer")
$takvim.Add('```')
$takvim.Add("")

# Salı — Açı P2 (işveren ekonomisi, B2B)
$takvim.Add("## $($gunler[1]) · $saatler[1] · Açı: $($aci.P2)")
$takvim.Add('```')
$takvim.Add("İşletmenize stajyer almak artık maliyet değil, destek meselesi.")
$takvim.Add("")
$takvim.Add("İMEP kapsamında çırak öğrenci eğitirseniz:")
$takvim.Add("• Öğrenci ücreti ve SGK primleri devlet desteğiyle karşılanır")
$takvim.Add("• İşletmenize öğrenci başına brüt asgari ücretin %30'u tutarında destek ödenir")
$takvim.Add("• Belgeli usta öğreticiniz varsa kayıt 1 dakika sürer")
$takvim.Add("")
$takvim.Add("Ücretsiz ilan: stajyeri.net/ilan-ver")
$takvim.Add("#İMEP #işveren #stajyer #İK")
$takvim.Add('```')
$takvim.Add("")

# Çarşamba — Açı P3 (öğrenci/veli hakları)
$takvim.Add("## $($gunler[2]) · $saatler[2] · Açı: $($aci.P3)")
$takvim.Add('```')
$takvim.Add("Staja başlayan her öğrencinin bilmesi gereken 3 hak:")
$takvim.Add("")
$takvim.Add("1) Çırak ücreti: net asgari ücretin en az %30'u (kalfa eğitiminde %50)")
$takvim.Add("2) İş kazası ve meslek hastalıkları sigortası: zorunlu, primini devlet öder")
$takvim.Add("3) Eğitim sözleşmesi: veli onayı olmadan imzalanamaz")
$takvim.Add("")
$takvim.Add("Haklarınızı bilin, stajınızı bilinçli yaşayın: stajyeri.net/staj-ucretleri")
$takvim.Add("#3308 #stajhakları #MESEM #veli")
$takvim.Add('```')
$takvim.Add("")

# Perşembe — Açı P4 (alan spotlight)
$takvim.Add("## $($gunler[3]) · $saatler[3] · Açı: $($aci.P4) — $spotAlan")
$takvim.Add('```')
$takvim.Add("Bu haftanın alanı: $spotAlan")
$takvim.Add("")
$spotCount = if ($topAlan.Count -gt 0) { $topAlan[0].Value } else { 0 }
$takvim.Add("Platformumuzda şu an $spotCount aktif $spotAlan staj ilanı var.")
$takvim.Add("Bu alanda çıraklıktan kalfalığa, kalfalıktan ustalığa uzanan resmî bir yol var —")
$takvim.Add("ücret hakları ve yol haritasıyla birlikte: stajyeri.net/meslek")
$takvim.Add("")
$takvim.Add("#$hashtagUc #staj #kariyer")
$takvim.Add('```')
$takvim.Add("")

# Cuma — Açı P5 (çağrı)
$takvim.Add("## $($gunler[4]) · $saatler[4] · Açı: $($aci.P5)")
$takvim.Add('```')
$takvim.Add("Haftanın kapanış çağrısı:")
$takvim.Add("")
$takvim.Add("Öğrenciyseniz: profilinizi oluşturun, işletmeler sizi bulsun → stajyeri.net/kayit")
$takvim.Add("İşletmeyken: 1 dakikada staj ilanı yayınlayın → stajyeri.net/ilan-ver")
$takvim.Add("")
$takvim.Add("$(if ($univ -gt 0) { "Üniversite stajı arayanlara özel filtreler de yayında — zorunlu ve gönüllü/yaz stajı ayrımıyla." } else { "Üniversite zorunlu ve gönüllü/yaz stajı filtreleri yayında." })")
$takvim.Add("#staj #üniversite #MESEM #işealım")
$takvim.Add('```')
$takvim.Add("")

# --- Yayın ipuçları ---
$takvim.Add("## Yayın İpuçları")
$takvim.Add("- LinkedIn organik erişimi için hafta içi 08:00-10:00 en verimli pencere")
$takvim.Add("- Her postun ilk 2 satırı 'hook': 'devamını oku' katlanmasından önce görünür")
$takvim.Add("- Görsel eklemek erişimi ~%20 artırır: bento ekran görüntüleri veya ilan kartları kullanın")
$takvim.Add("- Hashtag sayısı: 3-5 arası (fazlası erişimi düşürür)")
$takvim.Add("- Etiketlenecekler: MEB il/ilçe müdürlükleri, OSB yönetimleri, esnaf odaları (varsa işletme sayfaları)")

$out = $takvim -join "`n"
$dosya = Join-Path $draftDir ("{0:yyyy-MM-dd}-takvim.md" -f (Get-Date -Format 'yyyy-MM-dd'))
$out | Set-Content -Path $dosya -Encoding UTF8

$onizleme = "📘 LINKEDIN TAKVİMİ hazır ($(Get-Date -Format 'dd.MM')) — $toplam aktif ilan verisiyle`n`n$(($gunler | ForEach-Object { "• $_" }) -join "`n")`n`nTam takvim: drafts\linkedin\$((Get-Date -Format 'yyyy-MM-dd'))-takvim.md`nOnay: /onayla $((Get-Date -Format 'yyyy-MM-dd'))-takvim.md (drafts/linkedin altında)"
Send-Tg $onizleme
Write-Output "LinkedIn takvimi hazır: $dosya (5 gün × $($aci.P1) açı seti, hafta rotasyonu: $haftaNo)"
