# İlk dilim doğrulama kaydı

24 Ekim 2026 · Prologue + Captain Purple

## Otomatik kontroller

| Kontrol | Sonuç |
| --- | --- |
| `npm test` | 8 test geçti. Seek, beat sınırları, aktivasyon, azaltılmış hareket, iptal, kaynak abonelikleri, sahne yaşam döngüsü, asset alt yolu. |
| `npm run lint` | Geçti. Derlenmiş `.preview/`, `out/` ve video çıktıları kapsam dışında. |
| `npm run typecheck` | Next route tipleri üretilir; TypeScript denetimi geçti. |
| `npm run build` | Statik export başarılı; `/` ve 404 çıktısı. |
| `NEXT_PUBLIC_BASE_PATH=/ive-hero npm run build` | Başarılı; alt yol ayrıca statik sunucuda açıldı. |
| `npm audit` | Override sonrası bütün bağımlılıklarda 0 açık. Ayrıntı `npm-audit.json`. |
| Remotion | 1080 × 1920 / 30 fps / 1260 kare MP4 render edildi. Dikey/yatay 840. kare ve 1056. darbe karesi incelendi. |

Üretilen tüm statik dosyalar yaklaşık 2,43 MB. Metin dosyalarına yerel gzip uygulanarak hesaplanan yaklaşık toplam 1,21 MB; bu, gerçek ağ aktarım ölçümü değildir. Remotion çalışma zamanı web chunk'larında bulunmuyor.

## Gerçek tarayıcı kontrolleri

Codex'in Chromium tabanlı tarayıcısında 1440 × 900 ve 390 × 844 viewport'ları kullanıldı. 390 × 844 kontrolü fiziksel telefon testi değildir.

- Kök statik önizleme: `http://localhost:4173/`.
- Pages benzeri alt yol: `http://localhost:4174/ive-hero/`. Görseller `/ive-hero/` önekiyle yüklendi; font durumu `loaded`, WebGL hazır, yatay taşma yok.
- 900 ms hold yolu normal tarayıcı kontrolü üzerinden denendi; aktivasyon başladı. 250 ms'de bırakılan hold, `idle` ve sıfır yük durumuna döndü.
- Enter ile aktivasyon; patlama sonrası `completed`/`released` ve replay kontrolü görüldü. Purple aşamasında Canvas bulunmuyor.
- Hareket azaltma açıkken tek tık aktivasyon doğrudan kapanışa ulaştı. Kamera/echo/tear/impact kaldırılmış durumda.
- Ses açma düğmesi izinli kullanıcı hareketinden sonra açık duruma geçti.
- Bilgi diyaloğunda Shift+Tab odağı içeride tuttu; Escape kapattı ve odak bilgi düğmesine döndü. Arka sayfa scroll'u kilitlendi.
- On ileri/geri bölüm geçişinde DOM'da en fazla bir Canvas vardı; tarayıcı konsolunda hata oluşmadı.
- Yeniden giriş sonrasında ölçülen sahne: 4 draw call, 4 geometry, 3 texture. Durağan başlangıçta frame sayacı artmadı. Kaynaklar prologue çıkışında bırakılıyor.
- Three.js/R3F tarafında `THREE.Clock` için upstream deprecation uyarısı var; çalışmayı engelleyen bir konsol hatası görülmedi.

Fiziksel düşük güçlü mobil donanımda p95 frame-time ölçümü veya zorlanmış WebGL context-loss testi yapılmadı. Teknik mimarideki FPS hedefleri ölçülmüş sonuç olarak sunulmuyor. Remotion'un Zod sürüm uyarısı ve güvenlik override'ı README'de açıklanıyor.

## Görsel kayıtlar

- `desktop-signal.jpg`: 1440 × 900 prologue, gerçek WebGL sayfası.
- `desktop-purple.jpg`: 1440 × 900 Captain Purple.
- `mobile-signal.jpg`: 390 × 844 prologue.
- `mobile-purple.jpg`: 390 × 844 Captain Purple.
- `mobile-released.jpg`: 390 × 844 aktivasyon sonucu.
- `output/captain-purple.png`, `output/captain-purple-landscape.png`, `output/burst-impact.png`: Remotion kareleri.
- `output/captain-purple.mp4`: 42 saniyelik dikey video.

Ekran görüntüleri ve video çıktıları yerelde saklanır, Git'e dahil edilmez. Kaynak deposu: [aidanum1/ive-hero-universe](https://github.com/aidanum1/ive-hero-universe). Pages workflow'u her `main` push'unda test, lint, typecheck, statik derleme ve yayını yürütür.
