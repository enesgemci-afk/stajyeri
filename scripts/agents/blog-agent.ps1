# ============================================================
# İÇERİK (BLOG) AJANI — haftalık blog taslağı
#   1) Konu rotasyonundan seçer (veya -Topic ile verilir)
#   2) ANTHROPIC_API_KEY .env.local'de varsa makaleyi LLM yazar
#      (BRAND-VOICE.md kuralları sistem prompt'una girer)
#      Yoksa kanuni rakamları doğru olan iskelet üretir
#   3) drafts/blog/<tarih>-<slug>.json olarak kaydeder (BlogPost şeması)
#   4) Telegram'a önizleme gönderir
#   Onay: Telegram'dan /onayla blog → onayla.ps1 lib'e merge + publish
# Kullanım: powershell -File scripts\agents\blog-agent.ps1 [-Topic "konu"]
# Telegram: /blog   (veya /blog üniversite yaz stajı)
# ============================================================

param([string]$Topic = '')

$ErrorActionPreference = 'Continue'
$root     = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$draftDir = Join-Path $root 'drafts\blog'
New-Item -ItemType Directory -Force -Path $draftDir | Out-Null

$script:Token  = $null
$script:ChatId = $null
$AnthropicKey  = $null
foreach ($line in Get-Content (Join-Path $root '.env.local')) {
  if ($line -match '^\s*TELEGRAM_BOT_TOKEN\s*=\s*(.+?)\s*$')   { $script:Token  = $Matches[1] }
  if ($line -match '^\s*TELEGRAM_CHAT_ID\s*=\s*(.+?)\s*$')     { $script:ChatId = $Matches[1] }
  if ($line -match '^\s*ANTHROPIC_API_KEY\s*=\s*(.+?)\s*$')    { $AnthropicKey  = $Matches[1] }
}
function Send-Tg {
  param([string]$Text)
  try {
    Invoke-RestMethod -Uri "https://api.telegram.org/bot$($script:Token)/sendMessage" -Method Post -Body @{
      chat_id = $script:ChatId; text = $Text; disable_web_page_preview = 'true'
    } | Out-Null
  } catch { }
}

# --- Konu rotasyonu (KANUNİ RAKAMLAR: lib/constants.ts ile senkron — güncellemeyi unutma) ---
$KONULAR = @(
  @{ slug='mesem-maas-rehberi'; title='MESEM maaşı ne kadar? Çırak ve kalfa ücret tablosu'; emoji='💰'; kategori='Ücret & Haklar';
     ozet=@('Çırak (9-11): net asgari ücretin en az %30''u','Kalfa (12): en az %50''si — sınıf atladıkça artar','İMEP: işletmeye brüt asgari ücretin %30''u destek, SGK primleri Hazine''den','Ücret ay sonunda eğitim sözleşmesi uyarınca ödenir','Güncel tutarlar stajyeri.net/staj-ucretleri hesaplayıcısında') },
  @{ slug='kalfa-sinavi-hazirlik'; title='Kalfalık sınavına nasıl hazırlanırım? Pratik plan'; emoji='⚙️'; kategori='Belgeler & Sınavlar';
     ozet=@('1) Okulun mesleki eğitim birimine başvuru kaydı','2) Teorik modülleri tamamla, eksik varsa tamamlama eğitimi al','3) Pratikte usta öğreticinle tüm becerileri tek tek tekrar et','4) Sınavda hem teori hem beceri ölçülür','Kalfalık belgesi mesleği tek başına yapma yetkisi verir') },
  @{ slug='universite-yaz-staji-takvim'; title='Yaz stajı takvimi: ne zaman başvurulmalı?'; emoji='📅'; kategori='Başvuru & Mülakat';
     ozet=@('Firmalar kontenjanları çoğunlukla Mart-Nisan''da açar','Şubat-Mart: CV hazırla, hedef firma listesi çıkar','Mart: toplu başvuruya çık, Nisan sonuna bırakma','Üniversite stajyerlerinin SGK primlerini devlet karşılar','Stajyeri.net''te Üniversite Stajı filtreleriyle bölümüne göre süz') },
  @{ slug='usta-ogreticilik-yolu'; title='Usta öğreticilik: öğrenci eğitirken gelir ve itibar'; emoji='🏅'; kategori='Girişimcilik';
     ozet=@('Usta öğreticilik belgesi ustalık sonrası alınır','Öğrenci eğitirken İMEP desteğinden işletme yararlanır','Eğitmenlik, maaş pazarlığında güçlü kozdur','Halk eğitim merkezlerinden ücretsiz eğitimler takip edilebilir') },
  @{ slug='veli-rehberi-meslek-egitimi'; title='Veli rehberi: çocuğunuz meslek lisesine giderken bilmeniz gerekenler'; emoji='👨‍👩‍👦'; kategori='Yol Seçimi';
     ozet=@('MESEM 4+1 modeli: yılın 12 ayı işletmede, haftada 1 gün okulda','İş kazası ve meslek hastalıkları sigortası zorunludur','Veli onayı olmadan eğitim sözleşmesi imzalanamaz','İlk 3 ayda sigorta ve ücret düzenli kontrol edilmeli','Alan değiştirmek felaket değil — doğru alana giden veridir') },
)

# --- Konu seçimi ---
$sec = $null
if ($Topic) {
  foreach ($k in $KONULAR) { if ($k.slug -like "*$($Topic.ToLower())*" -or $k.title -like "*$Topic*") { $sec = $k } }
  if (-not $sec) { $sec = @{ slug=($Topic.ToLower() -replace '[^a-z0-9]+','-').Trim('-'); title=$Topic; emoji='📝'; kategori='Kariyer Rehberi'; ozet=@() } }
} else {
  $sec = $KONULAR[(Get-Date).DayOfYear % $KONULAR.Count]
}

$tarih  = Get-Date -Format 'yyyy-MM-dd'
$slug   = "$($sec.slug)"
$tsPath = Join-Path $root 'lib\blogYazilari.ts'
if ((Test-Path $tsPath) -and ((Get-Content $tsPath -Raw) -match "slug: '$slug'")) { $slug = "$slug-2" }

# --- Üretim: LLM varsa makale, yoksa iskelet ---
$blocks = @()
$kaynak = 'iskelet (LLM anahtarı yok — kanuni rakamlar sabit dosyadan)'
if ($AnthropicKey) {
  try {
    $sys = "Sen Stajyeri.net'in içerik ajanısın. Ton: genç dostu, güven veren, 'sen' dili. Yasak: garanti vaatleri, uydurma rakamlar. KANUNİ GERÇEKLER (kesinlikle bunlara uy): çırak ücreti net asgari ücretin en az %30'u; kalfa %50; MTAL %30 ve SGK primi devletçe; İMEP işletmeye brüt asgari ücretin %30'u destek; üniversite stajında ücret serbest, SGK primini Genç İstihdam Paketi karşılar; usta yolu kalfalık+3 yıl çalışma+eğitim+sınav. Çıktı: SADECE geçerli JSON, açıklama yok."
    $usr = "Konu: '$($sec.title)'. Aşağıdaki JSON şemasına birebir uyan Türkçe makale üret: { slug, title, description, date: '$tarih', category, emoji, readMin, blocks: [ { type: 'p'|'h2'|'li'|'note', text } ] }. 10-16 blok, metinlerde tek tırnak kullanma."
    $body = @{ model = 'claude-sonnet-4-5'; max_tokens = 4000; system = $sys; messages = @(@{ role = 'user'; content = $usr }) } | ConvertTo-Json -Depth 6
    $r = Invoke-RestMethod -Uri 'https://api.anthropic.com/v1/messages' -Method Post -Headers @{
      'x-api-key' = $AnthropicKey; 'anthropic-version' = '2023-06-01'; 'content-type' = 'application/json'
    } -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 180
    $txt = $r.content[0].text
    $s0 = $txt.IndexOf('{'); $s1 = $txt.LastIndexOf('}')
    if ($s0 -ge 0 -and $s1 -gt $s0) {
      $j = ($txt.Substring($s0, $s1 - $s0 + 1) | ConvertFrom-Json)
      if ($j.slug -and $j.title -and $j.blocks) {
        $blocks = $j.blocks
        $kaynak = 'Anthropic Claude'
        if ($j.slug)  { $slug = $j.slug }
        if ($j.title) { $sec.title = $j.title }
        if ($j.emoji) { $sec.emoji  = $j.emoji }
      }
    }
  } catch { $kaynak = 'iskelet (LLM hatası: fallback)' }
}
if ($blocks.Count -eq 0) {
  $blocks = @(
    @{ type = 'p';   text = "$($sec.title) — bu rehberde adım adım ne yapman gerektiğini topladık." },
    @{ type = 'h2'; text = 'Bilmen gerekenler' }
  )
  foreach ($o in $sec.ozet) { $blocks += @{ type = 'li'; text = $o } }
  $blocks += @{ type = 'note'; text = 'Rakamlar 3308 sayılı Meslekî Eğitim Kanunu tabanlarıdır; güncel tutarlar için stajyeri.net/staj-ucretleri hesaplayıcısını kullan.' }
  $blocks += @{ type = 'p';   text = 'İlanları incelemek ve ilk başvuruyu yapmak için stajyeri.net/ilanlar adresine göz at.' }
}

# --- BlogPost JSON yaz ---
$post = [ordered]@{
  slug        = $slug
  title       = $sec.title
  description = "$($sec.title) — Stajyeri.net rehberi."
  date        = $tarih
  category    = $sec.kategori
  emoji       = $sec.emoji
  readMin     = [Math]::Max(3, [Math]::Min(9, [int]($blocks.Count * 0.7)))
  blocks      = $blocks
}
$dosya = Join-Path $draftDir ("{0}-{1}.json" -f $tarih, $slug)
$post | ConvertTo-Json -Depth 6 | Set-Content -Path $dosya -Encoding UTF8

$onizleme = "📝 BLOG TASLAĞI hazır`n`n$($sec.emoji) $($sec.title)`nKategori: $($sec.kategori) · $($post.readMin) dk · Üretim: $kaynak`nBloklar: $($blocks.Count)`nDosya: drafts\blog\$((Get-Date -Format 'yyyy-MM-dd'))-$slug.json`n`nOnaylamak için: /onayla blog"
Send-Tg $onizleme
Write-Output "Blog taslağı hazır: $dosya (üretim: $kaynak)"