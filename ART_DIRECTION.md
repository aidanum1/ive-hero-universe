# IVE HERO UNIVERSE — Art Direction

> Güncel durum: Prologue + Captain Purple uygulanmıştır. Çalıştırma, video ve doğrulama bilgileri [README.md](README.md) içindedir. Aşağıdaki belge ön yapım kararlarını ve sonraki bölüm planlarını kaydeder.

Tarih: 24 Ekim 2026 · Öneri: THE PRINT BREACH

## 1. Görsel tez

**Lüks bir moda çekimi, kendi çizgi roman baskısından dışarı çıkar.** Dünya önce basılı, düz ve disiplinli görünür. Kahraman ortaya çıktıkça kayıt hataları derinliğe, panel çizgileri portala, baskı izleri hızın kanıtına dönüşür.

Estetik ağırlık; büyük ve sıkıştırılmış tipografi, küçük teknik kayıtlar, heykelsi figür, düz spot renk ve derin mürekkep siyahındadır. Mor yalnızca Captain Purple'ın enerjisidir; bütün sitenin üzerine yayılan bir degrade değildir.

## 2. Referansın nasıl kullanıldığı

[Prometheus örneğinde](https://www.awwwards.com/inspiration/prometheus-fuels-stylized-webgl-interactive-story) gözlenen güçlü nesne odağı ve dokunun dünyayı birleştirmesi, burada bağımsız bir sanat yönetimine çevrilir. Doğrudan gözlem ve inceleme sınırları [storyboard'da](STORYBOARD.md) kayıtlıdır.

| Aktarılan ilke | IVE için özgün karşılık |
| --- | --- |
| Tek güçlü odak | Kayıt çerçevesinden dışarı taşan kahraman silueti. |
| Mekânı anlatan kamera | Sayfanın ön, orta ve arka baskı katmanlarının arasına giren kamera. |
| Yüzeyleri birleştiren doku | Kâğıt tanesi, ayrık tram noktaları, kontrollü mor baskı kaçması. |
| Görüntüyle aynı kadrajda kısa metin | Kahramanın hız yönünü kesen sıkışık başlık ve küçük kayıt bilgisi. |

Referanstan sahne, araç, manzara, fotoğraf, tipografi, model veya renk örneği alınmaz.

## 3. Renk tokenları

Renkler bu proje için önerilen yaratıcı tokenlardır. Üye renkleri veya resmî kampanya verisi oldukları iddia edilmez.

| Token | Değer | Rol |
| --- | --- | --- |
| `ink` | `#101014` | Ana karanlık, panel çizgileri, metin. |
| `paper` | `#F0EBDD` | Sıcak kâğıt, büyük başlıklar, açık kadraj. |
| `paperMuted` | `#B6B0A5` | Karanlık zeminde ikincil teknik metin. |
| `purple` | `#8552FF` | Captain Purple spot mürekkebi. |
| `purpleLight` | `#CEB8FF` | İnce kenar ışığı ve sınırlı enerji izi. |
| `redline` | `#F44957` | Gelecek kahramanın doğrusal kesme kimliği. |
| `ice` | `#69CDE8` | Gelecek kahramanın prizmatik kimliği. |
| `citron` | `#D2E64F` | Gelecek kahramanın çerçeve/yerçekimi kimliği. |
| `tangerine` | `#FF9251` | Gelecek kahramanın yörünge kimliği. |
| `silver` | `#C7CFD5` | Gelecek kahramanın negatif alan kimliği. |

Açılışın yaklaşık alan dağılımı: %75 ink/paper, %20 figür ve çerçeve, %5 mor vurgu. Altı renk ancak finale doğru aynı kadrajda güç kazanır. Küçük metinler vurgu rengiyle değil ink/paper çiftiyle yazılır; gerçek uygulamada kontrast ölçülür.

## 4. Tipografi rolleri

Önerilen fontlar uygulama sırasında resmî kaynaklarından doğrulanacak, lisans dosyalarıyla yerel WOFF2 olarak saklanacaktır. Bu planlama aşamasında font indirilmedi. İlk dilimde DISPLAY ve UI dosyaları önceliklidir; diğer roller ihtiyaç olduğunda eklenir.

| Rol | Önerilen aile | Kullanım ve davranış |
| --- | --- | --- |
| DISPLAY | Anton | Dar, büyük, tok; “CAPTAIN / PURPLE”. Harfler dekor değil ana şekil. |
| EDITORIAL | Bodoni Moda Italic | Sonraki bölümlerde kısa moda notları; aynı kadrajda tek kısa ifade. |
| UI | IBM Plex Mono | Sinyal numarası, ses/hareket durumu, seçim kaydı. |
| CAPTION | Archivo | Kısa açıklama, erişilebilir yardım, çizgi roman panel yazısı. |
| COMIC | Bangers | Yalnızca özgün kısa ses efekti yazıları; ana başlığa rakip olmaz. |

DISPLAY masaüstünde yaklaşık 120–220 px, 390 px mobilde 68–104 px aralığında ölçülendirilir. Değerler `clamp()` ve kadraj tokenlarıyla yönetilir. Ana başlık en fazla iki satırdır. UI 12–14 px, açıklama en az 16 px hedeflenir. Font beklenirken içerik görünür kalır; font ölçümleri tamamlanınca scroll ölçüleri bir kez yenilenir.

## 5. Kompozisyon kuralları

- Masaüstünde 12 kolon, mobilde 4 kolonluk görünmez editoryal kılavuz. Her şeyi simetrik ortalama zorunluluğu yoktur.
- Karanlık açılışta odak küçük; sayfaya yaklaşırken birden büyük olur. Boşluk ile yoğunluk arasındaki fark hareket kadar önemlidir.
- Captain Purple'ın figürü kadrajın yaklaşık %55–65 yüksekliğini kaplar. Başlık yüz/baş alanından uzak tutulur. Mor arka ışık figürün konturunu kurar.
- Panel çizgileri ekran kenarından geçebilir. Kullanılabilir kontroller çerçeveyle birlikte kaçmaz.
- Köşeler keskin; başlıklar kocaman; teknik kayıtlar küçük ve sakin. Kart, yuvarlak kutu ve dekoratif rozet çoğaltılmaz.
- Ana fikri açıklayan uzun paragraf açılış kadrajına konmaz. “Unofficial fan-made creative experiment” kısa bir künyede ve erişilebilir açıklamada yer alır.

### Masaüstü ve mobil yerleşim taslağı

```text
1440 × 900                              390 × 844
┌────────────────────────────────┐      ┌───────────────────┐
│ IVE / ISSUE 00      SOUND / MOT │      │ IVE     SOUND/MOT │
│                                │      │                   │
│ CAPTAIN          ┌─────────┐   │      │ CAPTAIN           │
│ PURPLE           │  HERO   │   │      │ PURPLE            │
│                  │   /     │   │      │     ┌───────┐     │
│ 01 / 06          └─────────┘   │      │     │ HERO  │     │
│                                │      │     │   /   │     │
│ SIGNAL →       HOLD TO ACTIVATE│      │     └───────┘     │
└────────────────────────────────┘      │ 01/06             │
                                        │ HOLD TO ACTIVATE  │
                                        └───────────────────┘
```

Bu şema wireframe'dir; nihai ekran görüntüsü veya görsel doğrulama sonucu değildir.

## 6. Altı kahraman, altı hareket dili

Captain Purple briefte verilen kimliktir. Diğer adlar tasarımın hareket farklarını somutlaştıran **geçici özgün kod adlarıdır**. Henüz üye eşlemesi yapılmaz; `memberId` alanı boş kalır.

| Kod adı | Siluet / motif | Giriş, hareket ve geçiş | Kart yüzeyi / ses yaklaşımı |
| --- | --- | --- | --- |
| CAPTAIN PURPLE | Ayrık kontur, dar yatay kayıt yırtığı. | Sıkışma → gecikmeli iz → kameradan dışarı çapraz hız. Uzun bekleme sonrası kısa patlama. | Mor saten, ince metal kenar; kısa kuru çatlak ve kesilen kuyruk. |
| REDLINE | Eğik kesik, üç uzun panel. | Birbirine ters yönde geçen doğrusal paneller. Kamera yanlamasına tek hızlı yer değiştirir, sert durur. | Kırmızı vernik, çapraz çizgi; keskin kısa kesme sesi. |
| ICE INDEX | Prizma, dört parçalı iris. | Figür parçalar hâlinde sırayla açılır; kamera yavaş bir çeyrek açı değiştirir. | Buzlu gümüş, dar cam yansıması; seyrek, yumuşak cam tonu. |
| CITRON STATIC | İç içe kareler, kesintili tarama. | Çerçeveler akordeon gibi katlanır; figür sabit kalırken dünya aşağı kırılır. | Mat asit sarısı, çizgili baskı; düşük kuru vuruş, ardından sessizlik. |
| TANGERINE ORBIT | Yarım daire, eksantrik baskı halkası. | Kamera merkez dışı bir yay izler; grafikler tek yörünge turunda kesilip durur. | Bakır spot folyo; bir kez yükselen yay sesi. |
| SILVER NULL | Negatif figür, tek dikey yarık. | Ortamın dokusu çekilir, figür boşluk olarak belirir. Kamera sabittir; kesme uzun bir sessizlikten gelir. | Fırçalanmış metal, siyah oyuk; neredeyse sessiz, kısa oda yankısı. |

Hero Select'te seçilen kimlik; paletle birlikte kamera rig'ini, maske şeklini, tipografik yerleşimi, malzemeyi ve ses zarfını belirler. Aynı animasyonun rengini değiştirmek kabul edilmez.

## 7. Yüzeyler ve efektler

**Kâğıt:** Tek küçük döşenebilir özgün tane dokusu. Görseli kirleten yoğun film greni kullanılmaz. Doku animasyonu sürekli rastgele değişmez.

**Tram:** DOM/SVG panellerinde desen; WebGL katmanlarında ekran ölçeğine göre sınırlanmış nokta shader'ı. Küçük ekranda moiré oluşursa ince nokta yerine seyrek sabit desen kullanılır. Tipografi dokudan bağımsız ve keskin kalır.

**Baskı hatası:** Captain Purple için tek yönlü mor kontur kaçması. RGB renk ayrımı genel bir site filtresine dönüşmez.

**Folyo:** Sonraki kartlarda saten temel, dar bir yansıma lobu, düşük doygunluklu mor/gümüş girişim ve kenar Fresnel'i. Ekranın tamamına yayılan gökkuşağı kullanılmaz. Pointer nötrdeyken yansıma sakin durur.

**Hız:** Anlamlı yönü olan az sayıda çizgi ve poz izi. Tüm sahneye rastgele parçacık serpilmez. Özgün siluet, derinlik ve kısa görüş kapanması hızın temelidir.

## 8. İlk dilim varlık listesi

| Varlık | Üretim yaklaşımı | Hedef |
| --- | --- | --- |
| `signal-page.svg` | Özgün sayfa çerçevesi ve kayıt işaretleri. | Katmanlara ayrılabilir SVG. |
| `captain-purple-silhouette.svg` | Elle oluşturulan özgün editoryal figür; gerçek üye portresi olduğu iddia edilmez. | Siluet, kenar ışığı ve iz maskesi için aynı kaynak. |
| `registration-marks.svg` | Altı sinyal ve baskı çentikleri. | Web ve videoda ortak. |
| `speed-lines.svg` | Sabit seed ile belirlenen yönlü çizgiler. | Mobilde yoğunluğu azaltılabilir. |
| `paper-grain.webp` | Küçük özgün döşenebilir doku veya prosedürel eşdeğer. | 256–512 px. |
| DISPLAY / UI fontları | Yerel WOFF2 ve lisans kaydı. | İlk yükte yalnızca gerekli ağırlıklar. |
| Kısa aktivasyon sesleri | Özgün sentez veya açık lisanslı, kaynağı kayıtlı ses. | Opsiyonel; sitede müzik/video zorunluluğu yok. |

İlk incelemede proje klasörü boştu; verilen tek dosya brief. Portre, logo, ses veya model sağlanmamış. İlk dilim özgün grafiklerle tamamlanabilir. Gerçek üyelerin fotoğrafları ileride eklenirse kaynak ve kullanım izni varlık manifestinde tutulur; referans sitesinden varlık taşınmaz.

## 9. Sanat yönetimi kontrolü

Her önemli tarayıcı incelemesinde şu sorular sorulur: İlk bakışta tek odak var mı? Kamera bize yeni bir ilişki gösteriyor mu? Başlık figürle birlikte tasarlanmış mı? Hareket durduğunda kadraj hâlâ güçlü mü? Her efekt anlatıya hizmet ediyor mu?

1440 × 900 ve 390 × 844 ekranları yan yana değerlendirilir. Karanlık giriş, ayrılan sayfa, Purple başlığı, yükleme ve patlama sonrası boşluk ayrı kilometre taşlarıdır. Genel bir mor arka plan ve üstüne yerleştirilmiş kart hissi oluşursa kompozisyon yeniden kurulur.
