# SheetLogger - Google Apps Script Kurulum Rehberi

## 📋 Adım 1: Google Sheets Oluşturma

1. [Google Sheets](https://sheets.google.com)'e gidin
2. **Boş** bir yeni e-tablo oluşturun
3. E-tabloya **"SheetLogger Harcamalar"** adını verin

---

## 📝 Adım 2: Apps Script Ekleme

1. Menüden **Uzantılar → Apps Script** seçin
2. Açılan editörde varsayılan kodu silin
3. `Code.gs` dosyasındaki tüm kodu kopyalayıp yapıştırın
4. **Ctrl+S** ile kaydedin
5. Proje adını **"SheetLogger"** olarak değiştirin

---

## 🚀 Adım 3: Web Uygulaması Olarak Yayınlama

1. Apps Script editöründe **Deploy → New deployment** tıklayın
2. ⚙️ (dişli) ikonuna tıklayın ve **Web app** seçin
3. Ayarları şu şekilde yapın:
   - **Description:** SheetLogger API v1
   - **Execute as:** Me (kendi hesabınız)
   - **Who has access:** Anyone
4. **Deploy** butonuna tıklayın
5. İzin istenirse **Authorize access** tıklayın
6. Google hesabınızla giriş yapın
7. "This app isn't verified" uyarısında **Advanced → Go to SheetLogger (unsafe)** tıklayın
8. **Allow** butonuna tıklayın

---

## 🔗 Adım 4: Webhook URL'sini Alma

Deploy işlemi tamamlandığında size bir **Web app URL** verilecek:

```
https://script.google.com/macros/s/AKfycbx.../exec
```

**Bu URL'yi kopyalayın!** Android uygulamasında kullanacaksınız.

---

## ✅ Adım 5: Test Etme

### Postman veya Terminal ile Test:

**Harcama Ekleme (POST):**
```bash
curl -X POST "WEBHOOK_URL_BURAYA" \
  -H "Content-Type: application/json" \
  -d '{"action":"add","category":"Yemek","description":"Öğle yemeği","amount":150}'
```

**Harcamaları Listeleme (GET):**
```bash
curl "WEBHOOK_URL_BURAYA?action=list"
```

**Kategorileri Alma (GET):**
```bash
curl "WEBHOOK_URL_BURAYA?action=categories"
```

**Aylık Özet (GET):**
```bash
curl "WEBHOOK_URL_BURAYA?action=summary&month=12&year=2025"
```

---

## 🔄 Güncelleme Yaparken

Kodu güncelledikten sonra:
1. **Deploy → Manage deployments**
2. Mevcut deployment'ı seçin
3. ✏️ (düzenle) ikonuna tıklayın
4. **Version:** New version seçin
5. **Deploy** tıklayın

> ⚠️ URL değişmez, aynı URL'yi kullanmaya devam edebilirsiniz.

---

## 📊 Sheets Yapısı

Script otomatik olarak şu yapıyı oluşturur:

| Sütun | İçerik |
|-------|--------|
| A | ID (UUID) |
| B | Tarih (YYYY-MM-DD) |
| C | Kategori |
| D | Açıklama |
| E | Tutar (TL) |
| F | Timestamp |

---

## ❓ Sorun Giderme

**"Authorization required" hatası:**
- Deploy sırasında izinleri onayladığınızdan emin olun

**"Script function not found" hatası:**
- Code.gs dosyasının doğru yapıştırıldığından emin olun
- Kaydettiğinizden emin olun

**CORS hatası:**
- Web app olarak deploy ettiğinizden emin olun
- "Who has access" → "Anyone" seçili olmalı
