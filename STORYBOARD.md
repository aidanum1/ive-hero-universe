# IVE HERO UNIVERSE — Storyboard

> Güncel durum: Prologue + Captain Purple uygulanmıştır. Çalıştırma, video ve doğrulama bilgileri [README.md](README.md) içindedir. Aşağıdaki belge ön yapım kararlarını ve sonraki bölüm planlarını kaydeder.

Tarih: 24 Ekim 2026 · Aşama: ön yapım · Yayın hedefi: GitHub Pages

## 1. Kapsam ve yaratıcı öneri

Deneyim, **bir çizgi roman baskısının içinden kaçan altı kahraman** fikri üzerine kurulur. Kullanıcı bir sayfayı aşağı okumaz; basılı bir dünyanın içine girer, bu dünyanın kayıt düzenini bozar ve kahramanları serbest bırakır. Çalışma adı: **THE PRINT BREACH / BASKIDAN TAŞANLAR**.

İlk uygulama dilimi yalnızca **PROLOGUE — SIGNAL + CHAPTER 1 — CAPTAIN PURPLE** olacaktır. Diğer bölümler burada anlatı sürekliliğini planlamak için bulunur. İlk dilimin sonu, ilerideki sahnelere bağlantı veren bir mühür ve “REPLAY SIGNAL” kontrolüdür; çalışmayan bölüm bağlantıları gösterilmez.

Bu teslim dört planlama belgesinden oluşur. Uygulama, paket kurulumu, Remotion renderı ve yayın henüz yapılmamıştır. Bir sonraki uygulama adımı [teknik mimaride](TECH_ARCHITECTURE.md) tanımlıdır.

## 2. Referans incelemesi: görülenler ve çıkarımlar

[Awwwards / Prometheus Fuels örneği](https://www.awwwards.com/inspiration/prometheus-fuels-stylized-webgl-interactive-story), 24 Ekim 2026 tarihinde tarayıcıda incelendi. Sayfa Active Theory'yi yaratıcı ekip olarak gösteriyor. Gömülü hareketli örnek yaklaşık 6,37 saniyelik bir döngü; bütün deneyimin kaydı değil.

**Doğrudan gözlem:** Araç baskın odak. Kamera/nesne arasındaki açı değişiyor; zemin, arka plan ve nesne farklı derinliklerde okunuyor. Baskı dokusu farklı yüzeyleri birleştiriyor. Kısa metin, görüntünün yanında açıklama paneline dönüşmeden kadraj içinde yer alıyor.

**İnceleme sınırı:** Referansın canlı adresi artık [farklı bir kurumsal siteye](https://prometheusfuels.ai/) yönleniyor. Eski deneyimin tam scroll davranışı, sahneler arası bütün geçişleri, mobil kamerası veya kaynak kodu doğrulanamadı. Bunlar gözlenmiş özellikler gibi sunulmuyor.

**Bu proje için tasarım çıkarımı:** Tek güçlü odak, kadrajın içinden geçen kamera, katmanlar arası mesafe ve hareketin ardından gelen duraklama kullanılabilir. Aşağıdaki zaman çizelgesi bu projeye ait özgün bir öneridir. Referansın aracı, çevresi, renkleri, kompozisyonları ve varlıkları kullanılmayacak.

## 3. İzleyicinin giriş yolu

- İlk görünüm: mürekkep siyahı, küçük “IVE HERO UNIVERSE”, sayfa kaydı ve altı küçük sinyal işareti. Ses varsayılan olarak kapalıdır.
- Kritik varlıklar hazır olduğunda kısa bir baskı kayması ve uzaktaki sayfanın kenarı görünür. Hedef, normal bağlantıda ilk beş saniyede özgün görsel fikri okutmak; uzun bir karanlık yükleme ekranı oluşturmamak.
- “SCROLL TO ENTER / SWIPE UP” ve klavye ile kullanılabilen “ENTER THE PAGE” aynı ilerleme sistemine bağlanır.
- Sabit kadrajın altında doğal scroll mesafesi bulunur. Kaydırma engellenmez. Ses, hareket azaltma ve atlama kontrolleri her zaman ulaşılabilirdir.

Arayüz metinleri ilk sürümde briefteki İngilizce dili korur. Yaratıcı ve teknik belgeler Türkçedir.

## 4. Açılış: 30–45 saniyelik hedef ritim

Süreler, sanat yönetimi ve video kurgusu için **yaklaşık izleme hedefidir**. Scroll hareketi bir kronometreye bağlı değildir. Aşağıdaki `p`, yalnızca ilk dilimin normalize ilerlemesidir; tüm sitenin ilerlemesi değildir.

| İlerleme / hedef süre | Kadraj ve kamera | Grafik / ses | Kullanıcı ve geçiş |
| --- | --- | --- | --- |
| `0.00–0.08` / 0–3 sn | Siyah alan; merkez dışında küçük bir kayıt işareti. Sayfa uzakta neredeyse çizgi gibi. | “SIGNAL 001”, küçük IVE başlığı, altı sinyal. Ses açık ise tek kuru kayıt tıkı. | İlk scroll veya “ENTER THE PAGE”. İlk sürpriz: başlığın mürekkebi kısa süre iki baskıya ayrılır. |
| `0.08–0.26` / 3–10 sn | Kamera ince, hafif dönük bir çizgi roman sayfasına yaklaşır. Sayfa nesne olarak okunur. | Krem kâğıt, siyah baskı çerçevesi, tek mor kayıt hatası. | İlerleme durduğunda kamera da durur. Sayfa nefes alıp süzülen bir nesneye dönüşmez. |
| `0.26–0.42` / 10–16 sn | Ön çerçeve, orta figür ve arka baskı zemini fiziksel olarak ayrılır. Kamera ön çerçeveden içeri girer. | Çerçeve kenarı kısa süre ekranı örter; kesme bu örtünün arkasında yapılır. | Kamera yakın plan bir görseli büyütmez; ayrı katmanların arasından geçer. |
| `0.42–0.60` / 16–24 sn | Dar bir mor arka ışık; önde heykelsi bir kahraman silueti. Kadrajda kontrollü boşluk. | “CAPTAIN” ve “PURPLE” farklı anlarda sert biçimde oturur. Harflerde bir kez baskı taşması. | Kahraman tanıtımı. Altı sinyalden yalnızca ilki yanar. |
| `0.60–0.80` / 24–34 sn | Kamera neredeyse sabit; figür tam güç pozu almadan önce gerilir. | “HOLD TO ACTIVATE”, basılı yük halkası, “01 / 06”. | Basılı tutma 900 ms. Alternatif “ACTIVATE” düğmesi aynı eylemi tek tık / Enter ile başlatır. Kullanıcı normal scroll ile devam edebilir. |
| `0.80–1.00` / 34–42 sn | Scroll yolu: kahraman bir diyagonal panelin arkasına girer. Eylem yolu: aşağıdaki hız patlaması. Son kadraj krem bir kayıt mührü. | “SIGNAL RELEASED / CAPTAIN PURPLE”, ilk mor sinyal, diğer beş mühür. | İki yol aynı kapanışa ulaşır. “REPLAY SIGNAL” en başa döner. Gelecek bölümler yüklenmez. |

### Captain Purple: aktivasyonun 860 ms'lik olay kurgusu

900 ms'lik yükleme tamamlandığında aşağıdaki bağımsız, kısa eylem saati başlar:

| Eylem zamanı | Görsel olay | Anlam |
| --- | --- | --- |
| 0–80 ms | Figür ve kamera tutulur; mor kenar yoğunlaşır. | Enerji boşalmadan önce karşı ağırlık. |
| 80–180 ms | İki ayrık mor siluet izi farklı derinliklerde belirir. | Figürün basılı kayıt dışına çıkması. |
| 180–300 ms | Üç gecikmeli poz, yönlü yer değiştirme, dar yatay baskı yırtılması. | İmkânsız hızın okunması. |
| 300–340 ms | Küçük bir grafik alanda tek açık renkli etki karesi; ekranı tamamen beyaza çakmaz. | Darbe. |
| 340–620 ms | Figür kamera düzlemini çapraz geçer; yakın çerçeve ve hız çizgileri görüşü keser. | Ön tarafa, ekranın dışına kaçış. |
| 620–860 ms | Mor iz kesilir; boş kadraj tutulur, kayıt mührü oturur. | Yokluğun hissedilmesi ve okunabilir kapanış. |

Bu koreografi özgündür. Gerçek performans görüntüsü veya telifli koreografi kullanılması gerekmez. Etki, görsel benzerlik iddiası taşımayan özgün bir siluetle çalışır.

### Kaydırma ile eylemin birbiriyle ilişkisi

Aktivasyon bir zorunlu kapı değildir. Hold sırasında gelen scroll hareketi yüklemeyi iptal eder ve doğal ilerlemeyi sürdürür. Patlama oynarken kullanıcı başka bir beat'e kaydırırsa eylem iptal edilir ve sahne mevcut `p` değerinde yeniden kurulur. Scroll konumu kilitlenmez veya geriye çekilmez.

Kullanıcı eylemin sonuna kadar beklerse 860 ms sonunda aynı kapanış kadrajı gösterilir; sonraki “CONTINUE” veya scroll girdisi doğal yolu sürdürür. Geri kaydırmak sahneyi yeniden kurar, sesi ve patlamayı otomatik tekrar başlatmaz. Kesin durum kuralları [hareket sisteminde](MOTION_SYSTEM.md) tanımlıdır.

## 5. Sonraki bölümler: yalnızca plan

| Bölüm | Özgün dünya ve anlatı amacı | Etkileşim / çıkış |
| --- | --- | --- |
| HERO AWAKENING | Beş kısa kimlik kırılması; her kahraman farklı bir basım kuralını bozar. Kesit, iris, akordeon çerçeve, yörünge ve sert negatif alan. | Her tanıtımın sonunda işaret eklenir. Son işaret bir konsol kayıt yuvasına dönüşür. |
| HERO SELECT | Krem ve siyah teknik ızgara üzerinde derinlikte altı koleksiyon kartı. Odakta tek büyük kart; uzak kartlar gerçek perspektifte. | Hover önizler, tık/Enter seçer; sol/sağ ok ve swipe değiştirir. Seçim ışık, kamera, harf düzeni, yüzey ve ses zarfını birlikte değiştirir. |
| HERO COMICS | Seçilen kahramanın ayrı ön plan, karakter, orta plan, arka plan ve FX katmanlarından oluşan dünyası. | Kamera paneller arasından geçer. Bir panelin kenarı koparak kartın kenarına dönüşür. |
| HERO CARDS | Mürekkep siyahında altı kartlık editoryal vitrin. Noktasal yansıma, kısıtlı folyo tonu ve keskin kenarlar. | Pointer yansımayı değiştirir; tık kısa kahraman olayını oynatır. Dokunmada kontrollü tek parıltı. |
| FINALE | Kamera geri çekilir; altı kayıt rengi özgün IVE harf formunun negatif alanını kurar. | “IVE / LOOKS CAN KILL / 26.10”. Tarih yapılandırıldığında “COMING 26.10” veya “OUT NOW”. Tekrar oynatma ve sessiz mod. |

Kahramanların önerilen hareket kimlikleri [sanat yönetimi belgesindedir](ART_DIRECTION.md). Captain Purple dışındaki kod adları geçicidir; üyelere ait resmî kimlikler olarak sunulmaz.

## 6. Mobil kadraj: 390 × 844

Sayfa dikey bir kesit olarak yeniden bestelenir. Masaüstü kadrajının merkezi kırpılmaz. Başlık üst üçte birlik alanda iki satır; siluet orta alanda; aktivasyon alt güvenli bölgededir. Ön çerçeve yanlardan geçer; kamera hareketinin yüz/baş bölgesini kadraj dışında bırakmasına izin verilmez.

- Sayfa yaklaşması daha kısa bir kamera yolu kullanır; katman aralığı okunabilir kalır.
- Captain Purple başlığı figürü örtmek yerine çevresinden kesilir.
- Kontroller en az 44 × 44 CSS piksel; alt konum safe-area boşluğuna uyar.
- Dokunmatik scroll korunur. Hold yalnızca kontrolün içindedir; sürükleyerek sayfa kaydırma eylemi hold'u iptal eder.
- Hero Select'in ilerideki mobil düzeni tek odak kart + iki kenar kartıdır; altı kart dikey listeye dönüşmez.

## 7. Azaltılmış hareket ve ses olmadan anlatı

Azaltılmış harekette aynı kadrajlar kısa, kullanıcı kontrollü kesmelerle açılır. Kamera uçuşu, yırtılma, afterimage ve etki parlaması kaldırılır. “ACTIVATE” mühür ve kahraman durumunu doğrudan değiştirir. Hareket tercihi yalnızca sistem ayarından değil arayüzden de değiştirilebilir.

Ses anlatı için zorunlu değildir. Yükleme, hazır, etkin ve kapanış durumları metin/grafikle de ayırt edilir. Giriş, açıklama, ses, hareket ve replay kontrolleri WebGL dışında DOM üzerinde kalır.

## 8. İlk dilimin tamamlanma ölçütleri

1. İlk beş saniyedeki kayıt kırılması, uzaktaki sayfa ve altı sinyal projenin fikrini anlatır.
2. İleri/geri scroll bütün pozları doğru kurar; hızlı kaydırma boş sahne üretmez.
3. Captain Purple aktivasyonu mouse, touch, Enter ve tek tıklama alternatifiyle çalışır.
4. 390 × 844 ve 1440 × 900 kadrajlarında odak, başlık ve kontrol aynı anda anlaşılır.
5. Hareket azaltılmışken ve WebGL olmadığında açılış ile aktivasyon sonucu okunabilir.
6. Gerçek tarayıcıda kilometre taşı ekran görüntüleri, konsol kontrolü ve render ölçümü kaydedilir. Henüz bir uygulama olmadığı için bu kontroller bu planlama tesliminde yapılmış sayılmaz.
7. GitHub Pages alt yolundan HTML, font, görsel ve shader varlıkları hatasız yüklenir. Bu geçmeden sonraki bölümlere başlanmaz.
