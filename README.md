# SheetLogger 📊

**Sunucusuz (Serverless) Harcama Takip Sistemi**

Android uygulamasından girilen verilerin, fiziksel bir donanıma (ESP32) veya harici bir sunucuya ihtiyaç duymadan, Google Apps Script (Webhook) teknolojisi kullanılarak doğrudan Google Sheets'e anlık ve çevrimiçi olarak işlendiği sistemdir.

## 🏗️ Mimari

```
📱 Android App  ➔  🔗 HTTP POST  ➔  ⚡ Google Apps Script  ➔  📊 Google Sheets
```

## ✨ Özellikler

- 📝 **Harcama Ekleme** - Kategori, tutar ve açıklama ile harcama kaydetme
- 📊 **Dashboard** - Aylık özet, kategori dağılımı pasta grafiği
- 📋 **Harcama Listesi** - Tarihe göre gruplu görünüm, kategori filtreleme
- 🗑️ **Silme** - Harcama silme desteği
- ⚡ **Gerçek Zamanlı** - Anında Google Sheets'e kayıt
- 🎨 **Modern UI** - Şık karanlık tema, animasyonlar
- 📴 **Offline Destek** - Bağlantı olmadığında kuyrukta bekletme

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React Native + Expo Router |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Charts | react-native-chart-kit |
| Storage | AsyncStorage |

## 🚀 Kurulum

### 1. Google Apps Script Kurulumu

1. [Google Sheets](https://sheets.google.com)'te yeni bir e-tablo oluşturun
2. **Uzantılar → Apps Script** açın
3. `google-apps-script/Code.gs` içeriğini yapıştırın
4. **Deploy → New deployment → Web app** olarak deploy edin
5. Webhook URL'sini kopyalayın

> Detaylı talimatlar için `google-apps-script/KURULUM.md` dosyasına bakın.

### 2. Android Uygulaması

```bash
# Bağımlılıkları yükle
cd SheetLogger
npm install

# Uygulamayı başlat
npx expo start

# Android için
npx expo start --android
```

### 3. Yapılandırma

1. Uygulamayı açın
2. **Ayarlar** sekmesine gidin
3. Webhook URL'sini yapıştırın
4. **Kaydet ve Doğrula** butonuna tıklayın

## 📁 Proje Yapısı

```
SheetLogger/
├── app/                      # Expo Router sayfaları
│   ├── _layout.tsx           # Root layout
│   └── (tabs)/               # Tab navigasyonu
│       ├── _layout.tsx       # Tab layout
│       ├── index.tsx         # Dashboard
│       ├── expenses.tsx      # Harcama listesi
│       ├── add.tsx           # Harcama ekleme
│       └── settings.tsx      # Ayarlar
├── src/
│   ├── components/           # UI bileşenleri
│   │   ├── Common.tsx        # Ortak bileşenler
│   │   ├── CategoryPicker.tsx
│   │   └── ExpenseCard.tsx
│   ├── constants/
│   │   └── theme.ts          # Tema sabitleri
│   ├── services/
│   │   └── api.ts            # API servisi
│   ├── types/
│   │   └── index.ts          # TypeScript tipleri
│   └── utils/
│       └── storage.ts        # AsyncStorage
├── google-apps-script/
│   ├── Code.gs               # Apps Script kodu
│   └── KURULUM.md            # Kurulum rehberi
├── app.json                  # Expo yapılandırması
├── package.json              # Bağımlılıklar
└── README.md                 # Bu dosya
```

## 📊 Google Sheets Yapısı

| Sütun | İçerik |
|-------|--------|
| A | ID (UUID) |
| B | Tarih (YYYY-MM-DD) |
| C | Kategori |
| D | Açıklama |
| E | Tutar (TL) |
| F | Timestamp |

## 🎨 Kategoriler

| Emoji | Kategori | Renk |
|-------|----------|------|
| 🍔 | Yemek | #FF6B6B |
| 🚗 | Ulaşım | #4ECDC4 |
| 🛒 | Market | #45B7D1 |
| 💡 | Faturalar | #96CEB4 |
| 🎬 | Eğlence | #FFEAA7 |
| 👕 | Giyim | #DDA0DD |
| 💊 | Sağlık | #98D8C8 |
| 📚 | Eğitim | #F7DC6F |
| 🏠 | Kira | #BB8FCE |
| 💰 | Diğer | #85C1E9 |

## 📝 API Endpoints

### POST (Yazma İşlemleri)

```json
// Harcama Ekle
{ "action": "add", "category": "Yemek", "description": "Öğle yemeği", "amount": 150, "date": "2025-12-28" }

// Harcama Sil
{ "action": "delete", "id": "uuid-here" }

// Harcama Güncelle
{ "action": "update", "id": "uuid-here", "amount": 200 }
```

### GET (Okuma İşlemleri)

```
?action=list                      # Tüm harcamalar
?action=list&month=12&year=2025   # Belirli ay
?action=list&category=Yemek       # Kategori filtresi
?action=summary&month=12&year=2025 # Aylık özet
?action=categories                # Kategori listesi
```

## 📄 Lisans

MIT License

---

**SheetLogger** - Sunucusuz Harcama Takip Sistemi 💰
