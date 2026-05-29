# InstaIndir — Instagram Video İndirici PWA

Instagram video, reels ve hikayeleri doğrudan cihazınıza indirin.  
Açık kaynaklı [Cobalt](https://github.com/imputnet/cobalt) API'si üzerinde çalışır.

---

## ADIM 1 — Koyeb'de Cobalt Kur (5 dakika, ücretsiz, kart gerekmez)

1. **[koyeb.com](https://www.koyeb.com)** adresine gidin → **"Sign up"** → GitHub hesabınızla giriş yapın.

2. Panelden **"Create Service"** butonuna tıklayın → **"Docker"** seçin.

3. **Docker image** alanına yazın:
   ```
   ghcr.io/imputnet/cobalt
   ```

4. **Environment Variables** bölümüne iki değişken ekleyin:

   | Değişken | Değer |
   |---|---|
   | `API_URL` | `https://SERVIS_ADIN.koyeb.app` *(Koyeb size URL verecek, önce boş bırakıp sonra güncelleyebilirsiniz)* |
   | `CORS_WILDCARD` | `1` |

5. **Port** alanına `9000` yazın.

6. **"Deploy"** butonuna basın.  
   Deployment tamamlanınca size bir URL verilecek, örneğin:
   ```
   https://cobalt-abc123.koyeb.app
   ```
   Bu URL'yi kopyalayın.

> **Not:** Ücretsiz Koyeb planında servis 10 dakika boşta kalırsa uyur.  
> İlk istekte 3-5 saniye bekleme yaşanabilir; bu normaldir.

---

## ADIM 2 — GitHub Pages'i Kur

1. **[github.com](https://github.com)** → **"New repository"** → İsim: `instaindir` → **Public** → Create.

2. Bu projedeki tüm dosyaları repoya yükleyin:
   - `index.html`
   - `style.css`
   - `app.js`
   - `sw.js`
   - `manifest.json`
   - `icons/icon-192.png`
   - `icons/icon-512.png`

3. Repo **Settings** → **Pages** → **Source:** `main branch` → **Save**.

4. Birkaç dakika sonra siteniz şu adreste yayınlanır:
   ```
   https://KULLANICI_ADINIZ.github.io/instaindir/
   ```

---

## ADIM 3 — Cobalt URL'sini Bağla

1. GitHub'da `app.js` dosyasına tıklayın → kalem ikonuyla düzenleyin.

2. Dosyanın en üstündeki şu satırı bulun:
   ```js
   const COBALT_URL = 'BURAYA_KOYEB_URL';
   ```

3. Koyeb'den aldığınız URL ile değiştirin:
   ```js
   const COBALT_URL = 'https://cobalt-abc123.koyeb.app';
   ```

4. **"Commit changes"** → Save.

---

## ADIM 4 — iPhone/Android'e Ana Ekrana Ekle

### iPhone (Safari)
1. Safari'de GitHub Pages URL'nizi açın.
2. Alt çubukta **Paylaş** (kare + ok) butonuna basın.
3. **"Ana Ekrana Ekle"** seçin → **Ekle**.

### Android (Chrome)
1. Chrome'da URL'yi açın.
2. Sağ üstteki **⋮** menüsünden **"Ana ekrana ekle"** seçin.

---

## Kullanım

```
Instagram → "..." → Bağlantıyı Kopyala
    ↓
InstaIndir → Yapıştır butonu → İndir
```

**Desteklenen bağlantı formatları:**
- `instagram.com/p/…` — Gönderi
- `instagram.com/reel/…` — Reels
- `instagram.com/reels/…` — Reels
- `instagram.com/tv/…` — IGTV
- `instagram.com/stories/…` — Hikayeler

> Sadece **herkese açık** hesapların içerikleri indirilebilir.

---

## iPhone'da Video Kaydetme

Safari'de video yeni sekmede açılır. Videoyu kaydetmek için:
- **Uzun bas → "İndir"** seçeneği
- veya **Paylaş → "Fotoğraflara Kaydet"**

---

## Sorun Giderme

| Sorun | Çözüm |
|---|---|
| "Sunucuya bağlanılamadı" | Koyeb servisinin çalıştığını kontrol edin. İlk istekte 5 sn bekleyin. |
| "COBALT_URL ayarlanmamış" | `app.js` dosyasında URL'yi güncellediğinizden emin olun. |
| "Gizli hesap" hatası | Sadece herkese açık hesaplar desteklenir. |
| CORS hatası | Koyeb'de `CORS_WILDCARD=1` değişkeninin eklendiğini kontrol edin. |

---

## Teknik Detaylar

- **Frontend:** GitHub Pages (statik PWA — HTML/CSS/JS)
- **Backend:** Koyeb ücretsiz tier — Cobalt Docker container
- **API:** Cobalt v10 — `POST /` endpoint
- **Veri:** Videolar doğrudan cihazınıza indirilir, hiçbir sunucuda saklanmaz
