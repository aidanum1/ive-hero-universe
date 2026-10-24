# IVE HERO UNIVERSE

GitHub Pages için hazırlanan, kaydırma ile yönetilen bir çizgi roman açılışı. Bu sürüm **Prologue + Captain Purple** içerir. Sabit kadraj, derinlikli WebGL sayfası, özgün kahraman illüstrasyonu, büyük editoryal tipografi ve aktivasyon patlaması uygulanmıştır.

[Siteyi aç](https://aidanum1.github.io/ive-hero-universe/) · [GitHub deposu](https://github.com/aidanum1/ive-hero-universe)

## Yerelde çalıştırma

Node.js 22 veya üzeri gerekir.

```sh
npm ci
npm run dev
```

Terminalde gösterilen yerel adresi aç. 3000 doluysa Next.js başka port seçer.

Kontroller: doğal scroll, **Enter the Page**, alttaki bölüm düğmeleri, 900 ms **Hold to Activate** veya tek tık **Tap to Activate**. Hold düğmesinde Enter/Space da çalışır. Sağ üstte ses, hareket azaltma ve deneyim bilgisi bulunur. Ses varsayılan kapalıdır. Geri scroll sahneyi geri kurar; aktivasyonu kendiliğinden tekrar başlatmaz.

## Statik çıktı ve GitHub Pages

```sh
npm run build
npm run preview
```

`out/` üretilir; önizleme `http://localhost:4173/` adresindedir. Çalışan bir Next.js sunucusu gerekmez.

Proje alt yolunu yerelde denemek için:

```sh
NEXT_PUBLIC_BASE_PATH=/ive-hero-universe npm run build
npm run preview -- --base-path /ive-hero-universe --port 4174
```

`http://localhost:4174/ive-hero-universe/` açılır. Kök kullanıcı/organizasyon sitesi veya özel alan adı için alt yol boş bırakılır.

GitHub'a aktarıldığında:

1. Kaynakları `main` dalına gönder.
2. Deponun **Settings → Pages → Source** alanında **GitHub Actions** seç.
3. **Publish to GitHub Pages** workflow'unu çalıştır veya `main` dalına push yap.

Workflow Pages'in kendi `base_path` çıktısını kullanır; depo adını kodda değiştirmek gerekmez. `.nojekyll` ve bütün yerel font/görsel yolları çıktıya dahildir. Bu deponun her `main` push'unda kontroller ve statik derleme çalışır; başarılı çıktı GitHub Pages'e gönderilir.

## Mimari

- `src/motion/`: beat aralıkları, süreler, tekrar kullanılabilir efektler ve saf `sampleOpening()` fonksiyonu.
- `src/scenes/`: normalize sahne ilerlemesi ve `enter/update/exit/dispose` yaşam döngüsünü yöneten SceneManager.
- `src/controllers/`: yüksek frekanslı dış hareket deposu, etkileşim iptal kuralları ve özgün ses sentezi.
- `src/components/FrameArt.tsx`: web ve video tarafından paylaşılan grafik sahneler.
- `src/webgl/WorldCanvas.tsx`: tek, isteğe bağlı render edilen R3F Canvas; sayfa, karakter ve ön çerçeve ayrı derinliklerde. Prologue'dan çıkarken unmount ve texture dispose yapılır.
- `src/design-system/`: font/renk tokenları, özgün SVG işaretler ve masaüstü/mobil kadrajları. Container query'ler video boyutlarında da aynı kompozisyonu kullanır.
- `remotion/`: etkileşimden bağımsız, kare sayısıyla sürülen video adaptörü. Remotion web giriş noktasına import edilmez.

WebGL yüklenirken veya kullanılamadığında aynı sayfanın DOM karşılığı görünür kalır. Hareket azaltıldığında kamera uçuşu, echo, yırtılma ve darbe parlaması kaldırılır. Metin ve kontroller canvas dışında kalır. Erişilebilir açıklama, görünür focus, tek tık aktivasyon ve focus'u içeride tutan bilgi diyaloğu bulunur.

## Remotion

```sh
npm run studio
npm run video:still
npm run video:render
```

Kompozisyonlar:

- `CaptainPurpleIntro`: 1080 × 1920, 30 fps, 42 saniye.
- `CaptainPurpleIntroLandscape`: 1920 × 1080, 30 fps, 42 saniye.

Yatay render:

```sh
npx remotion render remotion/index.ts CaptainPurpleIntroLandscape output/captain-purple-landscape.mp4
```

Video renderer 3055, Studio 3056 portunu kullanır; gerekirse `--port` ile değiştirilebilir. İlk render Remotion'un Chrome Headless Shell indirmesini gerektirebilir. Video DOM/perspektif adaptörü ortak sahne matematiğini kullanır; canlı scroll veya pointer'a dayanmaz. Ses dosyası verilmediği için video sessizdir.

Remotion 4.0.538, Zod 4.5.4 sürümünü tam olarak sabitliyor. Güvenlik düzeltmesi için Zod 4.6.7 override edilmiştir. CLI bunun için sürüm uyarısı verir; bu projede Zod schema/Studio özellikleri kullanılmaz. Render ve typecheck sonucu ayrıca doğrulanır.

## Doğrulama

```sh
npm test
npm run lint
npm run typecheck
```

Testler: ileri/geri seek'in deterministik olması, beat sınırları, darbe aralığı, azaltılmış hareket, tamamlanan aktivasyon, scroll iptali, abonelik temizliği ve kök/alt yol varlık yolları. Tarayıcı gözlemleri ve ekran görüntüleri `verification/` içinde tutulur.

## Varlıklar ve sonraki kapsam

Kahraman, built-in imagegen ile üretilen özgün ve kurgusal bir yetişkin karakterdir; IVE üyesi portresi değildir. Kaynak PNG `artwork/`, nihai prompt `artwork/PROMPT.md`, optimize edilmiş saydam görsel `public/heroes/captain-purple.webp` içindedir. SVG grafikler özgündür. Font lisansları `public/licenses/` içindedir.

Hero Awakening, Hero Select, Hero Comics, Hero Cards, finale ve bunların Remotion kompozisyonları bu sürümde uygulanmadı. `26.10` için yıl/saat bilgisi verilmediğinden resmî yayın tarihi varsayılmadı. Sonraki bölümlerin planları dört ön yapım belgesinde bulunur.

Unofficial fan-made creative experiment. IVE veya temsilcileriyle bağlantılı değildir.
