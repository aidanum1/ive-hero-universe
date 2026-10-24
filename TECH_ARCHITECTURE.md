# IVE HERO UNIVERSE — Technical Architecture

> Güncel durum: Prologue + Captain Purple uygulanmıştır. Çalıştırma, video ve doğrulama bilgileri [README.md](README.md) içindedir. Aşağıdaki belge ön yapım kararlarını ve sonraki bölüm planlarını kaydeder.

Tarih: 24 Ekim 2026 · Durum: önerilen mimari · Hedef: GitHub Pages

## 1. Mevcut durum ve uygulama sınırı

`/Users/ayda/Desktop/ive-hero` inceleme sırasında boştu; Git deposu veya uzak depo bağlantısı yok. Bu aşamada yalnızca dört planlama belgesi oluşturuluyor. İlk uygulama dilimi Prologue + Captain Purple; sonraki sahneler ve Remotion kompozisyonları genişleme planıdır.

Temel karar: **Next.js statik kabuk + tek sabit sahne + GSAP tarafından sürülen ortak görsel durum + ihtiyaç oldukça çizilen R3F dünyası.** HTML ve bütün varlıklar GitHub Pages üzerinde servis edilir. Video üretimi ayrı yerel/CI işidir.

## 2. Teknoloji sorumlulukları

| Katman | Araç | Sorumluluk |
| --- | --- | --- |
| Statik kabuk | Next.js App Router, React, TypeScript | Metadata, ilk HTML, istemci deneyiminin yüklenmesi. |
| Grafik arayüz | DOM, SVG, CSS Modules | Başlıklar, açıklamalar, maskeler, kontroller, erişilebilir anlatı. |
| Web hareketi | GSAP + ScrollTrigger | Scroll ilerlemesi, timeline seek, kısa olaylar ve temizleme. |
| Derinlik | Three.js, React Three Fiber, sınırlı Drei kullanımı | Kamera, katmanlı sayfa, figür düzlemi, sahne ışığı. |
| Malzeme | Küçük GLSL shader'ları | Tram ve ileride kontrollü kart yansıması. |
| Video | Remotion | Ortak tasarım ve saf hareket hesaplarından deterministik kare üretimi. |

Paket sürümleri uygulama başlangıcında karşılıklı uyumluluklarıyla seçilip lockfile'a sabitlenecek. Bu belge kurulu sürüm iddiası taşımaz. Açılışta postprocessing zinciri, fizik motoru veya ek smooth-scroll kütüphanesi gerekmiyor.

## 3. Veri akışı ve tek yazıcı kuralı

```text
Doğal scroll / erişilebilir ilerleme kontrolü
                     │
              ScrollController
                     │ rawProgress 0…1
              MotionController ◀── InteractionController
                     │              hold / activate / replay
                     │              eventProgress 0…1
              sampleOpening(p, event, viewport, quality)
                     │
              VisualState + SceneManager
                 ┌───┼───────────┐
                 ▼   ▼           ▼
             DOM/SVG WebGL       AudioController
               GSAP  Camera /    yalnızca açık ve izinli
               seek  uniforms
                     │
                invalidate()

Remotion frame / fps ──▶ aynı sampleOpening() ──▶ video görünümü
```

Bu bir bileşen şemasıdır; uygulamanın mevcut olduğu anlamına gelmez.

`VisualState` kamera pozunu, katman pozlarını, mor enerji miktarını, başlık maskelerini ve aktif grafik öğelerini içerir. Sayılar tek hareket konfigürasyonundan gelir. Web'de GSAP timeline'ı duraklatılmıştır ve normalize konuma seek edilir; bağımsız CSS keyframe veya ikinci bir animasyon döngüsü aynı özelliğe yazmaz.

React state her karede güncellenmez. Yüksek frekanslı değerler ref/düz nesne üzerinde taşınır. React yalnızca bölüm, hazır olma, ses, tercih ve hata durumlarını yönetir. R3F değişen kamera/uniform değerlerini okur ve çizim talep eder.

## 4. Denetleyiciler

- **ScrollController:** Tek doğal scroll rayını ölçer; `[0,1]` ilerleme ve yön üretir. Font/görsel hazır olunca ve gerçek boyut değişiminde ölçümü yeniler. Mobil adres çubuğu değişimi her karede yeniden ölçüm oluşturmaz.
- **MotionController:** Scroll ve olay saatinin önceliğini çözer; ortak örnekleyiciyi ve web GSAP adaptörünü sürer. Ayrıntılar [MOTION_SYSTEM.md](MOTION_SYSTEM.md) içinde.
- **SceneManager:** İstenen sahneyi, gerekli geçiş komşusunu ve kaynak yaşam döngüsünü yönetir. Hızlı seek'te atlanan sahneleri oynatmaz; hedef sahneyi hazırlar ve hedef poza kurar.
- **CameraController:** Her sahnenin masaüstü/mobil rig'ini uygular. Serbest orbit kontrolü yoktur. Pointer katkısı yalnızca küçük ve sınırlı bir ofsettir; hikâye kamerasını değiştirmez.
- **InteractionController:** Hold, tek tık alternatif, iptal, replay ve ileride kahraman seçimini yönetir. Eylem ve scroll aynı kamera değerine eşzamanlı yazamaz.
- **TransitionController:** Ön çerçeve/mürekkep maskesini ve kısa kaynak devirlerini yönetir. Yükleme uzun sürerse canlı çıkış sahnesi yerine statik geçiş örtüsü gösterir.
- **AudioController:** Varsayılan sessiz. Açık kullanıcı hareketinden sonra ses bağlamını başlatır; engellenirse sessiz kalır ve görünür durumu korur. Cue'lar geçiş kimliğiyle tekilleştirilir. [MDN autoplay rehberi](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

ScrollTrigger'ın scrub ve yenileme mekanizması ilerleme adaptöründe, GSAP medya koşulları ise farklı kadraj/azaltılmış hareket kurulumlarında kullanılır. [ScrollTrigger](https://www.gsap.com/docs/v3/Plugins/ScrollTrigger/), [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/).

## 5. Sahne sözleşmesi ve kaynak ömrü

Önerilen TypeScript sözleşmesi:

```ts
interface SceneModule {
  prepare(context: SceneContext, signal: AbortSignal): Promise<void>;
  enter(context: SceneContext): void;
  update(progress: number, frame: FrameContext): void;
  exit(reason: 'forward' | 'backward' | 'seek' | 'fallback'): void;
  dispose(): void;
}
```

`update()` aynı girdilerle aynı pozu üretir; geçmiş animasyonun tamamlanmasını beklemez. `prepare()` DOM'dan bağımsız varlık hazırlığıdır. `enter()` görünürlüğü ve abonelikleri açar; `exit()` olayları durdurur; `dispose()` sahnenin sahip olduğu kaynakları serbest bırakır. `prepare` yarıda kesilebilir, `dispose` tekrar çağrıldığında güvenlidir.

İlk dilimde tek Canvas yaşar. Normalde tek aktif sahne, geçişte en fazla iki sahne grubu bulunur. Sonraki sahnenin **verisi** önceden yüklenebilir; render döngüsü ve GPU varlıkları erkenden çalıştırılmaz. WebGL hazır değilse DOM kâğıt/siluet kadrajı kalır; siyah boşluk gösterilmez.

Sahne nesnelerinin otomatik R3F temizliği ile elle oluşturulan kaynakların sahipliği ayrı tutulur. Paylaşılan kaynakları küçük bir referans sayacı yönetir. Sahnenin texture, material, geometry ve render target'ı son kullanıcı bırakınca dispose edilir; iptal edilen yüklemeler kaynak sızdırmaz. [Three.js kaynak temizliği](https://threejs.org/manual/pages/how-to-dispose-of-objects.html).

## 6. DOM ve WebGL arasındaki sınır

**DOM/SVG:** IVE işareti, Captain Purple başlığı, kayıt işaretleri, yükleme kontrolü, durum metni, ses/hareket düğmeleri, erişilebilir alternatif. Metinler canvas dokusuna gömülmez.

**WebGL:** Ayrı z düzlemlerindeki sayfa, özgün figür silueti, ön çerçeve parçaları ve kamera geçişi. İleride kart geometrisi ve folyo eklenir. Dünyanın bütün metnini Three.js ile üretmek gerekmez.

Kadraj tokenları iki katmanda da ortak güvenli bölgeler tanımlar. Perspektife bağlı bir grafik gerekli olduğunda dünya koordinatı bir DOM anchor'ına projekte edilir; ana UI projeksiyona bağımlı değildir. Üst arayüz `pointer-events: none`, gerçek kontroller `pointer-events: auto` yaklaşımıyla scroll alanını örtmez.

## 7. GitHub Pages dağıtım sözleşmesi

Next.js `output: 'export'` ile `out/` üretir. Sunucuya bağlı route, Server Action, dinamik cookie veya istek anında render kullanılmayacak. Görseller önceden optimize edilmiş yerel varlıklardır; `next/image` kullanılırsa `unoptimized` seçilir. [Next.js statik export](https://nextjs.org/docs/app/guides/static-exports).

Planlanan `next.config.ts` değerleri:

```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  images: { unoptimized: true },
};
export default nextConfig;
```

`NEXT_PUBLIC_BASE_PATH` yerelde ve kök alan adında boş; proje Pages yayınında `/<depo-adı>` olur. Depo adı henüz bilinmiyor; `ive-hero` yalnızca mevcut klasör adı ve test alt yolu. Alt yol build sırasında hem Next yapılandırmasına hem istemci varlık çözücüsüne aynı değerle verilir. Değişirse yeniden build gerekir. [Next.js basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath).

Tüm `public/` varlıkları tek `assetUrl()` yardımcısından geçer: `/heroes/purple.svg` → `/ive-hero/heroes/purple.svg`. Ham `fetch`, texture, ses ve SVG maskeleri de buna dahildir. CSS dosyaları kökten sabit `/assets/...` yolları kullanmaz; paketleyicinin çözdüğü import/relative URL tercih edilir. Fontlar yerel build varlığıdır. `next/link` için alt yol ikinci kez elle eklenmez.

Tek deneyim rotası `/` ve bölüm hash'leri kullanılır. Kaynakta olmayan istemci yolları için Pages rewrite beklentisi oluşmaz. `out/` köküne `.nojekyll` konur. Hassas bilgi veya çalışma zamanı API anahtarı gerekmiyor.

### Planlanan GitHub Actions akışı

1. Depoyu checkout et; seçilen uyumlu Node sürümünü kur; lockfile ile `npm ci` çalıştır.
2. Pages yapılandırmasından yayın alt yolunu al ve build ortamına geçir.
3. TypeScript, lint ve gerekli davranış kontrollerini çalıştır; `next build` ile statik çıktıyı üret.
4. `out/` varlıklarını ve kök/alt yol önizlemelerini doğrula. Remotion kaynakları site bundle'ına girmesin.
5. `out/` dizinini Pages artifact'i olarak yükle; buna bağımlı deploy işi ile `github-pages` ortamına yayınla.

Resmî Pages action'ları kullanılacak; uygulama sırasında sürümleri doğrulanıp sabitlenecek. Yayın işi `pages: write` ve `id-token: write` izinleriyle çalışır. Depoda Pages yayın kaynağı GitHub Actions olmalıdır. [GitHub özel Pages workflow rehberi](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Bu belgede workflow kurulmuş veya yayın gerçekleşmiş değildir. Uzak depo bağlandığında iş akışı somutlaştırılabilir.

## 8. Render, performans ve hata davranışı

R3F varsayılanı `frameloop="demand"`. GSAP/ref değişiklikleri çizimi kendiliğinden tetiklemediğinden hareket adaptörü `invalidate()` çağırır. Durağan sahne çizim istemez; eylem sürerken her gerekli kare istenir. Arka plan sekmesinde olay saati durur. [R3F performans rehberi](https://r3f.docs.pmnd.rs/next/advanced/scaling-performance).

Aşağıdakiler ölçülmüş sonuçlar değil, ilk dilimin bütçeleridir:

| Ölçüt | Masaüstü hedefi | Mobil / düşük kalite hedefi |
| --- | --- | --- |
| DPR üst sınırı | 1,75 | 1,25; gerekirse 1 |
| Aktif draw call | ≤ 45 | ≤ 25 |
| En büyük açılış dokusu | 2048 px | 1024 px |
| Görünür FX pozu | En fazla 3 echo + 24 yönlü çizgi | 1 echo + 10 çizgi |
| İlk dilim aktarımı | Sıkıştırılmış toplam ≤ 3 MB hedefi | Aynı sınır, daha küçük görseller |
| Hareket sırasında kare aralığı | 60 Hz cihazda p95 ≤ 20 ms hedefi | Düşük katmanda p95 ≤ 34 ms hedefi |

Uzun shader zinciri, gerçek zamanlı gölge ve açılışta büyük HDR ortam haritası yoktur. Kare süreleri kötüleşirse önce echo, shader ayrıntısı ve DPR düşer; figür ve başlık kompozisyonu korunur. Başlangıç kalitesi feature detection ve kısa örneklemle belirlenir; user-agent tek başına karar vermez.

WebGL context kaybında veya destek yoksa DOM/SVG sürümü devreye girer. Restore başarılıysa yalnızca gerekli sahne ve mevcut poz yeniden kurulur. Doku yüklemesi başarısızsa özgün düz siluet gösterilir. Hata, scroll ve erişilebilir kontrolleri durdurmaz.

## 9. Erişilebilirlik ve mobil

Sabit sahne görsel bir katmandır. Anlatının okunabilir özeti semantik DOM'da bulunur; ekran okuyucu dekoratif canvas ve kopya başlıklardan arındırılır. Gerçek düğmeler, görünür focus ve yeterli kontrast kullanılır. Durum duyurusu yükleme yüzdesini her kare okumaz; yalnızca hazır/etkin/tamamlandı değişimlerini duyurur.

`prefers-reduced-motion` ve kullanıcı hareket düğmesi aynı tercih katmanına bağlanır. Azaltılmış sürüm uçuş, yırtılma ve flaşları kaldırır; aynı sahne bilgilerini kesmelerle verir. [MDN hareket tercihi](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

390 × 844 için ayrı kamera rig'i ve safe-area yerleşimi tanımlanır. `100svh` tabanlı sahne yüksekliği adres çubuğu dalgalanmasını sınırlar. Hold'un dışında `touch-action: pan-y`; iki eksenli jest yalnızca gelecekteki kart kontrolünün içinde değerlendirilir. Hold sırasında ekran kaydırma, pointer cancel ve focus kaybı iptal nedenidir.

## 10. Tarih ve final durumu

Brief yalnızca `26.10` veriyor; yıl, saat ve saat dilimi belirtilmemiş. Gerçek yayın tarihi uydurulmaz. `releaseAt` tam ISO zaman damgası ve offset olarak yapılandırılacak; örnek söz dizimi `YYYY-10-26T00:00:00+03:00`. Bu örnek resmî yayın bilgisi değildir.

Final uygulandığında `now < releaseAt` için “COMING 26.10”, diğer durumda “OUT NOW” hesaplanır. Kontrol istemcide açılışta, sekmeye dönüşte ve tarih eşiğinde yapılır; statik build tarihine kilitlenmez. İstemci saati kullanıldığı belgelenir. Değer belirlenene kadar nötr “26.10” gösterilir. SSR ilk metni nötr tutarak hydration uyuşmazlığı önlenir.

Remotion'da `releaseState` veya sabit `referenceDate` props ile verilir; render sırasında `Date.now()` kullanılmaz. Bu özellik ilk dilimin dışında, finale ait bir iştir.

## 11. Remotion ile paylaşım

Ortak: tasarım tokenları, hero konfigürasyonu, SVG kaynakları, sabit seed'ler, kamera keyframe verisi ve saf hareket fonksiyonları. Ayrı: ScrollTrigger, DOM ölçümleri, ses izinleri ve canlı pointer girdisi. Remotion site giriş noktasından import edilmez; ayrı bundler/entry kullanır.

Video saati `frame / fps`, normalize ilerleme ise kompozisyonun tanımlı beat aralıklarından üretilir. [useCurrentFrame](https://www.remotion.dev/docs/use-current-frame). Rastgele değerler sabit seed ile üretilir; frame sırası değişince görüntü değişmez. [Remotion random](https://www.remotion.dev/docs/random).

| Kompozisyon | Planlanan format | Uygulama aşaması |
| --- | --- | --- |
| `CaptainPurpleIntro` | 1080 × 1920 ve 1920 × 1080, 30 fps | İlk web dilimi görsel olarak doğrulandıktan sonra; 1260 karelik ~42 sn kurgu. |
| `HeroSelect` | İki format, 30 fps | Hero Select tamamlandıktan sonra. |
| `SixHeroesIntro` | İki format, 30 fps | Altı kimlik doğrulandıktan sonra. |
| `HeroCards` | İki format, 30 fps | Kart vitrini tamamlandıktan sonra. |
| `IVEHeroTrailer` | İki format, 30 fps | Tam anlatıdan türetilen ayrı kurgu. |

Geniş ve dikey sürümler merkezden crop edilmez; aynı viewport/kamera tokenlarının iki rig'ini kullanır. Video için hold eylemi belirli bir karede, ses tercihleri ise props üzerinden deterministik biçimde başlar. Render işi yerel/ayrı CI çalışır; GitHub Pages tarayıcıda video üretme servisi değildir.

## 12. Önerilen dosya yapısı

```text
src/
  app/                 # Statik page/layout, metadata, genel CSS
  components/          # ExperienceShell, HUD, ActivateControl, AccessibleStory
  scenes/
    prologue/          # Görünüm ve sahne adaptörü
    captain-purple/    # Görünüm ve sahne adaptörü
    registry.ts        # İleride sahne lazy-load kayıtları
  controllers/         # Scroll, motion, scene, camera, interaction, audio, transition
  motion/              # Beat'ler, easing, primitives, saf sample fonksiyonları
  webgl/               # Tek WorldCanvas, kalite, kaynak sahipliği
  shaders/             # Tram; sonraki aşamada folyo
  heroes/              # Veri şeması ve özgün kimlik konfigürasyonu
  design-system/       # Tokenlar, kadraj rig'leri, ortak SVG bileşenleri
  hooks/               # Tercihler, görünürlük, breakpoint
  utils/               # assetUrl, normalize, releaseState
remotion/
  index.ts
  Root.tsx
  compositions/
  components/
public/
  assets/              # Özgün grafikler
  heroes/              # Siluet / ileride izinli portreler
  textures/
  fonts/               # WOFF2 ve lisanslar
  audio/
  references/          # Yalnızca kaynak notları; kopya site varlığı yok
  asset-manifest.json  # Kaynak, lisans, boyut, katman, sahiplik
.github/workflows/     # Uygulama sırasında Pages workflow'u
```

Klasörler bu aşamada henüz oluşturulmadı. Kullanılmayan sahne dosyaları, boş route'lar veya çalışmayan kompozisyonlar iskelete eklenmez.

## 13. Uygulama sırası ve doğrulama

1. Statik export, yerel fontlar ve kök/alt yol varlık çözümlemesini kur. Pages dağıtım iskeletini oluştur.
2. Tek sabit kadraj, doğal scroll rayı, ortak beat verisi ve erişilebilir kontrolleri kur.
3. Prologue kamera hareketi ve sayfa katmanlarını bitir. Masaüstü/mobil tarayıcı görüntülerini incele.
4. Captain Purple kompozisyonu, hold/tek tık alternatif ve hız patlamasını uygula. Geri scroll ve iptal durumlarını doğrula.
5. Azaltılmış hareket, WebGL fallback, temizleme ve performansı doğrula; ilk dilimi görsel olarak düzelt.
6. İlk dilim yeterli olduğunda Remotion'u kur ve `CaptainPurpleIntro`yu aynı veriden üret. Sonraki bölümler ayrı genişleme aşamasıdır.

Gerekli davranış kontrolleri: normalize ilerlemenin sınırları, ileri/geri seek, eylem iptali, çift tetikleme, sahne cleanup ve asset alt yolu. Tarih testleri finale eklenirken yazılır. Sadece implementasyonu tekrar eden testler eklenmez.

Tarayıcı kontrolü her anlamlı frontend değişiminden sonra 1440 × 900 ve 390 × 844'te yapılır. Kilometre taşları: signal, ayrılan sayfa, Purple başlığı, hold, patlama sonrası. Konsol hataları, varlık 404'leri, gerçek kare süreleri ve `renderer.info` sayaçları incelenir. İleri/geri on turda GPU kaynaklarının sürekli büyümemesi aranır.

Yayın kontrolü `next dev` ile sınırlanmaz: üretilmiş `out/` hem `/` hem `/ive-hero/` altında servis edilir; doğrudan açılış ve yenilemede bütün varlıklar doğrulanır. Gerçek Pages URL'si mevcut olduğunda son kontrol orada yapılır. Şu anki teslimde yalnızca belge tutarlılığı denetlenebilir.
