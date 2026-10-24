# IVE HERO UNIVERSE — Motion System

> Güncel durum: Prologue + Captain Purple uygulanmıştır. Çalıştırma, video ve doğrulama bilgileri [README.md](README.md) içindedir. Aşağıdaki belge ön yapım kararlarını ve sonraki bölüm planlarını kaydeder.

Tarih: 24 Ekim 2026 · İlk dilim: Signal + Captain Purple

## 1. Hareket ilkesi

Ritim **dur → geril → kes → boşluğu tut** şeklindedir. Kamera hikâyenin mekânını açıklar; tipografi anı damgalar; efekt bir eylemin sonucunu gösterir. Her öğe sürekli hareket etmez. Durağan bir kadraj tamamlanmış bir tasarım olmalıdır.

Web'de scroll ve kısa etkileşim olayı; videoda kare sayısı aynı hareket verisini besler. Hiçbir sahne rastgele süreler, `Date.now()` tabanlı shader zamanı veya bağımsız sonsuz CSS animasyonuyla ortak ritimden kopmaz.

## 2. Zaman modeli

Üç değer açıkça ayrılır:

1. `rawProgress`: doğal scroll rayının normalize konumu.
2. `sceneProgress`: seçilen sahnenin kendi `[0,1]` aralığı.
3. `eventProgress`: yalnızca kullanıcı aktivasyonu sırasında çalışan kısa olay saati.

```text
p = clamp((scrollY - startY) / (endY - startY), 0, 1)
u = clamp((p - sceneStart) / (sceneEnd - sceneStart), 0, 1)
e = clamp(activeElapsedMs / burstDurationMs, 0, 1)
```

İlk dilimin storyboard aralıkları `OPENING_BEATS` içinde bir kez tanımlanır:

```text
signal       0.00 → 0.08
approach     0.08 → 0.26
pageSplit    0.26 → 0.42
purpleReveal 0.42 → 0.60
ready        0.60 → 0.80
departure    0.80 → 1.00
```

Prologue sahnesi `[0.00, 0.42)`, Captain Purple `[0.42, 1.00]` aralığındadır. Sonraki bölümler eklenince bu açılış aralığı ana registry'ye başka bir segment olarak bağlanır; burada yazan sayılar bütün siteyi tarif etmez.

Scroll seek'leri saf ve tersine çevrilebilir. Olay animasyonu kullanıcının açık eylemiyle başlar; `p` bir eşiği geçti diye ses/patlama tekrar tetiklenmez. ScrollTrigger yalnızca ilerleme sürücüsüdür. [GSAP ScrollTrigger](https://www.gsap.com/docs/v3/Plugins/ScrollTrigger/).

## 3. Merkezî konfigürasyon

Önerilen `motion/config.ts` bölümleri:

| Grup | İlk değerler | Amaç |
| --- | --- | --- |
| `duration` | cut 0 ms, register 100 ms, typeHit 180 ms, reveal 420 ms, settle 620 ms | Yeniden kullanılan editoryal olay süreleri. |
| `activation` | charge 900 ms, cancelReturn 180 ms, burst 860 ms | Hold ve aktivasyon sözleşmesi. |
| `burstBeats` | 0, 80, 180, 300, 340, 620, 860 ms | Storyboard'daki aktivasyon kesmeleri. |
| `input` | chargeCancelDistance 12 CSS px, scrollScrub 120 ms | Hold iptali ve scroll'a sınırlı yumuşatma. |
| `depth` | paper katmanları ve ayrı mobil/masaüstü kamera yolları | Sihirli mesafeleri bileşenlere dağıtmamak. |
| `quality` | DPR, echo, çizgi ve tram sınırları | Teknik mimarideki kalite katmanları. |

Süreler bu projenin ilk sanat yönetimi ayarlarıdır; ölçümden sonra bu dosyada güncellenir. Her bileşene ayrı tween sayıları yazılmaz. Scroll beat'leri sürelerden bağımsız normalize aralıklar olarak kalır.

### Easing paleti

Saf cubic-bezier kontrol noktaları hem web hem video adaptörüne verilir:

| Ad | Kontrol noktaları / kural | Kullanım |
| --- | --- | --- |
| `linear` | doğrusal | Yük yüzdesi ve zaman eşlemesi. |
| `editorialOut` | `[0.16, 1, 0.30, 1]` | Başlığın kısa yerleşmesi. |
| `cameraTravel` | `[0.65, 0, 0.35, 1]` | Yaklaşma ve sayfa ayrılması. |
| `snapOut` | `[0.22, 1, 0.36, 1]` | Maskenin hızlı açılması. |
| `typeOvershoot` | 0 → 1.035 → 1, süre oranı 0.72 / 0.28 | Yalnızca büyük harfin çok küçük geri oturması. |
| `holdThenCut` | sabit değer, belirtilen eşikte ani değişim | Etki karesi ve çerçeve tutuşu. |

Bezier değerleri x'e göre çözülür; yalnızca y polinomunu zaman gibi okumak aynı eğriyi üretmez. İki adaptör ortak çözücüyü kullanır. Web GSAP sürücüsü sonuçları uygular; Remotion karede aynı fonksiyonları örnekler.

## 4. Yeniden kullanılabilir hareket primitive'leri

Her primitive, konfigürasyon ve normalize zaman alır; görsel durum veya duraklatılmış timeline parçası üretir. Hedefler açıkça verilir, global selector kullanılmaz. Kamera, karakter ve tipografi için farklı katman sahipliği korunur.

| Primitive | Davranış | Azaltılmış hareket karşılığı |
| --- | --- | --- |
| `impactFrame()` | Bir kere, 40 ms, sınırlı grafik bölgede açık mürekkep; bütün ekranı beyaza çevirmez. | Kaldırılır; darbe durum metniyle verilir. |
| `comicWipe()` | Panelin eğik kenarı kadrajı örter; örtü altında sahne devri. | Kısa düz kesme. |
| `speedBurst()` | Figür kamera düzleminden geçer; yönlü çizgiler 280 ms içinde kesilir. | Doğrudan sonuç pozu. |
| `temporalEcho()` | Aynı figürün en fazla üç gecikmeli pozu; her iz belirli zaman ofsetinden örneklenir. | Kapalı. |
| `maskReveal()` | Başlık veya figürün tek yönlü kırpma maskesi. | Anında görünürlük. |
| `editorialCut()` | Önce sabit poz, sonra tek sert kesme ve kısa yerleşme. | Kesme korunur, yerleşme kaldırılır. |
| `cardGlint()` | İleride pointer normalinden dar yansıma; giriş/çıkışta bir geçiş. | Statik kenar vurgusu. |
| `cameraPunch()` | Kısa yaklaşma ve kontrollü geri oturma; mobil genlik yarıya iner. | Kapalı. |
| `frameFreeze()` | Kaynak sahne zamanı 80 ms sabitlenir; girdiler ve sayfa scroll'u çalışır. | Gerekmez; doğrudan sabit poz. |
| `screenTear()` | Dar yatay şeritte tek yönlü kayıt kayması; metin okunurluğunu bozmaz. | Kapalı. |

`frameFreeze()` uygulama/render thread'ini durdurmaz. `temporalEcho()` ekran geçmişi kaydetmek yerine figürün eski pozlarını saf matematikle hesaplar; video kareleri sırasız render edildiğinde de aynı sonucu verir.

## 5. Aktivasyon durum makinesi

```text
ready ── basılı tut ──▶ charging ── 900 ms ──▶ bursting ── 860 ms ──▶ completed
  │                       │                       │                       │
  └── ACTIVATE/Enter ──────┴── tek eylem ──────────┘                       │
                          │                       │                       │
                     bırak/iptal             sahneden ayrıl          REPLAY
                          ▼                       ▼                       ▼
                        ready                scroll pozu            başlangıç
```

`ACTIVATE` alternatifi hazır durumda doğrudan patlamayı başlatır; klavye kullanıcısı tuş tutmak zorunda değildir. `charging` sırasında ikinci bir tetikleme yeni timeline oluşturmaz. Patlama sırasında kontrol yeniden tetiklenemez.

| Olay | Kesin sonuç |
| --- | --- |
| Hold 900 ms'den önce bırakılır | Yük 180 ms'de sıfıra döner; kamera scroll pozunda kalır. |
| Pointer 12 CSS px'den fazla hareket eder, `pointercancel`, blur veya scroll gelir | Hold iptal; doğal scroll sürer. |
| Yük doludur | Olay saati başlar; bir activation ID oluşturulur. Aynı ID için ses cue'ları bir kez oynar. |
| Patlama sırasında scroll hazır beat'in dışına çıkar | Olay iptal; master scroll pozuna doğrudan yeniden örneklenir. Kalan sesi kısa zarfla kesilir. |
| Patlama sonunda kullanıcı yerinde bekler | Kapanış pozu latch edilir; `rawProgress` değiştirilmez. |
| Kapanış latch'inden sonra ileri scroll gelir | Alttaki `rawProgress` doğal olarak ilerler; görsel kapanış pozu korunur. Figür yeniden belirmez, kamera geri sıçramaz. |
| Kapanış latch'inden sonra geri scroll gelir | Latch kalkar; kaynak `p` doğrudan uygulanır. Kullanıcı isteğiyle önceki hazır poza dönülür. |
| Kullanıcı yukarı kaydırarak sahneye döner | Saf scroll pozu kurulur; aktivasyon ve ses otomatik oynatılmaz. Kontrol tekrar hazır olabilir. |
| Sekme gizlenir | Yük iptal; aktif patlama saati durur, ses susar. Görünür olduğunda patlama son sabit pozdan sürer veya sahne değişmişse iptal edilir. |
| Hareket tercihi değişir | Eylem temizlenir; mevcut anlatı durumu azaltılmış kadraja aktarılır. |
| CONTINUE | Kullanıcı isteğiyle ilk dilimin sonuna gidilir; azaltılmış harekette anında geçilir. |
| Replay | Olay, latch ve ses cue kaydı temizlenir; kullanıcı isteğiyle başlangıca dönülür. |

Latch, yalnızca olayın son görsel durumunu saklar; scroll yüzdesini yeniden eşlemez. İleri scroll sırasında `p` güncellenmeye devam eder ve görsel örnekleyici `completed` durumunu korur. `p=1` noktasında doğal kapanış ile olayın kapanışı aynıdır. Geri scroll, replay veya başka bir sahneye geçiş latch'i temizler. Böylece gizli scroll borcu veya tarayıcı konumunu düzeltme ihtiyacı oluşmaz.

## 6. Scroll ve olay arasında tek sahip

Normal durumda `sampleOpening(p, idle)` kullanılır. `charging` yalnızca yük halkası, enerji kenarı ve küçük figür sıkışmasını ekler; kamera yolu scroll'a aittir. `bursting` kamera/figür için kısa olay görünümünü devralır; sahneden çıkış bunu iptal eder. `completed` kapanış latch'ini gösterir.

Her frame sonunda tek bir `VisualState` uygulanır. İki GSAP tween'inin aynı `camera.position` veya `transform` özelliğini ayrı ayrı sürmesine izin verilmez. DOM tween'leri GSAP context içinde toplanır; geçiş/tercih değişiminde revert edilir. Manuel event listener ve ses düğümleri ayrıca temizlenir. [GSAP matchMedia ve cleanup](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/).

## 7. Video adaptörü

`CaptainPurpleIntro` 30 fps'te 1260 karelik ~42 saniyelik bir referans kurgu kullanabilir. Prologue ve başlık beat'leri storyboard ritmine yerleştirilir. Hold göstergesi önceden belirlenen başlangıç karesinden 900 ms boyunca ilerler, sonra 860 ms'lik patlama örneklenir. Web'de oynama süresi kullanıcıya bağlıdır.

Bir olayın zamanı `eventMs = max(0, (frame - eventStartFrame) * 1000 / fps)` ile bulunur. 40 ms'lik darbe 30 fps'te bir veya iki kareye denk gelebilir; sınırlar milisaniyeden hesaplanır ve ortaya çıkan render görsel olarak kontrol edilir. Web'e ait timeout, rAF veya GSAP autoplay video içinde kullanılmaz. [Remotion useCurrentFrame](https://www.remotion.dev/docs/use-current-frame).

Parçacık/çizgi başlangıçları sabit seed'den bir kez türetilir; hareket konumu zaman fonksiyonundan gelir. Kare başına `Math.random()` kullanılmaz. [Remotion deterministik random](https://www.remotion.dev/docs/random).

## 8. Hareketin kabul kontrolü

- `p=0`, bütün beat sınırları ve `p=1` pozlarında tutarlı kadraj; ileri ve geri seek'te aynı sonuç.
- Hızlı scroll, tekrarlı tıklama, yarım hold, iptal ve sekme dönüşünde tek aktif olay.
- Patlama sırasında tam bir odak; izler figürün hareket yönünü açıklar. Ana figür kaybolduktan sonra boşluk en az bir okunabilir beat kadar kalır.
- Hareket azaltıldığında içerik ve aktivasyon sonucu aynıdır; uçuş ve parlama yoktur.
- WebGL `invalidate()` yalnızca gerekli karelerde çağrılır; sabit kadrajda GPU sürekli animasyon üretmez.
- Video için kare 0, orta ve son kare tek başına render edildiğinde sıra bağımlılığı oluşmaz.
- Gerçek masaüstü ve 390 × 844 tarayıcı doğrulamasında ritim yeniden ayarlanır. Bu belgelerdeki süreler henüz ölçülmüş kalite sonucu değildir.
