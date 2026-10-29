# Direksiyon Provası — B sınıfı sınav simülasyonu

Mobil ve masaüstü tarayıcıda çalışan, eğitim amaçlı bir sürüş sınavı provası. Orijinal arayüz, SVG çizimleri ve basitçe modellenmiş bir otomobil kullanır; herhangi bir gerçek araç markasının veya ticari oyunun modeli/varlığı kullanılmamıştır.

## İçerik

- **İki oyun modu:** “Sınav provası yap” bagaj, kaput ve kokpit sorularından sonra parkura geçer. “Parkur provası yap” doğrudan sürüş bölümünü açar.
- **Görsel bagaj testi:** Stepne, kriko, bijon anahtarı, reflektör, ilk yardım çantası ve ek donanımlar arasından rastgele 3 öğe sorulur. Kartlarda isimler gösterilmez; aday üstte verilen adları alttaki çizimlerle eşleştirir.
- **Görsel kaput testi:** Motor, akü, yağ dolum kapağı/ölçüm çubuğu, soğutma sıvısı, cam yıkama suyu ve diğer parçalar arasından rastgele 3 öğe sorulur. Parçalar projeye özel SVG çizimlerdir.
- **Kokpit ve göstergeler:** Sinyal kolu, silecek, sis lambası, dörtlü ikaz, yağ basıncı, emniyet kemeri, fren uyarısı, hız göstergesi, far ve el freniyle ilgili rastgele 3 görsel soru gelir.
- **Tam ekran perspektifli 3B sürüş:** Araç arkası takip kamerası, hareketli tekerlekler, sanal park alanları, koniler, hız göstergesi ve yokuş geçişi. Ekran yatay kullanımda tüm parkuru kaplar.
- **Sürüş kontrolü:** Yuvarlak direksiyonu parmağınla sürükleyip döndür; gaz ve fren pedallarına basılı tut; vites için R / N / 1 seç. Emniyet kemeri takılı değilse veya uygun vites seçilmediyse araç kalkmaz.
- **El tercihi:** “DİREKSİYON SOLDA/SAĞDA” düğmesi direksiyon ile pedal gruplarının yerini değiştirir.
- **Görevler:** Güvenli kalkış, paralel geri park, 25 metre geri gitme, geri giderken sağa L dönüş, dar alanda U dönüşü, yokuşta kalkış ve güvenli bitiş.
- **Puanlama:** Yanlış cevap, hız aşımı, koni teması, kemersiz kalkış denemesi ve bazı sürüş hatalarında puan düşer. Oyun hatada doğrudan bitmez; parkuru tamamlamaya devam edebilirsin. Parkur-only modunda görevler 100 puan üzerinden hesaplanır.

## Çalıştırma

### Yerel bilgisayarda

1. Arşivi çıkar.
2. `index.html` dosyasını güncel bir tarayıcıda aç. 3B bölüm için internet bağlantısı gerekir; Three.js kütüphanesi CDN üzerinden yüklenir.
3. Tarayıcıda yerel dosya kısıtlamasıyla ilgili sorun çıkarsa proje klasöründe basit bir HTTP sunucusu çalıştır:

   ```bash
   python -m http.server 8000
   ```

   Ardından `http://localhost:8000` adresini aç.

### GitHub Pages üzerinde yayınlama

1. GitHub'da yeni bir repository oluştur.
2. **Bu klasörün içindeki dosyaları** repository'nin kök dizinine yükle (`index.html`, `app.js`, `style.css`, `assets/` ve `README.md`). `index.html` bir alt klasöre gömülmemeli.
3. Repository'de **Settings → Pages** bölümüne gir.
4. **Deploy from a branch** seç; `main` ve `/ (root)` ayarını seçip kaydet.
5. GitHub Pages'in oluşturduğu web adresini aç. İlk yüklemede CDN'den Three.js'in gelmesi için internet erişimi gerekir.

## Kontroller

### Telefon

- **Yuvarlak direksiyon:** Parmağınla tutup sağa/sola sürükle; bırakınca merkeze döner.
- **FREN / GAZ:** Basılı tuttuğun sürece fren veya gaz uygular.
- **R / N / 1:** Geri, boş, birinci vites. Vites değiştirmek için araç durmalı.
- **Kemer:** Emniyet kemerini tak / çıkar.
- **Dörtlü / Far:** İkaz lambaları ve kısa farı açıp kapatır.
- **Direksiyon solda/sağda:** Direksiyon ile pedalların ekran yerleşimini değiştirir.
- **⛶:** Tarayıcı destekliyorsa tam ekranı açıp kapatır.

### Bilgisayar

- **W / ↑:** Gaz
- **S / ↓ / Space:** Fren
- **A / ←, D / →:** Direksiyon
- **1 / N / R:** Vites
- **H:** Dörtlü ikaz
- **F:** Far
- **B:** Emniyet kemeri

## Önemli notlar

- Bu sürüm, oyunlaştırılmış bir eğitim prototipidir; MEB'in resmî sınav sistemi, onaylı parkur ölçüleri veya resmî puanlama formu değildir.
- Parkur ölçüleri ve puan kesintileri öğrenme amacıyla temsilî olarak ayarlanmıştır. Gerçek sınavda güncel MEB değerlendirme formu, komisyon yönlendirmesi, sınava girilen araç ve güzergâh esas alınır.
- Araç kumandaları ve motor bölümü parçalarının yerleri modelden modele değişebilir. Semboller ve yerleşim çizimleri öğretici örneklerdir; gerçek araç kullanma kılavuzuna bakılmalıdır.
- Fizik simülasyonu eğlenceli bir pratik içindir; gerçek araçta debriyaj, fren, direksiyon ve manevra çalışması yetkili sürücü eğitmeniyle yapılmalıdır.

## Proje dosyaları

- `index.html` — Ekranlar ve arayüz
- `style.css` — Mobil/masaüstü tasarım
- `app.js` — Rastgele testler, puanlama, 3B sahne, araç fiziği ve görev mantığı
- `assets/favicon.svg` — Projeye özel simge
- `assets/objects/` — Bagaj ve kaput için 17 özgün nesne çizimi
- `assets/cabin/` — Kokpit ve gösterge soruları için 11 özgün sembol çizimi
