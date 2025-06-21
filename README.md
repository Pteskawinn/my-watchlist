# My Watchlist

My Watchlist, sevdiğiniz anime, film, dizi, manga ve kitapları tek bir yerden takip etmenizi sağlayan kişisel bir izleme/okuma listesi uygulamasıdır. Bu uygulama ile izlediklerinizi, izleyeceklerinizi ve tamamladıklarınızı kolayca yönetebilirsiniz.

**[Canlı Demoyu Görüntüle](https://legendary-zuccutto-1e32d1.netlify.app/)**

## ✨ Özellikler

- **Kapsamlı Listeleme:** Anime, film, TV dizisi, manga, manhwa ve kitap gibi farklı türlerde öğeler ekleyin.
- **Detaylı Takip:** Her öğe için izleme/okuma durumu, ilerleme (bölüm/sayfa sayısı), kişisel puan ve notlar ekleyin.
- **Akıllı Arama ve Filtreleme:** Listelerinizi türe, duruma, puana veya yıla göre anında arayın, sıralayın ve filtreleyin.
- **TMDB & Jikan Entegrasyonu:** Yeni öğeler eklerken The Movie Database (TMDB) ve Jikan (MyAnimeList API) üzerinden otomatik olarak bilgi ve poster getirin.
- **İstatistik Paneli:** İzleme/okuma alışkanlıklarınızla ilgili toplam öğe sayısı, tamamlananlar ve ortalama puan gibi istatistikleri görün.
- **Toplu İşlemler:** Birden fazla öğeyi aynı anda seçerek durumlarını değiştirin veya silin.
- **Veri Yönetimi:** Tüm listenizi JSON formatında dışa aktarın ve daha sonra tekrar içe aktarın.
- **PWA Desteği:** Uygulamayı telefonunuza veya bilgisayarınıza bir uygulama gibi yükleyerek çevrimdışı erişim sağlayın.
- **Koyu/Açık Tema:** Göz zevkinize uygun temayı seçin.

## 📸 Ekran Görüntüleri

Proje klasörünüzde bulunan ekran görüntülerini buraya ekledim. GitHub'da harika görünecekler!

![Masaüstü Görünümü](./screenshots/desktop-1.png)
![Mobil Görünüm](./screenshots/mobile-1.png)

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **API'lar:**
    - [The Movie Database (TMDb)](https://www.themoviedb.org/documentation/api)
    - [Jikan API (MyAnimeList)](https://jikan.moe/)
- **Hosting:** [Netlify](https://www.netlify.com/)
- **Android Uygulama:** [Trusted Web Activity (TWA)](https://developer.chrome.com/docs/android/trusted-web-activity/)

## 🚀 Projeyi Güncelleme

Bu proje, Netlify üzerinden GitHub ile sürekli entegrasyon (Continuous Integration) kullanılarak yönetilmektedir. `main` branch'ine yapılan her `push` işlemi, web sitesini ve dolayısıyla Android uygulamasını otomatik olarak günceller.

Yerel ortamda bir değişiklik yaptıktan sonra aşağıdaki komutları çalıştırmak yeterlidir:

```bash
# 1. Değişiklikleri kayda hazırla
git add .

# 2. Değişiklikleri bir not ile kaydet
git commit -m "Yaptığınız değişikliği açıklayan bir mesaj"

# 3. Değişiklikleri GitHub'a yükle
git push
``` 